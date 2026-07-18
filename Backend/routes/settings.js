const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');

const protect = authMiddleware.verifyAccessToken || authMiddleware.protect || authMiddleware;

router.get('/', protect, settingsController.getSettings);

router.put('/', protect, settingsController.uploadAvatar, settingsController.updateSettings);

router.put('/profile', protect, settingsController.updateProfileSection);

router.put('/notifications', protect, settingsController.updateNotifications);

router.put('/privacy', protect, settingsController.updatePrivacy);

router.put('/change-password', protect, settingsController.changePassword);

router.delete('/delete-account', protect, settingsController.deleteAccount);

module.exports = router;