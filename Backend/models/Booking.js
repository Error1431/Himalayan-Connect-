const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  homestay: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homestay',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guestDetails: {
    name: String,
    email: String,
    phone: String,
    numberOfGuests: Number,
    specialRequests: String,
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String
    }
  },
  booking: {
    checkIn: {
      type: Date,
      required: true
    },
    checkOut: {
      type: Date,
      required: true
    },
    nights: Number,
    roomType: String,
    numberOfRooms: Number
  },
  pricing: {
    roomPrice: Number,
    experiencePrice: Number,
    taxAmount: Number,
    discountAmount: Number,
    totalAmount: Number
  },
  payment: {
    method: {
      type: String,
      enum: ['online', 'cash', 'upi', 'bank_transfer']
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAmount: Number,
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
    default: 'pending'
  },
  cancellation: {
    cancelled: Boolean,
    cancelledBy: {
      type: String,
      enum: ['customer', 'owner', 'admin']
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number
  },
  review: {
    submitted: Boolean,
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  }
}, {
  timestamps: true
});

// Generate unique booking ID
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  
  // Calculate nights
  if (this.booking.checkIn && this.booking.checkOut) {
    const diffTime = Math.abs(this.booking.checkOut - this.booking.checkIn);
    this.booking.nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  next();
});

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);