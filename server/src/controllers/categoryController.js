import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';

// GET /api/categories  — global + user's custom categories
export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ $or: [{ user: null }, { user: req.userId }] }).sort({ name: 1 });
  res.json({ success: true, data: categories });
});

// POST /api/categories  — add a custom category (supports "future categories added dynamically")
export const createCategory = asyncHandler(async (req, res) => {
  const { name, color, icon, description } = req.body;
  if (!name || !name.trim()) {
    res.status(400);
    throw new Error('Category name is required');
  }
  const category = await Category.create({
    name: name.trim(),
    color: color || '#90a4ae',
    icon: icon || 'Restaurant',
    description: description || '',
    isCustom: true,
    user: req.userId,
  });
  res.status(201).json({ success: true, data: category });
});

// DELETE /api/categories/:id  — only custom categories owned by the user
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndDelete({ _id: req.params.id, isCustom: true, user: req.userId });
  if (!category) {
    res.status(404);
    throw new Error('Custom category not found');
  }
  res.json({ success: true, data: { id: req.params.id } });
});
