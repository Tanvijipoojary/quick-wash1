import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './rider.css';

const VendorLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Bypassing Rider Login...");
    navigate('/rider-home'); // Goes to v_home.jsx
  };

  return (
    <div className="rider-container">
      <div className="rider-box">
        <div className="rider-header">
          <h1>PARTNER PORTAL</h1>
          <p>Grow your Laundry Business</p>
        </div>
        <h2>{isLogin ? "Rider Login" : "Register Rider"}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && <input type="text" placeholder="Rider Name" className="rider-input" />}
          <input type="email" placeholder="Business Email" className="rider-input" />
          <input type="password" placeholder="Password" className="rider-input" />
          
          <button type="submit" className="rider-btn">
            {isLogin ? "Dashboard (Direct)" : "Register (Direct)"}
          </button>
        </form>

        <p className="toggle-rider" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "New Partner? Register Rider" : "Already a Partner? Login"}
        </p>
        <button onClick={() => navigate('/')} className="back-to-home-rider">← Back to Customer Login</button>
      </div>
    </div>
  );
};

export default VendorLogin;