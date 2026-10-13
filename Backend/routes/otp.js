const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { otpLimiter } = require('../middleware/rateLimiter');
const {
  sendPhoneOtp, verifyPhoneOtp,
  sendEmailOtp, verifyEmailOtp
} = require('../controllers/otpController');

// Phone OTP — public, used during registration (no account exists yet)
router.post('/send-phone-otp', otpLimiter, sendPhoneOtp);
router.post('/verify-phone-otp', otpLimiter, verifyPhoneOtp);

// Email OTP — for a logged-in user verifying their email from Settings
router.post('/send-email-otp', protect, otpLimiter, sendEmailOtp);
router.post('/verify-email-otp', protect, otpLimiter, verifyEmailOtp);

module.exports = router;
