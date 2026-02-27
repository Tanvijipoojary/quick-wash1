import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './r_onboarding.css';

const RiderOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  // Added 'email' to formData
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', city: '',
    vehicleType: 'Two Wheeler (Bike/Scooter)', vehicleNumber: ''
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOTP = (e) => {
    e.preventDefault();
    // Now requires email to proceed
    if (!formData.fullName || !formData.phone || !formData.email || !formData.city) return;
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setOtpSent(true); }, 1000);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp.join('').length < 4) return;
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setStep(2); }, 1200);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    let newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value !== '') element.nextSibling.focus();
  };

  // Step 1: Rider Basic Registration (Now with Email)
  const renderStep1 = () => (
    <div className="ronb-step-content">
      <div className="ronb-text-header">
        <h2>Become a Delivery Partner</h2>
        <p>Earn money delivering fresh laundry in your city.</p>
      </div>
      
      {!otpSent ? (
        <form onSubmit={handleSendOTP} style={{width: '100%'}}>
          <div className="ronb-input-group">
            <label>Full Name</label>
            <input type="text" name="fullName" placeholder="Enter full name" value={formData.fullName} onChange={handleInputChange} required />
          </div>
          <div className="ronb-input-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} required />
          </div>
          {/* NEW: Email Address Field */}
          <div className="ronb-input-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="rider@quickwash.com" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="ronb-input-group">
            <label>City</label>
            <input type="text" name="city" placeholder="e.g. Mangaluru" value={formData.city} onChange={handleInputChange} required />
          </div>
          <button type="submit" className="ronb-action-btn" disabled={isLoading}>
            {isLoading ? 'Sending OTP...' : 'Send OTP to Email'}
          </button>
          <button type="button" className="ronb-text-btn" onClick={() => navigate('/rider')}>
            Already registered? Log in
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          {/* UPDATED: Displays the Email Address instead of Phone */}
          <p style={{textAlign: 'center', color: '#2b2522', fontWeight: '600', marginBottom: '24px'}}>
            Enter the 4-digit code sent to <br/><span style={{color: '#eb6d1e'}}>{formData.email}</span>
          </p>
          <div className="ronb-otp-container">
            {otp.map((data, index) => (
              <input key={index} type="text" maxLength="1" className="ronb-otp-input" value={data} onChange={(e) => handleOtpChange(e.target, index)} onFocus={(e) => e.target.select()} />
            ))}
          </div>
          <button type="submit" className="ronb-action-btn" disabled={isLoading || otp.join('').length < 4}>
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>
          <button type="button" className="ronb-text-btn" onClick={() => setOtpSent(false)} style={{color: '#666'}}>Edit Details</button>
        </form>
      )}
    </div>
  );

  // Step 2: Vehicle Details
  const renderStep2 = () => (
    <div className="ronb-step-content">
      <div className="ronb-text-header">
        <h2>Vehicle Details</h2>
        <p>What will you be riding?</p>
      </div>
      <div className="ronb-input-group">
        <label>Vehicle Type</label>
        <select name="vehicleType" className="ronb-select" value={formData.vehicleType} onChange={handleInputChange}>
          <option value="Two Wheeler (Bike/Scooter)">Two Wheeler (Bike/Scooter)</option>
          <option value="Three Wheeler (Auto)">Three Wheeler (Auto)</option>
        </select>
      </div>
      <div className="ronb-input-group">
        <label>Vehicle Registration Number</label>
        <input type="text" name="vehicleNumber" placeholder="e.g. KA 19 AB 1234" value={formData.vehicleNumber} onChange={handleInputChange} style={{textTransform: 'uppercase'}}/>
      </div>
      <div className="ronb-btn-row">
        <button className="ronb-back-btn" onClick={() => { setStep(1); setOtpSent(true); }}>Back</button>
        <button className="ronb-action-btn" style={{flex: 1, marginTop: 0}} onClick={handleNext}>Next: KYC Documents</button>
      </div>
    </div>
  );

  // Step 3: Rider KYC (Now with Vehicle Insurance!)
  const renderStep3 = () => (
    <div className="ronb-step-content">
      <div className="ronb-text-header">
        <h2>Rider KYC Documents</h2>
        <p>Please provide clear photos of your original documents.</p>
      </div>
      
      <div className="ronb-upload-scroll-area">
        <div className="ronb-upload-box">
          <div className="ronb-upload-header">
            <span className="ronb-upload-icon">🪪</span>
            <div><strong>Driving License</strong><small>Front & Back</small></div>
          </div>
          <button className="ronb-upload-btn">Upload</button>
        </div>

        <div className="ronb-upload-box">
          <div className="ronb-upload-header">
            <span className="ronb-upload-icon">🏍️</span>
            <div><strong>RC Book / Smart Card</strong><small>Vehicle Registration</small></div>
          </div>
          <button className="ronb-upload-btn">Upload</button>
        </div>

        {/* NEW: Vehicle Insurance Box */}
        <div className="ronb-upload-box">
          <div className="ronb-upload-header">
            <span className="ronb-upload-icon">🛡️</span>
            <div><strong>Vehicle Insurance</strong><small>Valid Policy Copy</small></div>
          </div>
          <button className="ronb-upload-btn">Upload</button>
        </div>

        <div className="ronb-upload-box">
          <div className="ronb-upload-header">
            <span className="ronb-upload-icon">🆔</span>
            <div><strong>Aadhar Card</strong><small>Front & Back for Identity</small></div>
          </div>
          <button className="ronb-upload-btn">Upload</button>
        </div>

        <div className="ronb-upload-box">
          <div className="ronb-upload-header">
            <span className="ronb-upload-icon">💳</span>
            <div><strong>PAN Card</strong><small>For Payments</small></div>
          </div>
          <button className="ronb-upload-btn">Upload</button>
        </div>
      </div>

      <div className="ronb-btn-row" style={{marginTop: '24px'}}>
        <button className="ronb-back-btn" onClick={handleBack}>Back</button>
        <button className="ronb-action-btn" style={{flex: 1, marginTop: 0}} onClick={handleNext}>Submit Application</button>
      </div>
    </div>
  );

  // Step 4: Verification Pending
  const renderStep4 = () => (
    <div className="ronb-verification-content">
      <div className="ronb-pulse-ring">
        <div className="ronb-verify-icon">⏳</div>
      </div>
      <h2>Profile Under Review</h2>
      <p>Thanks for applying, <strong>{formData.fullName || 'Rider'}</strong>!</p>
      <div className="ronb-info-card">
        Our onboarding team is reviewing your Driving License, RC, and Insurance. This usually takes <strong>24 hours</strong>.
      </div>
      <p className="ronb-sub-text">We will send you an email once your background check is clear and you can start accepting deliveries!</p>
      
      <button className="ronb-text-btn" style={{marginTop: '32px'}} onClick={() => navigate('/rider')}>
        ← Return to Login Screen
      </button>
    </div>
  );

  return (
    <div className="ronb-wrapper">
      <header className="ronb-top-header">
        <h2>Quick Wash <span>Rider</span></h2>
      </header>
      <main className="ronb-main-area">
        {step < 4 && (
          <div className="ronb-stepper">
            <div className={`ronb-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`ronb-step-line ${step >= 2 ? 'active-line' : ''}`}></div>
            <div className={`ronb-step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`ronb-step-line ${step >= 3 ? 'active-line' : ''}`}></div>
            <div className={`ronb-step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>
        )}
        {step < 4 && (
          <div className="ronb-step-labels">
            <span style={{color: step >= 1 ? '#eb6d1e' : '#a0aab2'}}>Account</span>
            <span style={{color: step >= 2 ? '#eb6d1e' : '#a0aab2'}}>Vehicle</span>
            <span style={{color: step >= 3 ? '#eb6d1e' : '#a0aab2'}}>KYC</span>
          </div>
        )}
        <div className="ronb-card">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </main>
    </div>
  );
};

export default RiderOnboarding;