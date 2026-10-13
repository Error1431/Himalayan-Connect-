const mongoose = require('mongoose');

/**
 * CollectionSchedule — pickup schedule shown on the "Collection Schedule" tab.
 * Created either manually by farmer ("request pickup") or auto-generated
 * when an order is confirmed (your call — see collectionScheduleRoutes.js).
 */
const collectionScheduleSchema = new mongoose.Schema(
    {
        farmer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        },
        pickupDate: { type: Date, required: true },
        pickupWindow: { type: String, default: '9:00 AM - 12:00 PM' },
        address: { type: String, default: '' },
        quantity: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'missed', 'cancelled'],
            default: 'scheduled',
            index: true
        },
        notes: { type: String, default: '' }
    },
    { timestamps: true }
);

module.exports =
    mongoose.models.CollectionSchedule ||
    mongoose.model('CollectionSchedule', collectionScheduleSchema);