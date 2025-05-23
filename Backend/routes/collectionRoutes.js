const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getCollections,
  addToCollection,
  deleteFromCollection,
  deleteCollection,
  renameCollection, // ✅ Add this
} = require('../controllers/collectionController');

// ✅ Get all collections for the logged-in user
router.get('/', protect, getCollections);

// ✅ Add media to a collection (create if not exists)
router.post('/', protect, addToCollection);

// ✅ Rename a collection
router.patch('/:collectionId', protect, renameCollection);

// ✅ Remove a media item from a specific collection
router.delete('/:collectionId/item/:itemId', protect, deleteFromCollection);

// ✅ Delete entire collection
router.delete('/:collectionId', protect, deleteCollection);

module.exports = router;
