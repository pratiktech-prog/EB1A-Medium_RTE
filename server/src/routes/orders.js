import { Router } from 'express';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Customer: place an order
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { restaurantId, items, deliveryAddress } = req.body;
    if (!restaurantId || !Array.isArray(items) || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({ message: 'restaurantId, items and deliveryAddress are required' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds }, restaurant: restaurantId });
    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ message: 'One or more menu items are invalid' });
    }

    const orderItems = items.map((i) => {
      const menuItem = menuItems.find((m) => String(m._id) === i.menuItemId);
      return {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: Math.max(1, Number(i.quantity) || 1),
      };
    });
    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// Customer: order history
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('restaurant', 'name imageUrl city')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// Owner: orders for a given restaurant they own
router.get('/restaurant/:restaurantId', requireAuth, requireRole('owner'), async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (String(restaurant.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your restaurant' });
    }
    const orders = await Order.find({ restaurant: restaurant._id })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// Owner: update order status
router.put('/:id/status', requireAuth, requireRole('owner'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const order = await Order.findById(req.params.id).populate('restaurant');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (String(order.restaurant.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your restaurant' });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
});

export default router;
