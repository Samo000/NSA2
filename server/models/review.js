const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productSlug: { type: String, required: true, index: true },
    author: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, minlength: 10, maxlength: 1200 }
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, productSlug: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
