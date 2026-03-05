const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true }, // We will encrypt 'admin123' here later
  role: { type: String, default: 'SuperAdmin' }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Admin', adminSchema);