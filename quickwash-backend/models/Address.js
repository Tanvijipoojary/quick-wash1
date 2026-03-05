// quickwash-backend/models/Address.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  customerEmail: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'Home', 'Work', 'Other'
  text: { type: String, required: true }, // The actual address
  icon: { type: String, default: '📍' }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);