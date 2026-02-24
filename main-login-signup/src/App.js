import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ==========================================
// 🔵 CUSTOMER PORTAL IMPORTS
// ==========================================
import Login from './components/customer/login';
import CustomerHome from './components/customer/home';
import Profile from './components/customer/profile';
import Cart from './components/customer/cart';
import Checkout from './components/customer/checkout';
import OrderDetails from './components/customer/orderdetails';
import ShopPage from './components/customer/shoppage';
import Billing from './components/customer/billing';

// ==========================================
// 🟠 RIDER PORTAL IMPORTS
// ==========================================
import RiderLogin from './components/rider/rider';
import RiderHome from './components/rider/r_home';
import RiderWallet from './components/rider/r_wallet';
import RiderEarnings from './components/rider/r_earnings';
import RiderEarningsHistory from './components/rider/r_earnings_history';

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
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/shop/:id" element={<ShopPage />} />
          <Route path="/billing/:id" element={<Billing />} />
          
          
          {/* --- Rider Routes --- */}
          <Route path="/rider" element={<RiderLogin />} />
          <Route path="/rider-home" element={<RiderHome />} />
          <Route path="/rider-wallet" element={<RiderWallet />} />
          <Route path="/rider-earnings" element={<RiderEarnings />} />
          <Route path="/rider-earnings-history" element={<RiderEarningsHistory />} />
          
          
          {/* --- Vendor Routes --- */}
          <Route path="/vendor" element={<VendorLogin />} />
          <Route path="/vendor-home" element={<VendorHome />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;