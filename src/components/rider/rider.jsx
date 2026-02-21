import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './rider.css';

const RiderLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Bypassing Rider Login...");
    navigate('/rider-home'); // Goes to r_home.jsx
  };

  return (
    <div className="rider-container">
      <div className="rider-box">
        <div className="rider-header">
          <h1>RIDER APP</h1>
          <p>Earn money on your schedule</p>
        </div>
        <h2>{isLogin ? "Rider Login" : "Join the Fleet"}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && <input type="text" placeholder="Full Name" className="rider-input" />}
          <input type="email" placeholder="Email Address" className="rider-input" />
          <input type="password" placeholder="Password" className="rider-input" />
          
          <button type="submit" className="rider-btn">
            {isLogin ? "Start Delivering (Direct)" : "Register (Direct)"}
          </button>
        </form>

        <p className="toggle-rider" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "New Rider? Apply Here" : "Already a Rider? Login"}
        </p>
        <button onClick={() => navigate('/')} className="back-to-home">← Back to Customer Login</button>
      </div>
    </div>
  );
};

export default RiderLogin;