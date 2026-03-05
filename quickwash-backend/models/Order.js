// quickwash-backend/models/Order.js
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
  
  // Added Date and Slot so the vendor knows when to go!
  pickupDate: { type: String }, 
  pickupSlot: { type: String },

  items: [orderItemSchema], 
  deliveryFee: { type: Number, default: 40 },
  
  // --- TRACKING & STATUS ---
  status: { type: String, default: 'Pending Pickup' },
  subStatus: { type: String, default: 'pending_acceptance' },
  laundryStage: { type: String, default: 'Pending' },
  riderEmail: { type: String, default: null }, 
  
  // --- BILLING INFO ---
  weight: { type: String, default: '0' },
  totalAmount: { type: Number, default: 0 },
  estimatedReady: { type: String, default: '' },
  
  instructions: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);