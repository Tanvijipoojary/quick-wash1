const express = require('express');
const router = express.Router();
const Rider = require('../models/Rider');

// --- 1. GET RIDER PROFILE DATA ---
// The frontend will call this after login to display the rider's name & stats
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

// --- 2. GET AVAILABLE LAUNDRY PICKUPS ---
// (We will expand this later when we connect the customer orders!)
router.get('/available-tasks', async (req, res) => {
  try {
    // For now, returning an empty array. 
    // Later, this will fetch orders from the database where status is "Awaiting Rider"
    res.status(200).json([]); 
  } catch (error) {
    res.status(500).json({ message: "Failed to load tasks" });
  }
});

module.exports = router;