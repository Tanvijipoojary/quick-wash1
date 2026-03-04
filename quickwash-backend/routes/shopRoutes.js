const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');

// GET ALL ACTIVE & OPEN SHOPS (No GPS filtering)
router.get('/active', async (req, res) => {
  try {
    // Just grab every approved and open shop
    const activeShops = await Vendor.find({ status: 'Active', is_open: true }).select('-documents');
    
    res.status(200).json(activeShops);
  } catch (error) {
    console.error("Error fetching active shops:", error);
    res.status(500).json({ message: "Failed to load shops." });
  }
});

// GET A SINGLE SHOP BY ID
router.get('/:id', async (req, res) => {
  try {
    // Find the specific vendor by their MongoDB ID and hide their private documents
    const shop = await Vendor.findById(req.params.id).select('-documents');
    
    if (!shop) {
      return res.status(404).json({ message: "Shop not found." });
    }
    
    res.status(200).json(shop);
  } catch (error) {
    console.error("Error fetching single shop:", error);
    res.status(500).json({ message: "Failed to load shop details." });
  }
});

module.exports = router;