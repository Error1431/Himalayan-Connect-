const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    profile: {
        displayName: { type: String, default: '' },
        bio: { type: String, default: '' },
        avatar: { type: String, default: '' },
        phone: { type: String, default: '' },
        alternateEmail: { type: String, default: '' },
        location: {
            address: { type: String, default: '' },
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            zipCode: { type: String, default: '' },
            coordinates: {
                lat: { type: Number },
                lng: { type: Number }
            }
        }
    },

    notifications: {
        email: {
            orderUpdates: { type: Boolean, default: true },
            newMessages: { type: Boolean, default: true },
            marketingEmails: { type: Boolean, default: false },
            weeklyDigest: { type: Boolean, default: true },
            bookingConfirmations: { type: Boolean, default: true }
        },
        push: {
            orderUpdates: { type: Boolean, default: true },
            newMessages: { type: Boolean, default: true },
            promotions: { type: Boolean, default: false }
        },
        sms: {
            orderUpdates: { type: Boolean, default: false },
            bookingReminders: { type: Boolean, default: false }
        }
    },

    privacy: {
        profileVisibility: {
            type: String,
            enum: ['public', 'private', 'friends'],
            default: 'public'
        },
        showLocation: { type: Boolean, default: true },
        showEmail: { type: Boolean, default: false },
        showPhone: { type: Boolean, default: false },
        allowMessages: { type: Boolean, default: true }
    },

    preferences: {
        language: { type: String, default: 'en' },
        currency: { type: String, default: 'INR' },
        timezone: { type: String, default: 'Asia/Kolkata' },
        theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
        mapView: { type: String, enum: ['roadmap', 'satellite', 'hybrid'], default: 'roadmap' }
    },

    farmer: {
        farmName: { type: String, default: '' },
        farmSize: { type: Number, default: 0 },
        farmType: { type: String, default: '' },
        certifications: [{ type: String }],
        specializations: [{ type: String }],
        harvestSchedule: { type: String, default: '' }
    },

    homestay: {
        propertyName: { type: String, default: '' },
        propertyType: { type: String, default: '' },
        totalRooms: { type: Number, default: 0 },
        amenities: [{ type: String }],
        checkInTime: { type: String, default: '14:00' },
        checkOutTime: { type: String, default: '11:00' },
        cancellationPolicy: { type: String, default: '' }
    },

    payment: {
        upiId: { type: String, default: '' },
        bankDetails: {
            accountHolderName: { type: String, default: '' },
            accountNumber: { type: String, default: '' },
            ifscCode: { type: String, default: '' },
            bankName: { type: String, default: '' }
        },
        razorpayId: { type: String, default: '' },
        stripeAccountId: { type: String, default: '' }
    },

    security: {
        twoFactorEnabled: { type: Boolean, default: false },
        loginAlerts: { type: Boolean, default: true },
        lastPasswordChange: { type: Date },
        trustedDevices: [{
            deviceName: String,
            deviceId: String,
            lastUsed: Date
        }]
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

settingsSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);