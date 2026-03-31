const path = require('path')
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const shopRoutes = require('./routes/shopRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const riderRoutes = require('./routes/riderRoutes');
const orderRoutes = require('./routes/orderRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const addressRoutes = require('./routes/addressRoutes');
const reviewRoutes = require('./routes/reviewRoutes');


const app = express();

// --- MIDDLEWARE ---
// CORS allows your React app (on port 3000) to talk to this server (on port 5000)
app.use(cors());
// This allows the server to understand JSON data sent in the request body
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---
// This links all your authentication logic (OTP, Signup, Login)
// Your URLs will look like: http://localhost:5000/api/auth/send-otp
app.use('/api/auth', authRoutes);

app.use('/api/riders', require('./routes/riderRoutes'));

app.use('/api/reviews', reviewRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/shops', shopRoutes);

app.use('/api/vendors', vendorRoutes);

app.use('/api/rider', riderRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/favorites', favoriteRoutes);
app.use('/api/addresses', addressRoutes);


// --- DATABASE CONNECTION ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quickwash_db';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('------------------------------------------');
    console.log('✅ Connected to MongoDB Atlas');
    console.log(`📂 Database: quickwash_db`);
    console.log('------------------------------------------');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
  });

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/auth`);
});