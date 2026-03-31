const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  txId: { type: String, required: true, unique: true },
  
  // This tells us if a Rider or a Vendor is asking for money
  userType: { type: String, enum: ['Rider', 'Vendor'], required: true },
  
  // The actual Database ID of the person (dynamic reference)
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userType' },
  
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  
  status: { type: String, enum: ['Pending', 'Processed', 'Rejected'], default: 'Pending' },
  
  // A snapshot of where to send the money
  bankDetails: {
    name: String,
    ac: String,
    ifsc: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);