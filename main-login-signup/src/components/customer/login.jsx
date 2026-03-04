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
  const [isAdminMode, setIsAdminMode] = useState(false); 

  // Notification States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Simulated Database (In a real app, this would be your backend)
  const [mockUsers, setMockUsers] = useState(['user@example.com']); 

  // Form Data
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState(''); 

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleToggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setStep(1); 
    setOtp(''); 
    setPassword('');
    setIsAdminMode(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    setTimeout(() => {
      setIsLoading(false);
      const enteredEmail = formData.email.toLowerCase();

      // ==========================================
      // ADMIN LOGIN (Untouched & Bypasses Checks)
      // ==========================================
      if (enteredEmail === 'admin@quickwash.com') {
        setIsAdminMode(true);
        setStep(2);
        return; 
      } 
      
      setIsAdminMode(false);

      // ==========================================
      // CUSTOMER LOGIN / SIGN UP LOGIC
      // ==========================================
      if (isLoginMode) {
        // Logging in: Check if user exists
        if (mockUsers.includes(enteredEmail)) {
          setStep(2); 
        } else {
          setErrorMessage("Account not found. Please sign up first.");
        }
      } else {
        // Signing up: Check if user already exists
        if (mockUsers.includes(enteredEmail)) {
          setErrorMessage("Email already registered. Please log in.");
        } else {
          // Register the user
          setMockUsers([...mockUsers, enteredEmail]);
          setSuccessMessage("Account created successfully! Please log in.");
          setIsLoginMode(true); 
          setFormData({ ...formData, name: '', phone: '' }); 
        }
      }
    }, 1000);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (isAdminMode) {
        // Admin verification remains exactly the same
        if (password === 'admin123') {
          navigate('/admin');
        } else {
          alert("Incorrect Admin Password!");
        }
      } else {
        // Customer OTP verification
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

            {/* Error/Success Banners */}
            {errorMessage && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #fecaca' }}>{errorMessage}</div>}
            {successMessage && <div style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #bbf7d0' }}>{successMessage}</div>}
            
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
              {isLoading ? 'Processing...' : (isLoginMode ? 'Continue' : 'Sign Up')}
            </button>

            <div className="toggle-mode-text">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <span className="text-link" onClick={handleToggleMode} style={{cursor: 'pointer', color: '#2563eb', fontWeight: 'bold'}}>
                {isLoginMode ? "Sign Up" : "Log In"}
              </span>
            </div>

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
              <button type="button" className="text-link" onClick={() => setStep(1)} style={{cursor: 'pointer', background: 'none', border: 'none', color: '#2563eb'}}>
                ✎ Back
              </button>
              {!isAdminMode && (
                <button type="button" className="text-link" onClick={(e) => { e.preventDefault(); alert("New OTP Sent!"); }} style={{cursor: 'pointer', background: 'none', border: 'none', color: '#2563eb'}}>
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