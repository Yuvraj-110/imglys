const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user');
const sendVerificationEmail = require('../utils/sendEmail');
const Plan = require("../models/plan");
const protect = require('../middleware/authMiddleware');


const router = express.Router();

// ✅ Register Route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const freePlan = await Plan.findOne({ name: "free" });
if (!freePlan) return res.status(500).json({ message: "Default plan not found" });

// Create user with Free plan
const user = new User({ name, email, password, plan: freePlan._id });
await user.save();

    const token = user.generateVerificationToken();
    const verifyURL = `http://localhost:5000/api/auth/verify-email/${token}`;

    const html = `
      <p>Hi ${name},</p>
      <p>Click the button below to verify your email:</p>
      <a href="${verifyURL}" style="padding:10px 20px; background:#007BFF; color:#fff; text-decoration:none;">Verify Email</a>
    `;

    await sendVerificationEmail(email, 'Verify your email', html);
    res.status(201).json({ message: 'Registration successful. Please check your email to verify.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ✅ Email Verification
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).send('Invalid verification link.');
    if (user.isVerified) return res.send('Email already verified.');

    user.isVerified = true;
    await user.save();

    res.redirect('http://localhost:5000/verify.html');
  } catch (err) {
    console.error(err);
    res.status(400).send('Verification link expired or invalid.');
  }
});

// ✅ Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email before login.' });
    }

    const token = user.generateToken();
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ✅ Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const token = user.generatePasswordResetToken();
    await user.save();

    const resetURL = `http://localhost:5000/reset-password.html?token=${token}`;
    const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
    <div style="max-width: 600px; background: #ffffff; border-radius: 8px; padding: 30px; margin: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #343a40;">Reset Your Password</h2>
      <p style="font-size: 16px; color: #495057;">Hi,</p>
      <p style="font-size: 16px; color: #495057;">
        We received a request to reset your password. Click the button below to set a new one.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetURL}" style="background-color: #007BFF; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-size: 16px;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 14px; color: #6c757d;">
        If you didn't request this, you can ignore this email.
      </p>
      <p style="font-size: 12px; color: #adb5bd; text-align: center; margin-top: 40px;">
        &copy; ${new Date().getFullYear()} Imglys. All rights reserved.
      </p>
    </div>
  </div>
`;

    await sendVerificationEmail(email, "Reset Your Password", html);

    res.json({ message: "Reset link sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Failed to send reset email" });
  }
});

// ✅ Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = req.body.newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Could not reset password" });
  }
});


// DELETE account route
router.delete('/delete-account', protect, async (req, res) => {
  try {
    const userId =req.user.id;
;

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Failed to delete account." });
  }
});


module.exports = router;
