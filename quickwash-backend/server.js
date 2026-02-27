const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Loads the .env file

// Initialize the Express App
const app = express();

// --- MIDDLEWARE ---
// Allows your React frontend to talk to this backend without security blocks
app.use(cors()); 
// Allows the server to read incoming JSON data (like form submissions)
app.use(express.json()); 

// --- IMPORT ROUTES ---
const vendorRoutes = require('./routes/vendorRoutes');
const userRoutes = require('./routes/userRoutes');
const riderRoutes = require('./routes/riderRoutes'); // <-- Add this line

// --- API ENDPOINTS ---
app.use('/api/vendors', vendorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/riders', riderRoutes); // <-- Add this line

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB successfully connected!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// --- BASIC TEST ROUTE ---
app.get('/', (req, res) => {
  res.send('Quick Wash API is up and running! 🚀');
});

// --- START THE SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Quick Wash Server is running on http://localhost:${PORT}`);
});