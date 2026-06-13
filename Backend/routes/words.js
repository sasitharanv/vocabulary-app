import express from 'express';
import * as wordsController from '../controllers/wordsController.js';

const router = express.Router();

router.get('/', wordsController.getAllWords);
router.post('/', wordsController.createWord);
router.delete('/:id', wordsController.deleteWord);
router.get('/review/queue', wordsController.getReviewQueue);
router.post('/:id/review', wordsController.reviewWord);
router.post('/dev/skip-to-due', wordsController.skipToDue);

export default router;
