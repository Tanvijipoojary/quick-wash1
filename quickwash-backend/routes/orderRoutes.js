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

    // REMOVED: deliveryDate and estimatedPickup logic to prevent "Invalid Date" confusion.
    // We now rely purely on the Vendor updating 'estimatedReady' during billing.

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
      // 🛑 THE BRICK WALL FIX: Only broadcast IF the vendor hit Accept ('Searching Rider') 
      // OR if the vendor finished washing ('Ready' for delivery back to customer)
      status: { $in: ['Searching Rider', 'Ready'] } 
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
    
    // 1. Fetch the order FIRST
    const existingOrder = await Order.findById(req.params.orderId);
    if (!existingOrder) return res.status(404).json({ message: "Order not found" });

    if (updateData.status === 'Ready') {
      updateData.riderEmail = null; // Clears the active rider so a new one can accept delivery
    }

    // 2. Update the order in the database
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId, 
      { $set: updateData }, 
      { returnDocument: 'after' }
    );
    
    const Vendor = require('../models/Vendor'); 
    const Transaction = require('../models/Transaction');
    const Rider = require('../models/Rider'); 
    const User = require('../models/User'); 

    // ==========================================
    // 🛵 RIDER PAY 1: COLLECTION RUN (₹20)
    // ==========================================
    const collectionDoneStatuses = ['Dropped at Hub', 'At Shop', 'Processing'];
    if (!collectionDoneStatuses.includes(existingOrder.status) && collectionDoneStatuses.includes(updatedOrder.status)) {
        // 👇 Uses the specific pickupRiderEmail
        if (updatedOrder.pickupRiderEmail) {
            await Rider.findOneAndUpdate(
                { email: updatedOrder.pickupRiderEmail.toLowerCase() },
                { $inc: { wallet_balance: 20, total_earnings: 20, total_tasks: 1, completed_tasks: 1 } }
            );
        }
    }

    // ==========================================
    // 💰 MASTER PAY: DELIVERY RUN (₹20) + VENDOR
    // ==========================================
    if (existingOrder.status !== 'Completed' && updatedOrder.status === 'Completed') {
        
        const laundrySubtotal = updatedOrder.totalAmount || 0;
        const vendorCut = Number((laundrySubtotal * 0.90).toFixed(2));
        const platformFee = Number((laundrySubtotal * 0.10).toFixed(2));
        const deliveryRiderCut = 20; 
        const totalRiderPay = 40; // Total collected from customer for both legs
        const customerPaid = laundrySubtotal + totalRiderPay;

        // A. Pay the Vendor
        await Vendor.findByIdAndUpdate(
            updatedOrder.shopId,
            { $inc: { walletBalance: vendorCut, lifetimeEarnings: vendorCut, totalOrdersCompleted: 1 } }
        );

        // B1. Get the Pickup Rider's Database ID for the receipt
        let actualPickupRiderId = null;
        if (updatedOrder.pickupRiderEmail) {
            const pRider = await Rider.findOne({ email: updatedOrder.pickupRiderEmail.toLowerCase() });
            if (pRider) actualPickupRiderId = pRider._id;
        }

        // B2. Pay the Delivery Rider (₹20) & get their Database ID
        let actualDeliveryRiderId = null;
        if (updatedOrder.deliveryRiderEmail) {
            const dRider = await Rider.findOneAndUpdate(
                { email: updatedOrder.deliveryRiderEmail.toLowerCase() },
                { $inc: { wallet_balance: deliveryRiderCut, total_earnings: deliveryRiderCut, total_tasks: 1, completed_tasks: 1 } },
                { returnDocument: 'after' } 
            );
            if (dRider) actualDeliveryRiderId = dRider._id;
        }

        // C. Grab Customer ID
        let actualCustomerId = null;
        if (updatedOrder.customerEmail) {
            const customer = await User.findOne({ email: updatedOrder.customerEmail.toLowerCase() });
            if (customer) actualCustomerId = customer._id;
        }

        // D. Generate the official Admin Transaction (Now 100% Split!)
        await Transaction.create({
            orderId: updatedOrder._id,
            customerId: actualCustomerId,
            totalAmountPaid: customerPaid,
            paymentMethod: updatedOrder.paymentMethod || 'Cash',
            paymentStatus: 'Success',
            platformFee: platformFee,
            vendorId: updatedOrder.shopId,
            vendorEarnings: vendorCut,
            pickupRiderId: actualPickupRiderId,     // 👈 Saved separately!
            pickupRiderEarnings: 20,                // 👈 ₹20 logged
            deliveryRiderId: actualDeliveryRiderId, // 👈 Saved separately!
            deliveryRiderEarnings: 20               // 👈 ₹20 logged
        });
    }
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating status:", error);
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

    // 2. If it's a vendor-approved order, advance it to 'Pending Pickup' so Trackers update!
    const newStatus = orderToClaim.status === 'Searching Rider' ? 'Pending Pickup' : orderToClaim.status;

    const claimedOrder = await Order.findByIdAndUpdate(
      req.params.orderId, 
      { $set: { riderEmail: req.body.riderEmail, status: newStatus } },
      { returnDocument: 'after' }
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
      { returnDocument: 'after' }
    );

    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error generating bill:", error);
    res.status(500).json({ message: "Server error generating bill" });
  }
});

/// ==========================================
// 🧹 DATABASE CLEANUP: Remove Dead Fields
// ==========================================
router.get('/cleanup-orders', async (req, res) => {
  try {
    const result = await Order.updateMany(
      {}, 
      { $unset: { subStatus: "", estimatedPickup: "" } }
    );
    res.status(200).json({ 
      message: "Database successfully scrubbed!", 
      ordersFixed: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to clean database." });
  }
});

// --- 9. GET SINGLE ORDER BY ID (MUST BE AT THE VERY BOTTOM!) ---
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    // 👇 THIS is the line that got accidentally deleted! It sends the data to React!
    res.status(200).json(order); 
    
  } catch (error) {
    console.error("Error fetching single order:", error);
    res.status(500).json({ message: "Server error fetching order" });
  }
});

// ==========================================
// 📊 VENDOR EARNINGS REPORT (COMPLETED ORDERS)
// ==========================================
router.get('/vendor-earnings/:shopId', async (req, res) => {
  try {
    const shopId = req.params.shopId;
    
    // Find only the completely finished orders for this specific vendor
    const completedOrders = await Order.find({ 
      shopId: shopId, 
      status: 'Completed' 
    }).sort({ updatedAt: -1 }); // Newest orders first
    
    res.status(200).json(completedOrders);
  } catch (error) {
    console.error("Error fetching vendor earnings:", error);
    res.status(500).json({ message: "Server error fetching earnings" });
  }
});

module.exports = router;