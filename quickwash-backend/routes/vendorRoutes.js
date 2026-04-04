const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Needed to delete junk files!
const nodemailer = require('nodemailer');
const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const Withdrawal = require('../models/Withdrawal');


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

// --- VENDOR LOGIN ---
router.post('/login', async (req, res) => {
  try {
    
    const { email, password } = req.body;
    const lowercaseEmail = email.toLowerCase();

    // 1. Find the vendor by email
    const vendor = await Vendor.findOne({ email: lowercaseEmail });
    if (!vendor) {
      return res.status(400).json({ message: "Your are not registered." });
    }

    // 2. Check the password (Comparing plain text exactly as it is in your database!)
    if (password !== vendor.password) {
      return res.status(400).json({ message: "Invalid Password. Please try again." });
    }

    // 3. Check if Admin suspended them
    if (vendor.status === 'Suspended') {
      return res.status(403).json({ message: "Your account has been suspended by the Admin." });
    }

    // 3.5 Check if Admin hasn't approved them yet
    if (vendor.status === 'Pending') {
      return res.status(403).json({ message: "Account is pending Admin approval. Please wait for KYC verification." });
    }

    // 4. Success! Send back the vendor data to React
    res.status(200).json({
      message: "Login successful",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        hubName: vendor.hubName,
        status: vendor.status,
        isOpen: vendor.isOpen
      }
    });

  } catch (error) {
    console.error("Vendor Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

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
      { returnDocument: 'after' }
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
      { returnDocument: 'after' } 
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

// --- UPLOAD SHOP PROFILE IMAGE ---
// Notice we are using your existing 'upload' multer configuration!
router.post('/upload-image', upload.single('shopImage'), async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const updatedVendor = await Vendor.findOneAndUpdate(
      { email: email.toLowerCase() },
      { shopImage: req.file.filename },
      { returnDocument: 'after' }
    );

    res.status(200).json({ 
      message: "Shop image updated!", 
      shopImage: updatedVendor.shopImage 
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Server error during image upload" });
  }
});

// ==========================================
// 💰 SMART WALLET OPERATIONS
// ==========================================

// --- 1. GET DYNAMIC WALLET BALANCE & HISTORY (CLEAN VERSION) ---
router.get('/wallet/:email/:shopId', async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ email: req.params.email.toLowerCase() });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Step A: Calculate Total Earnings
    const completedOrders = await Order.find({ shopId: req.params.shopId, status: 'Completed' });
    const totalEarned = completedOrders.reduce((sum, order) => sum + ((order.totalAmount || 0) * 0.9), 0);

    // Step B: Calculate Total Money Already Withdrawn
    const totalWithdrawn = vendor.transactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Step C: True Available Balance
    const availableBalance = totalEarned - totalWithdrawn;

    // Sort transactions so newest are at the top
    const sortedTx = vendor.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      balance: availableBalance,
      transactions: sortedTx
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ message: "Server error fetching wallet" });
  }
});

// --- 2. SECURE WITHDRAWAL REQUEST ---
router.post('/withdraw', async (req, res) => {
  try {
    const { email, amount, bankInfo } = req.body;
    const withdrawAmount = Number(amount);

    const vendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Calculate True Balance again to verify they have the funds!
    const completedOrders = await Order.find({ shopId: vendor._id.toString(), status: 'Completed' });
    const totalEarned = completedOrders.reduce((sum, order) => sum + ((order.totalAmount || 0) * 0.9), 0);
    const totalWithdrawn = vendor.transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const availableBalance = totalEarned - totalWithdrawn;

    // Block withdrawal if they are trying to take more than they have
    if (availableBalance < withdrawAmount) {
      return res.status(400).json({ message: "Insufficient funds!" });
    }

    // Generate a unified Transaction ID
    const txIdStr = `TXN-VWD${Math.floor(Math.random() * 100000000)}`;

    // Create the transaction receipt for the Vendor's personal history
    const newTx = {
      txId: txIdStr,
      title: 'Withdrawal to Bank',
      amount: withdrawAmount,
      status: 'Pending',
      bank: bankInfo || 'Primary Bank Account'
    };

    // Save the receipt to the vendor's history
    vendor.transactions.push(newTx);
    vendor.walletBalance -= withdrawAmount;
    await vendor.save();

    // 👇 NEW: Save to the Master Admin Withdrawal Ledger 👇
    await Withdrawal.create({
      txId: txIdStr,
      userType: 'Vendor',
      userId: vendor._id,
      email: vendor.email,
      amount: withdrawAmount,
      status: 'Pending',
      bankDetails: {
        name: bankInfo || 'Primary Bank Account',
        ac: 'N/A', // If your vendor frontend sends detailed account info later, map it here!
        ifsc: 'N/A'
      }
    });

    res.status(200).json({ 
      message: "Withdrawal requested successfully", 
      newBalance: availableBalance - withdrawAmount, // Send back the updated balance
      transaction: newTx 
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    res.status(500).json({ message: "Server error during withdrawal" });
  }
});

// ==========================================
// 📩 SUPPORT & COMPLAINT BOX
// ==========================================
router.post('/support-message', async (req, res) => {
  try {
    const { vendorEmail, subject, message } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER, // Your server email
      to: 'tanvijipoojary@gmail.com',  // Where the complaint goes!
      replyTo: vendorEmail,         // If you hit "Reply" in Gmail, it goes directly to the vendor
      subject: `Vendor Support: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #e3000f;">🚨 New Vendor Support Request</h2>
          <p><strong>From Vendor:</strong> ${vendorEmail}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: 1px solid #ccc;" />
          <h4 style="margin-bottom: 5px;">Message:</h4>
          <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Support ticket sent successfully!" });
  } catch (error) {
    console.error("Support Email Error:", error);
    res.status(500).json({ message: "Failed to send message to support." });
  }
});

module.exports = router;