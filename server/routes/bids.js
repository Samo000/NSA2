const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const Bid = require('../models/Bid');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const { listingId, amount } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });

  if (listing.type !== 'auction')
    return res.status(400).json({ message: 'Not an auction' });

  if (new Date() > listing.auctionEnd)
    return res.status(400).json({ message: 'Auction ended' });

  if (amount <= listing.currentBid)
    return res.status(400).json({ message: 'Bid too low' });

  listing.currentBid = amount;
  await listing.save();

  await Bid.create({
    listing: listing._id,
    bidder: req.user.id,
    amount
  });

  res.json({ message: 'Bid placed', currentBid: amount });
});

module.exports = router;