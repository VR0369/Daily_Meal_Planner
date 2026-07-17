import asyncHandler from 'express-async-handler';
import GroceryItem from '../models/GroceryItem.js';
import { rebuildGroceryList, markIngredientPurchased } from '../utils/grocerySync.js';

// GET /api/grocery
export const listGrocery = asyncHandler(async (req, res) => {
  await rebuildGroceryList(req.userId); // keep in sync on read
  const items = await GroceryItem.find({ user: req.userId }).sort({ purchased: 1, name: 1 });
  res.json({ success: true, data: items });
});

// POST /api/grocery/refresh
export const refreshGrocery = asyncHandler(async (req, res) => {
  const count = await rebuildGroceryList(req.userId);
  const items = await GroceryItem.find({ user: req.userId }).sort({ purchased: 1, name: 1 });
  res.json({ success: true, count, data: items });
});

// POST /api/grocery/:id/purchased  — flips every matching ingredient to Available
export const markPurchased = asyncHandler(async (req, res) => {
  const item = await GroceryItem.findOne({ _id: req.params.id, user: req.userId });
  if (!item) {
    res.status(404);
    throw new Error('Grocery item not found');
  }
  await markIngredientPurchased(req.userId, item.name);
  const items = await GroceryItem.find({ user: req.userId }).sort({ purchased: 1, name: 1 });
  res.json({ success: true, data: items });
});

// POST /api/grocery/:id/cannot-find  { replacement? }  — keep item, optionally add replacement
export const markCannotFind = asyncHandler(async (req, res) => {
  const item = await GroceryItem.findOne({ _id: req.params.id, user: req.userId });
  if (!item) {
    res.status(404);
    throw new Error('Grocery item not found');
  }
  item.cannotFind = true;
  item.status = 'Cannot Find';
  if (req.body.replacement !== undefined) item.replacement = req.body.replacement;
  await item.save();
  res.json({ success: true, data: item });
});

// PATCH /api/grocery/:id  { quantity?, replacement? }
export const updateGrocery = asyncHandler(async (req, res) => {
  const item = await GroceryItem.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { $set: { ...(req.body.quantity !== undefined && { quantity: req.body.quantity }), ...(req.body.replacement !== undefined && { replacement: req.body.replacement }) } },
    { new: true }
  );
  if (!item) {
    res.status(404);
    throw new Error('Grocery item not found');
  }
  res.json({ success: true, data: item });
});
