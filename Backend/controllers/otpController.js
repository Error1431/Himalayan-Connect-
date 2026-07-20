const crypto = require('crypto');
const OtpVerification = require('../models/OtpVerification');
const User = require('../models/User');
const { sendSmsOtp } = require('../utils/sms');
const { sendVerificationEmail } = require('../utils/email'); // reused for the "email OTP" template below
const nodemailer = require('nodemailer');

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// ---------------------------------------------------------------------
// Phone OTP — used during registration, BEFORE a User account exists.
// ---------------------------------------------------------------------

// POST /api/otp/send-phone-otp
// Body: { phone, dialCode }
exports.sendPhoneOtp = async (req, res) => {
  try {
    const { phone, dialCode } = req.body;
    if (!phone || !dialCode) {
      return res.status(400).json({ success: false, message: 'Phone number and country code are required' });
    }

    const fullPhone = `${dialCode} ${phone}`.trim();

    const existing = await User.findOne({ phone: fullPhone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this phone number already exists. Please login instead.' });
    }

    const otp = generateOtp();
    await OtpVerification.deleteMany({ identifier: fullPhone, purpose: 'phone_register' });
    await OtpVerification.create({
      identifier: fullPhone,
      purpose: 'phone_register',
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MS)
    });

    const { usingRealSMS } = await sendSmsOtp(fullPhone, otp);

    res.status(200).json({
      success: true,
      message: usingRealSMS
        ? `OTP sent to ${fullPhone}`
        : `OTP generated (SMS gateway not configured — check the server console for the code).`,
    });
  } catch (error) {
    console.error('Send phone OTP error:', error.message);
    res.status(500).json({ success: false, message: 'Could not send OTP. Please try again.' });
  }
};

// POST /api/otp/verify-phone-otp
// Body: { phone, dialCode, otp }
// Returns a short-lived verificationToken the registration form must send
// back with the final account-creation request.
exports.verifyPhoneOtp = async (req, res) => {
  try {
    const { phone, dialCode, otp } = req.body;
    const fullPhone = `${dialCode} ${phone}`.trim();

    const record = await OtpVerification.findOne({ identifier: fullPhone, purpose: 'phone_register' }).sort({ createdAt: -1 });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new OTP.' });
    }
    if (record.otpHash !== hashOtp(otp)) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
    }

    const verificationToken = crypto.randomBytes(24).toString('hex');
    record.verified = true;
    record.verificationToken = verificationToken;
    await record.save();

    res.status(200).json({ success: true, message: 'Phone number verified!', verificationToken });
  } catch (error) {
    console.error('Verify phone OTP error:', error.message);
    res.status(500).json({ success: false, message: 'Could not verify OTP. Please try again.' });
  }
};

// Used internally by authController.register() to confirm the phone was
// genuinely OTP-verified before creating the account.
exports.checkPhoneVerificationToken = async (fullPhone, token) => {
  if (!token) return false;
  const record = await OtpVerification.findOne({
    identifier: fullPhone,
    purpose: 'phone_register',
    verified: true,
    verificationToken: token
  });
  return !!record;
};

// ---------------------------------------------------------------------
// Email OTP — used from Settings > Account Verification for an existing
// logged-in user (distinct from the link-based verification sent at
// registration; some users prefer entering a code over clicking a link).
// ---------------------------------------------------------------------

exports.sendEmailOtp = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Your email is already verified' });
    }

    const otp = generateOtp();
    await OtpVerification.deleteMany({ identifier: user.email, purpose: 'email_verify' });
    await OtpVerification.create({
      identifier: user.email,
      purpose: 'email_verify',
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MS)
    });

    const { getTransporter } = require('../utils/email');
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || 'Himalaya Connect <no-reply@himalayaconnect.app>',
      to: user.email,
      subject: 'Your Himalaya Connect verification code',
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your verification code is:</p><h2 style="letter-spacing:4px;">${otp}</h2><p>This code expires in 10 minutes.</p>`
    });

    res.status(200).json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Send email OTP error:', error.message);
    res.status(500).json({ success: false, message: 'Could not send OTP. Please try again.' });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const record = await OtpVerification.findOne({ identifier: user.email, purpose: 'email_verify' }).sort({ createdAt: -1 });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new OTP.' });
    }
    if (record.otpHash !== hashOtp(otp)) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
    }

    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
    await OtpVerification.deleteOne({ _id: record._id });

    res.status(200).json({ success: true, message: 'Email verified! 🎉' });
  } catch (error) {
    console.error('Verify email OTP error:', error.message);
    res.status(500).json({ success: false, message: 'Could not verify OTP. Please try again.' });
  }
};
