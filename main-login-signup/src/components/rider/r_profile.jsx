import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './r_profile.css';

const RiderProfile = () => {
  const navigate = useNavigate();
  
  // Modals State
  const [isEditPersonalOpen, setIsEditPersonalOpen] = useState(false);
  const [isEditVehicleOpen, setIsEditVehicleOpen] = useState(false);
  const [isEditKYCOpen, setIsEditKYCOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // App Settings State
  const [notificationsOn, setNotificationsOn] = useState(true);

  // Rider Data State (Now contains ALL registration data)
  const [profile, setProfile] = useState({
    name: 'Anurag S',
    phone: '+91 98765 43210',
    email: 'anurag.s@quickwash.com',
    city: 'Mysuru',
    vehicleType: 'Two Wheeler (Scooter)',
    regNo: 'KA 09 AB 1234',
    rating: '4.8',
    kycStatus: 'Verified & Active',
    docs: {
      dl: 'Verified',
      rc: 'Verified',
      insurance: 'Verified',
      aadhar: 'Verified',
      pan: 'Verified'
    }
  });

  // Edit Forms State
  const [personalForm, setPersonalForm] = useState({ name: profile.name, phone: profile.phone, email: profile.email, city: profile.city });
  const [vehicleForm, setVehicleForm] = useState({ type: profile.vehicleType, regNo: profile.regNo });

  // Handlers
  const handleSavePersonal = (e) => {
    e.preventDefault();
    setProfile({ ...profile, ...personalForm });
    setIsEditPersonalOpen(false);
  };

  const handleSaveVehicle = (e) => {
    e.preventDefault();
    setProfile({ 
      ...profile, 
      vehicleType: vehicleForm.type, 
      regNo: vehicleForm.regNo
    });
    setIsEditVehicleOpen(false);
  };

  const handleSaveKYC = (e) => {
    e.preventDefault();
    setProfile({ 
      ...profile, 
      kycStatus: 'Pending Verification',
      docs: { ...profile.docs, dl: 'Under Review' } // Example: Assume they uploaded a new DL
    });
    setIsEditKYCOpen(false);
  };

  const handleLogout = () => {
    navigate('/rider'); // Send back to login screen
  };

  return (
    <div className="rprof-container">
      
      {/* --- HEADER --- */}
      <header className="rprof-header">
        <h1 className="rprof-title">My Profile</h1>
      </header>

      <main className="rprof-main-content">
        
        {/* --- PROFILE HERO CARD --- */}
        <div className="rprof-hero-card">
          <div className="rprof-avatar-ring">
            <div className="rprof-avatar-img">
              {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
          </div>
          <h2 className="rprof-name">{profile.name}</h2>
          <div className="rprof-badge-row">
            <span className="rprof-id-badge">ID: QW-R-8821</span>
            <span className="rprof-rating-badge">⭐ {profile.rating} Rating</span>
          </div>
        </div>

        {/* --- 1. PERSONAL DETAILS --- */}
        <div className="rprof-section">
          <div className="rprof-section-header">
            <h3>Personal Details</h3>
            <button className="rprof-text-btn" onClick={() => setIsEditPersonalOpen(true)}>Edit</button>
          </div>
          <div className="rprof-info-card">
            <div className="rprof-info-row">
              <span className="rprof-icon">👤</span>
              <div className="rprof-info-text">
                <small>Full Name</small>
                <strong>{profile.name}</strong>
              </div>
            </div>
            <div className="rprof-info-row">
              <span className="rprof-icon">📱</span>
              <div className="rprof-info-text">
                <small>Phone Number</small>
                <strong>{profile.phone}</strong>
              </div>
            </div>
            <div className="rprof-info-row">
              <span className="rprof-icon">✉️</span>
              <div className="rprof-info-text">
                <small>Email Address</small>
                <strong>{profile.email}</strong>
              </div>
            </div>
            <div className="rprof-info-row">
              <span className="rprof-icon">📍</span>
              <div className="rprof-info-text">
                <small>Service City</small>
                <strong>{profile.city}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. VEHICLE DETAILS --- */}
        <div className="rprof-section">
          <div className="rprof-section-header">
            <h3>Vehicle Details</h3>
            <button className="rprof-text-btn" onClick={() => setIsEditVehicleOpen(true)}>Edit</button>
          </div>
          <div className="rprof-info-card">
            <div className="rprof-info-row">
              <span className="rprof-icon">🛵</span>
              <div className="rprof-info-text">
                <small>Vehicle Type</small>
                <strong>{profile.vehicleType}</strong>
              </div>
            </div>
            <div className="rprof-info-row">
              <span className="rprof-icon">🪪</span>
              <div className="rprof-info-text">
                <small>Registration Number</small>
                <strong style={{textTransform: 'uppercase'}}>{profile.regNo}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* --- 3. KYC DOCUMENTS --- */}
        <div className="rprof-section">
          <div className="rprof-section-header">
            <h3>KYC Documents</h3>
            <button className="rprof-text-btn" onClick={() => setIsEditKYCOpen(true)}>Edit Docs</button>
          </div>
          <div className="rprof-info-card">
            <div className="rprof-info-row" style={{borderBottom: '1px dashed #e2ece6', paddingBottom: '12px'}}>
              <span className="rprof-icon">{profile.kycStatus === 'Verified & Active' ? '✅' : '⏳'}</span>
              <div className="rprof-info-text">
                <small>Overall Account Status</small>
                <strong style={{color: profile.kycStatus === 'Verified & Active' ? '#10b981' : '#d97706'}}>
                  {profile.kycStatus}
                </strong>
              </div>
            </div>
            
            {/* List of specific docs from onboarding */}
            <div className="rprof-doc-list">
              <div className="rprof-doc-item">
                <span>Driving License</span>
                <span className={`rprof-doc-status ${profile.docs.dl === 'Verified' ? 'green' : 'orange'}`}>{profile.docs.dl}</span>
              </div>
              <div className="rprof-doc-item">
                <span>RC Book / Smart Card</span>
                <span className={`rprof-doc-status ${profile.docs.rc === 'Verified' ? 'green' : 'orange'}`}>{profile.docs.rc}</span>
              </div>
              <div className="rprof-doc-item">
                <span>Vehicle Insurance</span>
                <span className={`rprof-doc-status ${profile.docs.insurance === 'Verified' ? 'green' : 'orange'}`}>{profile.docs.insurance}</span>
              </div>
              <div className="rprof-doc-item">
                <span>Aadhar Card</span>
                <span className={`rprof-doc-status ${profile.docs.aadhar === 'Verified' ? 'green' : 'orange'}`}>{profile.docs.aadhar}</span>
              </div>
              <div className="rprof-doc-item">
                <span>PAN Card</span>
                <span className={`rprof-doc-status ${profile.docs.pan === 'Verified' ? 'green' : 'orange'}`}>{profile.docs.pan}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- APP SETTINGS --- */}
        <div className="rprof-section">
          <h3>App Settings</h3>
          <div className="rprof-info-card" style={{ gap: '0' }}>
            <div className="rprof-settings-row">
              <div className="rprof-settings-text">
                <strong>Push Notifications</strong>
                <small>Get alerts for new trips</small>
              </div>
              <label className="rprof-switch">
                <input type="checkbox" checked={notificationsOn} onChange={() => setNotificationsOn(!notificationsOn)} />
                <span className="rprof-slider"></span>
              </label>
            </div>
            <div className="rprof-settings-divider"></div>
            <div className="rprof-settings-row">
              <div className="rprof-settings-text">
                <strong>Default Navigation</strong>
                <small>App used for directions</small>
              </div>
              <select className="rprof-select-nav">
                <option value="google">Google Maps</option>
                <option value="waze">Waze</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- SUPPORT & LOGOUT --- */}
        <div className="rprof-action-buttons">
          <button className="rprof-btn-secondary" onClick={() => setIsSupportModalOpen(true)}>
            Help & Support
          </button>
          <button className="rprof-btn-danger" onClick={() => setIsLogoutModalOpen(true)}>
            Log Out
          </button>
        </div>

      </main>

      {/* ========================================= */}
      {/* MODALS                    */}
      {/* ========================================= */}

      {/* --- 1. EDIT PERSONAL INFO MODAL --- */}
      {isEditPersonalOpen && (
        <div className="rprof-modal-overlay">
          <div className="rprof-modal-card">
            <div className="rprof-modal-header">
              <h2>Edit Personal Details</h2>
              <button className="rprof-close-btn" onClick={() => setIsEditPersonalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSavePersonal}>
              <div className="rprof-input-group">
                <label>Full Name</label>
                <input type="text" value={personalForm.name} onChange={(e) => setPersonalForm({...personalForm, name: e.target.value})} required />
              </div>
              <div className="rprof-input-group">
                <label>Phone Number</label>
                <input type="tel" value={personalForm.phone} onChange={(e) => setPersonalForm({...personalForm, phone: e.target.value})} required />
              </div>
              <div className="rprof-input-group">
                <label>Email Address</label>
                <input type="email" value={personalForm.email} onChange={(e) => setPersonalForm({...personalForm, email: e.target.value})} required />
              </div>
              <div className="rprof-input-group">
                <label>City</label>
                <input type="text" value={personalForm.city} onChange={(e) => setPersonalForm({...personalForm, city: e.target.value})} required />
              </div>
              <button type="submit" className="rprof-submit-btn" style={{marginTop: '8px'}}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* --- 2. EDIT VEHICLE MODAL --- */}
      {isEditVehicleOpen && (
        <div className="rprof-modal-overlay">
          <div className="rprof-modal-card">
            <div className="rprof-modal-header">
              <h2>Update Vehicle</h2>
              <button className="rprof-close-btn" onClick={() => setIsEditVehicleOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveVehicle}>
              <div className="rprof-input-group">
                <label>Vehicle Type</label>
                <select className="rprof-modal-select" value={vehicleForm.type} onChange={(e) => setVehicleForm({...vehicleForm, type: e.target.value})}>
                  <option value="Two Wheeler (Bike)">Two Wheeler (Bike)</option>
                  <option value="Two Wheeler (Scooter)">Two Wheeler (Scooter)</option>
                  <option value="Three Wheeler (Auto)">Three Wheeler (Auto)</option>
                </select>
              </div>
              <div className="rprof-input-group">
                <label>Registration Number</label>
                <input type="text" value={vehicleForm.regNo} onChange={(e) => setVehicleForm({...vehicleForm, regNo: e.target.value})} style={{textTransform: 'uppercase'}} required />
              </div>
              <button type="submit" className="rprof-submit-btn" style={{marginTop: '16px'}}>Update Vehicle</button>
            </form>
          </div>
        </div>
      )}

      {/* --- 3. EDIT KYC DOCUMENTS MODAL --- */}
      {isEditKYCOpen && (
        <div className="rprof-modal-overlay">
          <div className="rprof-modal-card rprof-modal-scrollable">
            <div className="rprof-modal-header">
              <h2>Update KYC Documents</h2>
              <button className="rprof-close-btn" onClick={() => setIsEditKYCOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveKYC}>
              <p className="rprof-modal-subtitle">Upload clear photos of your original documents to update your profile.</p>
              
              <div className="rprof-upload-grid">
                <div className="rprof-upload-box">
                  <div className="rprof-upload-info">
                    <strong>🪪 Driving License</strong>
                    <small>Front & Back</small>
                  </div>
                  <button type="button" className="rprof-upload-btn">Upload</button>
                </div>

                <div className="rprof-upload-box">
                  <div className="rprof-upload-info">
                    <strong>🏍️ RC Book / Smart Card</strong>
                    <small>Vehicle Registration</small>
                  </div>
                  <button type="button" className="rprof-upload-btn">Upload</button>
                </div>

                <div className="rprof-upload-box">
                  <div className="rprof-upload-info">
                    <strong>🛡️ Vehicle Insurance</strong>
                    <small>Valid Policy Copy</small>
                  </div>
                  <button type="button" className="rprof-upload-btn">Upload</button>
                </div>

                <div className="rprof-upload-box">
                  <div className="rprof-upload-info">
                    <strong>🆔 Aadhar Card</strong>
                    <small>Identity Proof</small>
                  </div>
                  <button type="button" className="rprof-upload-btn">Upload</button>
                </div>

                <div className="rprof-upload-box">
                  <div className="rprof-upload-info">
                    <strong>💳 PAN Card</strong>
                    <small>For Payments</small>
                  </div>
                  <button type="button" className="rprof-upload-btn">Upload</button>
                </div>
              </div>

              <p className="rprof-modal-note" style={{marginTop: '16px'}}>
                Any updated documents will be reviewed by our team within 24 hours.
              </p>
              
              <button type="submit" className="rprof-submit-btn">Submit Documents</button>
            </form>
          </div>
        </div>
      )}

      {/* --- 4. HELP & SUPPORT MODAL --- */}
      {isSupportModalOpen && (
        <div className="rprof-modal-overlay">
          <div className="rprof-modal-card">
            <div className="rprof-modal-header">
              <h2>Help & Support</h2>
              <button className="rprof-close-btn" onClick={() => setIsSupportModalOpen(false)}>✕</button>
            </div>
            <div className="rprof-support-options">
              <button className="rprof-support-btn" onClick={() => alert("Opening Live Chat...")}>
                <span className="rprof-support-icon">💬</span>
                <div>
                  <strong>Chat with Support</strong>
                  <small>Average wait: 2 mins</small>
                </div>
              </button>
              <button className="rprof-support-btn" onClick={() => alert("Dialing Quick Wash Hotline...")}>
                <span className="rprof-support-icon">📞</span>
                <div>
                  <strong>Call Hotline</strong>
                  <small>For urgent live order issues</small>
                </div>
              </button>
              <button className="rprof-support-btn" onClick={() => alert("Opening FAQ PDF...")}>
                <span className="rprof-support-icon">📖</span>
                <div>
                  <strong>Read FAQs</strong>
                  <small>App guides and payout info</small>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 5. LOGOUT CONFIRMATION MODAL --- */}
      {isLogoutModalOpen && (
        <div className="rprof-modal-overlay">
          <div className="rprof-modal-card" style={{textAlign: 'center', padding: '32px 24px'}}>
            <div className="rprof-logout-icon">👋</div>
            <h2 style={{margin: '0 0 8px 0', color: '#2b2522'}}>Ready to log out?</h2>
            <p style={{margin: '0 0 24px 0', color: '#666', lineHeight: '1.5'}}>You won't be able to receive any new laundry trips until you log back in.</p>
            <div style={{display: 'flex', gap: '12px'}}>
              <button className="rprof-btn-secondary" style={{flex: 1, margin: 0}} onClick={() => setIsLogoutModalOpen(false)}>Cancel</button>
              <button className="rprof-btn-danger" style={{flex: 1, margin: 0, padding: '16px'}} onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION --- */}
      <footer className="rprof-bottom-nav">
        <button className="rprof-nav-item" onClick={() => navigate('/rider-home')}>
          <span className="rprof-nav-icon">🛵</span><small>Ride</small>
        </button>
        <button className="rprof-nav-item" onClick={() => navigate('/rider-wallet')}>
          <span className="rprof-nav-icon">💳</span><small>Wallet</small>
        </button>
        <button className="rprof-nav-item" onClick={() => navigate('/rider-earnings')}>
          <span className="rprof-nav-icon">💲</span><small>Earnings</small>
        </button>
        <button className="rprof-nav-item active" onClick={() => navigate('/rider-profile')}>
          <span className="rprof-nav-icon">👤</span><small>Profile</small>
        </button>
      </footer>

    </div>
  );
};

export default RiderProfile;