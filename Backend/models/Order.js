const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyerName: {
        type: String,
        default: ''
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        productName: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    deliveryAddress: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    payment: {
        method: {
            type: String,
            enum: ['online', 'cash'],
            default: 'cash'
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        },
        transactionId: String,
        paidAt: Date
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

orderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);