const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const booking = await Booking.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Booking creation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('homestay', 'homestayName')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id })
      .populate('homestay')
      .populate('customer', 'name email phone')
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;