const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Link to the specific order
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  
  // Who paid?
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },

  // Payment Details
  totalAmountPaid: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Card', 'Wallet'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Success', 'Failed', 'Refunded'], default: 'Pending' },
  gatewayTransactionId: { type: String }, // For Razorpay/Stripe ID later

  // 💰 THE SPLIT (Crucial for your Admin Dashboard)
  platformFee: { type: Number, required: true, default: 0 }, // Admin's 10% cut
  
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  vendorEarnings: { type: Number, required: true, default: 0 },
  
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  riderEarnings: { type: Number, required: true, default: 0 }, // E.g., Flat Rs. 40

}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);