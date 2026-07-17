import asyncHandler from 'express-async-handler';
import { generateSuggestions } from '../utils/aiSuggestions.js';

// POST /api/suggestions  { category, mealTypes?, seed? }
export const getSuggestions = asyncHandler(async (req, res) => {
  const { category, mealTypes, seed } = req.body;
  if (!category) {
    res.status(400);
    throw new Error('category is required');
  }
  const suggestions = generateSuggestions(
    category,
    mealTypes && mealTypes.length ? mealTypes : undefined,
    seed || Math.floor(Math.random() * 1e9)
  );
  res.json({ success: true, data: suggestions });
});
