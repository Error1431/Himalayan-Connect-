const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  roomName: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    default: 1
  },
  maxGuests: {
    type: Number,
    default: 1
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  amenities: {
    type: String, // comma-separated, e.g. "WiFi, Bonfire, Home-cooked meals"
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: String, // free-text address of the homestay/room
    default: ''
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  images: [{
    type: String // uploaded file URLs, e.g. /uploads/12345.jpg
  }]
}, {
  timestamps: true
});

module.exports = mongoose.models.Room || mongoose.model('Room', roomSchema);
