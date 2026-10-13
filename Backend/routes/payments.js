const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

// These used to return hardcoded fake "success" responses without ever
// talking to Razorpay. Now they call the real controller, which creates a
// genuine Razorpay order and verifies the payment signature.
router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);

module.exports = router;
