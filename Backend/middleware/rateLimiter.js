const rateLimit = require('express-rate-limit');

// Limits login and register attempts to 5 per 15 minutes per IP, as required
// by the Week 6 security checklist (brute-force / credential-stuffing protection).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many attempts from this device. Please try again in 15 minutes.'
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

module.exports = { authLimiter, aiLimiter };
