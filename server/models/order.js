const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    orderNumber: { type: String, unique: true, sparse: true },
    items: {
      type: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
          slug: String,
          name: String,
          image: String,
          unitPrice: { type: Number, default: 0 },
          quantity: { type: Number, default: 1 },
          total: { type: Number, default: 0 }
        }
      ],
      default: []
    },
    customer: {
      email: String,
      fullName: String,
      phone: String
    },
    shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      country: String
    },
    shippingMethod: { type: String, default: 'standard' },
    paymentMethod: { type: String, default: 'card' },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
