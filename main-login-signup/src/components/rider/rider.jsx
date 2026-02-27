import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './rider.css';

const RiderLogin = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState(1); // 1 = Phone, 2 = OTP
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']); 

  // --- HANDLERS ---
  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!phone) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2); 
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

        {/* --- STEP 1: PHONE ENTRY --- */}
        {step === 1 && (
          <form className="rlog-form" onSubmit={handleSendOTP}>
            <h2 className="rlog-form-title">Rider Log In</h2>
            <p className="rlog-instruction">Enter your registered phone number to hit the road.</p>
            
            <div className="rlog-input-group">
              <label>Phone Number</label>
              <div className="rlog-phone-input-wrapper">
                <span className="rlog-country-code">+91</span>
                <input 
                  type="tel" 
                  placeholder="98765 43210" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="rlog-submit-btn" disabled={isLoading || !phone}>
              {isLoading ? 'Sending OTP...' : 'Continue'}
            </button>
            
            <div className="rlog-footer-links">
              <button type="button" className="rlog-text-link" onClick={() => navigate('/rider-register')}>
                Want to ride with us? Register Here
              </button>
              <button type="button" className="rlog-back-app-link" onClick={() => navigate('/')}>
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
              We've sent a 4-digit code to <strong>+91 {phone}</strong>
            </p>
            
            <div className="rlog-otp-container">
              {otp.map((data, index) => (
                <input
                  key={index} type="text" maxLength="1" className="rlog-otp-input"
                  value={data} onChange={(e) => handleOtpChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            <button type="submit" className="rlog-submit-btn" disabled={isLoading || otp.join('').length < 4}>
              {isLoading ? 'Verifying...' : 'Start Riding'}
            </button>
            
            <div className="rlog-footer-links">
              <button type="button" className="rlog-text-link" onClick={() => setStep(1)} style={{color: '#666'}}>
                Wrong number? Go back
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default RiderLogin;