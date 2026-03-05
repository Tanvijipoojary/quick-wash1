const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// --- 1. PLACE A NEW ORDER ---
router.post('/place-order', async (req, res) => {
  try {
    // 1. Destructure the data from the body
    const { customerEmail, shopId, shopName, items, deliveryFee } = req.body;

    // DEBUG: This ensures we see the email right before saving
    console.log("Saving order for email:", customerEmail);

    // 2. Convert the items object into an array for MongoDB
    const itemsArray = Object.values(items);

    // 3. CREATE THE NEW ORDER
    const newOrder = new Order({
      customerEmail: customerEmail, // 👈 ENSURE THIS IS MAPPED CORRECTLY
      shopId: shopId,
      shopName: shopName,
      items: itemsArray,
      deliveryFee: deliveryFee,
      totalAmount: 0,
      status: 'Pending Pickup',
      paymentStatus: 'Unpaid'
    });

    // 4. SAVE TO DATABASE
    const savedOrder = await newOrder.save();
    
    console.log("✅ Order saved to DB successfully!");
    res.status(201).json({ message: "Order placed successfully!", orderId: savedOrder._id });

  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Server error while placing order" });
  }
});

// --- 2. GET SINGLE ORDER BY ID ---
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error fetching order" });
  }
});

module.exports = router;