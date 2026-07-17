import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, unique: true },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    defaultCategory: { type: String, default: 'Vegetarian' },
    defaultDuration: { type: String, enum: ['Daily', 'Weekly', 'Monthly'], default: 'Daily' },
    includeSnacks: { type: Boolean, default: true },
    includeDessert: { type: Boolean, default: false },
    weekStartsOn: { type: String, enum: ['Sunday', 'Monday'], default: 'Monday' },
    autoSave: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
