import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getProspects,
  addProspect,
  editProspect,
  removeProspect,
  mergeProspectRecords,
} from '../controllers/prospectController.js';

const router = Router();

router.use(protect);

router.get('/', getProspects);
router.post('/', addProspect);
router.put('/:id', editProspect);
router.delete('/:id', adminOnly, removeProspect);
router.post('/merge', adminOnly, mergeProspectRecords);

export default router;
