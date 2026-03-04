import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './rider.css';

const RiderLogin = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [isLoginMode, setIsLoginMode] = useState(true); // Toggle Login/Signup
  const [step, setStep] = useState(1); // 1 = Email/Details, 2 = OTP
  const [isLoading, setIsLoading] = useState(false);

  // Notification States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Simulated Database (In a real app, this would be your backend)
  const [mockRiders, setMockRiders] = useState(['rider@example.com']); 

  // Form Data
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [otp, setOtp] = useState(['', '', '', '']); // 4-digit OTP

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleToggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setStep(1);
    setOtp(['', '', '', '']);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!formData.email) return;
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    setTimeout(() => {
      setIsLoading(false);
      const enteredEmail = formData.email.toLowerCase();

      if (isLoginMode) {
        // LOGIN CHECK: Does the rider exist?
        if (mockRiders.includes(enteredEmail)) {
          setStep(2); // Move to OTP step
        } else {
          setErrorMessage("Account not found. Please register first.");
        }
      } else {
        // SIGNUP CHECK: Is the email already used?
        if (mockRiders.includes(enteredEmail)) {
          setErrorMessage("Email already registered. Please log in.");
        } else {
          // Register the rider
          setMockRiders([...mockRiders, enteredEmail]);
          setSuccessMessage("Registration successful! Please log in.");
          setIsLoginMode(true); // Switch back to login view
          setFormData({ ...formData, name: '', phone: '' }); // Clear name/phone, keep email prefilled
        }
      }
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

    // Auto-focus next input
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

        {/* --- STEP 1: EMAIL / REGISTRATION ENTRY --- */}
        {step === 1 && (
          <form className="rlog-form" onSubmit={handleContinue}>
            <h2 className="rlog-form-title">{isLoginMode ? 'Rider Log In' : 'Partner With Us'}</h2>
            <p className="rlog-instruction">
              {isLoginMode ? 'Enter your registered email to log in.' : 'Fill in your details to start delivering.'}
            </p>

            {/* Error & Success Messages */}
            {errorMessage && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #fecaca' }}>{errorMessage}</div>}
            {successMessage && <div style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #bbf7d0' }}>{successMessage}</div>}
            
            {/* Show extra fields only if signing up */}
            {!isLoginMode && (
              <>
                <div className="rlog-input-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="e.g., Rahul Kumar" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="rlog-input-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="e.g., +91 98765 43210" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}

            <div className="rlog-input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email"
                placeholder="e.g., rider@example.com" 
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="rlog-submit-btn" disabled={isLoading || !formData.email}>
              {isLoading ? 'Processing...' : (isLoginMode ? 'Continue' : 'Register')}
            </button>
            
            <div className="rlog-footer-links">
              <button type="button" className="rlog-text-link" onClick={handleToggleMode} style={{color: '#e58415', fontWeight: 'bold'}}>
                {isLoginMode ? 'Not registered? Partner with Us' : 'Already registered? Log In'}
              </button>
              
              <button type="button" className="vlog-back-app-link" onClick={() => navigate('/')} style={{marginTop: '10px'}}>
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
              We've sent a 4-digit code to <strong>{formData.email}</strong>
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