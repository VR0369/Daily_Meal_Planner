import asyncHandler from 'express-async-handler';
import MealPlan from '../models/MealPlan.js';
import { rebuildGroceryList } from '../utils/grocerySync.js';
import { startOfDay, weekRange, monthRange, addDays } from '../utils/dates.js';
import { MEAL_TYPES } from '../utils/constants.js';

const decorate = (plan) => {
  if (!plan) return plan;
  const obj = typeof plan.toObject === 'function' ? plan.toObject() : plan;
  const filled = new Set(
    (obj.meals || []).filter((m) => m.mealName && m.mealName.trim()).map((m) => m.mealType)
  );
  const hasCore = ['Breakfast', 'Lunch', 'Dinner'].every((t) => filled.has(t));
  obj.completion = hasCore ? 'complete' : filled.size > 0 ? 'partial' : 'empty';
  obj.filledCount = filled.size;
  return obj;
};

// GET /api/mealplans?date=YYYY-MM-DD  — single day (may not exist)
export const getByDate = asyncHandler(async (req, res) => {
  const date = startOfDay(req.query.date);
  const plan = await MealPlan.findOne({ user: req.userId, date });
  res.json({ success: true, data: plan ? decorate(plan) : null, date });
});

// GET /api/mealplans/range?start=&end=  — inclusive range
export const getRange = asyncHandler(async (req, res) => {
  const start = startOfDay(req.query.start);
  const end = startOfDay(req.query.end);
  const plans = await MealPlan.find({
    user: req.userId,
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });
  res.json({ success: true, data: plans.map(decorate) });
});

// GET /api/mealplans/week?date=  — the 7 days of that week (fills gaps as null)
export const getWeek = asyncHandler(async (req, res) => {
  const days = weekRange(req.query.date, req.query.weekStartsOn);
  const plans = await MealPlan.find({
    user: req.userId,
    date: { $gte: days[0], $lte: days[6] },
  });
  const byKey = new Map(plans.map((p) => [startOfDay(p.date).getTime(), decorate(p)]));
  res.json({
    success: true,
    data: days.map((d) => ({ date: d, plan: byKey.get(d.getTime()) || null })),
  });
});

// GET /api/mealplans/month?date=  — summaries for calendar colour coding
export const getMonth = asyncHandler(async (req, res) => {
  const days = monthRange(req.query.date);
  const plans = await MealPlan.find({
    user: req.userId,
    date: { $gte: days[0], $lte: days[days.length - 1] },
  });
  const byKey = new Map(plans.map((p) => [startOfDay(p.date).getTime(), decorate(p)]));
  res.json({
    success: true,
    data: days.map((d) => {
      const plan = byKey.get(d.getTime());
      return {
        date: d,
        completion: plan?.completion || 'empty',
        meals: plan ? plan.meals.filter((m) => m.mealName).map((m) => ({ mealType: m.mealType, mealName: m.mealName })) : [],
      };
    }),
  });
});

/**
 * PUT /api/mealplans  — upsert a whole day's plan (used by auto-save).
 * Body: { date, category, duration, meals[], notes }
 */
export const upsertPlan = asyncHandler(async (req, res) => {
  const date = startOfDay(req.body.date);
  const update = {
    user: req.userId,
    date,
    ...(req.body.category !== undefined && { category: req.body.category }),
    ...(req.body.duration !== undefined && { duration: req.body.duration }),
    ...(req.body.meals !== undefined && { meals: req.body.meals }),
    ...(req.body.notes !== undefined && { notes: req.body.notes }),
  };
  const plan = await MealPlan.findOneAndUpdate(
    { user: req.userId, date },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  await rebuildGroceryList(req.userId);
  res.json({ success: true, data: decorate(plan) });
});

/**
 * Create a blank plan for a day with empty meals for the chosen meal types.
 * POST /api/mealplans  { date, category, duration, mealTypes[] }
 */
export const createPlan = asyncHandler(async (req, res) => {
  const date = startOfDay(req.body.date);
  const types = (req.body.mealTypes && req.body.mealTypes.length ? req.body.mealTypes : ['Breakfast', 'Lunch', 'Dinner'])
    .filter((t) => MEAL_TYPES.includes(t));
  const existing = await MealPlan.findOne({ user: req.userId, date });
  if (existing) {
    res.status(409);
    throw new Error('A plan already exists for this date');
  }
  const plan = await MealPlan.create({
    user: req.userId,
    date,
    category: req.body.category || '',
    duration: req.body.duration || 'Daily',
    meals: types.map((mealType) => ({ mealType, mealName: '', ingredients: [] })),
  });
  res.status(201).json({ success: true, data: decorate(plan) });
});

// PUT /api/mealplans/:id/meal  — update or add a single meal (auto-save granular)
export const upsertMeal = asyncHandler(async (req, res) => {
  const plan = await MealPlan.findOne({ _id: req.params.id, user: req.userId });
  if (!plan) {
    res.status(404);
    throw new Error('Meal plan not found');
  }
  const { mealType, mealName, ingredients, notes } = req.body;
  const meal = plan.meals.find((m) => m.mealType === mealType);
  if (meal) {
    if (mealName !== undefined) meal.mealName = mealName;
    if (ingredients !== undefined) meal.ingredients = ingredients;
    if (notes !== undefined) meal.notes = notes;
  } else {
    plan.meals.push({ mealType, mealName: mealName || '', ingredients: ingredients || [], notes: notes || '' });
  }
  await plan.save();
  await rebuildGroceryList(req.userId);
  res.json({ success: true, data: decorate(plan) });
});

// DELETE /api/mealplans/:id
export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await MealPlan.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!plan) {
    res.status(404);
    throw new Error('Meal plan not found');
  }
  await rebuildGroceryList(req.userId);
  res.json({ success: true, data: { id: req.params.id } });
});

