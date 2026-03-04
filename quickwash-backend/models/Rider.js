const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_number: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  vehicle_type: { 
    type: String, 
    enum: ['Two Wheeler (Bike/Scooter)', 'Three Wheeler (Auto)', 'Four Wheeler (Van)'],
    required: true 
  },
  vehicle_number: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Active', 'Rejected', 'Offline', 'Available'], 
    default: 'Pending' 
  },
  current_location_lat: { type: Number, default: null },
  current_location_lng: { type: Number, default: null }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Rider', riderSchema);