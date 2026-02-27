const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  zone: { type: String, required: true },
  
  // Vehicle Details
  vehicle: {
    makeModel: { type: String },
    plateNumber: { type: String }
  },
  
  // KYC Documents
// KYC Documents
  documents: {
    dl: { type: String },
    rc: { type: String }, // <-- NEW: Added RC here
    insurance: { type: String },
    aadhaar: { type: String },
    pan: { type: String }
  },

  status: { type: String, default: 'Unverified' }, // Unverified, Pending, Active, Suspended
  
  // Financials & Stats
  walletBalance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },

  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rider', riderSchema);