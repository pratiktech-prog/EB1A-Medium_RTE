import { Router } from 'express';
import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';
import Review from '../models/Review.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// List + search + filter restaurants
router.get('/', async (req, res, next) => {
  try {
    const { search, city, cuisine } = req.query;
    const query = {};
    if (city) query.city = new RegExp(`^${city}$`, 'i');
    if (cuisine) query.cuisines = new RegExp(`^${cuisine}$`, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { cuisines: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
      ];
    }
    const restaurants = await Restaurant.find(query).sort({ avgRating: -1 });
    res.json(restaurants);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    const menu = await MenuItem.find({ restaurant: restaurant._id, available: true });
    const reviews = await Review.find({ restaurant: restaurant._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json({ restaurant, menu, reviews });
  } catch (err) {
    next(err);
  }
});

// Owner: create restaurant
router.post('/', requireAuth, requireRole('owner'), async (req, res, next) => {
  try {
    const { name, description, city, address, cuisines, priceForTwo, imageUrl } = req.body;
    if (!name || !city) return res.status(400).json({ message: 'name and city are required' });
    const restaurant = await Restaurant.create({
      owner: req.user._id,
      name,
      description,
      city,
      address,
      cuisines,
      priceForTwo,
      imageUrl,
    });
    res.status(201).json(restaurant);
  } catch (err) {
    next(err);
  }
});

// Owner: list their own restaurants
router.get('/mine/list', requireAuth, requireRole('owner'), async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    res.json(restaurants);
  } catch (err) {
    next(err);
  }
});

async function loadOwnedRestaurant(req, res, next) {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
  if (String(restaurant.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not your restaurant' });
  }
  req.restaurant = restaurant;
  next();
}

// Owner: update restaurant
router.put('/:id', requireAuth, requireRole('owner'), loadOwnedRestaurant, async (req, res, next) => {
  try {
    Object.assign(req.restaurant, req.body);
    await req.restaurant.save();
    res.json(req.restaurant);
  } catch (err) {
    next(err);
  }
});

// Owner: delete restaurant
router.delete('/:id', requireAuth, requireRole('owner'), loadOwnedRestaurant, async (req, res, next) => {
  try {
    await req.restaurant.deleteOne();
    await MenuItem.deleteMany({ restaurant: req.restaurant._id });
    res.json({ message: 'Restaurant deleted' });
  } catch (err) {
    next(err);
  }
});

// Owner: add menu item
router.post('/:id/menu', requireAuth, requireRole('owner'), loadOwnedRestaurant, async (req, res, next) => {
  try {
    const { name, description, price, category, isVeg, imageUrl } = req.body;
    if (!name || price == null) return res.status(400).json({ message: 'name and price are required' });
    const item = await MenuItem.create({
      restaurant: req.restaurant._id,
      name,
      description,
      price,
      category,
      isVeg,
      imageUrl,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// Owner: update menu item
router.put('/:id/menu/:itemId', requireAuth, requireRole('owner'), loadOwnedRestaurant, async (req, res, next) => {
  try {
    const item = await MenuItem.findOne({ _id: req.params.itemId, restaurant: req.restaurant._id });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    Object.assign(item, req.body);
    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// Owner: delete menu item
router.delete('/:id/menu/:itemId', requireAuth, requireRole('owner'), loadOwnedRestaurant, async (req, res, next) => {
  try {
    const item = await MenuItem.findOneAndDelete({ _id: req.params.itemId, restaurant: req.restaurant._id });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
