const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/product');

router.get('/', async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products);
  } catch {
    return res.status(500).json({ message: 'Could not load products' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const lookup = [{ slug: req.params.slug }];
    if (mongoose.Types.ObjectId.isValid(req.params.slug)) {
      lookup.push({ _id: req.params.slug });
    }

    const product = await Product.findOne({ $or: lookup });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json(product);
  } catch {
    return res.status(500).json({ message: 'Could not load product' });
  }
});

module.exports = router;
