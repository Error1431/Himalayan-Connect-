const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const farmers = await Farmer.find()
      .populate('userId', 'name email phone')
      .lean();

    res.status(200).json({
      success: true,
      count: farmers.length,
      data: farmers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch farmers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;