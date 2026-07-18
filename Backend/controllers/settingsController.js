const Settings = require('../models/Settings');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/avatars/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
}).single('avatar');

exports.uploadAvatar = upload;

exports.getSettings = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        // Atomic find-or-create avoids a duplicate-key crash when two
        // requests for a brand-new user's settings race each other
        // (e.g. React StrictMode double-invoking effects in development).
        const settings = await Settings.findOneAndUpdate(
            { user: userId },
            {
                $setOnInsert: {
                    user: userId,
                    profile: {
                        displayName: req.user.name || '',
                        phone: req.user.phone || '',
                        alternateEmail: req.user.email || ''
                    }
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            success: true,
            settings: settings
        });

    } catch (error) {
        console.error('Get Settings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching settings',
            error: error.message
        });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        let settings = await Settings.findOne({ user: userId });

        if (!settings) {
            settings = new Settings({ user: userId });
        }

        const allowedUpdates = [
            'profile', 'notifications', 'privacy', 'preferences',
            'farmer', 'homestay', 'payment', 'security'
        ];

        allowedUpdates.forEach(key => {
            if (req.body[key]) {
                const currentData = settings[key].toObject ? settings[key].toObject() : settings[key];
                settings[key] = { ...currentData, ...req.body[key] };
            }
        });

        if (req.file) {
            if (settings.profile.avatar) {
                const oldAvatarPath = path.join(__dirname, '..', settings.profile.avatar);
                if (fs.existsSync(oldAvatarPath)) {
                    try {
                        fs.unlinkSync(oldAvatarPath);
                    } catch (err) {
                        console.error('Error deleting old avatar:', err);
                    }
                }
            }
            settings.profile.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            settings: settings
        });

    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating settings',
            error: error.message
        });
    }
};

exports.updateProfileSection = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const settings = await Settings.findOne({ user: userId });

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found'
            });
        }

        const currentProfile = settings.profile.toObject ? settings.profile.toObject() : settings.profile;
        settings.profile = { ...currentProfile, ...req.body };
        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            settings: settings
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

exports.updateNotifications = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const settings = await Settings.findOne({ user: userId });

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found'
            });
        }

        const currentNotifications = settings.notifications.toObject ? settings.notifications.toObject() : settings.notifications;
        settings.notifications = { ...currentNotifications, ...req.body };
        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Notification preferences updated',
            settings: settings
        });

    } catch (error) {
        console.error('Update Notifications Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notifications',
            error: error.message
        });
    }
};

exports.updatePrivacy = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const settings = await Settings.findOne({ user: userId });

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found'
            });
        }

        const currentPrivacy = settings.privacy.toObject ? settings.privacy.toObject() : settings.privacy;
        settings.privacy = { ...currentPrivacy, ...req.body };
        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Privacy settings updated',
            settings: settings
        });

    } catch (error) {
        console.error('Update Privacy Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating privacy settings',
            error: error.message
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        const userId = req.user.id || req.user._id;
        const user = await User.findById(userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        const settings = await Settings.findOne({ user: userId });
        if (settings) {
            settings.security.lastPasswordChange = new Date();
            await settings.save();
        }

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { password, confirmation } = req.body;

        if (confirmation !== 'DELETE MY ACCOUNT') {
            return res.status(400).json({
                success: false,
                message: 'Invalid confirmation text'
            });
        }

        const userId = req.user.id || req.user._id;
        const user = await User.findById(userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        await Settings.findOneAndDelete({ user: userId });
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete Account Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting account',
            error: error.message
        });
    }
};