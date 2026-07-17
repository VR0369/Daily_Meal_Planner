import mongoose from 'mongoose';
import { GROCERY_STATUS } from '../utils/constants.js';

/**
 * GroceryItem records where a needed ingredient came from. The list is derived
 * from meal-plan ingredients, but items persist their own purchased / cannot-find
 * state and can carry a replacement.
 *
 * Duplicate ingredient names are merged at read time (see groceryController),
 * so a single row may reference several source meals via `sources`.
 */
const sourceSchema = new mongoose.Schema(
  {
    mealPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'MealPlan' },
    ingredientId: { type: mongoose.Schema.Types.ObjectId },
    meal: String, // meal type e.g. "Breakfast"
    mealName: String,
    day: Date,
    quantity: String,
    status: String,
  },
  { _id: false }
);

const groceryItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    // Normalised key used to merge duplicates (lowercased, trimmed name).
    key: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: String, default: '' },
    status: { type: String, enum: GROCERY_STATUS, default: 'Need More' },
    purchased: { type: Boolean, default: false },
    cannotFind: { type: Boolean, default: false },
    replacement: { type: String, default: '' },
    sources: { type: [sourceSchema], default: [] },
  },
  { timestamps: true }
);

groceryItemSchema.index({ user: 1, key: 1 }, { unique: true });

export default mongoose.model('GroceryItem', groceryItemSchema);