/**
 * Copy/move/duplicate meals between days.
 * POST /api/mealplans/copy  { from, to, mode: 'copy'|'move' }
 */
export const copyDay = asyncHandler(async (req, res) => {
  const from = startOfDay(req.body.from);
  const to = startOfDay(req.body.to);
  const source = await MealPlan.findOne({ user: req.userId, date: from });
  if (!source) {
    res.status(404);
    throw new Error('No plan to copy from');
  }
  const meals = source.meals.map((m) => ({
    mealType: m.mealType,
    mealName: m.mealName,
    notes: m.notes,
    ingredients: m.ingredients.map((i) => ({ name: i.name, quantity: i.quantity, status: i.status })),
  }));
  const target = await MealPlan.findOneAndUpdate(
    { user: req.userId, date: to },
    { $set: { user: req.userId, date: to, category: source.category, duration: source.duration, meals } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  if (req.body.mode === 'move') {
    await MealPlan.deleteOne({ _id: source._id });
  }
  await rebuildGroceryList(req.userId);
  res.json({ success: true, data: decorate(target) });
});

/**
 * Copy an entire week to another week.
 * POST /api/mealplans/copy-week  { fromWeekOf, toWeekOf }
 */
export const copyWeek = asyncHandler(async (req, res) => {
  const fromDays = weekRange(req.body.fromWeekOf, req.body.weekStartsOn);
  const toStart = startOfDay(req.body.toWeekOf);
  const toDays = weekRange(toStart, req.body.weekStartsOn);
  const plans = await MealPlan.find({ user: req.userId, date: { $gte: fromDays[0], $lte: fromDays[6] } });
  const byDay = new Map(plans.map((p) => [startOfDay(p.date).getTime(), p]));

  const results = [];
  for (let i = 0; i < 7; i += 1) {
    const src = byDay.get(fromDays[i].getTime());
    if (!src) continue;
    const meals = src.meals.map((m) => ({
      mealType: m.mealType,
      mealName: m.mealName,
      notes: m.notes,
      ingredients: m.ingredients.map((x) => ({ name: x.name, quantity: x.quantity, status: x.status })),
    }));
    const t = await MealPlan.findOneAndUpdate(
      { user: req.userId, date: toDays[i] },
      { $set: { user: req.userId, date: toDays[i], category: src.category, duration: src.duration, meals } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    results.push(decorate(t));
  }
  await rebuildGroceryList(req.userId);
  res.json({ success: true, data: results });
});

/**
 * Which day should the dashboard show? Today, unless today's plan already exists
 * AND is complete-ish, in which case surface tomorrow (per spec: "If today's meal
 * plan already exists: automatically open tomorrow's planner").
 */
export const getActiveDay = asyncHandler(async (req, res) => {
  const today = startOfDay();
  const todayPlan = await MealPlan.findOne({ user: req.userId, date: today });
  let activeDate = today;
  let plan = todayPlan;
  if (todayPlan) {
    const tomorrow = addDays(today, 1);
    const tomorrowPlan = await MealPlan.findOne({ user: req.userId, date: tomorrow });
    // Only jump to tomorrow if today is fully complete; otherwise keep editing today.
    if (decorate(todayPlan).completion === 'complete') {
      activeDate = tomorrow;
      plan = tomorrowPlan;
    }
  }
  res.json({
    success: true,
    data: { date: activeDate, plan: plan ? decorate(plan) : null, isToday: activeDate.getTime() === today.getTime() },
  });
});
