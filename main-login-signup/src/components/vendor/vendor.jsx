import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './vendor.css';

const VendorLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Bypassing Vendor Login...");
    navigate('/vendor-home'); // Goes to v_home.jsx
  };

  return (
    <div className="vendor-container">
      <div className="vendor-box">
        <div className="vendor-header">
          <h1>PARTNER PORTAL</h1>
          <p>Grow your Laundry Business</p>
        </div>
        <h2>{isLogin ? "Vendor Login" : "Register Shop"}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && <input type="text" placeholder="Shop Name" className="vendor-input" />}
          <input type="email" placeholder="Business Email" className="vendor-input" />
          <input type="password" placeholder="Password" className="vendor-input" />
          
          <button type="submit" className="vendor-btn">
            {isLogin ? "Dashboard (Direct)" : "Register (Direct)"}
          </button>
        </form>

        <p className="toggle-vendor" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "New Partner? Register Shop" : "Already a Partner? Login"}
        </p>
        <button onClick={() => navigate('/')} className="back-to-home-vendor">← Back to Customer Login</button>
      </div>
    </div>
  );
};

export default VendorLogin;