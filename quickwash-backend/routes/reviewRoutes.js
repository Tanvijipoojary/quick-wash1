const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User'); 
const Vendor = require('../models/Vendor');// 👈 We must import User to look up the ID!

// ==========================================
// 1. CUSTOMER SUBMITS A REVIEW
// ==========================================
router.post('/add', async (req, res) => {
  try {
    let { orderId, customerId, vendorId, rating, comment } = req.body;

    // 🌟 THE FIX: If React accidentally sent an email instead of an ID, look it up!
    if (customerId && customerId.includes('@')) {
      const foundUser = await User.findOne({ email: customerId.toLowerCase() });
      if (!foundUser) {
        return res.status(400).json({ message: "Customer account not found." });
      }
      customerId = foundUser._id; // Swap the email out for the real 24-character MongoDB ID
    }

    // Optional: Check if a review already exists for this order to prevent spam
    const existingReview = await Review.findOne({ orderId, reviewTarget: 'Vendor' });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this order." });
    }

    const newReview = new Review({
      orderId,
      customerId,
      reviewTarget: 'Vendor', 
      vendorId,
      rating,
      comment
    });

    await newReview.save();

    // 👇 ADD THIS NEW BLOCK RIGHT HERE 👇
    // --- UPDATE VENDOR'S AVERAGE RATING ---
    const allShopReviews = await Review.find({ vendorId: vendorId, reviewTarget: 'Vendor', status: 'Published' });
    
    let totalStars = 0;
    allShopReviews.forEach(r => totalStars += r.rating);
    const newAverage = (totalStars / allShopReviews.length).toFixed(1); // e.g., 4.5

    // Save the new average directly to the Vendor document!
    await Vendor.findByIdAndUpdate(vendorId, {
      rating: newAverage,
      totalReviews: allShopReviews.length
    });
    // 👆 END OF NEW BLOCK 👆

    res.status(201).json({ message: "Review submitted successfully!", review: newReview });



    res.status(201).json({ message: "Review submitted successfully!", review: newReview });
  } catch (error) {
    console.error("Error submitting review:", error); 
    res.status(500).json({ message: "Failed to submit review." });
  }
});

// ==========================================
// 2. VENDOR FETCHES THEIR REVIEWS
// ==========================================
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const reviews = await Review.find({ 
      vendorId: req.params.vendorId, 
      reviewTarget: 'Vendor',
      status: 'Published' 
    })
    .populate('customerId', 'name') 
    .sort({ createdAt: -1 }); 

    let totalRating = 0;
    reviews.forEach(r => totalRating += r.rating);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.status(200).json({ 
      averageRating,
      totalReviews: reviews.length,
      reviews 
    });
  } catch (error) {
    console.error("Error fetching vendor reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews." });
  }
});

module.exports = router;