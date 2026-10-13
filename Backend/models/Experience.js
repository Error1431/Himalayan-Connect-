const mongoose = require('mongoose');

// Tourism & Culture module — weddings, farm visits, farm-work days,
// treks/hikes with certified guides, and village-exploration experiences.
const experienceSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'wedding',       // Uttarakhand / village / India weddings
      'farm_visit',    // watch crops grow live + taste farm-fresh produce
      'farm_work',     // work alongside the farmer, hands-in-the-soil
      'trek',          // multi-day trek with a certified guide
      'hiking',        // shorter day hikes
      'village_tour'   // explore a village, its culture and daily life
    ],
    required: true
  },
  culture: {
    type: String,
    enum: ['garhwali', 'kumaoni', 'jaunsari', 'other'],
    default: 'other'
  },
  description: {
    short: String,
    detailed: String
  },
  location: {
    village: String,
    district: String,
    state: { type: String, default: 'Uttarakhand' },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  images: [{
    url: String,
    caption: String
  }],
  duration: String,           // e.g. "3 hours", "2 days 1 night"
  theme: String,               // e.g. "Traditional Garhwali", "Kumaoni Folk", "Adventure"
  route: {
    from: String,
    to: String
  },
  cropsGrown: [String],         // for farm_visit / farm_work — what's growing right now
  howToReach: String,           // directions to the farm / village
  highlights: [{
    type: String,
    enum: [
      'viewpoint',        // sunrise/sunset mountain or valley viewpoint
      'farming',          // terraced fields, irrigation, cattle sheds, farming tools
      'local_food',       // cook/eat authentic local dishes together
      'traditional_house', // stone/wood traditional village house
      'wild_trail',        // forest trail, stream, waterfall, meadow
      'village_evening',   // evening tea/snacks with the village
      'local_culture',     // folk music, dance, local instruments
      'night_sky'          // stargazing under a dark Himalayan sky
    ]
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'challenging'],
    default: 'easy'
  },
  price: {
    amount: { type: Number, required: true },
    unit: { type: String, default: 'per person' },
    currency: { type: String, default: 'INR' }
  },
  groupSize: {
    min: { type: Number, default: 1 },
    max: { type: Number, default: 10 }
  },
  guide: {
    name: String,
    certified: { type: Boolean, default: false },
    certificationBody: String,   // e.g. "Uttarakhand Tourism / IMF"
    experienceYears: Number,
    languages: [String]
  },
  includes: [String],           // e.g. ["Meals", "Local transport", "Homestay"]
  seasonality: [String],        // e.g. ["March-June", "September-November"]
  availability: {
    openAllYear: { type: Boolean, default: true },
    closedMonths: [String]
  },
  ratings: {
    overall: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  verification: {
    verified: { type: Boolean, default: false },
    documents: [String]
  },
  featured: {
    type: Boolean,
    default: false
  },
  inquiries: [{
    name: String,
    phone: String,
    date: Date,
    guests: Number,
    fromLocation: String,
    toLocation: String,
    notes: String,
    createdAt: { type: Date, default: Date.now }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Experience || mongoose.model('Experience', experienceSchema);
