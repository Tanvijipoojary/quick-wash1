const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Shop = require('../models/Shop'); // Import your Shop blueprint

const router = express.Router();

// ==========================================
// 1. VENDOR REGISTRATION (SIGNUP)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, ownerName, phone, password, location } = req.body;

    // Check if a shop with this phone number already exists
    const existingShop = await Shop.findOne({ phone });
    if (existingShop) {
      return res.status(400).json({ message: 'A shop with this phone number is already registered.' });
    }

    // Encrypt the password before saving it to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new shop
    const newShop = new Shop({
      name,
      ownerName,
      phone,
      password: hashedPassword,
      location,
      status: 'Unverified' // They must do KYC next!
    });

    await newShop.save();
    
    res.status(201).json({ message: 'Shop registered successfully!', shopId: newShop._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during registration.' });
  }
});

// ==========================================
// 2. VENDOR LOGIN
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find the shop by phone number
    const shop = await Shop.findOne({ phone });
    if (!shop) {
      return res.status(400).json({ message: 'Invalid phone number or password.' });
    }

    // Compare the typed password with the encrypted one in the database
    const isMatch = await bcrypt.compare(password, shop.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid phone number or password.' });
    }

    // Generate a secure JWT Token (Acts as their digital ID card)
    const token = jwt.sign(
      { shopId: shop._id, role: 'vendor' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } // Keeps them logged in for 7 days
    );

    // Send the token and shop data back to React
    res.status(200).json({
      message: 'Login successful!',
      token,
      shop: {
        id: shop._id,
        name: shop.name,
        status: shop.status
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error during login.' });
  }
});

module.exports = router;