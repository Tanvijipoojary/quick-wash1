import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './vendor.css'; 
import logo from '../assets/quickwash-logo.png';

const VendorLogin = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);

  // Form Data 
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', shopName: '' });
  const [otp, setOtp] = useState('');

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setStep(1); 
    setOtp(''); 
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep(2); 
    }, 1000);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (otp.length === 4) {
        navigate('/vendor'); // Routes to the Vendor Dashboard
      } else {
        alert("Please enter a valid 4-digit OTP.");
      }
    }, 1500);
  };

  return (
    <div className="vendor-container">
      <div className="vendor-box">
        
        {/* --- BRAND HEADER --- */}
        <div className="vendor-header">
          <img src={logo} alt="Quick Wash Logo" className="logo" />
          <h1>QUICK WASH</h1>
          <p>Shop Owner Portal</p>
        </div>

        {/* ==========================================
            STEP 1: EMAIL ENTRY
        ========================================== */}
        {step === 1 && (
          <form onSubmit={handleContinue}>
            <h2 style={{ color: '#16a34a', margin: '0 0 5px 0', fontSize: '1.4rem' }}>
              {isLoginMode ? 'Vendor Log In' : 'Partner with Us'}
            </h2>
            <p style={{ color: '#15803d', fontSize: '0.9rem', marginBottom: '25px' }}>
              {isLoginMode 
                ? 'Enter your registered email to manage your shop.' 
                : 'Fill in your details to register your laundry shop.'}
            </p>
            
            {!isLoginMode && (
              <>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.85rem', color: '#14532d', fontWeight: 'bold' }}>Shop Name</label>
                  <input type="text" name="shopName" className="vendor-input" placeholder="e.g., Sparkle Cleaners" value={formData.shopName} onChange={handleInputChange} required />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.85rem', color: '#14532d', fontWeight: 'bold' }}>Owner Name</label>
                  <input type="text" name="name" className="vendor-input" placeholder="e.g., Ramesh M." value={formData.name} onChange={handleInputChange} required />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.85rem', color: '#14532d', fontWeight: 'bold' }}>Phone Number</label>
                  <input type="tel" name="phone" className="vendor-input" placeholder="e.g., +91 98765 43210" value={formData.phone} onChange={handleInputChange} required />
                </div>
              </>
            )}

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#14532d', fontWeight: 'bold' }}>Email Address</label>
              <input type="email" name="email" className="vendor-input" placeholder="e.g., vendor@example.com" value={formData.email} onChange={handleInputChange} required autoFocus />
            </div>
            
            <button type="submit" className="vendor-btn" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Continue'}
            </button>

            <div className="toggle-vendor" onClick={handleToggleMode}>
              {isLoginMode ? "Not registered? Partner with Us" : "Already a partner? Log In"}
            </div>

            <button type="button" className="back-to-home-vendor" onClick={() => navigate('/')}>
              ← Back to Main App
            </button>
          </form>
        )}

        {/* ==========================================
            STEP 2: OTP VERIFICATION
        ========================================== */}
        {step === 2 && (
          <form onSubmit={handleVerify}>
            <h2 style={{ color: '#16a34a', margin: '0 0 5px 0', fontSize: '1.4rem' }}>Verify your Email</h2>
            <p style={{ color: '#15803d', fontSize: '0.9rem', marginBottom: '25px' }}>
              Enter the 4-digit code sent to <strong>{formData.email}</strong>
            </p>
            
            <div>
              <input 
                type="text" 
                className="vendor-input"
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '15px', fontWeight: 'bold' }}
                placeholder="• • • •" 
                maxLength="4"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                required 
                autoFocus
              />
            </div>
            
            <button type="submit" className="vendor-btn" disabled={isLoading || otp.length < 4}>
              {isLoading ? 'Verifying...' : 'Access Dashboard'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
              <span className="toggle-vendor" style={{ marginTop: 0 }} onClick={() => setStep(1)}>
                ✎ Back
              </span>
              <span className="toggle-vendor" style={{ marginTop: 0 }} onClick={handleContinue}>
                ↻ Resend Code
              </span>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default VendorLogin;