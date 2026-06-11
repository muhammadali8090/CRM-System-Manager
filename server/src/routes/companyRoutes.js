import { Router } from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getCompanies,
  addCompany,
  editCompany,
  removeCompany,
  mergeCompanyRecords,
} from '../controllers/companyController.js';

const router = Router();

router.use(protect);

router.get('/', getCompanies);
router.post('/', addCompany);
router.put('/:id', editCompany);
router.delete('/:id', adminOnly, removeCompany);
router.post('/merge', adminOnly, mergeCompanyRecords);

export default router;
