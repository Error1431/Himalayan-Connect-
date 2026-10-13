const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        authorRole: { type: String, enum: ['farmer', 'homestay', 'homestay_owner'], required: true },
        type: { type: String, enum: ['text', 'image', 'video'], required: true },
        content: { type: String, trim: true },
        mediaUrl: { type: String },
        caption: { type: String, trim: true },
        location: { type: String, trim: true },
        likes: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);