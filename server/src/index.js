import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import restaurantRoutes from './routes/restaurants.js';
import reviewRoutes from './routes/reviews.js';
import orderRoutes from './routes/orders.js';
import discoverRoutes from './routes/discover.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/discover', discoverRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
