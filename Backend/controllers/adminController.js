// adminController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Media = require('../models/Media'); // Adjust if you use a different media model
const Plan = require('../models/plan');


// POST /api/users/login
const loginUser = async (req, res) => { 
  const { email, password } = req.body;

  console.log('Login attempt:', email, password); // <--- log input

  try {
    const user = await User.findOne({ email });
    console.log('User found:', user);

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};



// GET all users (excluding passwords)
const getAllUsers = async (req, res) => {
  try {
    // Populating the 'plan' field with only 'name' and '_id' for each user
    const users = await User.find()
      .select('-password')
      .populate('plan', 'name');

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Admin Get Users Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};


// DELETE a user by ID
const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error("Admin Delete User Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

// GET all uploaded media (if applicable)
const getAllMedia = async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, media });
  } catch (error) {
    console.error("Admin Get Media Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch media" });
  }
};


const getPlanStats = async (req, res) => {
  try {
    const users = await User.find({})
      .populate('plan', 'name')
      .select('name email plan planUpdatedAt');

    const stats = {};
    let freeUsers = [];

    users.forEach(user => {
      const planName = user.plan?.name || 'Free';

      if (!stats[planName]) stats[planName] = [];

      stats[planName].push({
        name: user.name,
        email: user.email,
        updated: user.planUpdatedAt || user.createdAt,
      });

      if (planName === 'Free') freeUsers.push(user);
    });

    res.json({
      totalUsers: users.length,
      plans: stats,
      freeUsers: freeUsers.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load plan details', error: err.message });
  }
};


// Get all plans
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().select('name price');
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load plans', error: err.message });
  }
};

// Update a user's plan
const updateUserPlan = async (req, res) => {
  const { id } = req.params;
  const { planId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { plan: planId, planUpdatedAt: new Date() },
      { new: true }
    ).populate('plan', 'name');

    res.json({
      message: `Plan updated to ${user.plan.name} for ${user.email}`
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user plan', error: err.message });
  }
};



module.exports = {
  getAllUsers,
  deleteUser,
  getAllMedia,
  loginUser,
  getPlanStats,
  getPlans,
  updateUserPlan

};
