const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Link to the Customer
  customerEmail: { type: String, required: true },
  
  // Link to the Vendor (Shop)
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  shopName: { type: String, required: true },
  
  // The items requested
  items: [{
    name: String,
    price: Number,
    qty: Number
  }],
  
  // Financials
  deliveryFee: { type: Number, default: 40 },
  totalAmount: { type: Number, default: 0 }, // Will be updated by vendor after weighing
  
  // Tracking the Order Lifecycle
  status: { 
    type: String, 
    enum: ['Pending Pickup', 'Picked Up', 'At Shop', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled'],
    default: 'Pending Pickup' 
  },
  
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid'],
    default: 'Unpaid'
  }
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);