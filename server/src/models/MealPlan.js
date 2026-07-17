import mongoose from 'mongoose';
import { MEAL_TYPES, INGREDIENT_STATUS, DURATIONS } from '../utils/constants.js';

/**
 * Ingredient — embedded inside a Meal.
 * Availability is tracked per-ingredient so the grocery list can be derived.
 */
const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: String, default: '' }, // free-form e.g. "2", "500g"
    status: {
      type: String,
      enum: INGREDIENT_STATUS,
      default: 'Available',
    },
  },
  { _id: true }
);

/**
 * Meal — embedded inside a MealPlan.
 */
const mealSchema = new mongoose.Schema(
  {
    mealType: { type: String, enum: MEAL_TYPES, required: true },
    mealName: { type: String, default: '', trim: true },
    ingredients: { type: [ingredientSchema], default: [] },
    notes: { type: String, default: '' },
  },
  { _id: true, timestamps: true }
);

/**
 * MealPlan — one document per (user, date). "duration" records how the plan was
 * created (Daily/Weekly/Monthly) but each plan is still stored per-day so the
 * calendar, weekly and daily views can all read the same source of truth.
 */
const mealPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    // Normalised to midnight (UTC) so lookups by day are exact.
    date: { type: Date, required: true, index: true },
    duration: { type: String, enum: DURATIONS, default: 'Daily' },
    category: { type: String, default: '' },
    meals: { type: [mealSchema], default: [] },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// One plan per user per calendar day.
mealPlanSchema.index({ user: 1, date: 1 }, { unique: true });

/**
 * Virtual completion helpers used by the dashboard & calendar colour coding.
 */
mealPlanSchema.methods.completionLevel = function completionLevel() {
  const filled = new Set(
    this.meals.filter((m) => m.mealName && m.mealName.trim()).map((m) => m.mealType)
  );
  const hasCore = ['Breakfast', 'Lunch', 'Dinner'].every((t) => filled.has(t));
  if (hasCore) return 'complete'; // light green
  if (filled.size > 0) return 'partial'; // light yellow
  return 'empty'; // white
};

export default mongoose.model('MealPlan', mealPlanSchema);
