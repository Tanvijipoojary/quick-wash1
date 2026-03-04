import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './vendor.css';
import axios from 'axios';

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
  const [errorMessage, setErrorMessage] = useState('');

  const [docs, setDocs] = useState({ gst: null, shopAct: null, aadhaar: null, pan: null, cheque: null });

  const handleFileChange = (e, docName) => {
    setDocs({ ...docs, [docName]: e.target.files[0] });
  };

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
    // Clear form when switching modes so emails don't get mixed up
    setFormData({ email: '', name: '', phone: '', hubName: '', capacity: '', address: '' }); 
  };

  // ==========================================
  // REAL BACKEND LOGIC (LOGIN)
  // ==========================================
  
  // 1. Check if Vendor exists and is Active, then send OTP
  const handleLoginContinue = async (e) => {
    e.preventDefault();
    if (!formData.email) return;
    
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Calling the real login route we made in the backend
      const response = await axios.post('http://localhost:5000/api/auth/vendor-login-step1', {
        email: formData.email.toLowerCase()
      });

      // If backend says 200 OK (User is active and OTP sent)
      if (response.status === 200) {
        setLoginStep(2); // Show OTP screen
        setOtp(['', '', '', '']); // Clear any old OTP characters
      }
    } catch (error) {
      // This will catch "Pending", "Suspended", or "Not Found" errors from the backend
      setErrorMessage(error.response?.data?.message || "Error logging in. Please check your email.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify the Login OTP
  const handleLoginVerify = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) return;
    
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Verify the OTP against the database
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email: formData.email.toLowerCase(),
        otp: enteredOtp
      });

      // If successful, take them to the Vendor Dashboard!
      if (response.status === 200) {
        localStorage.setItem('vendorEmail', formData.email.toLowerCase()); // <-- ADD THIS LINE!
        navigate('/vendor-home'); 
      }

    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // REAL BACKEND LOGIC (SIGNUP)
  // ==========================================

  const handleSignupSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', {
        email: formData.email.toLowerCase(),
        user_type: 'Vendor'
      });
      setSignupOtpSent(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Error sending OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupVerifyOTP = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length < 4) return;
    
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email: formData.email.toLowerCase(),
        otp: enteredOtp
      });

      if (response.status === 200) {
        setSignupStep(2); 
        setOtp(['', '', '', '']); 
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // THE FINAL SUBMIT (SAVING TO MONGODB WITH FILES)
  // THE FINAL SUBMIT (SAVING TO MONGODB WITH FILES)
  const handleSignupSubmit = async () => {
    // 1. Check if all text fields are filled
    if (!formData.email || !formData.name || !formData.phone || !formData.hubName || !formData.capacity || !formData.address) {
      setErrorMessage("⚠️ Please fill in all text fields in Steps 1 and 2.");
      return;
    }

    // 2. Check if ALL 5 files are uploaded (Changed 'files' to 'docs')
    if (!docs.gst || !docs.shopAct || !docs.pan || !docs.aadhaar || !docs.cheque) {
      setErrorMessage("⚠️ Please upload all 5 required KYC documents before submitting.");
      return;
    }

    // 3. Package the data perfectly
    const data = new FormData();
    data.append('email', formData.email);
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('hubName', formData.hubName);
    data.append('capacity', formData.capacity);
    data.append('address', formData.address);
    
    // (Changed 'files' to 'docs' here too)
    data.append('gst', docs.gst);
    data.append('shopAct', docs.shopAct);
    data.append('pan', docs.pan);
    data.append('aadhaar', docs.aadhaar);
    data.append('cheque', docs.cheque);

    // 4. Send to backend
    try {
      const response = await axios.post('http://localhost:5000/api/auth/vendor-signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.status === 201) {
        setSignupStep(4); // Success screen!
        setErrorMessage(""); 
      }
    } catch (error) {
      console.error("Signup failed:", error);
      // Show the exact error the backend sends back
      setErrorMessage(error.response?.data?.message || "⚠️ Server error. Is your backend running?");
    }
  };

  // ==========================================
  // RENDER
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
              
              {errorMessage && <p className="v-error" style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '5px' }}>{errorMessage}</p>}

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
              
              {errorMessage && <p className="v-error" style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '5px' }}>{errorMessage}</p>}

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

  return (
    <div className="v-page-container">
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
        {signupStep === 1 && (
          <form className="v-form" onSubmit={!signupOtpSent ? handleSignupSendOTP : handleSignupVerifyOTP}>
            <h2 className="v-form-title dark">Create Vendor Account</h2>
            <p className="v-form-desc gray">Join the Quick Wash network and grow your laundry business.</p>

            {errorMessage && <p className="v-error" style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '5px' }}>{errorMessage}</p>}

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
              <textarea name="address" placeholder="Enter complete address in Mangaluru..." rows="3" value={formData.address} onChange={handleInputChange}></textarea>
            </div>

            <div className="v-btn-row" style={{ marginTop: '20px' }}>
              <button type="button" className="v-btn-lightgray" onClick={() => setSignupStep(1)}>Back</button>
              
              {/* Clean, unlocked Next button! */}
              <button 
                type="button" 
                className="v-btn-darkgreen" 
                onClick={() => setSignupStep(3)}
              >
                Next: KYC Documents
              </button>
            </div>
          </div>
        )}

        {signupStep === 3 && (
          <div className="v-form">
            <h2 className="v-form-title dark">KYC & Compliance</h2>
            <p className="v-form-desc gray">Upload required documents for verification.</p>

            <div className="v-kyc-scroll-area">
              {[
                { key: 'gst', title: 'GST Registration', desc: 'PDF or JPG up to 5MB', icon: '📄' },
                { key: 'shopAct', title: 'Shop & Establishment', desc: 'Official License Copy', icon: '🏬' },
                { key: 'pan', title: 'Owner PAN Card', desc: 'Front side only', icon: '💳' },
                { key: 'aadhaar', title: 'Aadhar Card', desc: 'Front and Back', icon: '🪪' },
                { key: 'cheque', title: 'Cancelled Cheque', desc: 'For Bank linking', icon: '🏦' }
              ].map((doc, idx) => (
                <div key={idx} className="v-kyc-item" style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                  <div className="v-kyc-info">
                    <span className="v-kyc-icon">{doc.icon}</span>
                    <div>
                      <h4>{doc.title}</h4>
                      <p>{doc.desc}</p>
                    </div>
                  </div>
                  <input 
                     type="file" 
                     accept=".jpg,.jpeg,.png,.pdf"
                     onChange={(e) => handleFileChange(e, doc.key)} 
                     style={{fontSize: '0.8rem', padding: '5px'}}
                  />
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

        {signupStep === 4 && (
          <div className="v-form v-center-content">
            <div className="v-hourglass-container">
                <div className="v-hourglass-icon">⏳</div>
            </div>
            <h2 className="v-form-title dark">Profile Under Review</h2>
            <p className="v-form-desc gray">Thanks for applying, <strong>{formData.name || 'Vendor'}</strong>!</p>
            <div className="v-review-box">
              Our admin team is reviewing your details. This usually takes <strong>24 to 48 hours</strong>.
            </div>
            <button type="button" className="v-link-teal-bold mt-4" onClick={toggleMode}>
              ← Return to Login Screen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorLogin;