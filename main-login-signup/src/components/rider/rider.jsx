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

  // --- DATA STATES ---
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', city: '', 
    vehicleType: 'Two Wheeler (Bike/Scooter)', vehicleNumber: ''
  });
  
  const [docs, setDocs] = useState({
    dl: null, rc: null, insurance: null, aadhaar: null, pan: null
  });

  // --- FORM HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e, key) => {
    setDocs({ ...docs, [key]: e.target.files[0] });
    setError('');
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setSignupStep(1);
    setFormData({ ...formData, password: '' }); 
    setError('');
  };

  // ==========================================
  // 🚀 LOGIN FLOW (PASSWORD BASED)
  // ==========================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return setError("Email and Password are required.");
    setIsLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/rider-login', { 
        email: formData.email.toLowerCase(),
        password: formData.password
      });
      
      if (res.status === 200) {
        localStorage.setItem('riderEmail', formData.email.toLowerCase());
        navigate('/rider-home'); 
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🚀 SIGNUP FLOW (WITH PASSWORD)
  // ==========================================
  const handleSignupSubmit = async () => {
    if (!docs.dl || !docs.rc || !docs.insurance || !docs.aadhaar || !docs.pan) {
      return setError("⚠️ Please upload all 5 required KYC documents.");
    }
    setIsLoading(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email.toLowerCase());
    data.append('phone', formData.phone);
    data.append('password', formData.password); 
    data.append('city', formData.city);
    data.append('vehicleType', formData.vehicleType);
    data.append('vehicleNumber', formData.vehicleNumber);
    
    data.append('dl', docs.dl);
    data.append('rc', docs.rc);
    data.append('insurance', docs.insurance);
    data.append('aadhaar', docs.aadhaar);
    data.append('pan', docs.pan);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/rider-signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.status === 201) {
        setSignupStep(4); 
      }
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="r-page-container">
      
      {/* --- SIGNUP STEPPER HEADER --- */}
      {!isLoginMode && signupStep < 4 && (
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
        
        {error && <div className="r-error animate-fade">{error}</div>}

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
                <button type="button" className="r-link-orange-bold" onClick={toggleMode}>
                  Not registered? Partner with Us
                </button>
                <button type="button" className="r-link-dark" onClick={() => navigate('/')}>
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
            
            {/* STEP 1: ACCOUNT DETAILS (NOW MATCHES CUSTOMER SIGNUP EXACTLY) */}
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
                
                <button type="submit" className="r-btn-orange-pill">Next</button>
                
                <div className="r-centered-link mt-4">
                  <button type="button" className="r-link-orange-bold" onClick={toggleMode}>Already registered? Log in</button>
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
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange}>
                    <option>Two Wheeler (Bike/Scooter)</option>
                    <option>Bicycle</option>
                  </select>
                </div>
                <div className="r-input-group">
                  <label>Vehicle Registration Number</label>
                  <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} placeholder="e.g. KA 19 XX 0000" />
                </div>
                
                <div className="r-btn-row">
                  <button className="r-btn-lightgray" onClick={() => setSignupStep(1)}>Back</button>
                  <button className="r-btn-orange flex-1" onClick={() => setSignupStep(3)} disabled={!formData.vehicleNumber}>Next: KYC Documents</button>
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
                    <div className="r-kyc-item" key={doc.key}>
                      <div className="r-kyc-info">
                        <span className="r-kyc-icon">{doc.icon}</span>
                        <div>
                          <h4>{doc.label}</h4>
                          <p>{doc.desc}</p>
                        </div>
                      </div>
                      <label className="r-kyc-upload-btn">
                        {docs[doc.key] ? "✅ Uploaded" : "Upload"}
                        <input type="file" hidden accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e, doc.key)} />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="r-btn-row">
                  <button className="r-btn-lightgray" onClick={() => setSignupStep(2)}>Back</button>
                  <button className="r-btn-orange flex-1" onClick={handleSignupSubmit} disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS / UNDER REVIEW */}
            {signupStep === 4 && (
              <div className="r-center-content animate-fade">
                <div className="r-hourglass-container">
                  <span className="r-hourglass-icon">⏳</span>
                </div>
                <h2 className="r-form-title">Profile Under Review</h2>
                <p className="r-form-desc">Thanks for applying, <strong>{formData.name}</strong>!</p>
                
                <div className="r-review-box">
                  Our onboarding team is reviewing your Driving License, RC, and Insurance. This usually takes <strong>24 hours</strong>.
                </div>
                
                <p className="r-review-subtext">We will send you an email once your background check is clear and you can start accepting deliveries!</p>
                
                <button className="r-link-orange-bold mt-4" onClick={toggleMode}>← Return to Login Screen</button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default RiderLogin;