import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './vendor.css';
import axios from 'axios';

const VendorLogin = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); 

  // Signup States
  const [signupStep, setSignupStep] = useState(1);

  // Form Data (Completely removed capacity!)
  const [formData, setFormData] = useState({ 
    email: '', name: '', phone: '', password: '', hubName: '', otp: '',
    shopNo: '', area: '', city: 'Mangaluru', pincode: '' 
  });

  const [docs, setDocs] = useState({ 
    gst: null, shopAct: null, aadhaar: null, pan: null, cheque: null 
  });

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleFileChange = (e, docName) => {
    setDocs({ ...docs, [docName]: e.target.files[0] });
    setErrorMessage('');
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setSignupStep(1);
    setErrorMessage('');
    setSuccessMessage('');
    setFormData({ ...formData, password: '', otp: '' }); 
  };

  // Helper to stitch the address together
  const getFullAddress = () => {
    return `${formData.shopNo}, ${formData.area}, ${formData.city}, ${formData.pincode}`;
  };

  // ==========================================
  // 🚀 LOGIN FLOW
  // ==========================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return setErrorMessage("Email and Password are required.");
    }
    
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/vendor-login', {
        email: formData.email.toLowerCase(),
        password: formData.password
      });

      if (response.status === 200) {
        const vendorDataFromDB = response.data.vendor || response.data;
        const vendorSession = {
          shopId: vendorDataFromDB._id, 
          name: vendorDataFromDB.hubName || vendorDataFromDB.name,
          email: vendorDataFromDB.email
        };

        localStorage.setItem('quickwash_vendor', JSON.stringify(vendorSession));
        navigate('/vendor-home'); 
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🚀 SIGNUP STEP A: REQUEST OTP
  // ==========================================
  const handleRequestOTP = async () => {
    // 👇 Capacity has been removed from this blocker! 👇
    if (!formData.email || !formData.name || !formData.phone || !formData.password || !formData.hubName || !formData.shopNo || !formData.area || !formData.pincode) {
      setErrorMessage("⚠️ Please fill in all text fields, including full address.");
      return;
    }

    if (formData.pincode.length !== 6) {
      setErrorMessage("⚠️ Please enter a valid 6-digit Pincode.");
      return;
    }

    if (!docs.gst || !docs.shopAct || !docs.pan || !docs.aadhaar || !docs.cheque) {
      setErrorMessage("⚠️ Please upload all 5 required KYC documents.");
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/vendors/send-vendor-otp', {
        email: formData.email.toLowerCase()
      });
      
      if (response.status === 200) {
        setSuccessMessage("OTP sent to your email!");
        setSignupStep(4); 
      }
    } catch (error) {
      console.error("OTP request failed:", error);
      setErrorMessage(error.response?.data?.message || "⚠️ Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🚀 SIGNUP STEP B: VERIFY OTP & UPLOAD DOCS
  // ==========================================
  const handleVerifyAndSubmit = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setErrorMessage("⚠️ Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const data = new FormData();
    data.append('email', formData.email.toLowerCase());
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('password', formData.password); 
    data.append('hubName', formData.hubName);
    data.append('otp', formData.otp); 
    
    // 👇 STITCH THE ADDRESS TOGETHER HERE 👇
    data.append('address', getFullAddress());
    
    data.append('gst', docs.gst);
    data.append('shopAct', docs.shopAct);
    data.append('pan', docs.pan);
    data.append('aadhaar', docs.aadhaar);
    data.append('cheque', docs.cheque);

    try {
      const response = await axios.post('http://localhost:5000/api/vendors/vendor-signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.status === 201) {
        setSignupStep(5); 
      }
    } catch (error) {
      console.error("Signup failed:", error);
      setErrorMessage(error.response?.data?.message || "⚠️ Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="v-page-container">
      
      {/* --- SIGNUP STEPPER HEADER --- */}
      {!isLoginMode && signupStep < 5 && (
        <div className="v-signup-header animate-fade">
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

      {/* --- MAIN CARD --- */}
      <div className={`v-card ${isLoginMode ? 'login-card' : 'signup-card'}`}>
        
        {isLoginMode ? (
          /* =========================================
             LOGIN MODE 
             ========================================= */
          <div className="animate-fade">
            <div className="v-header-section">
              <h1 className="v-brand-title">QUICK WASH</h1>
              <p className="v-brand-subtitle">Shop Owner Portal</p>
              <div className="v-divider"></div>
            </div>

            <form className="v-form" onSubmit={handleLoginSubmit}>
              <h2 className="v-form-title">Vendor Log In</h2>
              <p className="v-form-desc">Enter your credentials to manage your shop.</p>
              
              {errorMessage && <p className="v-error" style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '5px' }}>{errorMessage}</p>}

              <div className="v-input-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="e.g., vendor@example.com" value={formData.email} onChange={handleInputChange} required />
              </div>

              <div className="v-input-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleInputChange} required />
              </div>

              <button type="submit" className="v-btn-teal" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Secure Log In'}
              </button>

              <div className="v-footer-links">
                <button type="button" className="v-link-teal" onClick={toggleMode} style={{background:'none', border:'none', cursor:'pointer', fontWeight:'bold', marginTop:'15px'}}>
                  Not registered? Partner with Us
                </button>
                <button type="button" className="v-link-dark" onClick={() => navigate('/')} style={{background:'none', border:'none', cursor:'pointer', marginTop:'10px'}}>
                  ← Back to Main App
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* =========================================
             SIGNUP MODE 
             ========================================= */
          <div className="animate-fade">
            
            {/* STEP 1: ACCOUNT DETAILS */}
            {signupStep === 1 && (
              <form className="v-form" onSubmit={(e) => { e.preventDefault(); setSignupStep(2); }}>
                <h2 className="v-form-title dark">Create Vendor Account</h2>
                <p className="v-form-desc gray">Join the Quick Wash network and grow your laundry business.</p>

                {errorMessage && <p className="v-error" style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '5px' }}>{errorMessage}</p>}

                <div className="v-input-group">
                  <label>FULL NAME</label>
                  <input type="text" name="name" placeholder="e.g., Anurag S." value={formData.name} onChange={handleInputChange} required />
                </div>
                
                <div className="v-input-group">
                  <label>PHONE NUMBER</label>
                  <input type="tel" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} required />
                </div>
                
                <div className="v-input-group">
                  <label>EMAIL ADDRESS</label>
                  <input type="email" name="email" placeholder="vendor@quickwash.com" value={formData.email} onChange={handleInputChange} required />
                </div>

                <div className="v-input-group">
                  <label>CREATE PASSWORD</label>
                  <input type="password" name="password" placeholder="Create a secure password" value={formData.password} onChange={handleInputChange} required minLength="6" />
                </div>

                <button type="submit" className="v-btn-darkgreen">Next</button>
                
                <button type="button" className="v-link-gray mt-4" onClick={toggleMode} style={{background:'none', border:'none', cursor:'pointer', width:'100%', marginTop:'15px', fontWeight:'bold'}}>
                  Already registered? Log In
                </button>
              </form>
            )}

            {/* STEP 2: BUSINESS PROFILE (STRUCTURED ADDRESS) */}
            {signupStep === 2 && (
              <div className="v-form animate-fade">
                <h2 className="v-form-title dark">Business Profile</h2>
                <p className="v-form-desc gray">Tell us about your laundry hub and its exact location.</p>
                
                <div className="v-input-group">
                  <label>LAUNDRY HUB NAME</label>
                  <input type="text" name="hubName" placeholder="e.g. Premium Cleaners" value={formData.hubName} onChange={handleInputChange} required />
                </div>

                <div style={{ padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>📍 Hub Location Details</h4>
                  
                  <div className="v-input-group">
                    <label>BUILDING / SHOP NO.</label>
                    <input type="text" name="shopNo" placeholder="e.g. Shop No. 12, Ground Floor" value={formData.shopNo} onChange={handleInputChange} required />
                  </div>

                  <div className="v-input-group">
                    <label>STREET / ROAD / AREA</label>
                    <input type="text" name="area" placeholder="e.g. MG Road, Near City Center" value={formData.area} onChange={handleInputChange} required />
                  </div>

                  <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
                    <div className="v-input-group" style={{ flex: 1, minWidth: 0 }}>
                      <label>CITY</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange} 
                        required 
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div className="v-input-group" style={{ flex: 1, minWidth: 0 }}>
                      <label>PINCODE</label>
                      <input 
                        type="text" 
                        name="pincode" 
                        placeholder="e.g. 575001" 
                        value={formData.pincode} 
                        onChange={handleInputChange} 
                        maxLength="6" 
                        required 
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="v-btn-row" style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                  <button type="button" className="v-btn-lightgray" onClick={() => setSignupStep(1)}>Back</button>
                  <button type="button" className="v-btn-darkgreen" style={{flex: 1}} onClick={() => setSignupStep(3)}>Next: KYC Documents</button>
                </div>
              </div>
            )}

            {/* STEP 3: KYC UPLOADS */}
            {signupStep === 3 && (
              <div className="v-form animate-fade">
                <h2 className="v-form-title dark">KYC & Compliance</h2>
                <p className="v-form-desc gray">Upload required documents for verification.</p>

                {errorMessage && <p className="v-error" style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '5px' }}>{errorMessage}</p>}

                <div className="v-kyc-scroll-area">
                  {[
                    { key: 'gst', title: 'GST Registration', desc: 'PDF or JPG up to 5MB', icon: '📄' },
                    { key: 'shopAct', title: 'Shop & Establishment', desc: 'Official License Copy', icon: '🏬' },
                    { key: 'pan', title: 'Owner PAN Card', desc: 'Front side only', icon: '💳' },
                    { key: 'aadhaar', title: 'Aadhar Card', desc: 'Front and Back', icon: '🪪' },
                    { key: 'cheque', title: 'Cancelled Cheque', desc: 'For Bank linking', icon: '🏦' }
                  ].map((doc, idx) => (
                    <div key={idx} className="v-kyc-item" style={{display:'flex', flexDirection:'column', gap:'10px', border:'1px dashed #ccc', padding:'15px', borderRadius:'10px', marginBottom:'10px'}}>
                      <div className="v-kyc-info" style={{display:'flex', gap:'10px', alignItems:'center'}}>
                        <span className="v-kyc-icon" style={{fontSize:'24px'}}>{doc.icon}</span>
                        <div>
                          <h4 style={{margin:0, fontSize:'14px'}}>{doc.title}</h4>
                          <p style={{margin:0, fontSize:'12px', color:'#666'}}>{doc.desc}</p>
                        </div>
                      </div>
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e, doc.key)} style={{fontSize: '0.8rem', padding: '5px'}}/>
                    </div>
                  ))}
                </div>

                <div className="v-btn-row mt-4" style={{display:'flex', gap:'15px', marginTop:'20px'}}>
                  <button type="button" className="v-btn-lightgray" onClick={() => setSignupStep(2)}>Back</button>
                  <button type="button" className="v-btn-darkgreen" style={{flex: 1}} onClick={handleRequestOTP} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Verify Email & Submit'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: OTP VERIFICATION */}
            {signupStep === 4 && (
              <div className="v-form animate-fade" style={{textAlign: 'center', padding: '20px 0'}}>
                <h2 className="v-form-title dark">Verify Your Email</h2>
                <p className="v-form-desc gray" style={{marginBottom: '25px'}}>
                  We've sent a 6-digit code to <strong>{formData.email}</strong>. Enter it below to complete your registration.
                </p>

                {errorMessage && <p className="v-error" style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '5px', textAlign: 'left' }}>{errorMessage}</p>}
                {successMessage && <p className="v-success" style={{ color: '#166534', background: '#dcfce7', padding: '10px', borderRadius: '5px', textAlign: 'left', marginBottom: '15px' }}>{successMessage}</p>}

                <div className="v-input-group">
                  <input 
                    type="text" 
                    name="otp" 
                    placeholder="Enter 6-digit OTP" 
                    value={formData.otp} 
                    onChange={handleInputChange} 
                    required 
                    maxLength="6"
                    style={{ letterSpacing: '4px', fontSize: '1.5rem', textAlign: 'center', fontWeight: 'bold', padding: '15px' }}
                  />
                </div>

                <button 
                  type="button" 
                  className="v-btn-darkgreen" 
                  style={{width: '100%', marginTop: '20px'}} 
                  onClick={handleVerifyAndSubmit} 
                  disabled={isLoading}
                >
                  {isLoading ? 'Uploading Documents...' : 'Secure Submit'}
                </button>
                
                <button type="button" className="v-link-gray mt-4" onClick={() => setSignupStep(3)} style={{background:'none', border:'none', cursor:'pointer', width:'100%', marginTop:'15px'}}>
                  Cancel and go back
                </button>
              </div>
            )}

            {/* STEP 5: SUCCESS */}
            {signupStep === 5 && (
              <div className="v-form v-center-content animate-fade" style={{textAlign:'center'}}>
                <div className="v-hourglass-container" style={{fontSize:'40px', marginBottom:'15px'}}>⏳</div>
                <h2 className="v-form-title dark">Profile Under Review</h2>
                <p className="v-form-desc gray">Thanks for applying, <strong>{formData.name || 'Vendor'}</strong>!</p>
                <div className="v-review-box" style={{background:'#f9f9f9', padding:'20px', borderRadius:'10px', border:'1px dashed #ccc', margin:'20px 0'}}>
                  Our admin team is reviewing your details and verifying your documents. This usually takes <strong>24 to 48 hours</strong>.
                </div>
                <button type="button" className="v-link-teal-bold mt-4" onClick={toggleMode} style={{background:'none', border:'none', color:'#0d9488', fontWeight:'bold', cursor:'pointer'}}>
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

export default VendorLogin;