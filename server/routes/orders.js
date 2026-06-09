const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/order');
const Product = require('../models/product');
const { sendOrderConfirmation } = require('../services/order-email');

function cleanString(value) {
  return String(value || '').trim();
}

function orderNumber() {
  return `TM-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
}

function salePrice(product) {
  const price = Number(product.price || 0);
  const discount = Math.max(0, Math.min(95, Number(product.discountPercent || 0)));
  return Math.round(price * (100 - discount)) / 100;
}

router.post('/', auth, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const checkout = req.body?.checkout || {};
    const coupon = cleanString(req.body?.coupon).toLowerCase();
    const requiredFields = ['email', 'fullName', 'phone', 'address', 'city', 'postalCode', 'country'];

    if (!items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const missingCheckout = requiredFields.some((field) => !cleanString(checkout[field]));
    if (missingCheckout) {
      return res.status(400).json({ message: 'Missing checkout details' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanString(checkout.email))) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const requestedItems = new Map();
    for (const item of items) {
      const slug = cleanString(item.slug);
      if (!slug) continue;

      const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity || item.qty || 1))));
      requestedItems.set(slug, (requestedItems.get(slug) || 0) + quantity);
    }

    const slugs = [...requestedItems.keys()];
    if (!slugs.length) {
      return res.status(400).json({ message: 'Order items are missing product slugs' });
    }

    const products = await Product.find({ slug: { $in: slugs } });
    const productBySlug = new Map(products.map((product) => [product.slug, product]));

    const orderItems = [];
    for (const [slug, quantity] of requestedItems) {
      const product = productBySlug.get(slug);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${slug}` });
      }

      if (Number(product.stock || 0) < quantity) {
        return res.status(409).json({ message: `${product.name} is out of stock` });
      }

      const unitPrice = salePrice(product);
      orderItems.push({
        product: product._id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        unitPrice,
        quantity,
        total: Math.round(unitPrice * quantity)
      });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const discount = coupon === 'koren5' ? Math.round(subtotal * 0.05) : 0;
    const total = Math.max(0, subtotal - discount);
    const number = orderNumber();

    const order = await Order.create({
      user: req.user.id,
      product: orderItems[0]?.product,
      quantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      orderNumber: number,
      items: orderItems,
      customer: {
        email: cleanString(checkout.email).toLowerCase(),
        fullName: cleanString(checkout.fullName),
        phone: cleanString(checkout.phone)
      },
      shippingAddress: {
        address: cleanString(checkout.address),
        city: cleanString(checkout.city),
        postalCode: cleanString(checkout.postalCode),
        country: cleanString(checkout.country)
      },
      shippingMethod: cleanString(checkout.shipping) || 'standard',
      paymentMethod: cleanString(checkout.payment) || 'card',
      subtotal,
      discount,
      total,
      status: checkout.payment === 'cod' ? 'pending' : 'paid'
    });

    await Product.bulkWrite(
      orderItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: -item.quantity } }
        }
      })),
      { ordered: false }
    );

    let emailSent = false;
    try {
      const emailResult = await sendOrderConfirmation(order);
      emailSent = Boolean(emailResult.sent);
    } catch (error) {
      console.error(`Order confirmation email failed for ${order.orderNumber}:`, error);
    }

    return res.status(201).json({
      message: 'Order created',
      orderNumber: order.orderNumber,
      emailSent,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        items: order.items,
        total: order.total,
        status: order.status
      }
    });
  } catch {
    return res.status(500).json({ message: 'Could not create order' });
  }
});

module.exports = router;
