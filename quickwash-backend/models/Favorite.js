// quickwash-backend/models/Favorite.js
const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  customerEmail: { type: String, required: true },
  shopId: { type: String, required: true },
  shopName: { type: String, required: true },
  shopRating: { type: Number, default: 4.5 }
}, { timestamps: true });

module.exports = mongoose.model('Favorite', favoriteSchema);