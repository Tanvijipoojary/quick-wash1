// quickwash-backend/routes/favoriteRoutes.js
const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');

// --- 1. GET ALL FAVORITES FOR A USER ---
router.get('/:email', async (req, res) => {
  try {
    const favorites = await Favorite.find({ customerEmail: req.params.email });
    res.status(200).json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Server error fetching favorites" });
  }
});

// --- 2. ADD OR REMOVE A FAVORITE (TOGGLE) ---
router.post('/toggle', async (req, res) => {
  try {
    const { customerEmail, shopId, shopName, shopRating } = req.body;

    // Check if it already exists
    const existingFav = await Favorite.findOne({ customerEmail, shopId });

    if (existingFav) {
      // If it exists, remove it (Un-favorite)
      await Favorite.findByIdAndDelete(existingFav._id);
      return res.status(200).json({ message: "Removed from favorites" });
    } else {
      // If it doesn't exist, add it
      const newFav = new Favorite({ customerEmail, shopId, shopName, shopRating });
      await newFav.save();
      return res.status(201).json({ message: "Added to favorites" });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ message: "Server error toggling favorite" });
  }
});

module.exports = router;