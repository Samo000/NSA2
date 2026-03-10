const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, index: true },
  category: String,
  price: Number,
  stock: Number,
  description: String,
  image: String,
  specs: { type: [String], default: [] },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  isAuction: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)
