const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/email');
const { checkPhoneVerificationToken } = require('./otpController');

function buildUserResponse(user) {
  const obj = user.toObject ? user.toObject() : user;
  const { password, ...rest } = obj;
  return rest;
}

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '30d' });
}

// Normalize role synonyms so 'homestay' and 'homestay_owner' are treated
// as the same account type wherever the app checks req.user.role.
function normalizeRole(role) {
  if (role === 'homestay') return 'homestay_owner';
  return role;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, phoneCountryCode, password, role, location, phoneVerificationToken } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: 'Name, email, phone, password and role are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // The phone must have gone through the real OTP flow (POST
    // /api/otp/send-phone-otp then /verify-phone-otp) — this proves the
    // number actually belongs to the person registering.
    const isPhoneVerified = await checkPhoneVerificationToken(phone, phoneVerificationToken);
    if (!isPhoneVerified) {
      return res.status(400).json({ message: 'Phone number is not verified. Please verify it with the OTP first.' });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
      return res.status(400).json({ message: 'Phone number is already registered' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      phoneCountryCode: phoneCountryCode || '+91',
      password, // hashed automatically by the User model's pre-save hook
      role: normalizeRole(role),
      location: location || {}
    });

    // Generate an email verification token (24h expiry) and email it to the user.
    // Registration/login still succeed even if the email fails to send —
    // the user can request a new verification link from their settings.
    const rawToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = hashToken(rawToken);
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail(user, rawToken);
    } catch (emailError) {
      console.error('Could not send verification email:', emailError.message);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      accessToken,
      token: accessToken,
      refreshToken,
      user: buildUserResponse(user),
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || { field: 1 })[0];
      return res.status(400).json({ message: `This ${field} is already registered` });
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message });
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      accessToken,
      token: accessToken,
      refreshToken,
      user: buildUserResponse(user)
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = (req, res) => {
  res.status(200).json(buildUserResponse(req.user));
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    const accessToken = generateAccessToken(user);
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const hashed = hashToken(token);
    const user = await User.findOne({
      emailVerificationToken: hashed,
      emailVerificationExpires: { $gt: Date.now() }
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({ message: 'This verification link is invalid or has expired' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: 'Email verified successfully! You can now use all features.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not verify email', error: error.message });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Your email is already verified' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = hashToken(rawToken);
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user, rawToken);

    res.status(200).json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not resend verification email', error: error.message });
  }
};

// Called after Passport's Google strategy has already authenticated the
// user (req.user is a Mongoose User doc at this point). Issues our own
// JWTs and hands the browser back to the frontend with them in the URL,
// since this is a redirect-based OAuth flow rather than an XHR call.
exports.googleCallback = (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const user = req.user;

  if (!user) {
    return res.redirect(`${frontendUrl}/login?oauth_error=google_auth_failed`);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const params = new URLSearchParams({ accessToken, refreshToken });
  res.redirect(`${frontendUrl}/oauth-success?${params.toString()}`);
};

// POST /api/auth/forgot-password
// Body: { email }
// Always responds with the same generic success message whether or not the
// email exists — this prevents someone from using this endpoint to check
// which emails are registered on the platform.
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = hashToken(rawToken);
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save({ validateBeforeSave: false });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

      try {
        const { getTransporter } = require('../utils/email');
        await getTransporter().sendMail({
          from: process.env.SMTP_FROM || 'Himalaya Connect <no-reply@himalayaconnect.app>',
          to: user.email,
          subject: 'Reset your Himalaya Connect password',
          text: `Hi ${user.name},\n\nWe received a request to reset your password. Click the link below to choose a new one (valid for 1 hour):\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email — your password will stay the same.\n\n— Himalaya Connect Team`,
          html: `<p>Hi ${user.name},</p><p>We received a request to reset your password. Click the button below to choose a new one (valid for 1 hour):</p><p><a href="${resetUrl}" style="background:#059669;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Reset Password</a></p><p>Or open this link: ${resetUrl}</p><p>If you didn't request this, you can safely ignore this email — your password will stay the same.</p><p>— Himalaya Connect Team</p>`
        });
      } catch (emailError) {
        console.error('Could not send password reset email:', emailError.message);
      }
    }

    res.status(200).json({ message: 'If an account exists with that email, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not process the request', error: error.message });
  }
};

// POST /api/auth/reset-password/:token
// Body: { password }
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hashed = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired. Please request a new one.' });
    }

    user.password = password; // re-hashed automatically by the pre-save hook
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not reset password', error: error.message });
  }
};
