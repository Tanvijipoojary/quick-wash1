const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, required: true },
  
  // KYC Documents (We will store the file URLs here after uploading)
  documents: {
    gst: { type: String },
    shopAct: { type: String },
    aadhaar: { type: String },
    pan: { type: String },
    cheque: { type: String }
  },
  
  status: { type: String, default: 'Unverified' }, // Unverified, Pending, Active, Suspended
  
  // Financials & Stats
  walletBalance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shop', shopSchema);