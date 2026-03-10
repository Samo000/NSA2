const router = require('express').Router();
const auth = require('../middleware/auth');
const Wishlist = require('../models/wishlist');

function normalizeSlugs(input) {
  if (!Array.isArray(input)) return [];

  const seen = new Set();
  const result = [];

  input.forEach((item) => {
    const slug = String(item || '').trim();
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    result.push(slug);
  });

  return result.slice(0, 200);
}

router.get('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    return res.json({ slugs: wishlist?.slugs || [] });
  } catch {
    return res.status(500).json({ message: 'Could not load wishlist' });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const slugs = normalizeSlugs(req.body?.slugs);

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user.id },
      { $set: { slugs } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ slugs: wishlist.slugs || [] });
  } catch {
    return res.status(500).json({ message: 'Could not save wishlist' });
  }
});

module.exports = router;
