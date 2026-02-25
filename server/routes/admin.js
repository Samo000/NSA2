const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const User = require('../models/user');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/users', auth, admin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.delete('/listing/:id', auth, admin, async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;