const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  owner_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_number: { type: String, required: true },
  hub_name: { type: String },
  washing_capacity_kg: { type: Number },
  hub_address: { type: String },
  status: { type: String, default: 'Pending' },
  is_open: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  // --- ADD THIS NEW SECTION ---
  documents: {
    gst: { type: String },
    shopAct: { type: String },
    pan: { type: String },
    aadhaar: { type: String },
    cheque: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);