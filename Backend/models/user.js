// user.js

const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    bio: {
        type: String,
        maxLength: 300,
        default: ""
    },
    profilePicture: {
        type: String,
        default: "" // You can use a default avatar URL if needed
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    phone: String,
    role: String,
    purpose: String,
    gender: String,
    ageGroup: String,


onboarded: {
  type: Boolean,
  default: false
},

plan: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Plan",
  default: null,
},
planUpdatedAt: {
  type: Date,
},
planExpiresAt: Date

}, {
    timestamps: true
});

// Password hash before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Login token
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Email verification token (shorter expiry)
userSchema.add({ isVerified: { type: Boolean, default: false } });
userSchema.methods.generateVerificationToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};


userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  return token;
};

module.exports = mongoose.model('User', userSchema);
