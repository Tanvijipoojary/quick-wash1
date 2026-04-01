const mongoose = require('mongoose');

// Inside quickwash-backend/models/Rider.js
const riderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true }, // 👈 ADD THIS LINE

  vehicle_type: { type: String, default: 'Scooter' }, 
  vehicle_number: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending, Active, Suspended
  // Statistics for the Admin Panel
  total_tasks: { type: Number, default: 0 },
  completed_tasks: { type: Number, default: 0 },
  wallet_balance: { type: Number, default: 0 },
  total_earnings: { type: Number, default: 0 },
  is_online: { type: Boolean, default: false },
  documents: {
    dl: { type: String },
    rc: { type: String },
    insurance: { type: String }, // New field
    aadhaar: { type: String },
    pan: { type: String }
  },
  // --- NEW: WALLET & BANK DETAILS ---
  bankDetails: {
    name: { type: String, default: '' },
    ac: { type: String, default: '' },
    ifsc: { type: String, default: '' }
  },
  withdrawals: [{
    txId: String,
    amount: Number,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' } // Pending or Processed
  }]
}, { timestamps: true });

module.exports = mongoose.model('Rider', riderSchema);