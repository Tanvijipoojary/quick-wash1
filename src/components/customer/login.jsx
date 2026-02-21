import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
// --- 1. IMPORT THE LOGO HERE ---
import logo from '../assets/quickwash-logo.png';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Bypassing login... going to Home.");
    navigate('/home'); 
  };

  return (
    <div className="customer-container">
      <div className="login-box">
        
        {/* --- 2. UPDATED BRAND SECTION --- */}
        <div className="brand-section">
          <img src={logo} alt="Quick Wash Logo" className="main-logo" />
          <h1>QUICK WASH</h1>
          <p>CLICK, CLEAN, DELIVERY</p>
        </div>
        {/* -------------------------------- */}

        <h2>{isLogin ? "Customer Login" : "Customer Sign Up"}</h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input type="text" placeholder="Full Name" className="input-field" />
          )}
          <input type="email" placeholder="Email Address" className="input-field" />
          <input type="password" placeholder="Password" className="input-field" />
          
          <button type="submit" className="main-submit-btn">
            {isLogin ? "Login (Direct Access)" : "Register (Direct Access)"}
          </button>
        </form>

        <p className="toggle-text" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </p>

        <div className="portal-divider">
          <span>OR JOIN AS</span>
        </div>

        <div className="portal-options">
          <button onClick={() => navigate('/rider')} className="rider-link-btn">Rider</button>
          <button onClick={() => navigate('/vendor')} className="vendor-link-btn">Vendor</button>
        </div>
      </div>
    </div>
  );
};

export default Login;