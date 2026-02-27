const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Rider = require('../models/Rider'); // Import the Rider blueprint

const router = express.Router();

// ==========================================
// 1. RIDER REGISTRATION (SIGNUP)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, zone, vehicleMake, vehiclePlate } = req.body;

    // Check if a rider with this phone number already exists
    const existingRider = await Rider.findOne({ phone });
    if (existingRider) {
      return res.status(400).json({ message: 'A rider with this phone number is already registered.' });
    }

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new rider
    const newRider = new Rider({
      name,
      phone,
      password: hashedPassword,
      zone,
      vehicle: {
        makeModel: vehicleMake,
        plateNumber: vehiclePlate
      },
      status: 'Unverified' // They must upload DL, RC, Insurance, etc. next!
    });

    await newRider.save();
    
    res.status(201).json({ message: 'Rider registered successfully!', riderId: newRider._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during rider registration.' });
  }
});

// ==========================================
// 2. RIDER LOGIN
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body; 

    // Find the rider by phone number
    const rider = await Rider.findOne({ phone });
    if (!rider) {
      return res.status(400).json({ message: 'Invalid phone number or password.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, rider.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid phone number or password.' });
    }

    // Check if Admin suspended them
    if (rider.status === 'Suspended') {
      return res.status(403).json({ message: 'Your account has been suspended by the Admin.' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { riderId: rider._id, role: 'rider' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } 
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      rider: { 
        id: rider._id, 
        name: rider.name, 
        status: rider.status,
        zone: rider.zone 
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during rider login.' });
  }
});

module.exports = router;