const express = require('express');
const router = express.Router();
const Rider = require('../models/Rider'); // Adjust path if needed
const Vendor = require('../models/Vendor'); // Assuming you want to approve vendors too

// 1. GET ALL RIDERS (For the Admin Table)
router.get('/riders', async (req, res) => {
  try {
    const riders = await Rider.find({});
    res.status(200).json(riders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch riders" });
  }
});

// 2. UPDATE RIDER STATUS (Approve or Reject)
router.put('/rider-status/:id', async (req, res) => {
  try {
    const { status } = req.body; // Expects { status: 'Active' } or { status: 'Suspended' }
    
    const updatedRider = await Rider.findByIdAndUpdate(
      req.params.id, 
      { status: status },
      { new: true } // Returns the updated document
    );

    if (!updatedRider) return res.status(404).json({ message: "Rider not found" });

    res.status(200).json({ message: `Rider status updated to ${status}`, rider: updatedRider });
  } catch (error) {
    console.error("Admin Update Error:", error);
    res.status(500).json({ message: "Error updating rider status" });
  }
});

module.exports = router;