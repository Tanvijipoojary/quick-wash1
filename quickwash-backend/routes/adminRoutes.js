const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const Rider = require('../models/Rider');

// 1. GET ALL VENDORS (For the Admin Table)
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
});

// 2. UPDATE VENDOR STATUS (Approve or Reject)
router.put('/vendor-status/:id', async (req, res) => {
  try {
    const { status } = req.body; // 'Active' or 'Suspended'
    const vendorId = req.params.id;

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId, 
      { status: status },
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({ message: `Vendor marked as ${status}`, vendor: updatedVendor });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

router.get('/riders', async (req, res) => {
  try {
    const riders = await Rider.find({});
    res.status(200).json(riders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch riders" });
  }
});

// --- 2. UPDATE RIDER STATUS (Approve or Reject) ---
router.put('/rider-status/:id', async (req, res) => {
  try {
    // Expects { status: 'Active' } or { status: 'Suspended' } from the Admin Panel
    const { status } = req.body; 
    
    // Find the rider by ID and update their status
    const updatedRider = await Rider.findByIdAndUpdate(
      req.params.id, 
      { status: status },
      { new: true } 
    );

    if (!updatedRider) return res.status(404).json({ message: "Rider not found" });

    res.status(200).json({ message: `Rider is now ${status}`, rider: updatedRider });
  } catch (error) {
    console.error("Admin Update Error:", error);
    res.status(500).json({ message: "Error updating rider status" });
  }
});

module.exports = router;