// quickwash-backend/routes/addressRoutes.js
const express = require('express');
const router = express.Router();
const Address = require('../models/Address');

// 1. GET ALL ADDRESSES FOR A USER
router.get('/:email', async (req, res) => {
  try {
    const addresses = await Address.find({ customerEmail: req.params.email });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching addresses" });
  }
});

// 2. ADD A NEW ADDRESS
router.post('/add', async (req, res) => {
  try {
    const newAddress = new Address(req.body);
    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(500).json({ message: "Server error saving address" });
  }
});

// 3. DELETE AN ADDRESS
router.delete('/delete/:id', async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting address" });
  }
});

module.exports = router;