import express from 'express';
import {
  getYears,
  createYear,
  updateYear,
  deleteYear,
} from '../controllers/yearController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getYears).post(createYear);
router.route('/:id').put(updateYear).delete(deleteYear);

export default router;
