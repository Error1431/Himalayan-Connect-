const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerId: {
    type: String,
    unique: true,
    required: true
  },
  farmerGroup: {
    type: String,
    enum: ['Group-1', 'Group-2', 'Group-3', 'Group-4', 'Group-5',
      'Group-6', 'Group-7', 'Group-8', 'Group-9', 'Group-10',
      'Group-11', 'Group-12'],
    required: true
  },
  farmDetails: {
    totalLand: Number, // in acres
    irrigatedLand: Number,
    organicCertified: {
      type: Boolean,
      default: false
    },
    certificationNumber: String,
    farmingType: {
      type: String,
      enum: ['organic', 'traditional', 'mixed']
    }
  },
  crops: [{
    cropName: String,
    variety: String,
    plantingDate: Date,
    expectedHarvestDate: Date,
    estimatedYield: Number, // in quintals
    actualYield: Number
  }],
  harvestReadiness: {
    status: {
      type: String,
      enum: ['Ready', 'Partially Ready', 'Not Ready'],
      default: 'Not Ready'
    },
    lastUpdated: Date
  },
  collectionSchedule: [{
    date: Date,
    vegetable: String,
    quantity: Number,
    status: {
      type: String,
      enum: ['scheduled', 'collected', 'cancelled']
    }
  }],
  yieldHistory: [{
    crop: String,
    season: String,
    year: Number,
    yield: Number,
    marketPrice: Number,
    revenue: Number
  }],
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String
  },

  // 🔴 CODES INTEGRATED INSIDE THE SCHEMA PROPERLY WITH COMMA SEPARATION:
  aadhaarNumber: {
    type: String
  },
  aadhaarDocumentUrl: {
    type: String
  },
  aadhaarVerified: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'razorpay'],
    default: 'upi'
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Farmer || mongoose.model('Farmer', farmerSchema);