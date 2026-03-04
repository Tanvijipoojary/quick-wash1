const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');

// GET: Fetch the vendor's profile by email
router.get('/profile', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const vendor = await Vendor.findOne({ email: email.toLowerCase() });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT: Update the vendor's profile details
router.put('/profile', async (req, res) => {
  try {
    const { email, hub_name, owner_name, washing_capacity_kg, turnaround_time, services, hub_address } = req.body;

    const updatedVendor = await Vendor.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        hub_name, 
        owner_name, 
        washing_capacity_kg, 
        turnaround_time, 
        services, 
        hub_address 
      },
      { new: true } // Returns the updated document
    );

    if (!updatedVendor) return res.status(404).json({ message: "Vendor not found" });
    res.status(200).json(updatedVendor);
  } catch (error) {
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// PUT: Toggle the vendor's Open/Closed status
router.put('/toggle-status', async (req, res) => {
  try {
    const { email, is_open } = req.body;

    const updatedVendor = await Vendor.findOneAndUpdate(
      { email: email.toLowerCase() },
      { is_open: is_open },
      { new: true } 
    );

    if (!updatedVendor) return res.status(404).json({ message: "Vendor not found" });
    res.status(200).json({ message: "Status updated successfully", is_open: updatedVendor.is_open });
  } catch (error) {
    res.status(500).json({ message: "Server error updating status" });
  }
});

module.exports = router;