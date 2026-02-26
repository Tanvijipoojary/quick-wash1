import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import logo from '../assets/quickwash-logo.png';

const Login = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false); // NEW: Tracks if admin is logging in

  // Form Data
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState(''); // NEW: Admin Password

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setStep(1); 
    setOtp(''); 
    setPassword('');
    setIsAdminMode(false);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      
      // MAGIC CHECK: Is this the Admin?
      if (formData.email.toLowerCase() === 'admin@quickwash.com') {
        setIsAdminMode(true);
      } else {
        setIsAdminMode(false);
      }
      
      setStep(2); // Move to verification/password screen
    }, 1000);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (isAdminMode) {
        // --- ADMIN LOGIN LOGIC ---
        // For prototype, password is 'admin123'
        if (password === 'admin123') {
          navigate('/admin');
        } else {
          alert("Incorrect Admin Password!");
        }
      } else {
        // --- CUSTOMER LOGIN LOGIC ---
        if (otp.length === 4) {
          navigate('/home');
        } else {
          alert("Please enter a valid 4-digit OTP.");
        }
      }
    }, 1500);
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
            STEP 1: EMAIL ENTRY
        ========================================== */}
        {step === 1 && (
          <form className="login-form animate-fade" onSubmit={handleContinue}>
            <h2>{isLoginMode ? 'Welcome Back' : 'Create an Account'}</h2>
            <p className="form-subtitle">
              {isLoginMode 
                ? 'Enter your email to continue.' 
                : 'Fill in your details to get started.'}
            </p>
            
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
              <input type="email" name="email" placeholder="e.g., hello@example.com" value={formData.email} onChange={handleInputChange} required autoFocus />
            </div>
            
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Continue'}
            </button>

            <div className="toggle-mode-text">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <span className="text-link" onClick={handleToggleMode}>
                {isLoginMode ? "Sign Up" : "Log In"}
              </span>
            </div>
          </form>
        )}

        {/* ==========================================
            STEP 2: OTP (CUSTOMERS) OR PASSWORD (ADMIN)
        ========================================== */}
        {step === 2 && (
          <form className="login-form animate-slide-left" onSubmit={handleVerify}>
            <h2>{isAdminMode ? 'Admin Portal' : 'Verify your Email'}</h2>
            <p className="form-subtitle">
              {isAdminMode 
                ? 'Enter your secure administrator password.' 
                : <span>Enter the 4-digit code sent to <strong>{formData.email}</strong></span>}
            </p>
            
            <div className="input-group">
              {isAdminMode ? (
                // ADMIN SEES PASSWORD BOX
                <input 
                  type="password" 
                  placeholder="Enter admin password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  autoFocus
                  style={{ textAlign: 'left', letterSpacing: 'normal', fontSize: '1rem' }}
                />
              ) : (
                // CUSTOMERS SEE OTP BOX
                <input 
                  type="text" 
                  className="otp-input"
                  placeholder="• • • •" 
                  maxLength="4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                  required 
                  autoFocus
                />
              )}
            </div>
            
            <button type="submit" className="login-btn" disabled={isLoading || (!isAdminMode && otp.length < 4) || (isAdminMode && password.length === 0)}>
              {isLoading ? 'Verifying...' : (isAdminMode ? 'Access Dashboard' : 'Verify & Enter')}
            </button>

            <div className="otp-helpers">
              <button type="button" className="text-link" onClick={() => setStep(1)}>
                ✎ Back
              </button>
              {!isAdminMode && (
                <button type="button" className="text-link" onClick={handleContinue}>
                  ↻ Resend Code
                </button>
              )}
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default Login;