import { Router } from 'express';
import authRoutes from './authRoutes.js';
import mealPlanRoutes from './mealPlanRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import groceryRoutes from './groceryRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import suggestionRoutes from './suggestionRoutes.js';
import { search } from '../controllers/dashboardController.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));

// Convenience top-level search alias.
router.get('/search', search);

router.use('/auth', authRoutes);
router.use('/mealplans', mealPlanRoutes);
router.use('/categories', categoryRoutes);
router.use('/grocery', groceryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/suggestions', suggestionRoutes);

export default router;
