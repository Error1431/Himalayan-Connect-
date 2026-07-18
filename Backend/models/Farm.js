const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  farmName: {
    type: String,
    required: true,
    trim: true
  },
  areaSize: {
    type: Number
  },
  cropTypes: {
    type: String, // comma-separated list, e.g. "Rajma, Mandua, Red Rice"
    default: ''
  },
  certifications: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  contact: {
    type: String,
    default: ''
  },
  harvestSeasons: {
    type: String,
    default: ''
  },
  location: {
    type: String, // free-text address, e.g. "Chopta Village, Rudraprayag, Uttarakhand"
    default: ''
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  images: [{
    url: String,
    publicId: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.models.Farm || mongoose.model('Farm', farmSchema);
