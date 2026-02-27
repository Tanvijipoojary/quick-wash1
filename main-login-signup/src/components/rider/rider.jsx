import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Pointing to your new specific rider CSS file!
import './rider.css'; 
import logo from '../assets/quickwash-logo.png';

const RiderLogin = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);

  // Form Data 
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', vehicle: '' });
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
        // Redirects to the new Rider Home page!
        navigate('/rider-home'); 
      } else {
        alert("Please enter a valid 4-digit OTP.");
      }
    }, 1500);
  };

  return (
    <div className="rider-container">
      <div className="rider-box">
        
        {/* --- BRAND HEADER --- */}
        <div className="rider-header">
          <img src={logo} alt="Quick Wash Logo" className="logo" />
          <h1>QUICK WASH</h1>
          <p>Delivery Rider Portal</p>
        </div>

        {/* ==========================================
            STEP 1: EMAIL ENTRY
        ========================================== */}
        {step === 1 && (
          <form onSubmit={handleContinue}>
            <h2 style={{ color: '#ea580c', margin: '0 0 5px 0', fontSize: '1.3rem' }}>
              {isLoginMode ? 'Rider Log In' : 'Join the Fleet'}
            </h2>
            <p style={{ color: '#9a3412', fontSize: '0.85rem', marginBottom: '20px' }}>
              {isLoginMode 
                ? 'Enter your registered email to start your shift.' 
                : 'Fill in your details to become a delivery partner.'}
            </p>
            
            {!isLoginMode && (
              <>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.85rem', color: '#9a3412', fontWeight: 'bold' }}>Full Name</label>
                  <input type="text" name="name" className="rider-input" placeholder="e.g., Kiran Kumar" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.85rem', color: '#9a3412', fontWeight: 'bold' }}>Phone Number</label>
                  <input type="tel" name="phone" className="rider-input" placeholder="e.g., +91 99999 11111" value={formData.phone} onChange={handleInputChange} required />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.85rem', color: '#9a3412', fontWeight: 'bold' }}>Vehicle Type & Number</label>
                  <input type="text" name="vehicle" className="rider-input" placeholder="e.g., Scooter - KA 19 AB 1234" value={formData.vehicle} onChange={handleInputChange} required />
                </div>
              </>
            )}

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: '#9a3412', fontWeight: 'bold' }}>Email Address</label>
              <input type="email" name="email" className="rider-input" placeholder="e.g., rider@example.com" value={formData.email} onChange={handleInputChange} required autoFocus />
            </div>
            
            {/* Rider Button uses CSS class entirely */}
            <button type="submit" className="rider-btn" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Continue'}
            </button>

            <div className="toggle-rider" onClick={handleToggleMode}>
              {isLoginMode ? "Want to join our delivery fleet? Apply Now" : "Already a rider? Log In"}
            </div>

            {/* Back to Customer App Button uses new specific class */}
            <button type="button" className="back-to-home-rider" onClick={() => navigate('/')}>
              ← Back to Main App
            </button>
          </form>
        )}

        {/* ==========================================
            STEP 2: OTP VERIFICATION
        ========================================== */}
        {step === 2 && (
          <form onSubmit={handleVerify}>
            <h2 style={{ color: '#ea580c', margin: '0 0 5px 0', fontSize: '1.3rem' }}>Verify your Email</h2>
            <p style={{ color: '#9a3412', fontSize: '0.85rem', marginBottom: '20px' }}>
              Enter the 4-digit code sent to <strong>{formData.email}</strong>
            </p>
            
            <div>
              <input 
                type="text" 
                className="rider-input"
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '15px', fontWeight: 'bold' }}
                placeholder="• • • •" 
                maxLength="4"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                required 
                autoFocus
              />
            </div>
            
            <button type="submit" className="rider-btn" disabled={isLoading || otp.length < 4}>
              {isLoading ? 'Verifying...' : 'Access Deliveries'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
              <span className="toggle-rider" style={{ marginTop: 0 }} onClick={() => setStep(1)}>
                ✎ Back
              </span>
              <span className="toggle-rider" style={{ marginTop: 0 }} onClick={handleContinue}>
                ↻ Resend Code
              </span>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default RiderLogin;