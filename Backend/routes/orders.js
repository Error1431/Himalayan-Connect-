const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const protect = authMiddleware.verifyAccessToken || authMiddleware.protect || authMiddleware;

router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { status, page = 1, limit = 10 } = req.query;

        const query = { buyer: userId };
        if (status) query.status = status;

        const skip = (page - 1) * limit;

        const orders = await Order.find(query)
            .populate('items.product', 'productName imageURL basePrice')
            .populate('farmer', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            count: orders.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            orders
        });
    } catch (error) {
        console.error('Fetch consumer orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

router.post('/', protect, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { items, deliveryAddress, notes, payment } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart items are required' });
        }

        // Group cart items by seller so each seller gets their own order.
        const bySeller = {};
        for (const item of items) {
            const sellerId = item.sellerId;
            if (!sellerId) continue;
            if (!bySeller[sellerId]) bySeller[sellerId] = [];
            bySeller[sellerId].push(item);
        }

        const createdOrders = await Order.insertMany(
            Object.entries(bySeller).map(([sellerId, sellerItems]) => ({
                farmer: sellerId,
                buyer: userId,
                buyerName: req.user.name || '',
                items: sellerItems.map((i) => ({
                    product: i.type === 'product' ? i.id : undefined,
                    productName: i.name,
                    quantity: i.qty,
                    price: i.price
                })),
                totalAmount: sellerItems.reduce((sum, i) => sum + i.qty * i.price, 0),
                deliveryAddress: deliveryAddress || '',
                notes: notes || '',
                payment: payment && payment.method === 'online'
                    ? { method: 'online', status: 'paid', transactionId: payment.transactionId, paidAt: new Date() }
                    : { method: 'cash', status: 'pending' },
                status: payment && payment.method === 'online' ? 'confirmed' : 'pending'
            }))
        );

        res.status(201).json({
            success: true,
            message: 'Order request placed successfully',
            orders: createdOrders
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
});

// GET /api/orders/received — orders placed AGAINST this user's products
// (i.e. this user is the seller/farmer, not the buyer). Powers the
// "Recent Orders" table on the Farmer Dashboard's Market Analysis tab.
router.get('/received', protect, async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { limit = 10 } = req.query;

        const orders = await Order.find({ farmer: userId })
            .populate('buyer', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const totalRevenue = await Order.aggregate([
            { $match: { farmer: new mongoose.Types.ObjectId(userId), 'payment.status': 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            success: true,
            orders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalOrders: await Order.countDocuments({ farmer: userId })
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching received orders', error: error.message });
    }
});

module.exports = router;