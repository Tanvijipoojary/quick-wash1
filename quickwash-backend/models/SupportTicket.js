const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  // Unique Ticket ID (e.g., TKT-8821)
  ticketId: { type: String, required: true, unique: true },

  // Who needs help?
  userType: { type: String, enum: ['Customer', 'Vendor', 'Rider'], required: true },
  email: { type: String, required: true }, 

  // The Issue
  subject: { type: String, required: true },
  message: { type: String, required: true },

  // Admin Tracking
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  
  // Your reply (which will be emailed back to them automatically when you type it in the dashboard)
  adminResponse: { type: String, default: '' }

}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);