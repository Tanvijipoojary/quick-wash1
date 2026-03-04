import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './rider.css';

const RiderLogin = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [isLoading, setIsLoading] = useState(false);

  // Login States
  const [loginStep, setLoginStep] = useState(1); 
  
  // Signup States
  const [signupStep, setSignupStep] = useState(1);
  const [signupOtpSent, setSignupOtpSent] = useState(false);

  // Form Data & OTP
  const [formData, setFormData] = useState({ 
    email: '', name: '', phone: '', city: '', vehicleType: 'Two Wheeler (Bike/Scooter)', vehicleNumber: '' 
  });
  const [otp, setOtp] = useState(['', '', '', '']);

  // Mock Databases (To test pending vs approved states)
  const [mockRiders] = useState(['rider@example.com', 'delishamiranda22@gmail.com']); // Approved
  const [mockPendingRiders, setMockPendingRiders] = useState([]); // Waiting for admin approval
  const [errorMessage, setErrorMessage] = useState('');

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
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

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setLoginStep(1);
    setSignupStep(1);
    setSignupOtpSent(false);
    setOtp(['', '', '', '']);
    setErrorMessage('');
  };

  // --- LOGIN LOGIC ---
  const handleLoginContinue = (e) => {
    e.preventDefault();
    if (!formData.email) return;
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsLoading(false);
      const emailEntered = formData.email.toLowerCase();

      if (mockRiders.includes(emailEntered)) {
        setLoginStep(2);
      } else if (mockPendingRiders.includes(emailEntered)) {
        setErrorMessage("Your profile is still under review. Please wait for the approval email.");
      } else {
        setErrorMessage("Account not found. Please partner with us first.");
      }
    }, 1000);
  };

  const handleLoginVerify = (e) => {
    e.preventDefault();
    if (otp.join('').length < 4) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/rider-home'); 
    }, 1200);
  };

  // --- SIGNUP LOGIC ---
  const handleSignupSendOTP = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      setIsLoading(false);
      const emailEntered = formData.email.toLowerCase();

      if (mockRiders.includes(emailEntered)) {
        setErrorMessage("Email already registered. Please log in.");
      } else if (mockPendingRiders.includes(emailEntered)) {
        setErrorMessage("This email is currently under review by the onboarding team.");
      } else {
        setSignupOtpSent(true);
      }
    }, 1000);
  };

  const handleSignupVerifyOTP = (e) => {
    e.preventDefault();
    if (otp.join('').length < 4) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSignupStep(2); // Move to Vehicle Details
      setOtp(['', '', '', '']);
    }, 1000);
  };

  const handleSignupSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Register rider in the PENDING database
      setMockPendingRiders([...mockPendingRiders, formData.email.toLowerCase()]);
      setSignupStep(4); // Move to Under Review Screen
    }, 1500);
  };

  // ==========================================
  // RENDER: LOGIN FLOW
  // ==========================================
  if (isLoginMode) {
    return (
      <div className="r-page-container">
        <div className="r-card r-login-card">
          
          <div className="r-header-section">
            <h1 className="r-brand-title">QUICK WASH</h1>
            <p className="r-brand-subtitle">Delivery Partner Portal</p>
            <div className="r-divider"></div>
          </div>

          {loginStep === 1 ? (
            <form className="r-form" onSubmit={handleLoginContinue}>
              <h2 className="r-form-title">Rider Log In</h2>
              <p className="r-form-desc">Enter your registered email.</p>
              
              {errorMessage && <p className="r-error">{errorMessage}</p>}

              <div className="r-input-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="e.g., rider@example.com" value={formData.email} onChange={handleInputChange} required />
              </div>

              <button type="submit" className="r-btn-orange" disabled={isLoading || !formData.email}>
                {isLoading ? 'Loading...' : 'Continue'}
              </button>

              <div className="r-footer-links">
                <button type="button" className="r-link-orange" onClick={toggleMode}>
                  Not registered? Partner with Us
                </button>
                <button type="button" className="r-link-darkgreen" onClick={() => navigate('/')}>
                  ← Back to Main App
                </button>
              </div>
            </form>
          ) : (
            <form className="r-form" onSubmit={handleLoginVerify}>
              <h2 className="r-form-title">Enter OTP</h2>
              <p className="r-form-desc">We've sent a 4-digit code to <br/><strong>{formData.email}</strong></p>
              
              <div className="r-otp-row">
                {otp.map((data, index) => (
                  <input key={index} type="text" maxLength="1" className="r-otp-box" value={data} onChange={(e) => handleOtpChange(e.target, index)} onFocus={(e) => e.target.select()} />
                ))}
              </div>

              <button type="submit" className="r-btn-orange" disabled={isLoading || otp.join('').length < 4}>
                {isLoading ? 'Verifying...' : 'Secure Log In'}
              </button>

              <div className="r-footer-links">
                <button type="button" className="r-link-orange" onClick={() => setLoginStep(1)}>
                  Wrong email? Go back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: SIGNUP FLOW
  // ==========================================
  return (
    <div className="r-page-container">
      {/* Stepper shows for steps 1 to 3 */}
      {signupStep < 4 && (
        <div className="r-signup-header">
          <h1>Quick Wash <span>Rider</span></h1>
          
          <div className="r-stepper">
            <div className="r-step-item">
              <div className={`r-step-circle ${signupStep >= 1 ? 'active' : ''}`}>1</div>
              <span className={signupStep >= 1 ? 'active-text' : ''}>ACCOUNT</span>
            </div>
            <div className={`r-step-line ${signupStep >= 2 ? 'active-line' : ''}`}></div>
            <div className="r-step-item">
              <div className={`r-step-circle ${signupStep >= 2 ? 'active' : ''}`}>2</div>
              <span className={signupStep >= 2 ? 'active-text' : ''}>VEHICLE</span>
            </div>
            <div className={`r-step-line ${signupStep >= 3 ? 'active-line' : ''}`}></div>
            <div className="r-step-item">
              <div className={`r-step-circle ${signupStep >= 3 ? 'active' : ''}`}>3</div>
              <span className={signupStep >= 3 ? 'active-text' : ''}>KYC</span>
            </div>
          </div>
        </div>
      )}

      <div className="r-card signup-card">
        {/* STEP 1: ACCOUNT DETAILS / OTP */}
        {signupStep === 1 && (
          <form className="r-form" onSubmit={!signupOtpSent ? handleSignupSendOTP : handleSignupVerifyOTP}>
            <h2 className="r-form-title dark">Become a Delivery Partner</h2>
            <p className="r-form-desc gray">Earn money delivering fresh laundry in your city.</p>

            {errorMessage && <p className="r-error">{errorMessage}</p>}

            {!signupOtpSent ? (
              <>
                <div className="r-input-group">
                  <label>FULL NAME</label>
                  <input type="text" name="name" placeholder="Enter full name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="r-input-group">
                  <label>PHONE NUMBER</label>
                  <input type="tel" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} required />
                </div>
                <div className="r-input-group">
                  <label>EMAIL ADDRESS</label>
                  <input type="email" name="email" placeholder="rider@quickwash.com" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="r-input-group">
                  <label>CITY</label>
                  <input type="text" name="city" placeholder="e.g. Mangaluru" value={formData.city} onChange={handleInputChange} required />
                </div>
                <button type="submit" className="r-btn-orange-pill mt-2" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send OTP to Email'}
                </button>
              </>
            ) : (
              <div className="r-otp-section">
                <p className="r-otp-prompt">Enter the 4-digit code sent to<br/><span className="r-otp-target">{formData.email}</span></p>
                <div className="r-otp-row">
                  {otp.map((data, index) => (
                    <input key={index} type="text" maxLength="1" className="r-otp-box" value={data} onChange={(e) => handleOtpChange(e.target, index)} onFocus={(e) => e.target.select()} />
                  ))}
                </div>
                <button type="submit" className="r-btn-orange-pill" disabled={isLoading || otp.join('').length < 4}>
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>
                <button type="button" className="r-link-gray mt-4" onClick={() => setSignupOtpSent(false)}>
                  Edit Details
                </button>
              </div>
            )}
            
            {!signupOtpSent && (
              <div className="r-centered-link mt-4">
                 <button type="button" className="r-link-orange-bold" onClick={toggleMode}>
                  Already registered? Log in
                 </button>
              </div>
            )}
          </form>
        )}

        {/* STEP 2: VEHICLE DETAILS */}
        {signupStep === 2 && (
          <div className="r-form">
            <h2 className="r-form-title dark">Vehicle Details</h2>
            <p className="r-form-desc gray">What will you be riding?</p>

            <div className="r-input-group">
              <label>VEHICLE TYPE</label>
              <select name="vehicleType" className="r-select" value={formData.vehicleType} onChange={handleInputChange}>
                <option value="Two Wheeler (Bike/Scooter)">Two Wheeler (Bike/Scooter)</option>
                <option value="Three Wheeler (Auto)">Three Wheeler (Auto)</option>
                <option value="Four Wheeler (Van)">Four Wheeler (Van)</option>
              </select>
            </div>
            <div className="r-input-group">
              <label>VEHICLE REGISTRATION NUMBER</label>
              <input type="text" name="vehicleNumber" placeholder="e.g. KA-19-XX-0000" value={formData.vehicleNumber} onChange={handleInputChange} className="active-border" />
            </div>

            <div className="r-btn-row mt-4">
              <button type="button" className="r-btn-lightgray" onClick={() => setSignupStep(1)}>Back</button>
              <button type="button" className="r-btn-orange-pill flex-1" onClick={() => setSignupStep(3)}>Next: KYC Documents</button>
            </div>
          </div>
        )}

        {/* STEP 3: KYC DOCS */}
        {signupStep === 3 && (
          <div className="r-form">
            <h2 className="r-form-title dark">Rider KYC Documents</h2>
            <p className="r-form-desc gray">Please provide clear photos of your original documents.</p>

            <div className="r-kyc-scroll-area">
              {[
                { title: 'Driving License', desc: 'Front & Back', icon: '🪪' },
                { title: 'RC Book / Smart Card', desc: 'Vehicle Registration', icon: '🏍️' },
                { title: 'Vehicle Insurance', desc: 'Valid Policy Copy', icon: '🛡️' },
                { title: 'Aadhar Card', desc: 'Front & Back for Identity', icon: '🆔' },
                { title: 'PAN Card', desc: 'For Payments', icon: '💳' }
              ].map((doc, idx) => (
                <div key={idx} className="r-kyc-item">
                  <div className="r-kyc-info">
                    <span className="r-kyc-icon">{doc.icon}</span>
                    <div>
                      <h4>{doc.title}</h4>
                      <p>{doc.desc}</p>
                    </div>
                  </div>
                  <button className="r-kyc-upload-btn">Upload</button>
                </div>
              ))}
            </div>

            <div className="r-btn-row mt-4">
              <button type="button" className="r-btn-lightgray" onClick={() => setSignupStep(2)}>Back</button>
              <button type="button" className="r-btn-orange-pill flex-1" onClick={handleSignupSubmit}>
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: UNDER REVIEW */}
        {signupStep === 4 && (
          <div className="r-form r-center-content">
            <div className="r-hourglass-container">
               <div className="r-hourglass-icon">⏳</div>
            </div>
            <h2 className="r-form-title dark">Profile Under Review</h2>
            <p className="r-form-desc gray">Thanks for applying, <strong>{formData.name || 'Rider'}</strong>!</p>
            
            <div className="r-review-box">
              Our onboarding team is reviewing your Driving License, RC, and Insurance. This usually takes <strong>24 hours</strong>.
            </div>

            <p className="r-review-subtext mt-4">
              We will send you an email once your background check is clear and you can start accepting deliveries!
            </p>

            <button type="button" className="r-link-orange-bold mt-4" onClick={toggleMode} style={{fontSize: '15px'}}>
              ← Return to Login Screen
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default RiderLogin;