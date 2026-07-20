const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true, index: true }, // phone (with dial code) or email
  purpose: { type: String, enum: ['phone_register', 'email_verify'], required: true },
  otpHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String }, // set once verified; proves this identifier was OTP-checked
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Auto-delete expired OTP docs so the collection doesn't grow forever.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpVerification', otpSchema);
