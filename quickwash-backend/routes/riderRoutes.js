const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Needed to delete junk files!
const nodemailer = require('nodemailer');
const Rider = require('../models/Rider');
const Order = require('../models/Order');

// ==========================================
// 📧 EMAIL & OTP CONFIGURATION
// ==========================================
const riderOtpStore = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ==========================================
// 📁 UPLOAD CONFIGURATION (MULTER)
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ==========================================
// 🛵 1. RIDER REGISTRATION (WITH OTP)
// ==========================================

// --- STEP 1: GENERATE & SEND RIDER OTP ---
router.post('/send-rider-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const lowercaseEmail = email.toLowerCase();

    // 1. Check if rider already exists
    const existingRider = await Rider.findOne({ email: lowercaseEmail });
    if (existingRider) {
      return res.status(400).json({ message: "Email already registered as a Rider." });
    }

    // 2. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Save to store (expires in 10 mins)
    riderOtpStore.set(lowercaseEmail, {
      otp: otp,
      expiresAt: Date.now() + 10 * 60 * 1000 
    });

    // 4. Send the Email
    const mailOptions = {
      from: `Quick Wash Fleet <${process.env.EMAIL_USER}>`,
      to: lowercaseEmail,
      subject: 'Quick Wash - Rider Onboarding OTP',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 25px; text-align: center; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #2563eb; margin-top: 0;">Welcome to Quick Wash Fleet 🛵</h2>
          <p style="color: #475569; font-size: 15px;">You're almost there! Use the One-Time Password (OTP) below to verify your email and complete your Rider signup:</p>
          <div style="margin: 25px auto; padding: 18px; background-color: #eff6ff; border: 2px dashed #bfdbfe; border-radius: 10px; max-width: 280px;">
            <h1 style="color: #1e3a8a; font-size: 42px; letter-spacing: 7px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #64748b; font-size: 13px;">If you did not initiate this registration, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Rider OTP Email sent to: ${lowercaseEmail}`);
    res.status(200).json({ message: "OTP sent! Please check your email inbox." });
  } catch (error) {
    console.error("Rider OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP. Check backend email configuration." });
  }
});

// --- STEP 2: VERIFY OTP & SIGNUP (WITH KYC UPLOADS & CLEANUP) ---
router.post('/rider-signup', upload.fields([
  { name: 'dl', maxCount: 1 }, 
  { name: 'rc', maxCount: 1 },
  { name: 'insurance', maxCount: 1 }, 
  { name: 'aadhaar', maxCount: 1 },
  { name: 'pan', maxCount: 1 }
]), async (req, res) => {
  
  // Helper function: Instantly deletes uploaded files from 'uploads/' folder
  const cleanupFiles = () => {
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        fileArray.forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error(" Failed to delete junk file:", file.path, err);
          });
        });
      });
    }
  };

  try {
    const { name, email, phone, password, city, vehicleType, vehicleNumber, otp } = req.body;
    const lowercaseEmail = email.toLowerCase();

    // 1. VERIFY THE OTP FIRST!
    const storedData = riderOtpStore.get(lowercaseEmail);
    
    if (!storedData || storedData.otp !== otp || Date.now() > storedData.expiresAt) {
      cleanupFiles(); // 🚨 CRITICAL: Delete the junk files!
      return res.status(400).json({ message: "Invalid or expired OTP. Files discarded." });
    }

    // 2. Safety double-check for existing rider
    const existingRider = await Rider.findOne({ email: lowercaseEmail });
    if (existingRider) {
      cleanupFiles(); 
      return res.status(400).json({ message: "Email already registered." });
    }

    // 3. Construct document object from uploaded file names
    const docs = {
      dl: req.files['dl'] ? req.files['dl'][0].filename : null,
      rc: req.files['rc'] ? req.files['rc'][0].filename : null,
      insurance: req.files['insurance'] ? req.files['insurance'][0].filename : null,
      aadhaar: req.files['aadhaar'] ? req.files['aadhaar'][0].filename : null,
      pan: req.files['pan'] ? req.files['pan'][0].filename : null,
    };

    // 4. Create new Rider document
    const newRider = new Rider({
      name, 
      email: lowercaseEmail, 
      phone, 
      password, 
      city, 
      vehicle_type: vehicleType, 
      vehicle_number: vehicleNumber,
      status: 'Pending', 
      documents: docs
    });

    // 5. Save Rider to Database
    await newRider.save();
    
    // 6. Registration Success! Clear the OTP memory
    riderOtpStore.delete(lowercaseEmail); 

    res.status(201).json({ message: "Rider application submitted successfully!" });
  } catch (error) {
    console.error("🚨 RIDER SIGNUP ERROR:", error);
    cleanupFiles(); 
    res.status(500).json({ message: "Server error during registration." });
  }
});

// ==========================================
// 🛵 2. GENERAL RIDER OPERATIONS
// ==========================================

// --- GET RIDER PROFILE DATA ---
router.get('/profile/:email', async (req, res) => {
  try {
    const rider = await Rider.findOne({ email: req.params.email.toLowerCase() });
    if (!rider) return res.status(404).json({ message: "Rider not found" });
    
    res.status(200).json(rider);
  } catch (error) {
    console.error("Error fetching rider profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- 2. GET AVAILABLE LAUNDRY PICKUPS (VENDOR APPROVED ONLY) ---
router.get('/available-tasks', async (req, res) => {
  try {
    // 🛑 THE FIX: Only fetch orders where the Vendor has clicked "Accept"
    const availableOrders = await Order.find({ status: 'Searching Rider' })
                                       .sort({ createdAt: -1 }); // Newest first
    
    res.status(200).json(availableOrders); 
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Failed to load tasks" });
  }
});

// --- 3. RIDER ACCEPTS A TASK ---
router.put('/accept-task/:orderId', async (req, res) => {
  try {
    const { riderEmail } = req.body;
    
    // 🛵 When Rider accepts, update status so the Vendor's radar updates!
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { 
        status: 'Pending Pickup', 
        riderEmail: riderEmail 
      },
      { new: true }
    );
    
    res.status(200).json({ message: "Task accepted successfully!", order: updatedOrder });
  } catch (error) {
    console.error("Error accepting task:", error);
    res.status(500).json({ message: "Failed to accept task" });
  }
});

module.exports = router;