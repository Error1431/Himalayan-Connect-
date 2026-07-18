const User = require('../models/User');
const Post = require('../models/Post');
const Farm = require('../models/Farm');
const Room = require('../models/Room');
const Product = require('../models/Product');
const Homestay = require('../models/Homestay');

// GET /api/profile/:id
// Returns a combined public profile: user info + their products/homestays
// + their Farm/Room detail entries + their photo/video posts — all from
// real, persistent MongoDB collections.
exports.getPublicProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    let user = null;
    try {
      user = await User.findById(userId).select('-password').lean();
    } catch (e) {
      user = null; // invalid ObjectId etc.
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const [myProducts, myHomestays, posts, farmDetails, homestayRooms] = await Promise.all([
      Product.find({ farmerId: userId }).sort({ createdAt: -1 }).lean(),
      Homestay.find({ ownerId: userId }).sort({ createdAt: -1 }).lean(),
      Post.find({ author: userId }).sort({ createdAt: -1 }).lean(),
      Farm.find({ owner: userId }).sort({ createdAt: -1 }).lean(),
      Room.find({ owner: userId }).sort({ createdAt: -1 }).lean()
    ]);

    const formattedLocation = user.location && typeof user.location === 'object'
      ? [user.location.village, user.location.district, user.location.state].filter(Boolean).join(', ')
      : user.location;

    res.status(200).json({
      success: true,
      user: { ...user, location: formattedLocation || user.location },
      products: myProducts,
      homestays: myHomestays,
      posts,
      farmDetails,
      homestayRooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to load profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
