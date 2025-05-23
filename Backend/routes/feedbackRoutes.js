const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const {
  submitFeedback,
  getAllFeedback,
  deleteFeedback,
  replyToFeedback,
} = require('../controllers/feedbackController');

// User submits feedback
router.post('/', authMiddleware, submitFeedback);

// Admin gets all feedback
router.get('/admin', authMiddleware, isAdmin, getAllFeedback);

// Admin deletes feedback
router.delete('/admin/:id', authMiddleware, isAdmin, deleteFeedback);

// Admin replies to feedback
router.post('/:id/reply', authMiddleware, isAdmin, replyToFeedback);

module.exports = router;
