import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './vendor.css';

const VendorLogin = () => {
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
    email: '', name: '', phone: '', hubName: '', capacity: '', address: '' 
  });
  const [otp, setOtp] = useState(['', '', '', '']);

  // Mock Databases (To test pending vs approved states)
  const [mockVendors] = useState(['vendor@example.com']); // Approved vendors
  const [mockPendingVendors, setMockPendingVendors] = useState([]); // Vendors waiting for admin approval
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

      // Check if approved
      if (mockVendors.includes(emailEntered)) {
        setLoginStep(2);
      } 
      // Check if still pending admin approval
      else if (mockPendingVendors.includes(emailEntered)) {
        setErrorMessage("Your account is still under review by the admin. Please wait for the approval email.");
      } 
      // Not registered at all
      else {
        setErrorMessage("Shop account not found. Please partner with us first.");
      }
    }, 1000);
  };

  const handleLoginVerify = (e) => {
    e.preventDefault();
    if (otp.join('').length < 4) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/vendor-home'); 
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

      if (mockVendors.includes(emailEntered)) {
        setErrorMessage("Email already registered. Please log in.");
      } else if (mockPendingVendors.includes(emailEntered)) {
        setErrorMessage("This email is currently under review by the admin.");
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
      setSignupStep(2); // Move to Business Profile
      setOtp(['', '', '', '']);
    }, 1000);
  };

  const handleSignupSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Register vendor in the PENDING database
      setMockPendingVendors([...mockPendingVendors, formData.email.toLowerCase()]);
      setSignupStep(4); // Move to Pending Approval Screen
    }, 1500);
  };

  // ==========================================
  // RENDER: LOGIN FLOW
  // ==========================================
  if (isLoginMode) {
    return (
      <div className="v-page-container">
        <div className="v-card login-card">
          
          <div className="v-header-section">
            <h1 className="v-brand-title">QUICK WASH</h1>
            <p className="v-brand-subtitle">Shop Owner Portal</p>
            <div className="v-divider"></div>
          </div>

          {loginStep === 1 ? (
            <form className="v-form" onSubmit={handleLoginContinue}>
              <h2 className="v-form-title">Vendor Log In</h2>
              <p className="v-form-desc">Enter your registered email to manage your shop.</p>
              
              {errorMessage && <p className="v-error">{errorMessage}</p>}

              <div className="v-input-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="e.g., vendor@example.com" value={formData.email} onChange={handleInputChange} required />
              </div>

              <button type="submit" className="v-btn-teal" disabled={isLoading || !formData.email}>
                {isLoading ? 'Loading...' : 'Continue'}
              </button>

              <div className="v-footer-links">
                <button type="button" className="v-link-teal" onClick={toggleMode}>
                  Not registered? Partner with Us
                </button>
                <button type="button" className="v-link-dark" onClick={() => navigate('/')}>
                  ← Back to Main App
                </button>
              </div>
            </form>
          ) : (
            <form className="v-form" onSubmit={handleLoginVerify}>
              <h2 className="v-form-title">Enter OTP</h2>
              <p className="v-form-desc">We've sent a 4-digit code to <strong>{formData.email}</strong></p>
              
              <div className="v-otp-row">
                {otp.map((data, index) => (
                  <input key={index} type="text" maxLength="1" className="v-otp-box" value={data} onChange={(e) => handleOtpChange(e.target, index)} onFocus={(e) => e.target.select()} />
                ))}
              </div>

              <button type="submit" className="v-btn-teal" disabled={isLoading || otp.join('').length < 4}>
                {isLoading ? 'Verifying...' : 'Secure Log In'}
              </button>

              <div className="v-footer-links">
                <button type="button" className="v-link-gray" onClick={() => setLoginStep(1)}>
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
    <div className="v-page-container">
      {/* Stepper only shows for steps 1 to 3 */}
      {signupStep < 4 && (
        <div className="v-signup-header">
          <h1>Quick Wash <span>Vendor</span></h1>
          
          <div className="v-stepper">
            <div className="v-step-item">
              <div className={`v-step-circle ${signupStep >= 1 ? 'active' : ''}`}>1</div>
              <span className={signupStep >= 1 ? 'active-text' : ''}>ACCOUNT</span>
            </div>
            <div className={`v-step-line ${signupStep >= 2 ? 'active-line' : ''}`}></div>
            <div className="v-step-item">
              <div className={`v-step-circle ${signupStep >= 2 ? 'active' : ''}`}>2</div>
              <span className={signupStep >= 2 ? 'active-text' : ''}>BUSINESS</span>
            </div>
            <div className={`v-step-line ${signupStep >= 3 ? 'active-line' : ''}`}></div>
            <div className="v-step-item">
              <div className={`v-step-circle ${signupStep >= 3 ? 'active' : ''}`}>3</div>
              <span className={signupStep >= 3 ? 'active-text' : ''}>KYC DOCS</span>
            </div>
          </div>
        </div>
      )}

      <div className="v-card signup-card">
        {/* STEP 1: ACCOUNT DETAILS / OTP */}
        {signupStep === 1 && (
          <form className="v-form" onSubmit={!signupOtpSent ? handleSignupSendOTP : handleSignupVerifyOTP}>
            <h2 className="v-form-title dark">Create Vendor Account</h2>
            <p className="v-form-desc gray">Join the Quick Wash network and grow your laundry business.</p>

            {errorMessage && <p className="v-error">{errorMessage}</p>}

            {!signupOtpSent ? (
              <>
                <div className="v-input-group">
                  <label>FULL NAME</label>
                  <input type="text" name="name" placeholder="Anurag S." value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="v-input-group">
                  <label>PHONE NUMBER</label>
                  <input type="tel" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} required />
                </div>
                <div className="v-input-group">
                  <label>EMAIL ADDRESS</label>
                  <input type="email" name="email" placeholder="vendor@quickwash.com" value={formData.email} onChange={handleInputChange} required />
                </div>
                <button type="submit" className="v-btn-darkgreen" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Verification OTP'}
                </button>
              </>
            ) : (
              <div className="v-otp-section">
                <p className="v-otp-prompt">Enter the 4-digit code sent to<br/><span className="v-otp-target">{formData.email}</span></p>
                <div className="v-otp-row">
                  {otp.map((data, index) => (
                    <input key={index} type="text" maxLength="1" className="v-otp-box" value={data} onChange={(e) => handleOtpChange(e.target, index)} onFocus={(e) => e.target.select()} />
                  ))}
                </div>
                <button type="submit" className="v-btn-darkgreen" disabled={isLoading || otp.join('').length < 4}>
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>
                <button type="button" className="v-link-gray mt-4" onClick={() => setSignupOtpSent(false)}>
                  Edit Email
                </button>
              </div>
            )}
            
            {!signupOtpSent && (
              <button type="button" className="v-link-gray mt-4" onClick={toggleMode}>
                Already registered? Log In
              </button>
            )}
          </form>
        )}

        {/* STEP 2: BUSINESS PROFILE */}
        {signupStep === 2 && (
          <div className="v-form">
            <h2 className="v-form-title dark">Business Profile</h2>
            <p className="v-form-desc gray">Tell us about your laundry hub capabilities.</p>

            <div className="v-input-group">
              <label>LAUNDRY HUB NAME</label>
              <input type="text" name="hubName" placeholder="e.g. Premium Cleaners" value={formData.hubName} onChange={handleInputChange} />
            </div>
            <div className="v-input-group">
              <label>DAILY WASHING CAPACITY (KG)</label>
              <input type="number" name="capacity" placeholder="e.g. 150" value={formData.capacity} onChange={handleInputChange} />
            </div>
            <div className="v-input-group">
              <label>FULL HUB ADDRESS</label>
              <textarea name="address" placeholder="Enter complete address..." rows="3" value={formData.address} onChange={handleInputChange}></textarea>
            </div>

            <div className="v-btn-row">
              <button type="button" className="v-btn-lightgray" onClick={() => setSignupStep(1)}>Back</button>
              <button type="button" className="v-btn-darkgreen" onClick={() => setSignupStep(3)}>Next: KYC Documents</button>
            </div>
          </div>
        )}

        {/* STEP 3: KYC DOCS */}
        {signupStep === 3 && (
          <div className="v-form">
            <h2 className="v-form-title dark">KYC & Compliance</h2>
            <p className="v-form-desc gray">Upload required documents for verification.</p>

            <div className="v-kyc-scroll-area">
              {[
                { title: 'GST Registration', desc: 'PDF or JPG up to 5MB', icon: '📄' },
                { title: 'Shop & Establishment', desc: 'Official License Copy', icon: '🏬' },
                { title: 'Owner PAN Card', desc: 'Front side only', icon: '💳' },
                { title: 'Aadhar Card', desc: 'Front and Back', icon: '🪪' },
                { title: 'Cancelled Cheque', desc: 'For Bank linking', icon: '🏦' }
              ].map((doc, idx) => (
                <div key={idx} className="v-kyc-item">
                  <div className="v-kyc-info">
                    <span className="v-kyc-icon">{doc.icon}</span>
                    <div>
                      <h4>{doc.title}</h4>
                      <p>{doc.desc}</p>
                    </div>
                  </div>
                  <button className="v-kyc-upload-btn">Upload</button>
                </div>
              ))}
            </div>

            <div className="v-btn-row mt-4">
              <button type="button" className="v-btn-lightgray" onClick={() => setSignupStep(2)}>Back</button>
              <button type="button" className="v-btn-darkgreen" onClick={handleSignupSubmit}>
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: UNDER REVIEW */}
        {signupStep === 4 && (
          <div className="v-form v-center-content">
            <div className="v-hourglass-container">
               <div className="v-hourglass-icon">⏳</div>
            </div>
            <h2 className="v-form-title dark">Profile Under Review</h2>
            <p className="v-form-desc gray">Thanks for applying, <strong>{formData.name || 'Vendor'}</strong>!</p>
            
            <div className="v-review-box">
              Our admin team is reviewing your Shop & Establishment, KYC, and Hub Details. This usually takes <strong>24 to 48 hours</strong>.
            </div>

            <p className="v-review-subtext mt-4">
              We will send you an approval email once your account is activated and ready to receive orders!
            </p>

            <button type="button" className="v-link-teal-bold mt-4" onClick={toggleMode} style={{fontSize: '15px'}}>
              ← Return to Login Screen
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VendorLogin;