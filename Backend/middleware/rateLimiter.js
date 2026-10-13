const rateLimit = require('express-rate-limit');

// Login is the real brute-force / credential-stuffing target, so it keeps
// a strict, dedicated limit — separate from registration/OTP so a normal
// signup flow can never eat into it.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts from this device. Please try again in 15 minutes.'
  }
});

// A single registration commonly involves several legitimate requests —
// send OTP, maybe resend once, verify OTP, then create the account, and
// sometimes a retry after a validation error (e.g. weak password, phone
// already registered). Its own, more generous bucket avoids blocking a
// real user partway through signing up.
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many registration attempts from this device. Please try again in 15 minutes.'
  }
});

// Phone/email OTP send + verify. Generous enough to cover mistyped OTPs
// and a resend or two, while still capping abuse of the SMS/email gateway.
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests from this device. Please wait a few minutes and try again.'
  }
});

// Password reset requests — less frequently retried legitimately, so this
// stays closer to the original strict limit.
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many password reset attempts from this device. Please try again in 15 minutes.'
  }
});

// Limits calls to the real AI API (OpenAI) to 20 per 15 minutes per IP.
// This is a paid, rate-limited third-party API, so we protect it from
// accidental abuse (e.g. a bug that fires requests in a loop) in addition
// to whatever limits OpenAI itself applies.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You have reached the AI assistant limit for now. Please try again in a few minutes.'
  }
});

// Kept for any code that still imports the old combined name — maps to
// the login limiter, the strictest of the new set.
const authLimiter = loginLimiter;

module.exports = { authLimiter, loginLimiter, registerLimiter, otpLimiter, passwordResetLimiter, aiLimiter };
