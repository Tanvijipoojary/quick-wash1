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
  documents: {
    gst: { type: String },
    shopAct: { type: String },
    pan: { type: String },
    aadhaar: { type: String },
    cheque: { type: String }
  }
}, { timestamps: true });

// This line prevents the OverwriteModelError
module.exports = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);