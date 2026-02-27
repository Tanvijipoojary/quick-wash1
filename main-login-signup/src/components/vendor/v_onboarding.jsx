import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './v_onboarding.css';

const VendorOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', 
    hubName: '', address: '', capacity: ''
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.email) return;
    
    setIsLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
    }, 1000);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp.join('').length < 4) return;

    setIsLoading(true);
    // Simulate verifying OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep(2); // Move to Business Details
    }, 1200);
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

  // Step 1: Basic Registration & OTP
  const renderStep1 = () => (
    <div className="vonb-step-content">
      <div className="vonb-text-header">
        <h2>Create Vendor Account</h2>
        <p>Join the Quick Wash network and grow your laundry business.</p>
      </div>
      
      {!otpSent ? (
        <form onSubmit={handleSendOTP} style={{width: '100%'}}>
          <div className="vonb-input-group">
            <label>Full Name</label>
            <input type="text" name="fullName" placeholder="Anurag S." value={formData.fullName} onChange={handleInputChange} required />
          </div>
          <div className="vonb-input-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} required />
          </div>
          <div className="vonb-input-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="vendor@quickwash.com" value={formData.email} onChange={handleInputChange} required />
          </div>
          
          <button type="submit" className="vonb-action-btn" disabled={isLoading}>
            {isLoading ? 'Sending OTP...' : 'Send Verification OTP'}
          </button>
          <button type="button" className="vonb-text-btn" onClick={() => navigate('/vendor')}>
            Already have an account? Log in
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <p style={{textAlign: 'center', color: '#0f172a', fontWeight: '600', marginBottom: '24px'}}>
            Enter the 4-digit code sent to <br/><span style={{color: '#10b981'}}>{formData.phone}</span>
          </p>
          
          <div className="vonb-otp-container">
            {otp.map((data, index) => (
              <input
                key={index} type="text" maxLength="1" className="vonb-otp-input"
                value={data} onChange={(e) => handleOtpChange(e.target, index)}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>

          <button type="submit" className="vonb-action-btn" disabled={isLoading || otp.join('').length < 4}>
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>
          
          <button type="button" className="vonb-text-btn" onClick={() => setOtpSent(false)} style={{color: '#64748b'}}>
            Edit Phone/Email
          </button>
        </form>
      )}
    </div>
  );

  // Step 2: Hub Details
  const renderStep2 = () => (
    <div className="vonb-step-content">
      <div className="vonb-text-header">
        <h2>Business Profile</h2>
        <p>Tell us about your laundry hub capabilities.</p>
      </div>
      <div className="vonb-input-group">
        <label>Laundry Hub Name</label>
        <input type="text" name="hubName" placeholder="e.g. Premium Cleaners" value={formData.hubName} onChange={handleInputChange} />
      </div>
      <div className="vonb-input-group">
        <label>Daily Washing Capacity (Kg)</label>
        <input type="number" name="capacity" placeholder="e.g. 150" value={formData.capacity} onChange={handleInputChange} />
      </div>
      <div className="vonb-input-group">
        <label>Full Hub Address</label>
        <textarea name="address" rows="3" placeholder="Enter complete address..." value={formData.address} onChange={handleInputChange}></textarea>
      </div>
      <div className="vonb-btn-row">
        {/* Skip back to step 1 disables OTP screen so they don't have to re-verify if they just want to edit name */}
        <button className="vonb-back-btn" onClick={() => { setStep(1); setOtpSent(true); }}>Back</button>
        <button className="vonb-action-btn" style={{flex: 1, marginTop: 0}} onClick={handleNext}>Next: KYC Documents</button>
      </div>
    </div>
  );

  // Step 3: Document Uploads (Updated with PAN and Shop & Establishment)
  const renderStep3 = () => (
    <div className="vonb-step-content">
      <div className="vonb-text-header">
        <h2>KYC & Compliance</h2>
        <p>Upload required documents for verification.</p>
      </div>
      
      <div className="vonb-upload-scroll-area">
        <div className="vonb-upload-box">
          <div className="vonb-upload-header">
            <span className="vonb-upload-icon">📄</span>
            <div><strong>GST Registration</strong><small>PDF or JPG up to 5MB</small></div>
          </div>
          <button className="vonb-upload-btn">Upload</button>
        </div>

        <div className="vonb-upload-box">
          <div className="vonb-upload-header">
            <span className="vonb-upload-icon">🏬</span>
            <div><strong>Shop & Establishment</strong><small>Official License Copy</small></div>
          </div>
          <button className="vonb-upload-btn">Upload</button>
        </div>

        <div className="vonb-upload-box">
          <div className="vonb-upload-header">
            <span className="vonb-upload-icon">💳</span>
            <div><strong>Owner PAN Card</strong><small>Front side only</small></div>
          </div>
          <button className="vonb-upload-btn">Upload</button>
        </div>

        <div className="vonb-upload-box">
          <div className="vonb-upload-header">
            <span className="vonb-upload-icon">🪪</span>
            <div><strong>Aadhar Card</strong><small>Front and Back</small></div>
          </div>
          <button className="vonb-upload-btn">Upload</button>
        </div>

        <div className="vonb-upload-box">
          <div className="vonb-upload-header">
            <span className="vonb-upload-icon">🏦</span>
            <div><strong>Cancelled Cheque</strong><small>For Bank linking</small></div>
          </div>
          <button className="vonb-upload-btn">Upload</button>
        </div>
      </div>

      <div className="vonb-btn-row" style={{marginTop: '24px'}}>
        <button className="vonb-back-btn" onClick={handleBack}>Back</button>
        <button className="vonb-action-btn" style={{flex: 1, marginTop: 0}} onClick={handleNext}>Submit Application</button>
      </div>
    </div>
  );

  // Step 4: Under Verification Screen (Demo removed)
  const renderStep4 = () => (
    <div className="vonb-verification-content">
      <div className="vonb-pulse-ring">
        <div className="vonb-verify-icon">⏳</div>
      </div>
      <h2>Profile Under Verification</h2>
      <p>Thank you for submitting your details, <strong>{formData.fullName || 'Vendor'}</strong>!</p>
      <div className="vonb-info-card">
        Our admin team is reviewing your KYC documents and business profile. This process typically takes <strong>24 to 48 hours</strong>.
      </div>
      <p className="vonb-sub-text">You will receive an email and SMS notification once your account is activated and ready to receive orders.</p>
      
      <button className="vonb-text-btn" style={{marginTop: '32px'}} onClick={() => navigate('/vendor')}>
        ← Return to Login Screen
      </button>
    </div>
  );

  return (
    <div className="vonb-wrapper">
      <header className="vonb-top-header">
        <h2>Quick Wash <span>Vendor</span></h2>
      </header>

      <main className="vonb-main-area">
        
        {step < 4 && (
          <div className="vonb-stepper">
            <div className={`vonb-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`vonb-step-line ${step >= 2 ? 'active-line' : ''}`}></div>
            <div className={`vonb-step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`vonb-step-line ${step >= 3 ? 'active-line' : ''}`}></div>
            <div className={`vonb-step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>
        )}
        
        {step < 4 && (
          <div className="vonb-step-labels">
            <span style={{color: step >= 1 ? '#1b5e20' : '#94a3b8'}}>Account</span>
            <span style={{color: step >= 2 ? '#1b5e20' : '#94a3b8'}}>Business</span>
            <span style={{color: step >= 3 ? '#1b5e20' : '#94a3b8'}}>KYC Docs</span>
          </div>
        )}

        <div className="vonb-card">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

      </main>
    </div>
  );
};

export default VendorOnboarding;