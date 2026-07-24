import { Router } from 'express';
import Review from '../models/Review.js';
import Restaurant from '../models/Restaurant.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

async function recalcRating(restaurantId) {
  const reviews = await Review.find({ restaurant: restaurantId });
  const ratingCount = reviews.length;
  const avgRating = ratingCount
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
    : 0;
  await Restaurant.findByIdAndUpdate(restaurantId, {
    avgRating: Math.round(avgRating * 10) / 10,
    ratingCount,
  });
}

router.post('/:restaurantId', requireAuth, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating) return res.status(400).json({ message: 'rating is required' });

    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const review = await Review.findOneAndUpdate(
      { restaurant: restaurant._id, user: req.user._id },
      { rating, comment },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await recalcRating(restaurant._id);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const restaurantId = review.restaurant;
    await review.deleteOne();
    await recalcRating(restaurantId);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
