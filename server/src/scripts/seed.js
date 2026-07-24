import 'dotenv/config';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

const restaurantData = [
  {
    name: 'Spice Route',
    description: 'Authentic North Indian curries and tandoor specialties.',
    city: 'Mumbai',
    address: '12 MG Road, Mumbai',
    cuisines: ['North Indian', 'Mughlai'],
    priceForTwo: 800,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600',
    menu: [
      { name: 'Butter Chicken', price: 320, category: 'Main', isVeg: false },
      { name: 'Paneer Tikka', price: 260, category: 'Starter', isVeg: true },
      { name: 'Garlic Naan', price: 60, category: 'Bread', isVeg: true },
      { name: 'Dal Makhani', price: 220, category: 'Main', isVeg: true },
    ],
  },
  {
    name: 'Pizza Bay',
    description: 'Wood-fired pizzas and Italian classics.',
    city: 'Mumbai',
    address: '45 Marine Drive, Mumbai',
    cuisines: ['Italian', 'Pizza'],
    priceForTwo: 700,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
    menu: [
      { name: 'Margherita Pizza', price: 280, category: 'Pizza', isVeg: true },
      { name: 'Pepperoni Pizza', price: 350, category: 'Pizza', isVeg: false },
      { name: 'Garlic Bread', price: 150, category: 'Sides', isVeg: true },
      { name: 'Tiramisu', price: 180, category: 'Dessert', isVeg: true },
    ],
  },
  {
    name: 'Dragon Wok',
    description: 'Indo-Chinese favorites made fresh and fast.',
    city: 'Bengaluru',
    address: '9 Brigade Road, Bengaluru',
    cuisines: ['Chinese', 'Indo-Chinese'],
    priceForTwo: 600,
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600',
    menu: [
      { name: 'Veg Hakka Noodles', price: 190, category: 'Main', isVeg: true },
      { name: 'Chilli Chicken', price: 260, category: 'Starter', isVeg: false },
      { name: 'Spring Rolls', price: 150, category: 'Starter', isVeg: true },
      { name: 'Manchurian', price: 210, category: 'Main', isVeg: true },
    ],
  },
  {
    name: 'South Spice',
    description: 'Traditional South Indian breakfast and thalis.',
    city: 'Bengaluru',
    address: '22 Indiranagar, Bengaluru',
    cuisines: ['South Indian'],
    priceForTwo: 400,
    imageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600',
    menu: [
      { name: 'Masala Dosa', price: 120, category: 'Main', isVeg: true },
      { name: 'Idli Sambar', price: 90, category: 'Main', isVeg: true },
      { name: 'Filter Coffee', price: 50, category: 'Beverage', isVeg: true },
      { name: 'Veg Thali', price: 220, category: 'Main', isVeg: true },
    ],
  },
];

async function seed() {
  await connectDB(process.env.MONGO_URI);

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Restaurant.deleteMany({}),
    MenuItem.deleteMany({}),
    Review.deleteMany({}),
    Order.deleteMany({}),
  ]);

  console.log('Creating users...');
  const customer = await User.create({
    name: 'Asha Verma',
    email: 'customer@example.com',
    password: 'password123',
    role: 'customer',
    phone: '9876543210',
    address: '101 Palm Street, Mumbai',
  });

  const owner = await User.create({
    name: 'Rohan Mehta',
    email: 'owner@example.com',
    password: 'password123',
    role: 'owner',
    phone: '9123456780',
  });

  console.log('Creating restaurants and menus...');
  for (const data of restaurantData) {
    const { menu, ...restInfo } = data;
    const restaurant = await Restaurant.create({ ...restInfo, owner: owner._id });
    const items = await MenuItem.insertMany(
      menu.map((item) => ({ ...item, restaurant: restaurant._id }))
    );

    const review = await Review.create({
      restaurant: restaurant._id,
      user: customer._id,
      rating: 4,
      comment: `Great food at ${restaurant.name}!`,
    });
    restaurant.avgRating = review.rating;
    restaurant.ratingCount = 1;
    await restaurant.save();

    if (restaurant.name === 'Spice Route') {
      await Order.create({
        customer: customer._id,
        restaurant: restaurant._id,
        items: [
          { menuItem: items[0]._id, name: items[0].name, price: items[0].price, quantity: 2 },
          { menuItem: items[2]._id, name: items[2].name, price: items[2].price, quantity: 3 },
        ],
        totalAmount: items[0].price * 2 + items[2].price * 3,
        deliveryAddress: customer.address,
        status: 'delivered',
      });
    }
  }

  console.log('Seed complete.');
  console.log('Sample login -> customer@example.com / password123');
  console.log('Sample login -> owner@example.com / password123');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
