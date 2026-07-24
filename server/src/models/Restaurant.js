import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    address: { type: String, trim: true },
    cuisines: [{ type: String, trim: true }],
    priceForTwo: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

restaurantSchema.index({ name: 'text', cuisines: 'text', city: 'text' });

export default mongoose.model('Restaurant', restaurantSchema);
