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

// --- TEMPORARY OTP STORAGE (In-Memory) ---
// Note: In production, you would use Redis or MongoDB for this.
const otpStore = new Map();

const nodemailer = require('nodemailer');

// ==========================================
// 📧 EMAIL CONFIGURATION (NODEMAILER)
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // 👈 Pulls directly from your .env
    pass: process.env.EMAIL_PASS  // 👈 Pulls directly from your .env
  }
});

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
      { returnDocument: 'after' } // This tells MongoDB to return the newly updated document
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

// --- STEP 1: GENERATE & SEND REGISTRATION OTP (REAL EMAIL) ---
router.post('/send-user-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const lowercaseEmail = email.toLowerCase();

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email: lowercaseEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered. Please log in." });
    }

    // 2. Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Save to store (expires in 10 mins)
    otpStore.set(lowercaseEmail, {
      otp: otp,
      expiresAt: Date.now() + 10 * 60 * 1000 
    });

    // 4. Send the Real Email!
    // 4. Send the Real Email!
    const mailOptions = {
      from: `Quick Wash <${process.env.EMAIL_USER}>`, // 👈 Securely uses your .env email
      to: lowercaseEmail,
      subject: 'Quick Wash - Your Registration OTP',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 20px; background-color: #f8fafc; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #2563eb; margin-top: 0;">Welcome to Quick Wash! 🧺</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.5;">Thank you for signing up. Please use the following One-Time Password (OTP) to complete your registration:</p>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #eff6ff; border-radius: 12px; border: 2px dashed #bfdbfe;">
              <h1 style="font-size: 48px; letter-spacing: 8px; color: #1e3a8a; margin: 0;">${otp}</h1>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">This code will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Real Email successfully sent to: ${lowercaseEmail}`);

    res.status(200).json({ message: "OTP sent to your email inbox!" });
  } catch (error) {
    console.error("Email Sending Error:", error);
    res.status(500).json({ message: "Failed to send email. Check backend configuration." });
  }
});

// --- STEP 2: VERIFY OTP & CREATE CUSTOMER ---
router.post('/user-register', async (req, res) => {
  try {
    const { name, phone, email, password, otp } = req.body;
    const lowercaseEmail = email.toLowerCase();

    // 1. Verify the OTP
    const storedData = otpStore.get(lowercaseEmail);
    
    if (!storedData) {
      return res.status(400).json({ message: "OTP expired or not requested. Please start over." });
    }
    if (storedData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please check and try again." });
    }
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(lowercaseEmail);
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    // 2. Double-check user doesn't exist (Safety net)
    const existingUser = await User.findOne({ email: lowercaseEmail });
    if (existingUser) return res.status(400).json({ message: "Email already registered." });

    // 3. Save User to Database
    const newUser = new User({
      name,
      phone,
      email: lowercaseEmail,
      password 
    });

    await newUser.save();
    
    // 4. Clear the OTP from memory so it can't be reused
    otpStore.delete(lowercaseEmail);

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

// --- GET ALL CUSTOMERS (USERS) FOR ADMIN DASHBOARD ---
router.get('/all-users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    console.log(`✅ Admin fetched users. Found: ${users.length}`); // This will print in your terminal!
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

module.exports = router;