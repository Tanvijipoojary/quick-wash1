const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp_code: { type: String, required: true },
  user_type: { type: String, required: true },
  expires_at: { type: Date, required: true },
  is_used: { type: Boolean, default: false }
});

// This automatically deletes the OTP from the database after it expires!
otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpVerification', otpSchema);