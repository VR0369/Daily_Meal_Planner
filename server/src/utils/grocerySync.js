import MealPlan from '../models/MealPlan.js';
import GroceryItem from '../models/GroceryItem.js';
import { NEEDED_STATUSES } from './constants.js';

const norm = (name) => name.trim().toLowerCase();

/**
 * Rebuild the grocery list for a user from every meal plan.
 *
 * Every ingredient marked "Not Available" or "Need More" is collected. Duplicate
 * ingredient names are merged into a single grocery row whose `sources` array
 * records each meal/day it is needed for. Existing purchased / cannot-find /
 * replacement state is preserved across rebuilds.
 */
export async function rebuildGroceryList(user = null) {
  const plans = await MealPlan.find({ user }).lean();

  // Preserve user-set flags from the previous list.
  const previous = await GroceryItem.find({ user }).lean();
  const prevByKey = new Map(previous.map((g) => [g.key, g]));

  const merged = new Map(); // key -> grocery doc shape

  for (const plan of plans) {
    for (const meal of plan.meals || []) {
      for (const ing of meal.ingredients || []) {
        if (!ing.name || !NEEDED_STATUSES.includes(ing.status)) continue;
        const key = norm(ing.name);
        if (!merged.has(key)) {
          const prev = prevByKey.get(key);
          merged.set(key, {
            user,
            key,
            name: ing.name.trim(),
            quantity: ing.quantity || '',
            status: ing.status,
            purchased: prev?.purchased || false,
            cannotFind: prev?.cannotFind || false,
            replacement: prev?.replacement || '',
            sources: [],
          });
        }
        const row = merged.get(key);
        row.sources.push({
          mealPlan: plan._id,
          ingredientId: ing._id,
          meal: meal.mealType,
          mealName: meal.mealName,
          day: plan.date,
          quantity: ing.quantity || '',
          status: ing.status,
        });
        // "Not Available" is stronger than "Need More".
        if (ing.status === 'Not Available') row.status = 'Not Available';
      }
    }
  }

  // Wipe and rewrite. Simple + correct for the derived list.
  await GroceryItem.deleteMany({ user });
  const docs = Array.from(merged.values());
  if (docs.length) await GroceryItem.insertMany(docs);
  return docs.length;
}

/**
 * When a grocery item is purchased, flip every matching ingredient in every meal
 * from Need More / Not Available to Available, then rebuild the list.
 */
export async function markIngredientPurchased(user, name) {
  const key = norm(name);
  const plans = await MealPlan.find({ user });
  for (const plan of plans) {
    let touched = false;
    for (const meal of plan.meals) {
      for (const ing of meal.ingredients) {
        if (norm(ing.name) === key && NEEDED_STATUSES.includes(ing.status)) {
          ing.status = 'Available';
          touched = true;
        }
      }
    }
    if (touched) await plan.save();
  }
  await rebuildGroceryList(user);
}
