import 'dotenv/config';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import MealPlan from '../models/MealPlan.js';
import Settings from '../models/Settings.js';
import { DEFAULT_CATEGORIES } from '../utils/constants.js';
import { generateSuggestions } from '../utils/aiSuggestions.js';
import { rebuildGroceryList } from '../utils/grocerySync.js';
import { startOfDay, addDays } from '../utils/dates.js';
import { connectDB, disconnectDB } from '../config/db.js';

/**
 * Seed default categories (idempotent) and, when there are no meal plans yet, a
 * few sample days so the dashboard/calendar aren't empty on first run.
 *
 * Built-ins aren't user-editable, so their colour/icon are re-applied on every
 * run — that way palette changes reach installs seeded before the change.
 */
export async function seedCategories() {
  for (const { name, color, icon, ...rest } of DEFAULT_CATEGORIES) {
    await Category.updateOne(
      { name, user: null },
      {
        $set: { color, icon },
        $setOnInsert: { ...rest, name, user: null, isCustom: false },
      },
      { upsert: true }
    );
  }
}

export async function seedSamplePlans() {
  const today = startOfDay();

  // A helper that marks a couple of ingredients as needing groceries so the
  // grocery list has content to show.
  const withStatuses = (meals) =>
    meals.map((meal, mi) => ({
      ...meal,
      ingredients: meal.ingredients.map((ing, ii) => ({
        ...ing,
        status: (mi + ii) % 4 === 0 ? 'Need More' : (mi + ii) % 4 === 1 ? 'Not Available' : 'Available',
      })),
    }));

  // Today: fully planned (Vegetarian).
  await MealPlan.create({
    user: null,
    date: today,
    duration: 'Daily',
    category: 'Vegetarian',
    meals: withStatuses(generateSuggestions('Vegetarian', ['Breakfast', 'Lunch', 'Dinner'], 1)),
  });

  // Tomorrow: partially planned (Italian, breakfast + lunch only).
  await MealPlan.create({
    user: null,
    date: addDays(today, 1),
    duration: 'Weekly',
    category: 'Italian',
    meals: withStatuses(generateSuggestions('Italian', ['Breakfast', 'Lunch'], 2)),
  });

  // Day after: fully planned (Indian).
  await MealPlan.create({
    user: null,
    date: addDays(today, 2),
    duration: 'Weekly',
    category: 'Indian',
    meals: withStatuses(generateSuggestions('Indian', ['Breakfast', 'Lunch', 'Dinner'], 3)),
  });

  // Yesterday: fully completed (Vegan) so "days completed" > 0.
  await MealPlan.create({
    user: null,
    date: addDays(today, -1),
    duration: 'Daily',
    category: 'Vegan',
    meals: generateSuggestions('Vegan', ['Breakfast', 'Lunch', 'Dinner'], 4).map((m) => ({
      ...m,
      ingredients: m.ingredients.map((i) => ({ ...i, status: 'Available' })),
    })),
  });

  await rebuildGroceryList(null);
}

// Called on server boot — only adds data when collections are empty.
export async function seedIfEmpty() {
  await seedCategories();
  const planCount = await MealPlan.countDocuments({ user: null });
  if (planCount === 0) await seedSamplePlans();
  const settings = await Settings.findOne({ user: null });
  if (!settings) await Settings.create({ user: null });
}

// Standalone: `npm run seed` — wipes and reseeds.
async function runStandalone() {
  await connectDB();
  console.log('🌱 Reseeding database…');
  await Promise.all([
    Category.deleteMany({}),
    MealPlan.deleteMany({}),
    Settings.deleteMany({}),
  ]);
  await seedCategories();
  await seedSamplePlans();
  await Settings.create({ user: null });
  console.log('✅ Seed complete.');
  await disconnectDB();
  process.exit(0);
}

// Run directly?
const isMain = process.argv[1] && process.argv[1].endsWith('seed.js');
if (isMain) {
  runStandalone().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
