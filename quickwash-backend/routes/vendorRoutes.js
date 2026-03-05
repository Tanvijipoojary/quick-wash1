const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor'); // Fixed capitalization

// --- 1. GET ALL ACTIVE VENDORS (For Customer Home Page) ---
// This allows customers to see all laundry shops that have been approved by Admin
router.get('/all-vendors', async (req, res) => {
  try {
    // Only fetch vendors who are 'Active' (Approved)
    const activeVendors = await Vendor.find({ status: 'Active' }).sort({ createdAt: -1 });
    res.status(200).json(activeVendors);
  } catch (error) {
    console.error("Error fetching active vendors:", error);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
});

// --- 2. GET VENDOR PROFILE DATA ---
router.get('/profile/:email', async (req, res) => {
  try {
    const foundVendor = await Vendor.findOne({ email: req.params.email.toLowerCase() });
    if (!foundVendor) return res.status(404).json({ message: "Vendor not found" });
    
    res.status(200).json(foundVendor);
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- 3. GET AVAILABLE LAUNDRY PICKUPS ---
router.get('/available-tasks', async (req, res) => {
  try {
    // This will be used when we build the Order schema
    res.status(200).json([]); 
  } catch (error) {
    res.status(500).json({ message: "Failed to load tasks" });
  }
});

module.exports = router;