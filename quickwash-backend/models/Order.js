const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Connecting the 3 players
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' }, // Assigned later
  
  // The 4-Step Lifecycle we discussed
  orderStatus: { 
    type: String, 
    default: 'Pending',
    enum: ['Pending', 'Rider Picking Up', 'At Shop', 'Washing', 'Ready for Delivery', 'Rider Delivering', 'Completed', 'Cancelled'] 
  },

  // Financial Split
  totalAmount: { type: Number, required: true },
  shopCut: { type: Number, required: true },
  riderCut: { type: Number, required: true },
  platformProfit: { type: Number, required: true },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);