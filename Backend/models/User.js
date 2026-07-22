const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  phoneCountryCode: {
    type: String,
    default: '+91'
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['farmer', 'homestay_owner', 'homestay', 'customer', 'admin'], // 🔴 Syncing custom enums
    required: true
  },
  avatar: String,
  location: {
    village: String,
    district: String,
    state: { type: String, default: 'Uttarakhand' },
    country: { type: String, default: 'India' },
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    url: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },

  // Email verification (separate from the KYC "verified" field above)
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  // 🔴 INTEGRATING NEW COMPLIANCE FIELDS SECURELY INSIDE THE SCHEMA:
  bio: { 
    type: String 
  },
  rating: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);