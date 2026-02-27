import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './rider.css';

const RiderLogin = () => {
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
    if (otp.join('').length < 4) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/rider-home'); // Unlock app and go to rider dashboard
    }, 1500);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    let newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  return (
    <div className="rlog-container">
      <div className="rlog-card">
        
        {/* --- HEADER SECTION --- */}
        <div className="rlog-header">
          <div className="rlog-icon">🛵</div>
          <h1 className="rlog-brand-title">QUICK WASH</h1>
          <p className="rlog-brand-subtitle">Delivery Partner Portal</p>
        </div>
        
        <div className="rlog-divider"></div>

 {/* --- STEP 1: EMAIL ENTRY --- */}
        {step === 1 && (
          <form className="rlog-form" onSubmit={handleSendOTP}>
            <h2 className="rlog-form-title">Rider Log In</h2>
            <p className="rlog-instruction">Enter your registered email.</p>
            
            <div className="rlog-input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="e.g., rider@example.com" 
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="rlog-submit-btn" disabled={isLoading || !Email}>
              {isLoading ? 'Sending OTP...' : 'Continue'}
            </button>
            
            <div className="rlog-footer-links">
              {/* This links directly to the 4-step Verification flow we built! */}
              <button type="button" className="rlog-text-link" onClick={() => navigate('/rider-register')}>
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
          <form className="rlog-form" onSubmit={handleVerifyOTP}>
            <h2 className="rlog-form-title">Enter OTP</h2>
            <p className="rlog-instruction">
              We've sent a 4-digit code to <strong>{Email}</strong>
            </p>
            
            <div className="rlog-otp-container">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="rlog-otp-input"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            <button type="submit" className="rlog-submit-btn" disabled={isLoading || otp.join('').length < 4}>
              {isLoading ? 'Verifying...' : 'Secure Log In'}
            </button>
            
            <div className="rlog-footer-links">
              <button type="button" className="rlog-text-link" onClick={() => setStep(1)} style={{color: '#e58415'}}>
                Wrong email? Go back
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default RiderLogin;