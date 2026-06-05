import express from 'express';
import {
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  searchContent,
} from '../controllers/topicController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/search').get(searchContent);
router.route('/').get(getTopics).post(createTopic);
router.route('/:id').put(updateTopic).delete(deleteTopic);

export default router;
