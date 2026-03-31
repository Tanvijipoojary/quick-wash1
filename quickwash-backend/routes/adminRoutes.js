const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const Rider = require('../models/Rider');
const User = require('../models/User');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction'); // 👈 ADDED USER MODEL

// ==========================================
// 🏪 GET ALL VENDORS (WITH LIVE STATS)
// ==========================================
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find().lean().sort({ createdAt: -1 });
    const orders = await Order.find().lean(); 

    const vendorData = vendors.map(v => {
      const shopOrders = orders.filter(o => o.shopId === v._id.toString());
      const totalOrders = shopOrders.length;

      // 👇 MATH FIX: The DB totalAmount IS the subtotal! Just take 90% of it.
      const completedOrders = shopOrders.filter(o => o.paymentStatus === 'Paid' || o.status === 'Completed');
      const totalEarned = completedOrders.reduce((sum, o) => {
          const laundrySubtotal = o.totalAmount || 0; 
          return sum + (laundrySubtotal * 0.9);
      }, 0);
      
      let totalWithdrawn = 0;
      const withdrawalRecords = v.withdrawals || v.transactions || [];
      if (withdrawalRecords.length > 0) {
          totalWithdrawn = withdrawalRecords.reduce((sum, w) => sum + Number(w.amount || 0), 0);
      }
      
      const walletBal = totalEarned - totalWithdrawn;

      return {
        ...v,
        total_orders: totalOrders,
        total_earnings: totalEarned,
        total_withdrawn: totalWithdrawn, 
        wallet_balance: walletBal
      };
    });

    res.status(200).json(vendorData);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==========================================
