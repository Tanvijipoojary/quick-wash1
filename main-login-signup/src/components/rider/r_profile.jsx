import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './r_profile.css';

const RiderProfile = () => {
  const navigate = useNavigate();
  
  // Modals State
  const [isEditPersonalOpen, setIsEditPersonalOpen] = useState(false);
  const [isEditVehicleOpen, setIsEditVehicleOpen] = useState(false);
  const [isEditKYCOpen, setIsEditKYCOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // --- REAL DYNAMIC RIDER DATA ---
  const [riderEmail, setRiderEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [profile, setProfile] = useState({
    id: '', // 👈 Added Database ID field
    name: 'Loading...',
    phone: '',
    email: '',
    city: 'Mangaluru', 
    vehicleType: '',
    regNo: '',
    kycStatus: 'Verified & Active',
    docs: { dl: 'Verified', rc: 'Verified', insurance: 'Verified', aadhar: 'Verified', pan: 'Verified' }
  });

  // Edit Forms State
  const [personalForm, setPersonalForm] = useState({ name: '', phone: '', email: '', city: '' });
  const [vehicleForm, setVehicleForm] = useState({ type: '', regNo: '' });

  // --- 1. FETCH LIVE DATA ON LOAD ---
  useEffect(() => {
    const fetchProfile = async () => {
      const savedRider = localStorage.getItem('quickwash_rider');
      if (!savedRider) {
        navigate('/'); 
        return;
      }
      
      const parsedData = JSON.parse(savedRider);
      setRiderEmail(parsedData.email);

      try {
        const res = await axios.get(`http://localhost:5000/api/riders/profile/${parsedData.email}`);
        const dbRider = res.data;

        setProfile(prev => ({
          ...prev,
          id: dbRider._id, // 👈 Pulling the actual ID from MongoDB!
          name: dbRider.name || 'Awesome Rider',
          phone: dbRider.phone || 'N/A',
          email: dbRider.email || 'N/A',
          vehicleType: dbRider.vehicle_type || dbRider.vehicleType || 'Two Wheeler',
          regNo: dbRider.vehicle_number || dbRider.vehicleNumber || 'N/A'
        }));
        
      } catch (error) {
        console.error("Failed to load rider profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Keep edit forms synced with the profile data
  useEffect(() => {
    setPersonalForm({ name: profile.name, phone: profile.phone, email: profile.email, city: profile.city });
    setVehicleForm({ type: profile.vehicleType, regNo: profile.regNo });
  }, [profile]);

  // --- 2. HANDLERS FOR UPDATING THE DATABASE ---
  
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/riders/profile', {
        email: riderEmail,
        name: personalForm.name,
        phone: personalForm.phone,
        vehicleType: profile.vehicleType,
        vehicleNumber: profile.regNo
      });
      
      setProfile({ ...profile, name: personalForm.name, phone: personalForm.phone });
      setIsEditPersonalOpen(false);
    } catch (error) {
      console.error("Error saving personal info:", error);
      alert("Failed to save changes.");
    }
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/riders/profile', {
        email: riderEmail,
        name: profile.name,
        phone: profile.phone,
        vehicleType: vehicleForm.type,
        vehicleNumber: vehicleForm.regNo
      });

      setProfile({ ...profile, vehicleType: vehicleForm.type, regNo: vehicleForm.regNo });
      setIsEditVehicleOpen(false);
    } catch (error) {
      console.error("Error saving vehicle info:", error);
      alert("Failed to update vehicle details.");
    }
  };

  const handleSaveKYC = (e) => {
    e.preventDefault();
    setProfile({ 
      ...profile, 
      kycStatus: 'Pending Verification',
      docs: { ...profile.docs, dl: 'Under Review' }
    });
    setIsEditKYCOpen(false);
    alert("Documents submitted for review!");
  };

  const handleLogout = () => {
    localStorage.removeItem('quickwash_rider');
    navigate('/'); 
  };

  if (isLoading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading Profile... ⏳</div>;

  return (
    <div className="rprof-container">
      
      <header className="rprof-header">
        <h1 className="rprof-title">My Profile</h1>
      </header>

      <main className="rprof-main-content">
        
        {/* --- PROFILE HERO CARD --- */}
        <div className="rprof-hero-card">
          <div className="rprof-avatar-ring">
            <div className="rprof-avatar-img">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <h2 className="rprof-name">{profile.name}</h2>
          <div className="rprof-badge-row">
            {/* 👈 Clean 6-character Database ID! */}
            <span className="rprof-id-badge">ID: {profile.id ? profile.id.slice(-6).toUpperCase() : '...'}</span>
            
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

        {/* --- 3. KYC DOCUMENTS (NOW ALL 5) --- */}
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
                <span>Aadhaar Card</span>
                <span className={`rprof-doc-status ${profile.docs.aadhar === 'Verified' ? 'green' : 'orange'}`}>{profile.docs.aadhar}</span>
              </div>
              <div className="rprof-doc-item">
                <span>PAN Card</span>
                <span className={`rprof-doc-status ${profile.docs.pan === 'Verified' ? 'green' : 'orange'}`}>{profile.docs.pan}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECURITY, POLICY, SUPPORT & LOGOUT --- */}
        <div className="rprof-action-buttons">
          
          <div className="rprof-settings-group">
            {/* 👇 UPDATED: Now points to About Us 👇 */}
            <button className="rprof-settings-btn" onClick={() => navigate('/rider-about')}>
              <div className="rprof-settings-content">
                <span className="rprof-settings-icon">ℹ️</span>
                <strong>About Us</strong>
              </div>
              <span className="rprof-settings-arrow">›</span>
            </button>
            
            <button className="rprof-settings-btn" onClick={() => navigate('/rider-policy')}>
              <div className="rprof-settings-content">
                <span className="rprof-settings-icon">📜</span>
                <strong>Privacy Policy</strong>
              </div>
              <span className="rprof-settings-arrow">›</span>
            </button>
          </div>

          <button className="rprof-btn-secondary" onClick={() => navigate('/rider-support')}>Help & Support</button>
          <button className="rprof-btn-danger" onClick={() => setIsLogoutModalOpen(true)}>Log Out</button>
        </div>
      </main>

      {/* =========================================
          MODALS
          ========================================= */}

      {/* 1. Edit Personal Modal */}
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
                <input type="email" value={personalForm.email} disabled style={{background: '#f1f5f9'}} />
              </div>
              <button type="submit" className="rprof-submit-btn" style={{marginTop: '8px'}}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Vehicle Modal */}
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
                  <option value="Two Wheeler (Bike/Scooter)">Petrol 2 Wheeler (Bike/Scooter)</option>
                  <option value="Bicycle">Electric 2 Wheeler</option>
                  
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

      {/* 3. KYC Modal (Static UI) */}
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
                <div className="rprof-upload-box"><div className="rprof-upload-info"><strong>🪪 Driving License</strong></div><button type="button" className="rprof-upload-btn">Upload</button></div>
                <div className="rprof-upload-box"><div className="rprof-upload-info"><strong>🏍️ RC Book</strong></div><button type="button" className="rprof-upload-btn">Upload</button></div>
                <div className="rprof-upload-box"><div className="rprof-upload-info"><strong>🛡️ Insurance</strong></div><button type="button" className="rprof-upload-btn">Upload</button></div>
                <div className="rprof-upload-box"><div className="rprof-upload-info"><strong>🆔 Aadhaar Card</strong></div><button type="button" className="rprof-upload-btn">Upload</button></div>
                <div className="rprof-upload-box"><div className="rprof-upload-info"><strong>💳 PAN Card</strong></div><button type="button" className="rprof-upload-btn">Upload</button></div>
              </div>
              <button type="submit" className="rprof-submit-btn" style={{marginTop: '12px'}}>Submit Documents</button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Support Modal */}
      {isSupportModalOpen && (
        <div className="rprof-modal-overlay">
          <div className="rprof-modal-card">
            <div className="rprof-modal-header">
              <h2>Help & Support</h2>
              <button className="rprof-close-btn" onClick={() => setIsSupportModalOpen(false)}>✕</button>
            </div>
            <div className="rprof-support-options">
              
              <button className="rprof-support-btn" onClick={() => alert("Dialing Quick Wash Hotline...")}>
                <span className="rprof-support-icon">📞</span>
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '4px', color: '#1e293b' }}>Call Hotline</strong>
                  <small style={{ color: '#64748b', fontSize: '0.85rem' }}>For urgent live order issues</small>
                </div>
              </button>

              <button className="rprof-support-btn" onClick={() => window.location.href = "mailto:support@quickwash.com"}>
                <span className="rprof-support-icon">✉️</span>
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '4px', color: '#1e293b' }}>Email Support</strong>
                  <small style={{ color: '#64748b', fontSize: '0.85rem' }}>For account & payment queries</small>
                </div>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* 5. Logout Confirmation */}
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
        <button className="rprof-nav-item" onClick={() => navigate('/rider-home')}><span className="rprof-nav-icon">🛵</span><small>Ride</small></button>
        <button className="rprof-nav-item" onClick={() => navigate('/rider-wallet')}><span className="rprof-nav-icon">💳</span><small>Wallet</small></button>
        <button className="rprof-nav-item" onClick={() => navigate('/rider-earnings')}><span className="rprof-nav-icon">💲</span><small>Earnings</small></button>
        <button className="rprof-nav-item active" onClick={() => navigate('/rider-profile')}><span className="rprof-nav-icon">👤</span><small>Profile</small></button>
      </footer>
    </div>
  );
};

export default RiderProfile;