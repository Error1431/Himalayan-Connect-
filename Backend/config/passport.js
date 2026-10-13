const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only registers the Google strategy if credentials are actually configured,
// so the server doesn't crash on startup when a developer hasn't set up
// OAuth yet. GET /api/auth/google will return a clear error until they do.
const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (googleConfigured) {
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${backendUrl}/api/auth/google/callback`,
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] && profile.emails[0].value;
          if (!email) {
            return done(null, false, { code: 'NO_EMAIL', message: 'Google account has no public email' });
          }

          // 'state' carries which page started the flow — Login only signs
          // existing users in; Register is allowed to create a new account.
          const intent = req.query.state === 'login' ? 'login' : 'register';

          let user = await User.findOne({ email: email.toLowerCase() });

          if (!user) {
            if (intent === 'login') {
              // Someone tried "Sign in with Google" for an email that has
              // no account here yet — decline instead of silently creating
              // one, and tell the frontend why.
              return done(null, false, { code: 'NO_ACCOUNT', message: 'No account found for this Google email. Please register first.' });
            }

            // New sign-ups via Google land as 'customer' by default (the
            // common "one-click sign in" case). They can switch/upgrade
            // their account type later from Settings.
            user = await User.create({
              name: profile.displayName || email.split('@')[0],
              email: email.toLowerCase(),
              // 'phone' has a unique index — a fixed placeholder here meant
              // only the very first Google sign-up ever succeeded, and every
              // one after it failed with a duplicate-key error (which is
              // exactly the "google_auth_failed" bug reported). Each OAuth
              // user now gets its own unique placeholder instead.
              phone: `google-${profile.id}`,
              phoneCountryCode: '+91',
              password: require('crypto').randomBytes(20).toString('hex'), // unused, but required by the schema
              role: 'customer',
              avatar: profile.photos && profile.photos[0] && profile.photos[0].value,
              isEmailVerified: true // Google has already verified this email
            });
          } else if (!user.isEmailVerified) {
            user.isEmailVerified = true;
            await user.save({ validateBeforeSave: false });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

module.exports = { passport, googleConfigured };
