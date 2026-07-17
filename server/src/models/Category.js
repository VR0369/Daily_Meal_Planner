import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    color: { type: String, default: '#90a4ae' },
    icon: { type: String, default: 'Restaurant' },
    description: { type: String, default: '' },
    isCustom: { type: Boolean, default: false },
    // Owning user (null = global/seed category available to everyone).
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
