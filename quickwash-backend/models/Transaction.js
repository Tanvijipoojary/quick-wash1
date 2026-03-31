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
  
  pickupRiderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  pickupRiderEarnings: { type: Number, default: 20 },
  deliveryRiderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  deliveryRiderEarnings: { type: Number, default: 20 },

}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);