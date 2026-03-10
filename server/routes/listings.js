const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');

router.get('/', async (_req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    return res.json(listings);
  } catch {
    return res.status(500).json({ message: 'Could not load listings' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const listing = await Listing.findOne({ slug: req.params.slug });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    return res.json(listing);
  } catch {
    return res.status(500).json({ message: 'Could not load listing' });
  }
});

module.exports = router;
