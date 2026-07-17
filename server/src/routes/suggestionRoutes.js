import { Router } from 'express';
import { getSuggestions } from '../controllers/suggestionController.js';

const router = Router();
router.post('/', getSuggestions);
export default router;
