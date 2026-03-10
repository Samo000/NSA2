const router = require('express').Router();
const auth = require('../middleware/auth');
const Review = require('../models/review');

function normalizeSlug(value) {
  return String(value || '').trim();
}

function toResponse(review) {
  return {
    id: String(review._id),
    slug: review.productSlug,
    author: review.author,
    rating: Number(review.rating || 0),
    comment: review.comment,
    createdAt: review.createdAt
  };
}

router.get('/:slug', async (req, res) => {
  try {
    const slug = normalizeSlug(req.params.slug);
    if (!slug) return res.status(400).json({ message: 'Invalid product slug' });

    const reviews = await Review.find({ productSlug: slug }).sort({ createdAt: -1 }).limit(300);
    return res.json({ reviews: reviews.map(toResponse) });
  } catch {
    return res.status(500).json({ message: 'Could not load reviews' });
  }
});

router.post('/:slug', auth, async (req, res) => {
  try {
    const slug = normalizeSlug(req.params.slug);
    const rating = Number(req.body?.rating);
    const comment = String(req.body?.comment || '').trim();

    if (!slug) return res.status(400).json({ message: 'Invalid product slug' });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }
    if (comment.length < 10 || comment.length > 1200) {
      return res.status(400).json({ message: 'Comment must be between 10 and 1200 characters' });
    }

    const author = `${String(req.user.firstName || '').trim()} ${String(req.user.lastName || '').trim()}`.trim()
      || String(req.user.email || 'Uporabnik');

    const existing = await Review.findOne({ user: req.user.id, productSlug: slug });

    if (existing) {
      existing.author = author;
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();
      return res.json({ review: toResponse(existing) });
    }

    const created = await Review.create({
      user: req.user.id,
      productSlug: slug,
      author,
      rating,
      comment
    });

    return res.status(201).json({ review: toResponse(created) });
  } catch {
    return res.status(500).json({ message: 'Could not save review' });
  }
});

module.exports = router;
