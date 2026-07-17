import asyncHandler from 'express-async-handler';
import MealPlan from '../models/MealPlan.js';
import GroceryItem from '../models/GroceryItem.js';
import { startOfDay, addDays, monthRange } from '../utils/dates.js';
import { CORE_MEAL_TYPES } from '../utils/constants.js';

// GET /api/dashboard/stats
export const getStats = asyncHandler(async (req, res) => {
  const today = startOfDay();
  const days = monthRange(today); // stats scoped to current month
  const plans = await MealPlan.find({
    user: req.userId,
    date: { $gte: days[0], $lte: days[days.length - 1] },
  });

  let mealsPlanned = 0;
  let daysCompleted = 0;
  const daysWithPlans = plans.length;

  for (const plan of plans) {
    const filled = new Set(plan.meals.filter((m) => m.mealName && m.mealName.trim()).map((m) => m.mealType));
    mealsPlanned += filled.size;
    if (CORE_MEAL_TYPES.every((t) => filled.has(t))) daysCompleted += 1;
  }

  // "Remaining" = core meals not yet filled for the days that have a plan this month.
  const possibleCore = daysWithPlans * CORE_MEAL_TYPES.length;
  let coreFilled = 0;
  for (const plan of plans) {
    const filled = new Set(plan.meals.filter((m) => m.mealName && m.mealName.trim()).map((m) => m.mealType));
    coreFilled += CORE_MEAL_TYPES.filter((t) => filled.has(t)).length;
  }
  const mealsRemaining = Math.max(possibleCore - coreFilled, 0);
  const completionPercentage = possibleCore ? Math.round((coreFilled / possibleCore) * 100) : 0;

  const grocery = await GroceryItem.find({ user: req.userId });
  const ingredientsNeeded = grocery.filter((g) => !g.purchased).length;
  const ingredientsPurchased = grocery.filter((g) => g.purchased).length;

  // Upcoming meals: next 3 days.
  const upcomingPlans = await MealPlan.find({
    user: req.userId,
    date: { $gte: today, $lte: addDays(today, 3) },
  }).sort({ date: 1 });
  const upcomingMeals = [];
  for (const plan of upcomingPlans) {
    for (const meal of plan.meals) {
      if (meal.mealName && meal.mealName.trim()) {
        upcomingMeals.push({ date: plan.date, mealType: meal.mealType, mealName: meal.mealName });
      }
    }
  }

  res.json({
    success: true,
    data: {
      mealsPlanned,
      mealsRemaining,
      daysCompleted,
      daysWithPlans,
      completionPercentage,
      ingredientsNeeded,
      ingredientsPurchased,
      upcomingMeals: upcomingMeals.slice(0, 8),
    },
  });
});

// GET /api/search?q=&type=meal|ingredient|category|date
export const search = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ success: true, data: [] });
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const plans = await MealPlan.find({ user: req.userId }).sort({ date: 1 });
  const results = [];

  const isDateQuery = /^\d{4}-\d{2}-\d{2}$/.test(q);

  for (const plan of plans) {
    const dateStr = startOfDay(plan.date).toISOString().slice(0, 10);
    const dateMatches = isDateQuery && dateStr === q;
    const categoryMatches = rx.test(plan.category || '');

    for (const meal of plan.meals) {
      const nameMatches = rx.test(meal.mealName || '');
      const ingredientMatch = meal.ingredients.find((i) => rx.test(i.name));
      if (dateMatches || categoryMatches || nameMatches || ingredientMatch) {
        results.push({
          date: plan.date,
          category: plan.category,
          mealType: meal.mealType,
          mealName: meal.mealName,
          matchedIngredient: ingredientMatch ? ingredientMatch.name : undefined,
          planId: plan._id,
        });
      }
    }
  }
  res.json({ success: true, data: results.slice(0, 50) });
});
