const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the Customer blueprint

const router = express.Router();

// ==========================================
// 1. USER REGISTRATION (SIGNUP)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if a customer with this email OR phone already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email or phone is already registered.' });
    }

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new customer
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      status: 'Active' // Customers don't need KYC, they are active immediately!
    });

    await newUser.save();
    
    // Generate a token so they are logged in immediately after signing up
    const token = jwt.sign(
      { userId: newUser._id, role: 'user' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      message: 'User registered successfully!', 
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during user registration.' });
  }
});

// ==========================================
// 2. USER LOGIN
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Assuming users log in with email

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check if Admin banned them
    if (user.status === 'Banned') {
      return res.status(403).json({ message: 'Your account has been suspended by the Admin.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, role: 'user' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } 
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during user login.' });
  }
});

module.exports = router;