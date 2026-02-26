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
import AboutUs from './components/customer/AboutUs';
import Careers from './components/customer/Careers';
import Partner from './components/customer/Partner';
import Terms from './components/customer/Terms';


import AdminDashboard from './components/Admin/AdminDashboard';

// ==========================================
// 🟠 RIDER PORTAL IMPORTS
// ==========================================
import RiderLogin from './components/rider/rider';
import RiderHome from './components/rider/r_home';
import RiderWallet from './components/rider/r_wallet';
import RiderEarnings from './components/rider/r_earnings';
import RiderEarningsHistory from './components/rider/r_earnings_history';
import RiderProfile from './components/rider/r_profile';
import RiderLanguage from './components/rider/r_language';
import RiderVehicle from './components/rider/r_vehicle';
import RiderBank from './components/rider/r_bank';
import RiderSchedule from './components/rider/r_schedule';

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
          <Route path="/about" element={<AboutUs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* --- Rider Routes --- */}
          <Route path="/rider" element={<RiderLogin />} />
          <Route path="/rider-home" element={<RiderHome />} />
          <Route path="/rider-wallet" element={<RiderWallet />} />
          <Route path="/rider-earnings" element={<RiderEarnings />} />
          <Route path="/rider-earnings-history" element={<RiderEarningsHistory />} />
          <Route path="/rider-profile" element={<RiderProfile />} />
          <Route path="/rider-language" element={<RiderLanguage />} />
          <Route path="/rider-vehicle" element={<RiderVehicle />} />
          <Route path="/rider-bank" element={<RiderBank />} />
          <Route path="/rider-schedule" element={<RiderSchedule />} />
          
          
          {/* --- Vendor Routes --- */}
          <Route path="/vendor" element={<VendorLogin />} />
          <Route path="/vendor-home" element={<VendorHome />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;