// createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const connectDB = require('../config/db');

async function createAdmin() {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const adminUser = new User({
      name: 'admin_Yuvraj',
      email: 'imglys.info@gmail.com',
      password: 'ysj123',
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
