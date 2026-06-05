import express from 'express';
import {
  getEssayPointers,
  createEssayPointer,
  updateEssayPointer,
  deleteEssayPointer,
} from '../controllers/essayPointerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getEssayPointers).post(createEssayPointer);
router.route('/:id').put(updateEssayPointer).delete(deleteEssayPointer);

export default router;
