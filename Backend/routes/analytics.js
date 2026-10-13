const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { trackPageView, getSummary } = require('../controllers/analyticsController');

// Tracking a page view doesn't require login — most visitors are anonymous.
// If a token IS present, `protect`-style user attachment happens elsewhere;
// here we just optionally read req.user if some earlier middleware set it,
// otherwise it's simply an anonymous view.
router.post('/track', trackPageView);

// Only admins can see the traffic/user dashboard.
router.get('/summary', protect, authorize('admin'), getSummary);

module.exports = router;
