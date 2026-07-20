const Review = require('../models/Review');
const Product = require('../models/Product');
const Homestay = require('../models/Homestay');

// Recomputes and saves the aggregate rating on the Product/Homestay document
// whenever a review is added, so listing pages show a real average instead
// of a hardcoded placeholder.
async function recomputeRating(type, entityId) {
  const reviews = await Review.find({ type, entityId });
  const count = reviews.length;
  const average = count > 0
    ? reviews.reduce((sum, r) => sum + r.rating.overall, 0) / count
    : 0;

  if (type === 'product') {
    await Product.findByIdAndUpdate(entityId, {
      'ratings.average': Math.round(average * 10) / 10,
      'ratings.count': count
    });
  } else {
    await Homestay.findByIdAndUpdate(entityId, {
      'ratings.overall': Math.round(average * 10) / 10,
      'ratings.totalReviews': count
    });
  }
}

// POST /api/reviews
// Body: { type: 'product'|'homestay', entityId, rating, title?, comment }
exports.createReview = async (req, res) => {
  try {
    const { type, entityId, rating, title, comment } = req.body;
    const customerId = req.user.id || req.user._id;

    if (!type || !entityId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'type, entityId, rating and comment are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // One review per customer per product/homestay — resubmitting updates
    // the existing review instead of creating duplicates.
    const review = await Review.findOneAndUpdate(
      { type, entityId, customer: customerId },
      {
        type,
        entityId,
        customer: customerId,
        rating: { overall: rating },
        title: title || '',
        comment,
        verified: true // came from an authenticated user with an account here
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await recomputeRating(type, entityId);

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('Create review error:', error.message);
    res.status(500).json({ success: false, message: 'Could not save review' });
  }
};

// GET /api/reviews/:type/:entityId
exports.getReviews = async (req, res) => {
  try {
    const { type, entityId } = req.params;
    if (!['product', 'homestay'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be product or homestay' });
    }

    const reviews = await Review.find({ type, entityId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    const count = reviews.length;
    const average = count > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating.overall, 0) / count) * 10) / 10
      : 0;

    res.status(200).json({ success: true, reviews, average, count });
  } catch (error) {
    console.error('Get reviews error:', error.message);
    res.status(500).json({ success: false, message: 'Could not load reviews' });
  }
};
