import { Router } from 'express';
import {
  getByDate,
  getRange,
  getWeek,
  getMonth,
  getActiveDay,
  upsertPlan,
  createPlan,
  upsertMeal,
  deletePlan,
  copyDay,
  copyWeek,
} from '../controllers/mealPlanController.js';

const router = Router();

router.get('/active', getActiveDay);
router.get('/range', getRange);
router.get('/week', getWeek);
router.get('/month', getMonth);
router.get('/', getByDate);

router.post('/', createPlan);
router.put('/', upsertPlan);
router.post('/copy', copyDay);
router.post('/copy-week', copyWeek);

router.put('/:id/meal', upsertMeal);
router.delete('/:id', deletePlan);

export default router;
