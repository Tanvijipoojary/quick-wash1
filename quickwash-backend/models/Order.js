const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, default: 1 },
  price: { type: Number } 
});

const orderSchema = new mongoose.Schema({
  customerEmail: { type: String, required: true },
  shopId: { type: String, required: true },
  shopName: { type: String, required: true },
  pickupAddress: { type: String, required: true },
  
  pickupDate: { type: String }, 
  pickupSlot: { type: String },

  items: [orderItemSchema], 
  deliveryFee: { type: Number, default: 40 },
  
  // --- UPDATED 7-STEP TRACKING ---
  status: { 
    type: String, 
    enum: [
      'Pending',          // 1. Customer booked
      'Pending Pickup',   // 2. Vendor accepted, rider assigned
      'Picked Up',        // 3. Rider collected from customer
      'Dropped at Hub',   // 4. Rider dropped at vendor
      'At Shop',          // 4b. Vendor is weighing/washing
      'Ready',            // 5. Vendor finished, waiting for rider
      'Out for Delivery', // 6. Rider heading back to customer
      'Completed'         // 7. Delivered!
    ],
    default: 'Pending' 
  },
  
  subStatus: { type: String, default: 'pending_acceptance' },
  laundryStage: { type: String, default: 'Pending' },
  riderEmail: { type: String, default: null }, 
  
  // --- UPDATED SMART BILLING ---
  weightInKg: { type: Number, default: 0 }, // Changed to a Number for accurate math!
  totalAmount: { type: Number, default: 0 },
  estimatedReady: { type: String, default: '' },
  
  instructions: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);