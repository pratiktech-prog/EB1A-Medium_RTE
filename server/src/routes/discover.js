import { Router } from 'express';

const router = Router();
const YELP_BASE_URL = 'https://api.yelp.com/v3';

function yelpHeaders() {
  if (!process.env.YELP_API_KEY) {
    const err = new Error('Server is not configured with a YELP_API_KEY');
    err.status = 500;
    throw err;
  }
  return { Authorization: `Bearer ${process.env.YELP_API_KEY}` };
}

// Search restaurants by location/term, proxied to Yelp so the API key stays server-side
router.get('/restaurants', async (req, res, next) => {
  try {
    const { location = 'New York, NY', term = '', categories = 'restaurants', price, limit = 20, offset = 0 } = req.query;
    const params = new URLSearchParams({
      location,
      term: term || 'restaurants',
      categories,
      limit: String(Math.min(Number(limit) || 20, 50)),
      offset: String(Number(offset) || 0),
    });
    if (price) params.set('price', price);

    const response = await fetch(`${YELP_BASE_URL}/businesses/search?${params.toString()}`, {
      headers: yelpHeaders(),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return res.status(response.status).json({ message: body.error?.description || 'Yelp API error' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Restaurant details + reviews, proxied to Yelp
router.get('/restaurants/:id', async (req, res, next) => {
  try {
    const headers = yelpHeaders();
    const id = encodeURIComponent(req.params.id);
    const [detailsRes, reviewsRes] = await Promise.all([
      fetch(`${YELP_BASE_URL}/businesses/${id}`, { headers }),
      fetch(`${YELP_BASE_URL}/businesses/${id}/reviews`, { headers }),
    ]);
    if (!detailsRes.ok) {
      const body = await detailsRes.json().catch(() => ({}));
      return res.status(detailsRes.status).json({ message: body.error?.description || 'Yelp API error' });
    }
    const details = await detailsRes.json();
    const reviewData = reviewsRes.ok ? await reviewsRes.json() : { reviews: [] };
    res.json({ ...details, reviews: reviewData.reviews || [] });
  } catch (err) {
    next(err);
  }
});

export default router;
