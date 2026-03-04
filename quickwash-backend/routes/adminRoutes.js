const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');

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

module.exports = router;