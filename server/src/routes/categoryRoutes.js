import { Router } from 'express';
import { listCategories, createCategory, deleteCategory } from '../controllers/categoryController.js';

const router = Router();
router.get('/', listCategories);
router.post('/', createCategory);
router.delete('/:id', deleteCategory);
export default router;
