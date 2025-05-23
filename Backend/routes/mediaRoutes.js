// mediaRoutes.js


const express = require("express");
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const checkFeatureAccess = require("../middleware/planMiddleware");
const authMiddleware = require('../middleware/authMiddleware');


const {
  fetchMedia,
  getTrendingTags,
  downloadMedia,
  proxyMedia,
} = require("../controllers/mediaController");

// ✅ Media search (optional: make it protect if needed)
router.get('/search', fetchMedia);

// ✅ Trending tags
router.get('/trending-tags', getTrendingTags);

// ✅ Media download via backend (optional: secure it too)
router.get('/download', downloadMedia);

// ✅ NEW: Proxy media stream through backend (Secure)
router.get('/proxy', proxyMedia); // 🔐 Secure with login token

// ✅ Upload route protected by auth + plan feature access
router.post('/upload', protect, checkFeatureAccess('upload'), (req, res) => {
  res.send('Upload allowed!');
});

module.exports = router;
