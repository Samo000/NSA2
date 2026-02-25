const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  images: [String],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['buyNow', 'auction'] },
  price: Number,
  currentBid: Number,
  buyoutPrice: Number,
  auctionEnd: Date,
  condition: String,
  shippingInfo: String,
  slug: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', listingSchema);