const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  hubName: { type: String, required: true },
  shopImage: { type: String, default: '' },

  // --- WALLET & TRANSACTIONS ---
  walletBalance: { type: Number, default: 0 },
  transactions: [{
    txId: { type: String },
    title: { type: String, default: 'Withdrawal' },
    amount: { type: Number },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' },
    bank: { type: String }
  }],
  
  // ✂️ capacity has been completely removed from here! ✂️
  
  address: { type: String, required: true },
  status: { type: String, default: 'Pending' },

  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  
  // Store Open/Closed Toggle
  isOpen: { type: Boolean, default: true }, 
  
  // --- STREAMLINED PRICING ENGINE ---
  pricing: { 
    washAndIron: { type: Number, default: 60 } // Only the core service remains!
  },

  documents: {
    gst: { type: String },
    shopAct: { type: String },
    pan: { type: String },
    aadhaar: { type: String },
    cheque: { type: String }
  }
}, { timestamps: true });

// Prevents the "OverwriteModelError" crash during hot reloads
module.exports = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);