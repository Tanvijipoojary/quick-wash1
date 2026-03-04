const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const multer = require('multer'); // Used for file uploads
const path = require('path');

// --- 1. IMPORT YOUR MODELS ---
const Vendor = require('../models/Vendor'); 
const OtpVerification = require('../models/OtpVerification');

// --- 2. CONFIGURE EMAIL SENDER ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- 3. SEND OTP ROUTE ---
router.post('/send-otp', async (req, res) => {
  try {
    const { email, user_type } = req.body;
    
    if (!email) return res.status(400).json({ message: "Email is required" });

    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    await OtpVerification.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp_code: generatedOtp, user_type, expires_at: new Date(Date.now() + 600000), is_used: false },
      { upsert: true, new: true }
    );

    const mailOptions = {
      from: `"Quick Wash" <${process.env.EMAIL_USER}>`,
      to: email.toLowerCase(),
      subject: 'Quick Wash Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #0d9488;">QUICK WASH</h2>
          <p style="color: #555;">Your verification code for <strong>${user_type}</strong> registration is:</p>
          <div style="background: #f3f4f6; padding: 15px; display: inline-block; border-radius: 5px;">
            <h1 style="font-size: 40px; letter-spacing: 10px; color: #333; margin: 0;">${generatedOtp}</h1>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">This code will expire in 10 minutes.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Real OTP Email sent to: ${email}`);
    res.status(200).json({ message: "OTP sent successfully!" });

  } catch (error) {
    console.error("❌ Nodemailer/Database Error:", error);
    res.status(500).json({ message: "Failed to send OTP. Check server logs." });
  }
});

// --- 4. VERIFY OTP ROUTE ---
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OtpVerification.findOne({ email: email.toLowerCase() });

    if (!otpRecord) return res.status(400).json({ message: "OTP expired or not found. Please resend." });
    if (otpRecord.otp_code !== otp) return res.status(400).json({ message: "Invalid OTP. Please try again." });

    await OtpVerification.deleteOne({ email: email.toLowerCase() });
    res.status(200).json({ message: "OTP verified successfully!" });

  } catch (error) {
    console.error("❌ Verification Error:", error);
    res.status(500).json({ message: "Server error during verification." });
  }
});

// --- 5. CONFIGURE MULTER STORAGE ---
// This tells the server WHERE to put the uploaded images/PDFs and WHAT to name them
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Saves to the 'uploads' folder you created
  },
  filename: function (req, file, cb) {
    // Creates a safe, unique filename (e.g., vendor-gst-1709456.jpg)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const emailPrefix = req.body.email ? req.body.email.split('@')[0] : 'vendor';
    cb(null, emailPrefix + '-' + file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- 6. VENDOR SIGNUP & KYC UPLOAD ROUTE ---
// The 'upload.fields' middleware catches the files sent from the React form
router.post('/vendor-signup', upload.fields([
  { name: 'gst', maxCount: 1 },
  { name: 'shopAct', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'aadhaar', maxCount: 1 },
  { name: 'cheque', maxCount: 1 }
]), async (req, res) => {
  try {
    // These names match what you appended in React (e.g., data.append('name', formData.name))
    const { name, email, phone, hubName, capacity, address } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    // 1. Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (existingVendor) {
      return res.status(400).json({ message: "Registration already exists for this email." });
    }

    // 2. Extract the automatically generated filenames for the uploaded files safely
    const docs = {
      gst: req.files && req.files['gst'] ? req.files['gst'][0].filename : null,
      shopAct: req.files && req.files['shopAct'] ? req.files['shopAct'][0].filename : null,
      pan: req.files && req.files['pan'] ? req.files['pan'][0].filename : null,
      aadhaar: req.files && req.files['aadhaar'] ? req.files['aadhaar'][0].filename : null,
      cheque: req.files && req.files['cheque'] ? req.files['cheque'][0].filename : null,
    };

    // 3. Save everything to MongoDB
    const newVendor = new Vendor({
      owner_name: name, 
      email: email.toLowerCase(), 
      phone_number: phone, 
      hub_name: hubName,
      washing_capacity_kg: capacity, 
      hub_address: address, 
      status: 'Pending', 
      documents: docs // Save the filenames here!
    });

    await newVendor.save();
    console.log(`✅ New Vendor Registered: ${email}`);
    res.status(201).json({ message: "Application submitted successfully!", vendor: newVendor });

  } catch (error) {
    console.error("❌ Signup/Upload Error:", error);
    res.status(500).json({ message: "Server error. Could not process application." });
  }
});

// --- 7. VENDOR LOGIN (CHECK STATUS & SEND OTP) ---
router.post('/vendor-login-step1', async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if the email exists in the Vendor database
    const vendor = await Vendor.findOne({ email: email.toLowerCase() });
    
    if (!vendor) {
      return res.status(404).json({ message: "Email not recognized. Please sign up first." });
    }

    // 2. Check what the Admin has set their status to
    if (vendor.status === 'Pending') {
      return res.status(403).json({ message: "Your account is still under review by the Admin." });
    }
    if (vendor.status === 'Suspended') {
      return res.status(403).json({ message: "Your account has been suspended. Please contact support." });
    }

    // 3. If they are 'Active', generate and send the Login OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    await OtpVerification.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp_code: generatedOtp, user_type: 'Vendor', expires_at: new Date(Date.now() + 600000), is_used: false },
      { upsert: true, new: true }
    );

    const mailOptions = {
      from: `"Quick Wash" <${process.env.EMAIL_USER}>`,
      to: email.toLowerCase(),
      subject: 'Quick Wash Login Verification',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #0d9488;">QUICK WASH LOGIN</h2>
          <p style="color: #555;">Welcome back! Your login verification code is:</p>
          <div style="background: #f3f4f6; padding: 15px; display: inline-block; border-radius: 5px;">
            <h1 style="font-size: 40px; letter-spacing: 10px; color: #333; margin: 0;">${generatedOtp}</h1>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">This code expires in 10 minutes.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Login OTP sent successfully!" });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// --- IMPORTANT: ALWAYS EXPORT THE ROUTER AT THE BOTTOM ---
module.exports = router;