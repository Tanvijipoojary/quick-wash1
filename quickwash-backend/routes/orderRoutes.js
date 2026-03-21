const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// --- 1. CREATE A NEW ORDER (CHECKOUT) ---
router.post('/place-order', async (req, res) => {
  try {
    const orderData = req.body;

    // FIX: Convert cart dictionary/object into an Array so MongoDB accepts it!
    if (orderData.items && !Array.isArray(orderData.items)) {
      orderData.items = Object.values(orderData.items);
    }

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    res.status(201).json({ 
      message: "Order placed successfully", 
      orderId: savedOrder._id 
    });

  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Failed to place order in database" });
  }
});

// --- 2. GET ALL ORDERS FOR A SPECIFIC USER ---
router.get('/user/:email', async (req, res) => {
  try {
    const orders = await Order.find({ customerEmail: req.params.email }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

// --- 3. GET ALL ORDERS FOR A SPECIFIC VENDOR (SHOP) ---
router.get('/vendor/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    const orders = await Order.find({ shopId: shopId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({ message: "Server error fetching vendor orders" });
  }
});

// --- 4. BROADCAST: GET ALL AVAILABLE ORDERS FOR RIDERS ---
router.get('/available-for-rider', async (req, res) => {
  try {
    const availableOrders = await Order.find({
      riderEmail: { $in: [null, ""] }, 
      // 🔥 THE FIX: Broadcast 'Pending' (Instant Dispatch) and 'Ready' (Delivery)
      status: { $in: ['Pending', 'Ready'] } 
    }).sort({ createdAt: -1 });
    
    res.status(200).json(availableOrders);
  } catch (error) {
    console.error("Error fetching live orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- 5. VENDOR/RIDER UPDATES ORDER STATUS ---
router.put('/update-status/:orderId', async (req, res) => {
  try {
    let updateData = { ...req.body };
    
    if (updateData.status === 'Ready') {
      updateData.riderEmail = null; 
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId, 
      { $set: updateData }, 
      { new: true }
    );
    
    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error updating status" });
  }
});

// --- 6. CLAIM: RIDER ACCEPTS THE ORDER ---
router.put('/claim/:orderId', async (req, res) => {
  try {
    // 1. Find the order to see what type it is
    const orderToClaim = await Order.findById(req.params.orderId);
    if (!orderToClaim || (orderToClaim.riderEmail && orderToClaim.riderEmail.trim() !== "")) {
      return res.status(400).json({ message: "Too slow! Another rider just claimed this order." });
    }

    // 2. If it's a brand new order, advance it to 'Pending Pickup' so the Vendor & Customer trackers update!
    const newStatus = orderToClaim.status === 'Pending' ? 'Pending Pickup' : orderToClaim.status;

    const claimedOrder = await Order.findByIdAndUpdate(
      req.params.orderId, 
      { $set: { riderEmail: req.body.riderEmail, status: newStatus } },
      { new: true }
    );
    
    res.status(200).json(claimedOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error claiming order" });
  }
});

// --- 7. GET ALL ORDERS CLAIMED BY A SPECIFIC RIDER ---
router.get('/rider/:email', async (req, res) => {
  try {
    const orders = await Order.find({ riderEmail: req.params.email }).sort({ updatedAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching rider orders:", error);
    res.status(500).json({ message: "Server error fetching rider orders" });
  }
});

// --- 8. SMART BILLING & WASH INITIATION ---
router.put('/generate-bill/:orderId', async (req, res) => {
  try {
    // We now accept the tracking details along with the math!
    const { weightInKg, pricePerKg, estimatedReady, laundryStage } = req.body;
    
    // Server does the secure math
    const calculatedTotal = Number(weightInKg) * Number(pricePerKg);

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { 
        weightInKg: weightInKg,
        totalAmount: calculatedTotal,
        estimatedReady: estimatedReady,
        laundryStage: laundryStage || 'Washing',
        status: 'At Shop' 
      },
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error generating bill:", error);
    res.status(500).json({ message: "Server error generating bill" });
  }
});

// --- 9. GET SINGLE ORDER BY ID (MUST BE AT THE VERY BOTTOM!) ---
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching order" });
  }
});

module.exports = router; 