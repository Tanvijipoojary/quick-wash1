import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Ensure this is imported!
import './login.css';
import logo from '../assets/quickwash-logo.png'; 

const Login = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [isLoading, setIsLoading] = useState(false);

  // Notification States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Data
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    password: '' 
  });

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleToggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({ ...formData, name: '', phone: '', password: '' });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const enteredEmail = formData.email.toLowerCase();
    const enteredPassword = formData.password;

    // ==========================================
    // HARDCODED ADMIN LOGIN
    // ==========================================
    if (enteredEmail === 'admin@quickwash.com') {
      if (enteredPassword === 'admin123') {
        navigate('/admin');
      } else {
        setErrorMessage("Incorrect Admin Password!");
      }
      setIsLoading(false);
      return; 
    } 

    // ==========================================
    // REAL DATABASE CUSTOMER LOGIN / SIGN UP
    // ==========================================
    try {
      if (isLoginMode) {
        // --- LOGIN API CALL ---
        const response = await axios.post('http://localhost:5000/api/auth/user-login', {
          email: enteredEmail,
          password: enteredPassword
        });

        if (response.status === 200) {
          // Save user info so the Home/Cart pages know who is logged in!
          // 👇 Change getItem to setItem, and actually save the response data!
          localStorage.setItem('quickwash_user', JSON.stringify(response.data.user || response.data)); 
          navigate('/home'); 
        }

      } else {
        // --- SIGNUP API CALL ---
        const response = await axios.post('http://localhost:5000/api/auth/user-register', {
          name: formData.name,
          phone: formData.phone,
          email: enteredEmail,
          password: enteredPassword
        });

        if (response.status === 201) {
          setSuccessMessage("Account created successfully! Please log in.");
          setIsLoginMode(true); 
          setFormData({ ...formData, name: '', phone: '', password: '' }); 
        }
      }
    } catch (error) {
      // Safely grab the error message from the backend, or show a default one
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Server error. Please make sure your backend is running.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="customer-container">
      <div className="login-box animate-scale-up">
        
        {/* --- BRAND HEADER --- */}
        <div className="brand-section">
          <img src={logo} alt="Quick Wash Logo" className="logo" />
          <h2>QUICK WASH</h2>
          <p>Your premium laundry partner.</p>
        </div>

        {/* ==========================================
            LOGIN & SIGNUP FORM
        ========================================== */}
        <form className="login-form animate-fade" onSubmit={handleSubmit}>
          <h2>{isLoginMode ? 'Welcome Back' : 'Create an Account'}</h2>
          <p className="form-subtitle">
            {isLoginMode 
              ? 'Enter your credentials to continue.' 
              : 'Fill in your details to get started.'}
          </p>

          {/* Error/Success Banners */}
          {errorMessage && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #fecaca' }}>{errorMessage}</div>}
          {successMessage && <div style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #bbf7d0' }}>{successMessage}</div>}
          
          {/* Extra fields for Sign Up Mode */}
          {!isLoginMode && (
            <>
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" name="name" placeholder="e.g., Tanvi Poojary" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" placeholder="e.g., +91 98765 43210" value={formData.phone} onChange={handleInputChange} required />
              </div>
            </>
          )}

          {/* Core Fields for both Login & Sign Up */}
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="e.g., hello@example.com" value={formData.email} onChange={handleInputChange} required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleInputChange} required />
          </div>
          
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLoginMode ? 'Log In' : 'Sign Up')}
          </button>

          <div className="toggle-mode-text">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <span className="text-link" onClick={handleToggleMode} style={{cursor: 'pointer', color: '#2563eb', fontWeight: 'bold'}}>
              {isLoginMode ? "Sign Up" : "Log In"}
            </span>
          </div>

          {/* Partner Links */}
          <div className="partner-section">
            <div className="partner-divider"><span>OR</span></div>
            <p className="partner-title">Partner with Quick Wash</p>
            <div className="partner-buttons">
              <button type="button" className="partner-btn vendor-btn" onClick={() => navigate('/vendor')}>
                🏪 Shop Owner
              </button>
              <button type="button" className="partner-btn rider-btn" onClick={() => navigate('/rider')}>
                🛵 Delivery Rider
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Login;