const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Needed to delete junk files!
const nodemailer = require('nodemailer');
const Rider = require('../models/Rider');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');

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

// --- 2. GET AVAILABLE LAUNDRY PICKUPS & DELIVERIES ---
router.get('/available-tasks', async (req, res) => {
  try {
    // 📡 BROADCAST FIX: Find orders that need a Pickup Rider OR a Delivery Rider
    const availableOrders = await Order.find({
      $or: [
        { status: 'Searching Rider', pickupRiderEmail: null }, // Needs collection
        { status: 'Ready', deliveryRiderEmail: null }          // Needs delivery
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json(availableOrders); 
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Failed to load tasks" });
  }
});

// --- 3. SMART RIDER ACCEPTANCE LOGIC ---
router.put('/accept-task/:orderId', async (req, res) => {
  try {
    const { riderEmail } = req.body;
    
    // 1. Fetch the order first to see what stage it is in
    const existingOrder = await Order.findById(req.params.orderId);
    if (!existingOrder) return res.status(404).json({ message: "Order not found" });

    let updateData = {};

    // 2. If it's a brand new order, assign them as the Pickup Rider!
    if (existingOrder.status === 'Searching Rider') {
        updateData.status = 'Pending Pickup';
        updateData.pickupRiderEmail = riderEmail;
    } 
    // 3. If the clothes are clean, assign them as the Delivery Rider!
    else if (existingOrder.status === 'Ready') {
        updateData.status = 'Out for Delivery';
        updateData.deliveryRiderEmail = riderEmail;
    } else {
        return res.status(400).json({ message: "Task is no longer available." });
    }

    // 4. Save the exact rider to the exact leg of the journey
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    res.status(200).json({ message: "Task accepted successfully!", order: updatedOrder });
  } catch (error) {
    console.error("Error accepting task:", error);
    res.status(500).json({ message: "Failed to accept task" });
  }
});


// --- UPDATE ORDER STATUS ---
router.put('/update-status/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updateData = req.body; 

    // Find the order and update it with the new data
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { returnDocument: 'after' } 
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 👇 ADD THIS AUTOMATION BLOCK 👇
    // If the Rider marks the order as Completed, instantly generate the Financial Receipt
    if (updateData.status === 'Completed') {
      const existingTx = await Transaction.findOne({ orderId: updatedOrder._id });
      
      if (!existingTx) {
        const User = require('../models/User'); // Pull in the User model to find the customer ID
        
        const total = updatedOrder.totalAmount || 0;
        const platformFee = total * 0.10;
        const riderCut = 40; 
        let vendorEarnings = total - platformFee - riderCut;
        
        // Find customer ID safely
        const customer = await User.findOne({ email: updatedOrder.customerEmail.toLowerCase() });

        await Transaction.create({
          orderId: updatedOrder._id,
          customerId: customer ? customer._id : null,
          totalAmountPaid: total,
          paymentMethod: 'Cash', 
          paymentStatus: 'Success',
          platformFee: platformFee,
          vendorId: updatedOrder.shopId,
          vendorEarnings: vendorEarnings > 0 ? vendorEarnings : 0,
          riderId: updatedOrder.riderId || null, // Assuming you save riderId on the order
          riderEarnings: riderCut
        });
        
        console.log(`✅ Transaction generated for Completed Order: ${updatedOrder._id}`);
      }
    }
    // 👆 END AUTOMATION BLOCK 👆

    res.status(200).json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    console.error("🚨 Error updating order status:", error);
    res.status(500).json({ message: "Server error while updating order" });
  }
});

// --- 4. GET RIDER EARNINGS & TRIP HISTORY ---
router.get('/earnings/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    
    // Find orders where the rider did EITHER the pickup OR the delivery
    const trips = await Order.find({ 
      $or: [
        { pickupRiderEmail: email },
        { deliveryRiderEmail: email }
      ]
    }).sort({ updatedAt: -1 }); 

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching rider earnings:", error);
    res.status(500).json({ message: "Failed to fetch earnings data" });
  }
});

// ==========================================
// 💳 RIDER WALLET & WITHDRAWALS
// ==========================================

// --- 1. GET WALLET DATA (DYNAMIC BALANCE) ---
router.get('/wallet/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const rider = await Rider.findOne({ email });
    if (!rider) return res.status(404).json({ message: "Rider not found" });

    // Find all trips
    const trips = await Order.find({ $or: [{ pickupRiderEmail: email }, { deliveryRiderEmail: email }] });
    
    let totalEarned = 0;
    let todaysEarnings = 0;
    let allTxns = [];
    const now = new Date();

    // A. Generate "Credit" Transactions from Trips
    trips.forEach(o => {
      // Collection Run
      if (o.pickupRiderEmail === email) {
        totalEarned += 20;
        if (new Date(o.createdAt).toDateString() === now.toDateString()) todaysEarnings += 20;
        allTxns.push({ id: o._id.toString().slice(-6).toUpperCase(), type: 'credit', title: 'Collection Run', date: o.createdAt, amount: 20, status: 'Completed' });
      }
      // Delivery Run
      if (o.deliveryRiderEmail === email) {
        totalEarned += 20;
        if (new Date(o.updatedAt).toDateString() === now.toDateString()) todaysEarnings += 20;
        allTxns.push({ id: o._id.toString().slice(-6).toUpperCase(), type: 'credit', title: 'Delivery Run', date: o.updatedAt, amount: 20, status: 'Completed' });
      }
    });

    // B. Generate "Debit" Transactions & Calculate Withdrawals
    let totalWithdrawn = 0;
    let pendingPayout = 0;

    rider.withdrawals.forEach(w => {
      totalWithdrawn += w.amount;
      if (w.status === 'Pending') pendingPayout += w.amount;
      
      allTxns.push({ id: w.txId, type: 'debit', title: 'Bank Withdrawal', date: w.date, amount: w.amount, status: w.status === 'Pending' ? `Processing to ${rider.bankDetails.name || 'Bank'}` : 'Processed' });
    });

    // C. Calculate Final True Balance
    const availableBalance = totalEarned - totalWithdrawn;

    // D. Sort Transactions by newest first
    allTxns.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      balance: availableBalance,
      pendingPayout,
      todaysEarnings,
      bankDetails: rider.bankDetails,
      transactions: allTxns
    });

  } catch (error) {
    console.error("Wallet Error:", error);
    res.status(500).json({ message: "Failed to load wallet" });
  }
});

// --- 2. REQUEST WITHDRAWAL ---
router.post('/wallet/withdraw', async (req, res) => {
  try {
    const { email, amount } = req.body;
    const rider = await Rider.findOne({ email: email.toLowerCase() });
    
    if (!rider) return res.status(404).json({ message: "Rider not found" });
    if (!rider.bankDetails || !rider.bankDetails.ac) return res.status(400).json({ message: "Please add a bank account first." });

    const txIdStr = `TXN-BWD${Math.floor(Math.random() * 1000000)}`;

    const newWithdrawal = {
      txId: txIdStr,
      amount: amount,
      status: 'Pending',
      date: new Date()
    };

    // 1. Save to Rider's personal history
    rider.withdrawals.push(newWithdrawal);

    rider.wallet_balance -= amount;
    rider.total_withdrawn = (rider.total_withdrawn || 0) + amount;
    await rider.save();

    // 2. 👇 NEW: Save to the Master Admin Withdrawal Ledger 👇
    await Withdrawal.create({
      txId: txIdStr,
      userType: 'Rider',
      userId: rider._id,
      email: rider.email,
      amount: amount,
      status: 'Pending',
      bankDetails: rider.bankDetails
    });

    res.status(200).json({ message: "Withdrawal requested successfully", withdrawal: newWithdrawal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error processing withdrawal" });
  }
});

// --- 3. UPDATE BANK DETAILS ---
router.put('/wallet/bank', async (req, res) => {
  try {
    const { email, bankDetails } = req.body;
    console.log(`🏦 Updating Bank for ${email}:`, bankDetails); // 👈 Helpful log
    
    const rider = await Rider.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { bankDetails: bankDetails } }, // 👈 Forces the update safely
      { returnDocument: 'after' }
    );
    
    if (!rider) return res.status(404).json({ message: "Rider not found in DB." });
    
    res.status(200).json({ message: "Bank details updated!", bankDetails: rider.bankDetails });
  } catch (error) {
    console.error("🚨 Bank Update Error:", error);
    res.status(500).json({ message: "Server error saving bank details." });
  }
});

router.post('/support-message', async (req, res) => {
  const { riderEmail, subject, message } = req.body;

  try {
    const mailOptions = {
      from: `Quick Wash Support <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, 
      replyTo: riderEmail, 
      subject: `Rider Support: ${subject}`,
      text: `Rider Email: ${riderEmail}\n\nMessage:\n${message}`
    };

    // 👇 UNCOMMENT THIS LINE TO SEND FOR REAL
    await transporter.sendMail(mailOptions);
    
    console.log("🚀 Email sent successfully to tanvijipoojary@gmail.com");
    res.status(200).json({ message: "Support email sent successfully" });
  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    res.status(500).json({ message: "Failed to send email. Check App Password." });
  }
});

module.exports = router;