import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './rider.css';

const RiderLogin = () => {
  const navigate = useNavigate();

  // --- TOGGLE MODES ---
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // --- STATE MANAGEMENT ---
  const [signupStep, setSignupStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // NEW: For OTP feedback

  // --- DATA STATES ---
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', city: '', 
    vehicleType: 'Two Wheeler (Bike/Scooter)', vehicleNumber: '', otp: '' // Added otp!
  });
  
  const [docs, setDocs] = useState({
    dl: null, rc: null, insurance: null, aadhaar: null, pan: null
  });

  // --- FORM HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccessMessage('');
  };

  const handleFileChange = (e, key) => {
    setDocs({ ...docs, [key]: e.target.files[0] });
    setError('');
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setSignupStep(1);
    setFormData({ ...formData, password: '', otp: '' }); // Clear sensitive info
    setError('');
    setSuccessMessage('');
  };

  // ==========================================
  // 🚀 LOGIN FLOW
  // ==========================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return setError("Email and Password are required.");
    setIsLoading(true);
    
    try {
      // Note: Assuming your login route is still in authRoutes
      const res = await axios.post('http://localhost:5000/api/auth/rider-login', { 
        email: formData.email.toLowerCase(),
        password: formData.password
      });
      
      if (res.status === 200) {
        const riderData = res.data.rider || res.data; 
        localStorage.setItem('quickwash_rider', JSON.stringify(riderData));
        navigate('/rider-home'); 
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🚀 SIGNUP STEP A: REQUEST OTP
  // ==========================================
  const handleRequestOTP = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.city || !formData.vehicleNumber) {
      return setError("⚠️ Please fill in all text fields before continuing.");
    }

    if (!docs.dl || !docs.rc || !docs.insurance || !docs.aadhaar || !docs.pan) {
      return setError("⚠️ Please upload all 5 required KYC documents.");
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Request the OTP first (using the new riders route prefix)
      const res = await axios.post('http://localhost:5000/api/riders/send-rider-otp', {
        email: formData.email.toLowerCase()
      });
      
      if (res.status === 200) {
        setSuccessMessage("OTP sent to your email!");
        setSignupStep(4); // Move to OTP verification step
      }
    } catch (err) {
      console.error("OTP request failed:", err);
      setError(err.response?.data?.message || "⚠️ Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🚀 SIGNUP STEP B: VERIFY & SUBMIT DOCS
  // ==========================================
  const handleVerifyAndSubmit = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      return setError("⚠️ Please enter a valid 6-digit OTP.");
    }

    setIsLoading(true);
    setError('');
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email.toLowerCase());
    data.append('phone', formData.phone);
    data.append('password', formData.password); 
    data.append('city', formData.city);
    data.append('vehicleType', formData.vehicleType);
    data.append('vehicleNumber', formData.vehicleNumber);
    data.append('otp', formData.otp); // Send the OTP!
    
    data.append('dl', docs.dl);
    data.append('rc', docs.rc);
    data.append('insurance', docs.insurance);
    data.append('aadhaar', docs.aadhaar);
    data.append('pan', docs.pan);

    try {
      const res = await axios.post('http://localhost:5000/api/riders/rider-signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.status === 201) {
        setSignupStep(5); // Move to final success screen
      }
    } catch (err) {
      console.error("Signup failed:", err);
      setError(err.response?.data?.message || "⚠️ Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="r-page-container">
      
      {/* --- SIGNUP STEPPER HEADER --- */}
      {!isLoginMode && signupStep < 5 && (
        <div className="r-signup-header animate-fade">
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

      {/* --- MAIN CARD --- */}
      <div className={`r-card ${isLoginMode ? 'r-login-card' : ''}`}>
        
        {error && <div className="r-error animate-fade" style={{ marginBottom: '15px', color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '5px' }}>{error}</div>}
        {successMessage && <div className="animate-fade" style={{ marginBottom: '15px', color: '#166534', background: '#dcfce7', padding: '10px', borderRadius: '5px' }}>{successMessage}</div>}

        {isLoginMode ? (
          /* =========================================
             LOGIN MODE 
             ========================================= */
          <div className="r-form animate-fade">
            <form onSubmit={handleLoginSubmit}>
              <div className="r-header-section">
                <div className="r-icon-box">🛵</div>
                <h1 className="r-brand-title">QUICK WASH</h1>
                <p className="r-brand-subtitle">Delivery Partner Portal</p>
                <div className="r-divider"></div>
              </div>

              <h2 className="r-form-title">Rider Log In</h2>
              <p className="r-form-desc">Enter your credentials to continue.</p>

              <div className="r-input-group">
                <label>Email Address</label>
                <input 
                  type="email" name="email" value={formData.email} 
                  onChange={handleInputChange} placeholder="e.g., rider@example.com" required 
                />
              </div>

              <div className="r-input-group">
                <label>Password</label>
                <input 
                  type="password" name="password" value={formData.password} 
                  onChange={handleInputChange} placeholder="Enter your password" required 
                />
              </div>

              <button type="submit" className="r-btn-orange" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Secure Log In'}
              </button>

              <div className="r-footer-links">
                <button type="button" className="r-link-orange-bold" onClick={toggleMode} style={{background:'none', border:'none', cursor:'pointer', marginTop:'15px'}}>
                  Not registered? Partner with Us
                </button>
                <button type="button" className="r-link-dark" onClick={() => navigate('/')} style={{background:'none', border:'none', cursor:'pointer', marginTop:'10px'}}>
                  ← Back to Main App
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* =========================================
             SIGNUP MODE 
             ========================================= */
          <div className="r-form animate-fade">
            
            {/* STEP 1: ACCOUNT DETAILS */}
            {signupStep === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setSignupStep(2); }}>
                <h2 className="r-form-title">Become a Delivery Partner</h2>
                <p className="r-form-desc">Earn money delivering fresh laundry in your city.</p>
                
                <div className="r-input-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Tanvi Poojary" required />
                </div>
                
                <div className="r-input-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g., +91 98765 43210" required />
                </div>
                
                <div className="r-input-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="e.g., hello@example.com" required />
                </div>
                
                <div className="r-input-group">
                  <label>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter your password" required minLength="6" />
                </div>

                <div className="r-input-group">
                  <label>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Mangaluru" required />
                </div>
                
                <button type="submit" className="r-btn-orange-pill" style={{width: '100%', padding: '12px', marginTop: '10px'}}>Next</button>
                
                <div className="r-centered-link mt-4" style={{textAlign: 'center'}}>
                  <button type="button" className="r-link-orange-bold" onClick={toggleMode} style={{background:'none', border:'none', cursor:'pointer', marginTop:'15px'}}>
                    Already registered? Log in
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: VEHICLE DETAILS */}
            {signupStep === 2 && (
              <div className="animate-fade">
                <h2 className="r-form-title">Vehicle Details</h2>
                <p className="r-form-desc">What will you be riding?</p>
                
                <div className="r-input-group">
                  <label>Vehicle Type</label>
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}>
                    <option>Petrol 2 Wheeler (Bike/Scooter)</option>
                    <option>Electric 2 Wheeler</option>
                  </select>
                </div>
                <div className="r-input-group">
                  <label>Vehicle Registration Number</label>
                  <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} placeholder="e.g. KA 19 XX 0000" />
                </div>
                
                <div className="r-btn-row" style={{display: 'flex', gap: '15px', marginTop: '20px'}}>
                  <button className="r-btn-lightgray" onClick={() => setSignupStep(1)} style={{padding: '12px 20px'}}>Back</button>
                  <button className="r-btn-orange flex-1" onClick={() => setSignupStep(3)} disabled={!formData.vehicleNumber} style={{flex: 1, padding: '12px'}}>Next: KYC Documents</button>
                </div>
              </div>
            )}

            {/* STEP 3: KYC UPLOADS */}
            {signupStep === 3 && (
              <div className="animate-fade">
                <h2 className="r-form-title">Rider KYC Documents</h2>
                <p className="r-form-desc" style={{marginBottom: '15px'}}>Please provide clear photos of your original documents.</p>
                
                <div className="r-kyc-scroll-area">
                  {[
                    { label: "Driving License", desc: "Front & Back", key: "dl", icon: "🪪" },
                    { label: "RC Book / Smart Card", desc: "Vehicle Registration", key: "rc", icon: "🏍️" },
                    { label: "Vehicle Insurance", desc: "Valid Policy Copy", key: "insurance", icon: "🛡️" },
                    { label: "Aadhaar Card", desc: "Front & Back for Identity", key: "aadhaar", icon: "🆔" },
                    { label: "PAN Card", desc: "For Payments", key: "pan", icon: "💳" }
                  ].map(doc => (
                    <div className="r-kyc-item" key={doc.key} style={{display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px dashed #ccc', padding:'10px', marginBottom:'10px', borderRadius:'8px'}}>
                      <div className="r-kyc-info" style={{display:'flex', gap:'10px', alignItems:'center'}}>
                        <span className="r-kyc-icon" style={{fontSize: '24px'}}>{doc.icon}</span>
                        <div>
                          <h4 style={{margin: 0, fontSize: '14px'}}>{doc.label}</h4>
                          <p style={{margin: 0, fontSize: '12px', color: '#666'}}>{doc.desc}</p>
                        </div>
                      </div>
                      <label className="r-kyc-upload-btn" style={{cursor: 'pointer', background: docs[doc.key] ? '#dcfce7' : '#f1f5f9', color: docs[doc.key] ? '#166534' : '#475569', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>
                        {docs[doc.key] ? "✅ Uploaded" : "Upload"}
                        <input type="file" hidden accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e, doc.key)} />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="r-btn-row" style={{display: 'flex', gap: '15px', marginTop: '20px'}}>
                  <button className="r-btn-lightgray" onClick={() => setSignupStep(2)} style={{padding: '12px 20px'}}>Back</button>
                  {/* Changed this button to trigger the OTP email first! */}
                  <button className="r-btn-orange flex-1" onClick={handleRequestOTP} disabled={isLoading} style={{flex: 1, padding: '12px'}}>
                    {isLoading ? 'Processing...' : 'Verify Email & Submit'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: OTP VERIFICATION */}
            {signupStep === 4 && (
              <div className="r-form animate-fade" style={{textAlign: 'center', padding: '20px 0'}}>
                <h2 className="r-form-title">Verify Your Email</h2>
                <p className="r-form-desc" style={{marginBottom: '25px'}}>
                  We've sent a 6-digit code to <strong>{formData.email}</strong>. Enter it below to complete your registration.
                </p>

                <div className="r-input-group">
                  <input 
                    type="text" 
                    name="otp" 
                    placeholder="Enter 6-digit OTP" 
                    value={formData.otp} 
                    onChange={handleInputChange} 
                    required 
                    maxLength="6"
                    style={{ letterSpacing: '4px', fontSize: '1.5rem', textAlign: 'center', fontWeight: 'bold', padding: '15px', width: '100%', borderRadius: '8px', border: '2px solid #fdba74' }}
                  />
                </div>

                <button 
                  type="button" 
                  className="r-btn-orange" 
                  style={{width: '100%', marginTop: '20px', padding: '14px'}} 
                  onClick={handleVerifyAndSubmit} 
                  disabled={isLoading}
                >
                  {isLoading ? 'Uploading Documents...' : 'Secure Submit'}
                </button>
                
                <button type="button" onClick={() => setSignupStep(3)} style={{background:'none', border:'none', cursor:'pointer', width:'100%', marginTop:'20px', color: '#64748b'}}>
                  Cancel and go back
                </button>
              </div>
            )}

            {/* STEP 5: SUCCESS / UNDER REVIEW */}
            {signupStep === 5 && (
              <div className="r-center-content animate-fade" style={{textAlign: 'center', padding: '20px 0'}}>
                <div className="r-hourglass-container" style={{fontSize: '48px', marginBottom: '20px'}}>
                  <span className="r-hourglass-icon">⏳</span>
                </div>
                <h2 className="r-form-title">Profile Under Review</h2>
                <p className="r-form-desc">Thanks for applying, <strong>{formData.name}</strong>!</p>
                
                <div className="r-review-box" style={{background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '20px', borderRadius: '8px', margin: '20px 0'}}>
                  Our onboarding team is reviewing your Driving License, RC, and Insurance. This usually takes <strong>24 hours</strong>.
                </div>
                
                <p className="r-review-subtext" style={{color: '#64748b', fontSize: '14px'}}>We will send you an email once your background check is clear and you can start accepting deliveries!</p>
                
                <button className="r-link-orange-bold mt-4" onClick={toggleMode} style={{background: 'none', border: 'none', cursor: 'pointer', marginTop: '20px', fontWeight: 'bold', color: '#ea580c'}}>
                  ← Return to Login Screen
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default RiderLogin;