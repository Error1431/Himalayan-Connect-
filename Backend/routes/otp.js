const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  sendPhoneOtp, verifyPhoneOtp,
  sendEmailOtp, verifyEmailOtp
} = require('../controllers/otpController');

// Phone OTP — public, used during registration (no account exists yet)
router.post('/send-phone-otp', authLimiter, sendPhoneOtp);
router.post('/verify-phone-otp', authLimiter, verifyPhoneOtp);

// Email OTP — for a logged-in user verifying their email from Settings
router.post('/send-email-otp', protect, authLimiter, sendEmailOtp);
router.post('/verify-email-otp', protect, authLimiter, verifyEmailOtp);

module.exports = router;
