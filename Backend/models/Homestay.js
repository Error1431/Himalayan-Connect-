const mongoose = require('mongoose');

const homestaySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  homestayName: {
    type: String,
    required: true
  },
  tagline: String,
  description: {
    short: String,
    detailed: String,
    aiGenerated: String
  },
  location: {
    village: String,
    nearestTown: String,
    district: String,
    state: { type: String, default: 'Uttarakhand' },
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    accessibility: String,
    nearbyAttractions: [String]
  },
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  roomTypes: [{
    name: String,
    description: String,
    capacity: Number,
    totalRooms: Number,
    availableRooms: Number,
    pricing: {
      basePrice: Number,
      weekendPrice: Number,
      monsoonPrice: Number,
      currency: { type: String, default: 'INR' }
    },
    amenities: [String],
    images: [String]
  }],
  facilities: {
    wifi: Boolean,
    parking: Boolean,
    meals: Boolean,
    bonfire: Boolean,
    trekking: Boolean,
    farmVisit: Boolean,
    organicFood: Boolean,
    electricBackup: Boolean,
    hotWater: Boolean
  },
  experiences: [{
    name: String,
    description: String,
    duration: String,
    price: Number,
    included: Boolean,
    seasonalAvailability: [String]
  }],
  farmToTablePartnership: {
    partneredFarmers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer'
    }],
    servesOrganicProduce: Boolean,
    sourceDescription: String
  },
  offseasonPackages: [{
    name: String,
    description: String,
    duration: String,
    price: Number,
    validFrom: Date,
    validTo: Date,
    targetAudience: String,
    itinerary: [String]
  }],
  availability: {
    openAllYear: Boolean,
    closedMonths: [String],
    peakSeason: [String]
  },
  bookingRules: {
    checkInTime: String,
    checkOutTime: String,
    minimumStay: Number,
    maximumStay: Number,
    cancellationPolicy: String,
    advanceBookingDays: Number
  },
  ratings: {
    overall: { type: Number, default: 0 },
    cleanliness: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    hospitality: { type: Number, default: 0 },
    location: { type: Number, default: 0 },
    value: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: String
  },
  verification: {
    verified: Boolean,
    documents: [String],
    touristLicense: String
  },
  featured: {
    type: Boolean,
    default: false
  },
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

homestaySchema.pre('save', function (next) {
  if (this.isModified('homestayName')) {
    this.seo.slug = this.homestayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.models.Homestay || mongoose.model('Homestay', homestaySchema);