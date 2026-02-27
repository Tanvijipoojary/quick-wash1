import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './vendor.css';

const VendorLogin = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
  const [isLoading, setIsLoading] = useState(false);
  const [Email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']); // 4-digit OTP

  // --- HANDLERS ---
  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!Email) return;
    
    setIsLoading(true);
    // Simulate API call to send OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep(2); // Move to OTP step
    }, 1200);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 4) return;

    setIsLoading(true);
    // Simulate API call to verify OTP
    setTimeout(() => {
      setIsLoading(false);
      navigate('/vendor-home'); // Unlock app and go to dashboard!
    }, 1500);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    let newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto-focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  return (
    <div className="vlog-container">
      <div className="vlog-card">
        
        {/* --- HEADER SECTION --- */}
        <div className="vlog-header">
          <div className="vlog-icon">
            <span role="img" aria-label="laundry">🧺</span>
          </div>
          <h1 className="vlog-brand-title">QUICK WASH</h1>
          <p className="vlog-brand-subtitle">Shop Owner Portal</p>
        </div>
        
        <div className="vlog-divider"></div>

        {/* --- STEP 1: EMAIL ENTRY --- */}
        {step === 1 && (
          <form className="vlog-form" onSubmit={handleSendOTP}>
            <h2 className="vlog-form-title">Vendor Log In</h2>
            <p className="vlog-instruction">Enter your registered email to manage your shop.</p>
            
            <div className="vlog-input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="e.g., vendor@example.com" 
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="vlog-submit-btn" disabled={isLoading || !Email}>
              {isLoading ? 'Sending OTP...' : 'Continue'}
            </button>
            
            <div className="vlog-footer-links">
              {/* This links directly to the 4-step Verification flow we built! */}
              <button type="button" className="vlog-text-link" onClick={() => navigate('/vendor-register')}>
                Not registered? Partner with Us
              </button>
              
              <button type="button" className="vlog-back-app-link" onClick={() => navigate('/')}>
                ← Back to Main App
              </button>
            </div>
          </form>
        )}

        {/* --- STEP 2: OTP VERIFICATION --- */}
        {step === 2 && (
          <form className="vlog-form" onSubmit={handleVerifyOTP}>
            <h2 className="vlog-form-title">Enter OTP</h2>
            <p className="vlog-instruction">
              We've sent a 4-digit code to <strong>{Email}</strong>
            </p>
            
            <div className="vlog-otp-container">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="vlog-otp-input"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            <button type="submit" className="vlog-submit-btn" disabled={isLoading || otp.join('').length < 4}>
              {isLoading ? 'Verifying...' : 'Secure Log In'}
            </button>
            
            <div className="vlog-footer-links">
              <button type="button" className="vlog-text-link" onClick={() => setStep(1)} style={{color: '#64748b'}}>
                Wrong email? Go back
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default VendorLogin;