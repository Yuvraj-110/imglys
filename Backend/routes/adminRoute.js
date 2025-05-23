// adminRoutes.js

const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const {
  getAllUsers,
  deleteUser,
  getAllMedia,
  getPlanStats,
  getPlans,
  updateUserPlan

} = require('../controllers/adminController');

// Admin routes
router.get('/users', protect, isAdmin, getAllUsers);
router.delete('/users/:id', protect, isAdmin, deleteUser);
router.get('/media', protect, isAdmin, getAllMedia);
router.get('/plans/stats', protect, isAdmin, getPlanStats);
router.get('/plans', protect, isAdmin, getPlans);
router.put('/users/:id/plan', protect, isAdmin, updateUserPlan);



module.exports = router;
