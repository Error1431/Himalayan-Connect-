const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// DigiLocker (India's government document-verification service) requires
// official partner credentials, approved via https://partners.digilocker.gov.in
// or a KYC aggregator like Setu/Surepass — these can't be generated without
// the platform owner going through that approval process. This endpoint is
// wired up exactly like the Google OAuth integration (see config/passport.js)
// so it activates automatically the moment DIGILOCKER_CLIENT_ID /
// DIGILOCKER_CLIENT_SECRET are added to .env — until then it fails clearly
// instead of pretending to work.
router.get('/digilocker', protect, (req, res) => {
  if (!process.env.DIGILOCKER_CLIENT_ID || !process.env.DIGILOCKER_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      code: 'DIGILOCKER_NOT_CONFIGURED',
      message: 'DigiLocker verification is not connected on this server yet. Please upload your Aadhaar document manually instead.'
    });
  }

  // Once configured, this would redirect to DigiLocker's OAuth authorize URL,
  // e.g.: https://api.digitallocker.gov.in/public/oauth2/1/authorize?...
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const authorizeUrl = `https://api.digitallocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${process.env.DIGILOCKER_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${backendUrl}/api/verification/digilocker/callback`)}&state=${req.user.id}`;

  res.json({ success: true, url: authorizeUrl });
});

// Callback DigiLocker would redirect to after the user approves — exchanges
// the auth code for their e-Aadhaar and marks verification.number/verified
// on the User document. Left as a scaffold since it can't be tested without
// real credentials; the shape follows DigiLocker's published API docs.
router.get('/digilocker/callback', protect, async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'DigiLocker callback handling is scaffolded but not implemented — wire this up once you have partner credentials and can test against their sandbox.'
  });
});

module.exports = router;
