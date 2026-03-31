const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Which order is this review for?
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  
  // Who wrote it?
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Who is being reviewed? (Vendor or Rider)
  reviewTarget: { type: String, enum: ['Vendor', 'Rider'], required: true },
  
  // IDs (Only one of these will be filled depending on the reviewTarget)
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },

  // The actual review
  rating: { type: Number, required: true, min: 1, max: 5 }, // 1 to 5 stars
  comment: { type: String, default: '' },

  // Admin Control: If a customer leaves a fake/abusive review, you can hide it from the dashboard!
  status: { type: String, enum: ['Published', 'Hidden'], default: 'Published' }

}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);