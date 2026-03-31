const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, default: 1 },
  price: { type: Number } 
});

const orderSchema = new mongoose.Schema({
  // --- CUSTOMER & SHOP DETAILS ---
  customerEmail: { type: String, required: true },
  shopId: { type: String, required: true },
  shopName: { type: String, required: true },
  pickupAddress: { type: String, required: true },

  // --- GARMENT & ITEM DETAILS ---
  garmentDetails: { type: Object, default: {} },
  totalExpectedGarments: { type: Number, default: 0 },
  items: [orderItemSchema], 
  instructions: { type: String, default: '' },
  
  // --- BILLING INFO ---
  weightInKg: { type: Number, default: 0 }, 
  totalAmount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 40 },
  
  // --- TRACKING STATUSES ---
  status: { 
    type: String, 
    enum: [
      'Pending',          // 1. Customer booked
      'Searching Rider',  // 2. Vendor accepted, broadcasting to riders (Added this for your routes!)
      'Pending Pickup',   // 3. Rider assigned, heading to customer
      'Picked Up',        // 4. Rider collected from customer
      'Dropped at Hub',   // 5. Rider dropped at vendor
      'At Shop',          // 6. Vendor is weighing/washing
      'Ready',            // 7. Vendor finished, waiting for return rider
      'Out for Delivery', // 8. Rider heading back to customer
      'Completed',        // 9. Delivered!
      'Rejected'          // Vendor cancelled
    ],
    default: 'Pending' 
  },
  laundryStage: { type: String, default: 'Pending' },
  
  // --- RIDER ASSIGNMENTS ---
  
  pickupRiderEmail: { type: String, default: null },
  deliveryRiderEmail: { type: String, default: null }, 

  // --- TIMELINES & DATES (Deduplicated!) ---
  pickupDate: { type: String }, 
  pickupSlot: { type: String }, 
  estimatedReady: { type: String, default: '' },   // Formatted string sent by vendor (e.g., "Mar 31, 10:51 PM")
  estimatedDelivery: { type: Date },               

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);