const crypto = require('crypto');

let razorpayInstance = null;
function getRazorpay() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return null;
    }
    if (!razorpayInstance) {
        const Razorpay = require('razorpay');
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
}

// POST /api/payments/create-order
// Body: { amount: number (in rupees), notes?: object }
// Creates a real Razorpay order so the frontend can open the Razorpay
// Checkout modal (which itself offers UPI, cards, netbanking and wallets).
exports.createOrder = async (req, res) => {
    try {
        const { amount, notes } = req.body;
        const numericAmount = Number(amount);

        if (!numericAmount || numericAmount <= 0) {
            return res.status(400).json({ success: false, message: 'A valid amount is required' });
        }

        const razorpay = getRazorpay();
        if (!razorpay) {
            return res.status(503).json({
                success: false,
                code: 'PAYMENTS_NOT_CONFIGURED',
                message: 'Online payments are not configured on this server yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to Backend/.env.',
            });
        }

        const order = await razorpay.orders.create({
            amount: Math.round(numericAmount * 100), // paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: notes || {},
        });

        res.status(200).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Create payment order error:', error.message);
        res.status(500).json({ success: false, message: 'Could not create payment order' });
    }
};

// POST /api/payments/verify-payment
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Verifies the HMAC signature Razorpay returns after a successful checkout,
// so the frontend can't just claim "payment succeeded" without proof.
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, verified: false, message: 'Missing payment details' });
        }
        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(503).json({ success: false, verified: false, message: 'Payments are not configured on this server yet.' });
        }

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        const verified = expectedSignature === razorpay_signature;

        if (!verified) {
            return res.status(400).json({ success: false, verified: false, message: 'Payment signature could not be verified' });
        }

        res.status(200).json({
            success: true,
            verified: true,
            transactionId: razorpay_payment_id,
            orderId: razorpay_order_id,
        });
    } catch (error) {
        console.error('Verify payment error:', error.message);
        res.status(500).json({ success: false, verified: false, message: 'Payment verification failed' });
    }
};
