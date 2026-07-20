const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getReviews } = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/:type/:entityId', getReviews);

module.exports = router;
