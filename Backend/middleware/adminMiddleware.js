// adminMiddleware.js
const User = require('../models/user');

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);
    res.status(500).json({ message: 'Server error in admin check' });
  }
};

module.exports = isAdmin;