// 🛵 GET ALL RIDERS (WITH LIVE STATS)
// ==========================================
router.get('/riders', async (req, res) => {
  try {
    const riders = await Rider.find().sort({ createdAt: -1 });
    const orders = await Order.find();
    
    const riderData = riders.map(r => {
      let totalTasks = 0;
      let totalEarned = 0;

      orders.forEach(o => {
        const isPickup = o.pickupRiderEmail && o.pickupRiderEmail.toLowerCase() === r.email.toLowerCase();
        const isDelivery = o.deliveryRiderEmail && o.deliveryRiderEmail.toLowerCase() === r.email.toLowerCase();

        // 1. Check if they did the Pickup Run
        if (isPickup) {
          totalTasks++;
          totalEarned += 40; // Flat ₹40 for pickup
        }
        
        // 2. Check if they did the Delivery Run
        if (isDelivery) {
          totalTasks++;
          totalEarned += 40; // Flat ₹40 for delivery
        }
      });

      // Calculate Withdrawals
      let totalWithdrawn = 0;
      if (r.withdrawals && r.withdrawals.length > 0) {
          totalWithdrawn = r.withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
      }

      const walletBal = totalEarned - totalWithdrawn;

      return {
        ...r._doc,
        total_tasks: totalTasks,
        total_earnings: totalEarned,
        total_withdrawn: totalWithdrawn,
        wallet_balance: walletBal
      };
    });

    res.status(200).json(riderData);
  } catch (error) {
    console.error("Error fetching riders:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// ==========================================
// 👥 GET ALL USERS (WITH LIVE STATS)
// ==========================================
router.get('/users', async (req, res) => {
  try {
    const User = require('../models/User'); // Make sure User is imported!
    const users = await User.find().sort({ createdAt: -1 });
    const orders = await Order.find();

    const userData = users.map(u => {
      // 1. Find all orders for this specific customer by email
      const userOrders = orders.filter(o => 
        o.customerEmail && o.customerEmail.toLowerCase() === u.email.toLowerCase()
      );

      // 2. Count the order statuses
      const totalOrders = userOrders.length;
      const completedOrders = userOrders.filter(o => ['Completed', 'Dropped at Hub'].includes(o.status)).length;
      const cancelledOrders = userOrders.filter(o => o.status === 'Cancelled').length;
      const pendingOrders = totalOrders - completedOrders - cancelledOrders;

      // 3. Calculate Total Lifetime Spend
      const totalSpent = userOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // 4. Send back the User data WITH the new math attached!
      return {
        ...u._doc,
        totalOrders,
        completedOrders,
        cancelledOrders,
        pendingOrders,
        totalSpent
      };
    });

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

router.put('/rider-status/:id', async (req, res) => {
  try {
    const { status } = req.body; 
    const updatedRider = await Rider.findByIdAndUpdate(req.params.id, { status: status }, { new: true });

    if (!updatedRider) return res.status(404).json({ message: "Rider not found" });
    res.status(200).json({ message: `Rider is now ${status}`, rider: updatedRider });
  } catch (error) {
    console.error("Admin Update Error:", error);
    res.status(500).json({ message: "Error updating rider status" });
  }
});

// ==========================================
// 3. USER (CUSTOMER) ROUTES (👈 NEW)
// ==========================================
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.put('/user-status/:id', async (req, res) => {
  try {
    const { status } = req.body; // 'Active' or 'Banned'
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { status: status }, { new: true });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: `User is now ${status}`, user: updatedUser });
  } catch (error) {
    console.error("Admin Update Error:", error);
    res.status(500).json({ message: "Error updating user status" });
  }
});

// ==========================================
// 4. ADMIN DASHBOARD OVERVIEW (DAILY STATS & LEDGER)
// ==========================================
router.get('/dashboard', async (req, res) => {
  try {
    // 1. Define "Today" (Midnight to Midnight)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // 2. Fetch Data
    const allVendors = await Vendor.find({});
    const allRiders = await Rider.find({});
    
    // Fetch orders created today OR updated today (completed today)
    const todaysOrders = await Order.find({
      $or: [
        { createdAt: { $gte: startOfToday, $lte: endOfToday } },
        { updatedAt: { $gte: startOfToday, $lte: endOfToday } }
      ]
    }).sort({ createdAt: -1 });

    // 3. Calculate Daily Stats
    let todaysRevenue = 0;
    let pendingOrdersCount = 0;

    todaysOrders.forEach(order => {
      // Calculate Revenue (Assuming 10% platform fee, adjust if your math is different)
      if (order.status === 'Completed' || order.paymentStatus === 'Paid') {
        const orderTotal = order.totalAmount || 0;
        const platformProfit = orderTotal * 0.10; // 10% commission
        todaysRevenue += platformProfit; 
      }
      
      // Count Pending
      if (['Searching Rider', 'Pending Pickup', 'At Shop', 'Ready', 'Out for Delivery'].includes(order.status)) {
        pendingOrdersCount++;
      }
    });

    const activeShops = allVendors.filter(v => v.status === 'Active').length;
    const activeRiders = allRiders.filter(r => r.status === 'Active').length;

    // 4. Format the Ledger (Transactions Table)
    const ledger = todaysOrders.map(order => {
      const total = order.totalAmount || 0;
      const profit = total * 0.10; // 10% Admin Fee
      const riderCut = 40; // Flat rider delivery fee
      const shopCut = total - profit - riderCut; // Vendor gets the rest

      return {
        id: `TXN-${order._id.toString().slice(-4).toUpperCase()}`,
        orderId: `#ORD-${order._id.toString().slice(-4).toUpperCase()}`,
        customerName: order.customerEmail ? order.customerEmail.split('@')[0] : 'Guest',
        shopName: order.shopId || "Quick Wash Hub", // Update if you store shop names directly on the order
        total: total.toFixed(2),
        shopCut: shopCut > 0 ? shopCut.toFixed(2) : 0,
        riderCut: riderCut,
        profit: profit.toFixed(2),
        status: order.status
      };
    });

    // 5. Send back the compiled data
    res.status(200).json({
      stats: {
        revenue: todaysRevenue.toFixed(2),
        totalOrders: todaysOrders.length,
        pendingOrders: pendingOrdersCount,
        shopsOnline: activeShops,
        shopsTotal: allVendors.length,
        ridersOnline: activeRiders,
        ridersTotal: allRiders.length
      },
      ledger: ledger
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
});


// ==========================================
// 🛠️ ONE-TIME DATA SYNC: Convert Old Orders to Transactions
// ==========================================
router.get('/sync-financials', async (req, res) => {
  try {
    // 1. Find all orders that are already "Completed"
    const completedOrders = await Order.find({ status: 'Completed' });
    let newlyCreatedCount = 0;

    // 2. Loop through them and create a transaction if one doesn't exist
    for (let order of completedOrders) {
      const existingTx = await Transaction.findOne({ orderId: order._id });
      
      if (!existingTx) {
        // Look up the customer ID using their email
        const customer = await User.findOne({ email: order.customerEmail?.toLowerCase() });
        const customerId = customer ? customer._id : null;

        // Do the math!
        const total = order.totalAmount || 0;
        const platformFee = total * 0.10; // Admin gets 10%
        const riderCut = 40;              // Rider gets ₹40 flat fee
        let vendorEarnings = total - platformFee - riderCut;
        if (vendorEarnings < 0) vendorEarnings = 0; // Prevent negative earnings on tiny orders

        // Generate the official permanent receipt
        await Transaction.create({
          orderId: order._id,
          customerId: customerId, 
          totalAmountPaid: total,
          paymentMethod: order.paymentMethod || 'Cash', // Default to Cash if missing
          paymentStatus: 'Success',
          platformFee: platformFee,
          vendorId: order.shopId,
          vendorEarnings: vendorEarnings,
          riderId: order.riderId || null, 
          riderEarnings: riderCut
        });

        newlyCreatedCount++;
      }
    }

    res.status(200).json({ 
      message: "Sync Complete!", 
      transactionsCreated: newlyCreatedCount 
    });

  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({ message: "Failed to sync transactions", error: error.message });
  }
});

// ==========================================
// 🛠️ ONE-TIME DATA SYNC: Convert Old Orders to Transactions
// ==========================================
router.get('/sync-financials', async (req, res) => {
  try {
    // 1. Find all orders that are already "Completed"
    const completedOrders = await Order.find({ status: 'Completed' });
    let newlyCreatedCount = 0;

    // 2. Loop through them and create a transaction if one doesn't exist
    for (let order of completedOrders) {
      const existingTx = await Transaction.findOne({ orderId: order._id });
      
      if (!existingTx) {
        // Look up the customer ID using their email safely
        let customerId = null;
        if (order.customerEmail) {
            const customer = await User.findOne({ email: order.customerEmail.toLowerCase() });
            if (customer) customerId = customer._id;
        }

        // Do the math!
        const total = order.totalAmount || 0;
        const platformFee = total * 0.10; // Admin gets 10%
        const riderCut = 40;              // Rider gets ₹40 flat fee
        let vendorEarnings = total - platformFee - riderCut;
        if (vendorEarnings < 0) vendorEarnings = 0; // Prevent negative earnings on tiny orders

        // Generate the official permanent receipt
        await Transaction.create({
          orderId: order._id,
          customerId: customerId, 
          totalAmountPaid: total,
          paymentMethod: order.paymentMethod || 'Cash', // Default to Cash if missing
          paymentStatus: 'Success',
          platformFee: platformFee,
          vendorId: order.shopId,
          vendorEarnings: vendorEarnings,
          riderId: order.riderId || null, 
          riderEarnings: riderCut
        });

        newlyCreatedCount++;
      }
    }

    res.status(200).json({ 
      message: "Sync Complete!", 
      transactionsCreated: newlyCreatedCount 
    });

  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({ message: "Failed to sync transactions", error: error.message });
  }
});

// ==========================================
// 💰 GET ALL FINANCIAL TRANSACTIONS
// ==========================================
router.get('/transactions', async (req, res) => {
  try {
    // Fetch all transactions and populate the linked customer and vendor details
    const transactions = await Transaction.find()
      .populate('customerId', 'name email')
      .populate('vendorId', 'hubName name')
      .sort({ createdAt: -1 }); // Newest first

    // Format the data cleanly for the React frontend
    const formattedTxns = transactions.map(t => ({
      _id: t._id,
      orderId: t.orderId,
      customerName: t.customerId ? (t.customerId.name || t.customerId.email.split('@')[0]) : 'Guest',
      shopName: t.vendorId ? (t.vendorId.hubName || t.vendorId.name) : 'Unknown Shop',
      totalAmountPaid: t.totalAmountPaid,
      vendorEarnings: t.vendorEarnings,
      riderEarnings: t.riderEarnings,
      platformFee: t.platformFee,
      paymentStatus: t.paymentStatus,
      createdAt: t.createdAt
    }));

    res.status(200).json(formattedTxns);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// ==========================================
// 🛠️ FORCE SYNC: Rebuild Transactions Table
// ==========================================
router.get('/force-sync-financials', async (req, res) => {
  try {
    await Transaction.deleteMany({});
    const completedOrders = await Order.find({ $or: [ { status: 'Completed' }, { paymentStatus: 'Paid' } ] });
    let newlyCreatedCount = 0;

    for (let order of completedOrders) {
        const User = require('../models/User');
        let customerId = null;
        if (order.customerEmail) {
            const customer = await User.findOne({ email: order.customerEmail.toLowerCase() });
            if (customer) customerId = customer._id;
        }

        const laundrySubtotal = order.totalAmount || 0; 
        const riderCut = 40; 
        const customerPaid = laundrySubtotal + riderCut; 
        
        const platformFee = Number((laundrySubtotal * 0.10).toFixed(2)); 
        const vendorEarnings = Number((laundrySubtotal * 0.90).toFixed(2)); 

        // 👇 THE FIX: Grab the exact historical date the order was completed!
        const realDate = order.updatedAt || order.createdAt || new Date();

        await Transaction.create({
          orderId: order._id, 
          customerId: customerId, 
          totalAmountPaid: customerPaid, 
          paymentMethod: order.paymentMethod || 'Cash', 
          paymentStatus: 'Success',
          platformFee: platformFee, 
          vendorId: order.shopId, 
          vendorEarnings: vendorEarnings,
          riderId: order.riderId || null, 
          riderEarnings: riderCut,
          createdAt: realDate, // 👈 Forces the DB to respect the real timeline
          updatedAt: realDate
        });
        
        newlyCreatedCount++;
    }
    res.status(200).json({ message: "Synced Perfectly with Real Dates!", count: newlyCreatedCount });
  } catch (error) { res.status(500).json({ message: "Sync Failed" }); }
});

// ==========================================
// 🏪 UPDATE VENDOR STATUS (Approve/Reject)
// ==========================================
router.put('/vendor-status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Find the vendor by ID and update their status
    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    res.status(200).json({ message: `Vendor successfully marked as ${status}!`, vendor: updatedVendor });
  } catch (error) {
    console.error("Error updating vendor status:", error);
    res.status(500).json({ message: "Server error while updating vendor status." });
  }
});

// ==========================================
// 🛵 UPDATE RIDER STATUS (Approve/Reject)
// ==========================================
router.put('/rider-status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Find the rider by ID and update their status
    const updatedRider = await Rider.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true }
    );

    if (!updatedRider) {
      return res.status(404).json({ message: "Rider not found." });
    }

    res.status(200).json({ message: `Rider successfully marked as ${status}!`, rider: updatedRider });
  } catch (error) {
    console.error("Error updating rider status:", error);
    res.status(500).json({ message: "Server error while updating rider status." });
  }
});

module.exports = router;