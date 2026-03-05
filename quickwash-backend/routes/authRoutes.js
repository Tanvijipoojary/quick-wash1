const express = require('express');
const router = express.Router();

// Import Database Models
const User = require('../models/User');
const Rider = require('../models/Rider');
const Vendor = require('../models/Vendor'); // Make sure you have this model created!


// File Upload Tools
const multer = require('multer');
const path = require('path');

// ==========================================
// 📁 UPLOAD CONFIGURATION (MULTER)
// ==========================================
// This saves uploaded KYC docs into the 'uploads' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// quickwash-backend/routes/authRoutes.js (or userRoutes.js)

// --- UPDATE USER PROFILE ---
router.put('/update-profile', async (req, res) => {
  try {
    const { email, name, phone } = req.body;

    // Assuming your user model is required at the top as `User`
    // This finds the user by email and updates their name and phone
    const updatedUser = await User.findOneAndUpdate(
      { email: email }, 
      { name: name, phone: phone },
      { new: true } // This tells MongoDB to return the newly updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found in database" });
    }

    res.status(200).json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
});


// ==========================================
// 🧑‍💼 1. CUSTOMER (USER) ROUTES
// ==========================================

// --- CUSTOMER REGISTRATION ---
router.post('/user-register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered. Please log in." });
    }

    const newUser = new User({
      name,
      phone,
      email: email.toLowerCase(),
      password 
    });

    await newUser.save();
    res.status(201).json({ message: "Account created successfully!" });
  } catch (error) {
    console.error("User Registration Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// --- CUSTOMER LOGIN ---
router.post('/user-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "Account not found. Please sign up first." });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password. Please try again." });
    }

    res.status(200).json({ 
      message: "Login successful", 
      user: { name: user.name, email: user.email, phone: user.phone } 
    });
  } catch (error) {
    console.error("User Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});


// ==========================================
// 🛵 2. RIDER ROUTES
// ==========================================

// --- RIDER SIGNUP (WITH KYC UPLOADS) ---
router.post('/rider-signup', upload.fields([
  { name: 'dl', maxCount: 1 }, 
  { name: 'rc', maxCount: 1 },
  { name: 'insurance', maxCount: 1 }, 
  { name: 'aadhaar', maxCount: 1 },
  { name: 'pan', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, phone, password, city, vehicleType, vehicleNumber } = req.body;

    const existingRider = await Rider.findOne({ email: email.toLowerCase() });
    if (existingRider) return res.status(400).json({ message: "Email already registered." });

    const docs = {
      dl: req.files['dl'] ? req.files['dl'][0].filename : null,
      rc: req.files['rc'] ? req.files['rc'][0].filename : null,
      insurance: req.files['insurance'] ? req.files['insurance'][0].filename : null,
      aadhaar: req.files['aadhaar'] ? req.files['aadhaar'][0].filename : null,
      pan: req.files['pan'] ? req.files['pan'][0].filename : null,
    };

    const newRider = new Rider({
      name, 
      email: email.toLowerCase(), 
      phone, 
      password, 
      city, 
      vehicle_type: vehicleType, 
      vehicle_number: vehicleNumber,
      status: 'Pending', 
      documents: docs
    });

    await newRider.save();
    res.status(201).json({ message: "Rider application submitted successfully!" });
  } catch (error) {
    console.error("🚨 RIDER SIGNUP ERROR:", error);
    res.status(500).json({ message: "Server error during rider registration." });
  }
});

// --- RIDER LOGIN (PASSWORD VERIFICATION) ---
router.post('/rider-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const rider = await Rider.findOne({ email: email.toLowerCase() });
    if (!rider) return res.status(404).json({ message: "Rider not found. Please register first." });
    
    if (rider.status === 'Pending') return res.status(403).json({ message: "Account under review by Admin." });
    if (rider.status === 'Suspended') return res.status(403).json({ message: "Account suspended." });

    if (rider.password !== password) return res.status(401).json({ message: "Incorrect password. Try again." });

    res.status(200).json({ message: "Login successful", rider: { name: rider.name, email: rider.email }});
  } catch (err) {
    console.error("🚨 RIDER LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});


// ==========================================
// 🏪 3. VENDOR ROUTES
// ==========================================

// --- VENDOR SIGNUP (WITH KYC UPLOADS) ---
router.post('/vendor-signup', upload.fields([
  { name: 'gst', maxCount: 1 }, 
  { name: 'shopAct', maxCount: 1 },
  { name: 'pan', maxCount: 1 }, 
  { name: 'aadhaar', maxCount: 1 },
  { name: 'cheque', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, phone, password, hubName, capacity, address } = req.body;

    const existingVendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (existingVendor) return res.status(400).json({ message: "Email already registered." });

    const docs = {
      gst: req.files['gst'] ? req.files['gst'][0].filename : null,
      shopAct: req.files['shopAct'] ? req.files['shopAct'][0].filename : null,
      pan: req.files['pan'] ? req.files['pan'][0].filename : null,
      aadhaar: req.files['aadhaar'] ? req.files['aadhaar'][0].filename : null,
      cheque: req.files['cheque'] ? req.files['cheque'][0].filename : null,
    };

    const newVendor = new Vendor({
      name, 
      email: email.toLowerCase(), 
      phone, 
      password, 
      hubName, 
      capacity, 
      address,
      status: 'Pending', 
      documents: docs
    });

    await newVendor.save();
    res.status(201).json({ message: "Vendor application submitted!" });
  } catch (error) {
    console.error("🚨 VENDOR SIGNUP ERROR:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// --- VENDOR LOGIN (PASSWORD VERIFICATION) ---
router.post('/vendor-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const vendor = await Vendor.findOne({ email: email.toLowerCase() });

    if (!vendor) return res.status(404).json({ message: "Vendor not found." });
    
    // Check Status
    if (vendor.status === 'Pending') return res.status(403).json({ message: "Approval pending." });

    // Compare plain-text password (matching your current simple setup)
    if (vendor.password !== password) {
      return res.status(401).json({ message: "Invalid password." });
    }

    res.status(200).json({ message: "Login successful", vendor });
  } catch (error) {
    res.status(500).json({ message: "Server error during login." });
  }
});

module.exports = router;