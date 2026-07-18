const express = require('express');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin } = require('../middleware/validators');
const { passport, googleConfigured } = require('../config/passport');
const {
    register, login, getMe, refreshToken, logout,
    verifyEmail, resendVerification, googleCallback
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/me', protect, getMe);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, resendVerification);

// Google OAuth ("Sign in with Google") — only active once GOOGLE_CLIENT_ID
// and GOOGLE_CLIENT_SECRET are set in .env (see config/passport.js).
//
// ?intent=login  -> only signs in an EXISTING account (declines otherwise)
// ?intent=register (default) -> creates a new account if one doesn't exist
router.get('/google', (req, res, next) => {
    if (!googleConfigured) {
        return res.status(503).json({
            message: 'Google sign-in is not configured on this server yet. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Backend/.env.'
        });
    }
    const intent = req.query.intent === 'login' ? 'login' : 'register';
    passport.authenticate('google', { scope: ['profile', 'email'], session: false, state: intent })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!googleConfigured) {
        return res.redirect(`${frontendUrl}/login?oauth_error=google_not_configured`);
    }

    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Google OAuth error:', err.message);
            return res.redirect(`${frontendUrl}/login?oauth_error=google_auth_failed`);
        }
        if (!user) {
            // info.code is 'NO_ACCOUNT' when someone tried to log in with a
            // Google email that has no account here — decline with a clear,
            // professional message instead of silently creating one.
            const code = (info && info.code) || 'google_auth_failed';
            return res.redirect(`${frontendUrl}/login?oauth_error=${code}`);
        }
        req.user = user;
        

        req.frontendUrl = frontendUrl;
        
        return googleCallback(req, res);
    })(req, res, next);
});

module.exports = router;
