import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ==========================================
// 🔵 CUSTOMER PORTAL IMPORTS
// ==========================================
import Login from './components/customer/login';
import CustomerHome from './components/customer/home';
import Profile from './components/customer/profile';
import Cart from './components/customer/cart';

// ==========================================
// 🟠 RIDER PORTAL IMPORTS
// ==========================================
import RiderLogin from './components/rider/rider';
import RiderHome from './components/rider/r_home';

// ==========================================
// 🟢 VENDOR PORTAL IMPORTS
// ==========================================
import VendorLogin from './components/vendor/vendor';
import VendorHome from './components/vendor/v_home';

// Global App CSS (if you have one)
import './App.css'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* --- Customer Routes --- */}
          {/* The default page is the Customer Login */}
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<CustomerHome />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          
          {/* --- Rider Routes --- */}
          <Route path="/rider" element={<RiderLogin />} />
          <Route path="/rider-home" element={<RiderHome />} />
          
          {/* --- Vendor Routes --- */}
          <Route path="/vendor" element={<VendorLogin />} />
          <Route path="/vendor-home" element={<VendorHome />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;