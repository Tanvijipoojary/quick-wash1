const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  hubName: { type: String, required: true },
  capacity: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  
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