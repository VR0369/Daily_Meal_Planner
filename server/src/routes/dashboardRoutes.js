import { Router } from 'express';
import { getStats, search } from '../controllers/dashboardController.js';

const router = Router();
router.get('/stats', getStats);
// search is mounted here and also aliased at /api/search in index for convenience
router.get('/search', search);
export default router;
