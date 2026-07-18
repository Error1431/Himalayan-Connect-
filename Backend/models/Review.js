const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['product', 'homestay'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'type'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    // For homestays
    cleanliness: Number,
    food: Number,
    hospitality: Number,
    location: Number,
    value: Number
  },
  title: String,
  comment: {
    type: String,
    required: true
  },
  images: [String],
  aiSentiment: {
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    themes: [String],
    suggestedResponse: String
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  response: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  verified: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);