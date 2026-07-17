import { Router } from 'express';
import {
  listGrocery,
  refreshGrocery,
  markPurchased,
  markCannotFind,
  updateGrocery,
} from '../controllers/groceryController.js';

const router = Router();
router.get('/', listGrocery);
router.post('/refresh', refreshGrocery);
router.post('/:id/purchased', markPurchased);
router.post('/:id/cannot-find', markCannotFind);
router.patch('/:id', updateGrocery);
export default router;
