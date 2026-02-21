import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Customer Imports
import Login from './components/customer/login';
import CustomerHome from './components/customer/home';

// Rider Imports (Matches your file structure: r_home.jsx)
import RiderLogin from './components/rider/rider';
import RiderHome from './components/rider/r_home'; 

// Vendor Imports (Matches your file structure: v_home.jsx)
import VendorLogin from './components/vendor/vendor';
import VendorHome from './components/vendor/v_home'; 

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<CustomerHome />} />
          
          {/* Rider Routes */}
          <Route path="/rider" element={<RiderLogin />} />
          <Route path="/rider-home" element={<RiderHome />} />
          
          {/* Vendor Routes */}
          <Route path="/vendor" element={<VendorLogin />} />
          <Route path="/vendor-home" element={<VendorHome />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;