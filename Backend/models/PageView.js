const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
  path: { type: String, required: true, index: true },
  sessionId: { type: String, index: true }, // anonymous per-browser id, from a cookie-less localStorage id
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userAgent: String,
  referrer: String,
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('PageView', pageViewSchema);
