const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/adminController'); // use adminController since login is there

// Route: POST /api/users/login
router.post('/login', loginUser);

module.exports = router;
