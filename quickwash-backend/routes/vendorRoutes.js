const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');

// --- 1. GET ALL ACTIVE VENDORS (For Customer Home Page) ---
router.get('/all-vendors', async (req, res) => {
  try {
    // Only fetch vendors whose status is exactly 'Active'.
    // This safely hides 'Inactive', 'Pending', and 'Suspended' shops automatically!
    const activeVendors = await Vendor.find({ status: 'Active' }).sort({ createdAt: -1 });
    res.status(200).json(activeVendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
});

// --- 2. GET VENDOR PROFILE DATA ---
router.get('/profile/:email', async (req, res) => {
  try {
    const foundVendor = await Vendor.findOne({ email: req.params.email.toLowerCase() });
    if (!foundVendor) return res.status(404).json({ message: "Vendor not found" });
    
    res.status(200).json({
      ...foundVendor._doc, 
      is_open: foundVendor.isOpen // Explicitly mapped for the frontend toggle
    });
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- 3. SAVE VENDOR PROFILE EDITS (Including Pricing) ---
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
        pricing: pricing // Saves the new prices!
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

// --- 4. TOGGLE STORE OPEN/CLOSED STATUS (Updates Admin Dashboard Status) ---
router.put('/toggle-status', async (req, res) => {
  try {
    const { email, is_open } = req.body;

    // 1. Find the vendor first
    const vendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // 2. SECURITY CHECK: Do not let Suspended vendors reopen their shop!
    if (vendor.status === 'Suspended') {
      return res.status(403).json({ message: "Account is suspended. Cannot change status." });
    }

    // 3. Determine the new status based on the switch
    // If switch is ON -> 'Active'. If switch is OFF -> 'Inactive'
    const newAdminStatus = is_open ? 'Active' : 'Inactive';

    // 4. Update the database
    const updatedVendor = await Vendor.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        isOpen: is_open,
        status: newAdminStatus // Updates the status field for the Admin Panel!
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

// --- 5. GET SINGLE VENDOR BY ID (For Customer Shop Page) ---
router.get('/shop/:id', async (req, res) => {
  try {
    // Find the vendor by their MongoDB _id
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ message: "Shop not found" });
    }
    
    // Send the shop data back to the customer
    res.status(200).json(vendor);
  } catch (error) {
    console.error("Error fetching shop details:", error);
    res.status(500).json({ message: "Server error fetching shop details" });
  }
});

module.exports = router;