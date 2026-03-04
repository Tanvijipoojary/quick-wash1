import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './vendor.css';

const VendorLogin = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [isLoginMode, setIsLoginMode] = useState(true); // Toggle Login/Signup
  const [step, setStep] = useState(1); // 1 = Email/Details, 2 = OTP
  const [isLoading, setIsLoading] = useState(false);

  // Notification States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Simulated Database (In a real app, this would be your backend)
  const [mockVendors, setMockVendors] = useState(['vendor@example.com']); 

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
        // LOGIN CHECK: Does the vendor exist?
        if (mockVendors.includes(enteredEmail)) {
          setStep(2); // Move to OTP step
        } else {
          setErrorMessage("Shop account not found. Please register first.");
        }
      } else {
        // SIGNUP CHECK: Is the email already used?
        if (mockVendors.includes(enteredEmail)) {
          setErrorMessage("Email already registered. Please log in.");
        } else {
          // Register the vendor
          setMockVendors([...mockVendors, enteredEmail]);
          setSuccessMessage("Registration successful! Please log in.");
          setIsLoginMode(true); // Switch back to login view
          setFormData({ ...formData, name: '', phone: '' }); // Clear name/phone, keep email prefilled
        }
      }
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

        {/* --- STEP 1: EMAIL / REGISTRATION ENTRY --- */}
        {step === 1 && (
          <form className="vlog-form" onSubmit={handleContinue}>
            <h2 className="vlog-form-title">{isLoginMode ? 'Vendor Log In' : 'Partner With Us'}</h2>
            <p className="vlog-instruction">
              {isLoginMode ? 'Enter your registered email to manage your shop.' : 'Fill in your details to register your laundry shop.'}
            </p>
            
            {/* Error & Success Messages */}
            {errorMessage && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #fecaca' }}>{errorMessage}</div>}
            {successMessage && <div style={{ color: '#166534', backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #bbf7d0' }}>{successMessage}</div>}

            {/* Show extra fields only if signing up */}
            {!isLoginMode && (
              <>
                <div className="vlog-input-group">
                  <label>Owner Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="e.g., Ramesh Kumar" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="vlog-input-group">
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

            <div className="vlog-input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email"
                placeholder="e.g., vendor@example.com" 
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="vlog-submit-btn" disabled={isLoading || !formData.email}>
              {isLoading ? 'Processing...' : (isLoginMode ? 'Continue' : 'Register Shop')}
            </button>
            
            <div className="vlog-footer-links">
              <button type="button" className="vlog-text-link" onClick={handleToggleMode} style={{color: '#2563eb', fontWeight: 'bold'}}>
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
          <form className="vlog-form" onSubmit={handleVerifyOTP}>
            <h2 className="vlog-form-title">Enter OTP</h2>
            <p className="vlog-instruction">
              We've sent a 4-digit code to <strong>{formData.email}</strong>
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