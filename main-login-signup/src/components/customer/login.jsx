import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';
import logo from '../assets/quickwash-logo.png'; 

const Login = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [showOtpField, setShowOtpField] = useState(false); // NEW: OTP State
  const [isLoading, setIsLoading] = useState(false);

  // Notification States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Data
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    password: '',
    otp: '' // NEW: OTP Input
  });

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleToggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setShowOtpField(false); // Reset OTP field if they toggle
    setFormData({ name: '', phone: '', email: '', password: '', otp: '' });
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

    // --- HARDCODED ADMIN LOGIN ---
    if (enteredEmail === 'admin@quickwash.com') {
      if (enteredPassword === 'admin123') {
        navigate('/admin');
      } else {
        setErrorMessage("Incorrect Admin Password!");
      }
      setIsLoading(false);
      return; 
    } 

    try {
      if (isLoginMode) {
        // ==========================================
        // 1. LOGIN API CALL
        // ==========================================
        const response = await axios.post('http://localhost:5000/api/auth/user-login', {
          email: enteredEmail,
          password: enteredPassword
        });

        if (response.status === 200) {
          localStorage.setItem('quickwash_user', JSON.stringify(response.data.user || response.data)); 
          navigate('/home'); 
        }

      } else {
        // ==========================================
        // 2. SIGNUP (WITH OTP)
        // ==========================================
        
        if (!showOtpField) {
          // STEP A: REQUEST THE OTP FIRST
          const response = await axios.post('http://localhost:5000/api/auth/send-user-otp', {
            email: enteredEmail
          });

          if (response.status === 200) {
            setSuccessMessage("OTP sent! Check your backend terminal for the code.");
            setShowOtpField(true); // Reveal the OTP input box!
          }
        } else {
          // STEP B: VERIFY OTP AND CREATE ACCOUNT
          if (!formData.otp) {
            setErrorMessage("Please enter the 6-digit OTP.");
            setIsLoading(false);
            return;
          }

          const response = await axios.post('http://localhost:5000/api/auth/user-register', {
            name: formData.name,
            phone: formData.phone,
            email: enteredEmail,
            password: enteredPassword,
            otp: formData.otp // Send the OTP to backend for verification
          });

          if (response.status === 201) {
            setSuccessMessage("Account created successfully! Please log in.");
            setIsLoginMode(true); 
            setShowOtpField(false);
            setFormData({ name: '', phone: '', email: '', password: '', otp: '' }); 
          }
        }
      }
    } catch (error) {
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

        <form className="login-form animate-fade" onSubmit={handleSubmit}>
          <h2>{isLoginMode ? 'Welcome Back' : (showOtpField ? 'Verify Email' : 'Create an Account')}</h2>
          <p className="form-subtitle">
            {isLoginMode 
              ? 'Enter your credentials to continue.' 
              : (showOtpField ? `Enter the OTP sent to ${formData.email}` : 'Fill in your details to get started.')}
          </p>

          {errorMessage && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #fecaca' }}>{errorMessage}</div>}
          {successMessage && <div style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #bbf7d0' }}>{successMessage}</div>}
          
          {/* Hide core fields if we are just verifying the OTP */}
          {!showOtpField && (
            <>
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

              <div className="input-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="e.g., hello@example.com" value={formData.email} onChange={handleInputChange} required />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleInputChange} required />
              </div>
            </>
          )}

          {/* Reveal OTP Field if requested */}
          {showOtpField && (
            <div className="input-group animate-fade">
              <label>6-Digit OTP</label>
              <input 
                type="text" 
                name="otp" 
                placeholder="Enter 6-digit code" 
                value={formData.otp} 
                onChange={handleInputChange} 
                required 
                maxLength="6"
                style={{ letterSpacing: '2px', fontSize: '1.2rem', textAlign: 'center', fontWeight: 'bold' }}
              />
              <button 
                type="button" 
                onClick={() => setShowOtpField(false)} 
                style={{ background: 'none', border: 'none', color: '#64748b', marginTop: '10px', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
              >
                Change Email / Back
              </button>
            </div>
          )}
          
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading 
              ? 'Processing...' 
              : (isLoginMode ? 'Log In' : (showOtpField ? 'Verify & Register' : 'Send OTP'))}
          </button>

          {!showOtpField && (
            <div className="toggle-mode-text">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <span className="text-link" onClick={handleToggleMode} style={{cursor: 'pointer', color: '#2563eb', fontWeight: 'bold'}}>
                {isLoginMode ? "Sign Up" : "Log In"}
              </span>
            </div>
          )}

          {/* Partner Links */}
          {isLoginMode && (
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
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;