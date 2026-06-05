import express from 'express';
import {
  getMonths,
  createMonth,
  updateMonth,
  deleteMonth,
} from '../controllers/monthController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getMonths).post(createMonth);
router.route('/:id').put(updateMonth).delete(deleteMonth);

export default router;
