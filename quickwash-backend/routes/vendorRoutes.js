const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Needed to delete junk files!
const nodemailer = require('nodemailer');
const Vendor = require('../models/Vendor');

// ==========================================
// 📧 EMAIL & OTP CONFIGURATION
// ==========================================
const vendorOtpStore = new Map();

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
// 🏪 1. VENDOR REGISTRATION (WITH OTP)
// ==========================================

// --- STEP 1: GENERATE & SEND VENDOR OTP ---
router.post('/send-vendor-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const lowercaseEmail = email.toLowerCase();

    // 1. Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email: lowercaseEmail });
    if (existingVendor) {
      return res.status(400).json({ message: "Email already registered as a Vendor." });
    }

    // 2. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Save to store (expires in 10 mins)
    vendorOtpStore.set(lowercaseEmail, {
      otp: otp,
      expiresAt: Date.now() + 10 * 60 * 1000 
    });

    // 4. Send the Email
    const mailOptions = {
      from: `Quick Wash Partners <${process.env.EMAIL_USER}>`,
      to: lowercaseEmail,
      subject: 'Quick Wash - Vendor Registration OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #16a34a;">Partner with Quick Wash 🏪</h2>
          <p>Use the following OTP to verify your email and submit your KYC documents:</p>
          <div style="margin: 20px auto; padding: 15px; background-color: #f0fdf4; border: 2px dashed #86efac; border-radius: 8px; max-width: 300px;">
            <h1 style="color: #15803d; font-size: 40px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 12px;">This code expires in 10 minutes.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Vendor OTP Email sent to: ${lowercaseEmail}`);
    res.status(200).json({ message: "OTP sent to your email inbox!" });
  } catch (error) {
    console.error("Vendor OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP email." });
  }
});

// --- STEP 2: VERIFY OTP & SAVE VENDOR (WITH KYC) ---
router.post('/vendor-signup', upload.fields([
  { name: 'gst', maxCount: 1 }, 
  { name: 'shopAct', maxCount: 1 },
  { name: 'pan', maxCount: 1 }, 
  { name: 'aadhaar', maxCount: 1 },
  { name: 'cheque', maxCount: 1 }
]), async (req, res) => {
  
  // Helper function to delete uploaded files if OTP fails
  const cleanupFiles = () => {
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        fileArray.forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error("Failed to delete junk file:", err);
          });
        });
      });
    }
  };

  try {
    const { name, email, phone, password, hubName, capacity, address, otp } = req.body;
    const lowercaseEmail = email.toLowerCase();

    // 1. Verify the OTP FIRST!
    const storedData = vendorOtpStore.get(lowercaseEmail);
    
    if (!storedData || storedData.otp !== otp || Date.now() > storedData.expiresAt) {
      cleanupFiles(); // 🚨 Delete the files immediately!
      return res.status(400).json({ message: "Invalid or expired OTP. Files discarded." });
    }

    // 2. Safety check for existing vendor
    const existingVendor = await Vendor.findOne({ email: lowercaseEmail });
    if (existingVendor) {
      cleanupFiles();
      return res.status(400).json({ message: "Email already registered." });
    }

    // 3. Map the documents securely
    const docs = {
      gst: req.files['gst'] ? req.files['gst'][0].filename : null,
      shopAct: req.files['shopAct'] ? req.files['shopAct'][0].filename : null,
      pan: req.files['pan'] ? req.files['pan'][0].filename : null,
      aadhaar: req.files['aadhaar'] ? req.files['aadhaar'][0].filename : null,
      cheque: req.files['cheque'] ? req.files['cheque'][0].filename : null,
    };

    // 4. Save to Database
    const newVendor = new Vendor({
      name, 
      email: lowercaseEmail, 
      phone, 
      password, 
      hubName, 
      capacity, 
      address,
      status: 'Pending', 
      documents: docs
    });

    await newVendor.save();
    vendorOtpStore.delete(lowercaseEmail); // Clear OTP memory

    res.status(201).json({ message: "Vendor application submitted successfully!" });
  } catch (error) {
    console.error("🚨 VENDOR SIGNUP ERROR:", error);
    cleanupFiles(); // Delete files on any server error
    
    // 👇 NEW: Smart Error Handling to tell the Frontend exactly what broke! 👇
    let exactErrorMessage = "Server error during registration.";
    
    if (error.code === 11000) {
      // Catch Duplicate Emails or Phone Numbers
      const duplicateField = Object.keys(error.keyValue)[0];
      exactErrorMessage = `Registration failed: That ${duplicateField} is already in use!`;
    } else if (error.name === 'ValidationError') {
      // Catch missing Schema fields (like capacity or address)
      exactErrorMessage = Object.values(error.errors).map(val => val.message).join(', ');
    } else {
      // Catch anything else
      exactErrorMessage = error.message;
    }

    res.status(500).json({ message: exactErrorMessage });
  }
});

// ==========================================
// 🏪 2. GENERAL VENDOR OPERATIONS
// ==========================================

// --- GET ALL ACTIVE VENDORS (For Customer Home Page) ---
router.get('/all-vendors', async (req, res) => {
  try {
    const activeVendors = await Vendor.find({ status: 'Active' }).sort({ createdAt: -1 });
    res.status(200).json(activeVendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
});

// --- GET VENDOR PROFILE DATA ---
router.get('/profile/:email', async (req, res) => {
  try {
    const foundVendor = await Vendor.findOne({ email: req.params.email.toLowerCase() });
    if (!foundVendor) return res.status(404).json({ message: "Vendor not found" });
    
    res.status(200).json({
      ...foundVendor._doc, 
      is_open: foundVendor.isOpen 
    });
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- SAVE VENDOR PROFILE EDITS ---
router.put('/profile', async (req, res) => {
  try {
    const { email, hub_name, owner_name, washing_capacity_kg, hub_address, pricing } = req.body;
    
    const updatedVendor = await Vendor.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        hubName: hub_name, 
        name: owner_name, 
        capacity: washing_capacity_kg, 
        address: hub_address, 
        pricing: pricing 
      },
      { new: true }
    );
    
    if (!updatedVendor) return res.status(404).json({ message: "Vendor not found" });
    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
});

// --- TOGGLE STORE OPEN/CLOSED STATUS ---
router.put('/toggle-status', async (req, res) => {
  try {
    const { email, is_open } = req.body;

    const vendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Do not let Suspended vendors reopen their shop!
    if (vendor.status === 'Suspended') {
      return res.status(403).json({ message: "Account is suspended. Cannot change status." });
    }

    const newAdminStatus = is_open ? 'Active' : 'Inactive';

    const updatedVendor = await Vendor.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        isOpen: is_open,
        status: newAdminStatus 
      },
      { new: true } 
    );

    res.status(200).json({ 
      message: "Store status updated successfully!", 
      is_open: updatedVendor.isOpen 
    });
  } catch (error) {
    console.error("Error toggling store status:", error);
    res.status(500).json({ message: "Server error while updating status" });
  }
});

// --- GET SINGLE VENDOR BY ID (For Customer Shop Page) ---
router.get('/shop/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Shop not found" });
    
    res.status(200).json(vendor);
  } catch (error) {
    console.error("Error fetching shop details:", error);
    res.status(500).json({ message: "Server error fetching shop details" });
  }
});

module.exports = router;