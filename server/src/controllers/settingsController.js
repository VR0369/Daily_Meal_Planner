import asyncHandler from 'express-async-handler';
import Settings from '../models/Settings.js';

// GET /api/settings
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ user: req.userId });
  if (!settings) settings = await Settings.create({ user: req.userId });
  res.json({ success: true, data: settings });
});

// PUT /api/settings
export const updateSettings = asyncHandler(async (req, res) => {
  const allowed = ['theme', 'defaultCategory', 'defaultDuration', 'includeSnacks', 'includeDessert', 'weekStartsOn', 'autoSave'];
  const update = {};
  for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];
  const settings = await Settings.findOneAndUpdate(
    { user: req.userId },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, data: settings });
});
