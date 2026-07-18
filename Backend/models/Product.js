const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  productName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  sku: {
    type: String,
    trim: true,
    sparse: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Vegetables', 'Fruits', 'Grains & Pulses', 'Organic Foods', 'Pulses', 'Millets', 'Herbs', 'Processed Foods', 'Processed'],
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    default: ''
  },
  aiGeneratedDescription: {
    type: String,
    default: ''
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['kg', 'quintal', 'piece', 'bunch', 'liter', 'dozen', 'litre'],
      default: 'kg'
    },
    minimumOrder: {
      type: Number,
      default: 1,
      min: 1
    },
    bulkDiscount: {
      quantity: { type: Number, min: 0 },
      discountPercent: { type: Number, min: 0, max: 100 }
    }
  },
  availability: {
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    inStock: {
      type: Boolean,
      default: true
    },
    harvestDate: Date,
    expiryDate: Date
  },
  locationAddress: {
    type: String,
    default: ''
  },
  locationZipCode: {
    type: String,
    default: '',
    index: true
  },
  locationLat: {
    type: Number
  },
  locationLng: {
    type: Number
  },
  geoSpatialLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  imageUrl: {
    type: String,
    default: ''
  },
  images: [{
    url: String,
    publicId: String
  }],
  harvestStatus: {
    type: String,
    enum: ['Ready', 'Partially Ready', 'Growing'],
    default: 'Ready',
    index: true
  },
  expectedHarvestDate: {
    type: Date
  },
  organicCertification: {
    certified: { type: Boolean, default: false },
    certificateUrl: String,
    certifyingBody: String,
    issueDate: Date
  },
  nutritionalInfo: {
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 },
    carbs: { type: Number, min: 0 },
    fat: { type: Number, min: 0 },
    fiber: { type: Number, min: 0 }
  },
  originStory: {
    type: String,
    default: ''
  },
  farmToTableDistance: {
    type: Number,
    min: 0
  },
  carbonFootprint: {
    type: String,
    default: ''
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now }
  }],
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Out of Stock', 'Archived'],
    default: 'Active',
    index: true
  }
}, {
  timestamps: true
});

productSchema.index({ productName: 'text', description: 'text', tags: 'text' });
productSchema.index({ geoSpatialLocation: '2dsphere' });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);