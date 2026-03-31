const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  // Unique generated ID (e.g., TXN-BWD1234)
  withdrawId: { type: String, required: true, unique: true },

  // Who is withdrawing? (It will be EITHER a Vendor OR a Rider)
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
  
  // To make querying easier for the admin dashboard
  userType: { type: String, enum: ['Vendor', 'Rider'], required: true },

  // The Money
  amount: { type: Number, required: true },

  // Where is it going? (Snapshot of their bank details at the time of request)
  bankDetails: {
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true }
  },

  // The Status Lifecycle
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Processed', 'Rejected'], 
    default: 'Pending' 
  },

  // When the Admin actually pays them, they paste the Bank Reference Number here
  bankReferenceNo: { type: String, default: '' },
  
  // If the admin rejects it, why? (e.g., "Invalid IFSC Code")
  adminNotes: { type: String, default: '' }

}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);