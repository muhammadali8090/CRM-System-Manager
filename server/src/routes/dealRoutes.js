import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getDeals,
  addDeal,
  editDeal,
  removeDeal,
} from '../controllers/dealController.js';

const router = Router();

router.use(protect);

router.get('/', getDeals);
router.post('/', addDeal);
router.put('/:id', editDeal);
router.delete('/:id', adminOnly, removeDeal);

export default router;
