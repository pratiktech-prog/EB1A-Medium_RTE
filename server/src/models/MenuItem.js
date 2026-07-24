import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, trim: true, default: 'Main' },
    isVeg: { type: Boolean, default: true },
    imageUrl: { type: String, default: '' },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('MenuItem', menuItemSchema);
