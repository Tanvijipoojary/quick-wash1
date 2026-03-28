import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './v_profile.css';

const VendorProfile = () => {
  const navigate = useNavigate();
  
  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  // Live Database Profile Data State
  const [profileData, setProfileData] = useState({
    hubName: '', owner: '', email: '', phone: '', address: '', adminStatus: 'Pending', shopImage: '',
    pricing: { washAndIron: 60 } 
  });
  
  const [isOpen, setIsOpen] = useState(true); 
  const [editForm, setEditForm] = useState({ ...profileData });

  // --- 1. FETCH LIVE PROFILE FROM MONGODB ---
  useEffect(() => {
    const fetchProfile = async () => {
      const savedVendorStr = localStorage.getItem('quickwash_vendor');
      
      if (!savedVendorStr) {
        navigate('/vendor-login'); 
        return;
      }
      
      const parsedVendor = JSON.parse(savedVendorStr);

      try {
        // Fetch real data from the backend
        const res = await axios.get(`http://localhost:5000/api/vendors/profile/${parsedVendor.email}`);
        const dbData = res.data;

        setProfileData({
          hubName: dbData.hubName || '',
          owner: dbData.name || '',
          email: dbData.email || '',
          phone: dbData.phone || '',
          address: dbData.address || '',
          adminStatus: dbData.status || 'Pending',
          shopImage: dbData.shopImage || '', // 👈 ADD THIS
          pricing: dbData.pricing || { washAndIron: 60 }
        });
        
        setIsOpen(dbData.is_open); // Set store toggle status
        setIsLoading(false); 
      } catch (error) {
        console.error("Failed to fetch profile from DB:", error);
        alert("Could not load profile data.");
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // --- 2. HANDLE TOGGLE SWITCH (STORE OPEN/CLOSED) ---
  const handleToggleStatus = async () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus); 

    try {
      await axios.put('http://localhost:5000/api/vendors/toggle-status', {
        email: profileData.email,
        is_open: newStatus
      });
    } catch (error) {
      console.error("Failed to update status", error);
      setIsOpen(!newStatus); // Revert switch if DB fails
      alert("Failed to update status on server.");
    }
  };

  // --- UPLOAD NEW SHOP IMAGE ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('shopImage', file);
    formData.append('email', profileData.email);

    try {
      const res = await axios.post('http://localhost:5000/api/vendors/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update the UI instantly with the new image!
      setProfileData({ ...profileData, shopImage: res.data.shopImage });
      alert("📸 Shop image updated successfully!");
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image.");
    }
  };

  // --- 3. SAVE PROFILE EDITS TO BACKEND ---
  const handleSaveProfile = async () => {
    // Stitch it back together!
    const stitchedAddress = `${editForm.shopNo}, ${editForm.area}, ${editForm.city}, ${editForm.pincode}`;

    try {
      await axios.put('http://localhost:5000/api/vendors/profile', {
        email: profileData.email, 
        hub_name: editForm.hubName,
        owner_name: editForm.owner,
        hub_address: stitchedAddress, // 👈 Send the stitched address
        pricing: editForm.pricing
      });
      
      // Update the screen instantly
      setProfileData({ ...editForm, address: stitchedAddress });
      setIsEditModalOpen(false);

      // Update LocalStorage
      const savedVendorStr = localStorage.getItem('quickwash_vendor');
      if (savedVendorStr) {
        const parsed = JSON.parse(savedVendorStr);
        localStorage.setItem('quickwash_vendor', JSON.stringify({
          ...parsed, name: editForm.hubName
        }));
      }

      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("❌ Failed to update profile.");
    }
  };

  const handleDocumentAction = (docName, action) => {
    setActiveDocument({ name: docName, action: action });
  };

  // --- 4. SECURE LOGOUT ---
  const handleLogout = () => {
    localStorage.removeItem('quickwash_vendor'); 
    navigate('/'); 
  };

  if (isLoading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading Profile... ⏳</div>;

  return (
    <div className="vprof-container">
      
      <header className="vprof-header">
        <button className="vprof-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="vprof-header-title">Business Profile</h1>
        <button className="vprof-menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </header>

      <main className="vprof-main-content">
        
        <div className="vprof-identity-card">
          <div className="vprof-identity-top">
            {/* 👇 NEW: Clickable Avatar with Image Support 👇 */}
            <div className="vprof-avatar-large" style={{ position: 'relative', overflow: 'hidden', padding: 0, cursor: 'pointer' }} onClick={() => document.getElementById('shopImageInput').click()}>
              
              {profileData.shopImage ? (
                <img src={`http://localhost:5000/uploads/${profileData.shopImage}`} alt="Shop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {profileData.hubName ? profileData.hubName.substring(0,2).toUpperCase() : 'QW'}
                </div>
              )}
              
              {/* Overlay edit icon */}
              <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '10px', textAlign: 'center', padding: '2px 0' }}>
                📷 EDIT
              </div>
              
              {/* Hidden file input */}
              <input type="file" id="shopImageInput" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            </div>
            {/* 👆 END NEW AVATAR 👆 */}
            
            <div className="vprof-identity-text">
              <h2>{profileData.hubName}</h2>
              <p>Owner: {profileData.owner}</p>
              <div className="vprof-rating">
                <span>⭐ 4.8</span>
                <small>(124 Reviews)</small>
              </div>
            </div>
          </div>
          
          <div className="vprof-completion-box">
            <div className="vprof-completion-text">
              <span>Profile Completion</span>
              <strong>{profileData.adminStatus === 'Active' ? '100%' : '85%'}</strong>
            </div>
            <div className="vprof-progress-bar">
              <div className="vprof-progress-fill" style={{ width: profileData.adminStatus === 'Active' ? '100%' : '85%', background: profileData.adminStatus === 'Active' ? '#10b981' : '#0ea5e9' }}></div>
            </div>
            <small>{profileData.adminStatus === 'Active' ? 'Your profile is fully verified!' : 'Waiting for Admin KYC verification.'}</small>
          </div>
        </div>

        <div className="vprof-section">
          <h3 className="vprof-section-title">Contact & Operations</h3>
          <div className="vprof-card">
            
            <div className="vprof-info-row">
              <div className="vprof-info-item">
                <span className="vprof-label">Registered Email</span>
                <span className="vprof-value" style={{fontSize: '0.9rem'}}>{profileData.email}</span>
              </div>
              <div className="vprof-info-item">
                <span className="vprof-label">Phone Number</span>
                <span className="vprof-value">{profileData.phone}</span>
              </div>
            </div>

            <div className="vprof-divider"></div>

            <div className="vprof-info-block">
              <span className="vprof-label">Core Service</span>
              <div className="vprof-tags-wrapper" style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                <span className="vprof-tag">Wash & Iron</span>
              </div>
            </div>

            <div className="vprof-divider"></div>

            <div className="vprof-info-block">
              <span className="vprof-label">Hub Address</span>
              <span className="vprof-value" style={{fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-line'}}>
                {profileData.address}
              </span>
            </div>

          </div>
        </div>

        {/* PRICING SECTION */}
        <div className="vprof-section">
          <h3 className="vprof-section-title">Current Pricing (per Kg)</h3>
          <div className="vprof-card">
            <div className="vprof-info-row" style={{ padding: '5px 0' }}>
              <span className="vprof-label">Standard Wash & Iron</span>
              <span className="vprof-value" style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.1rem' }}>
                ₹{profileData.pricing?.washAndIron || 60}
              </span>
            </div>
          </div>
        </div>

        <div className="vprof-section">
          <h3 className="vprof-section-title">Compliance & KYC</h3>
          <div className="vprof-card vprof-docs-card">
            
            {(() => {
              const isVerified = profileData.adminStatus === 'Active';
              const statusText = isVerified ? 'Verified' : 'Pending Review';
              const pillClass = isVerified ? 'vprof-pill-success' : 'vprof-pill-warning';

              const docs = [
                { name: 'GST Registration', icon: '📄' },
                { name: 'Shop & Establishment', icon: '🏬' },
                { name: 'Aadhar Card', icon: '🪪' },
                { name: 'Owner PAN Card', icon: '💳' },
                { name: 'Cancelled Cheque', icon: '🏦' }
              ];

              return docs.map((doc, idx) => (
                <div key={idx} className="vprof-doc-item" style={{ borderBottom: idx === 4 ? 'none' : '' }}>
                  <div className="vprof-doc-left">
                    <span className="vprof-doc-icon">{doc.icon}</span>
                    <div className="vprof-doc-text">
                      <strong>{doc.name}</strong>
                      <span className={`vprof-pill ${pillClass}`}>{statusText}</span>
                    </div>
                  </div>
                  <button className="vprof-doc-action" onClick={() => handleDocumentAction(doc.name, 'View')}>View</button>
                </div>
              ));
            })()}

          </div>
        </div>
        
        <button className="vprof-edit-btn" onClick={() => {
          // Ultra-Smart Split: Handles old addresses with extra commas perfectly!
          const parts = profileData.address ? profileData.address.split(',').map(p => p.trim()) : [];
          
          let parsedShopNo = '', parsedArea = '', parsedCity = 'Mangaluru', parsedPincode = '';
          
          if (parts.length >= 4) {
            parsedShopNo = parts[0];
            parsedPincode = parts[parts.length - 1]; // Always grabs the very last item
            parsedCity = parts[parts.length - 2];    // Always grabs the second-to-last item
            parsedArea = parts.slice(1, parts.length - 2).join(', '); // Merges everything in the middle!
          } else {
            // Fallback for short addresses
            parsedShopNo = parts[0] || '';
            parsedArea = parts[1] || '';
            parsedCity = parts[2] || 'Mangaluru';
            parsedPincode = parts[3] || '';
          }
          
          setEditForm({ 
            ...profileData,
            shopNo: parsedShopNo,
            area: parsedArea,
            city: parsedCity,
            pincode: parsedPincode
          }); 
          setIsEditModalOpen(true);
        }}>Edit Profile Details</button>

      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="vprof-modal-overlay">
          <div className="vprof-modal-box vprof-scrollable-modal">
            <button className="vprof-close-x" onClick={() => setIsEditModalOpen(false)}>✕</button>
            <h3 className="vprof-modal-title">Edit Details</h3>
            
            <div className="vprof-input-group">
              <label>Hub Name</label>
              <input type="text" value={editForm.hubName} onChange={(e) => setEditForm({...editForm, hubName: e.target.value})} />
            </div>
            
            <div className="vprof-row-inputs">
              <div className="vprof-input-group" style={{flex: 1}}>
                <label>Owner Name</label>
                <input type="text" value={editForm.owner} onChange={(e) => setEditForm({...editForm, owner: e.target.value})} />
              </div>
              <div className="vprof-input-group" style={{flex: 1}}>
                <label>Phone No.</label>
                <input type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
              </div>
            </div>

            {/* REPLACE THE OLD TEXTAREA WITH THIS: */}
            <div style={{ padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>📍 Hub Location Details</h4>
              
              <div className="vprof-input-group">
                <label>BUILDING / SHOP NO.</label>
                <input type="text" value={editForm.shopNo || ''} onChange={(e) => setEditForm({...editForm, shopNo: e.target.value})} required />
              </div>

              <div className="vprof-input-group">
                <label>STREET / ROAD / AREA</label>
                <input type="text" value={editForm.area || ''} onChange={(e) => setEditForm({...editForm, area: e.target.value})} required />
              </div>

              <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
                <div className="vprof-input-group" style={{ flex: 1, minWidth: 0 }}>
                  <label>CITY</label>
                  <input 
                    type="text" 
                    value={editForm.city || ''} 
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})} 
                    required 
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div className="vprof-input-group" style={{ flex: 1, minWidth: 0 }}>
                  <label>PINCODE</label>
                  <input 
                    type="text" 
                    value={editForm.pincode || ''} 
                    onChange={(e) => setEditForm({...editForm, pincode: e.target.value})} 
                    maxLength="6" 
                    required 
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
            {/* END OF REPLACEMENT */}

            <h4 style={{ marginTop: '20px', marginBottom: '10px', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>
              Update Pricing (₹ per Kg)
            </h4>
            
            <div className="vprof-input-group">
              <label>Wash & Iron</label>
              <input 
                type="number" 
                value={editForm.pricing?.washAndIron || 60} 
                onChange={(e) => setEditForm({...editForm, pricing: { washAndIron: e.target.value }})} 
              />
            </div>

            <button className="vprof-save-btn" onClick={handleSaveProfile} style={{ marginTop: '10px' }}>Save Changes</button>
          </div>
        </div>
      )}

      {/* Document Action Modal */}
      {activeDocument && (
        <div className="vprof-modal-overlay">
          <div className="vprof-modal-box" style={{textAlign: 'center', alignItems: 'center', padding: '40px 32px'}}>
            <button className="vprof-close-x" onClick={() => setActiveDocument(null)}>✕</button>
            <div className="vprof-modal-icon">📄</div>
            <h3 className="vprof-modal-title" style={{marginTop: '16px'}}>{activeDocument.action} Document</h3>
            <p className="vprof-modal-subtitle">You selected <strong>{activeDocument.name}</strong>.</p>
            <p style={{fontSize: '14px', color: '#64748b', marginBottom: '24px'}}>
              {activeDocument.action === 'View' ? 'This document is securely stored in the Quick Wash database.' : 'Upload a clear, scanned copy.'}
            </p>
            <button className="vprof-save-btn" style={{width: '100%'}} onClick={() => setActiveDocument(null)}>
              Close Viewer
            </button>
          </div>
        </div>
      )}

      {/* SLIDE-OUT SIDEBAR MENU */}
      {isSidebarOpen && (
        <div className="vprof-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}>
          <div className="vprof-sidebar" onClick={(e) => e.stopPropagation()}>
            
            <div className="vprof-sidebar-header" style={{ padding: '30px 20px', background: '#064e3b', color: 'white' }}>
              <div className="vprof-avatar-small" style={{ background: '#fff', color: '#064e3b', width: '55px', height: '55px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.4rem', marginBottom: '15px' }}>
                {(profileData.owner || profileData.hubName || 'V').substring(0,2).toUpperCase()}
              </div>
              <div className="vprof-sidebar-user-text">
                <h2 style={{ margin: '0 0 5px 0', fontSize: '1.3rem' }}>{profileData.owner || profileData.hubName}</h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#6ee7b7' }}>Active Vendor</p>
              </div>
            </div>

            <div className="vprof-sidebar-menu" style={{ padding: '10px 0' }}>
              
              <div className="vprof-side-item">
                <div className="vprof-side-left">
                  <span className="vprof-side-icon">⏱️</span>
                  <span className="vprof-side-label" style={{ fontWeight: '500' }}>{isOpen ? 'Store Open' : 'Store Closed'}</span>
                </div>
                <div className="vprof-toggle-wrapper">
                  <label className="vprof-toggle">
                    <input type="checkbox" checked={isOpen} onChange={handleToggleStatus}/>
                    <span className="vprof-slider"></span>
                  </label>
                </div>
              </div>
              
              <button className="vprof-side-item" onClick={() => navigate('/vendor-bank')}><div className="vprof-side-left"><span className="vprof-side-icon">💳</span><span className="vprof-side-label">Bank Management</span></div><span className="vprof-side-arrow">›</span></button>
              <button className="vprof-side-item" onClick={() => { setIsSidebarOpen(false); setIsEditModalOpen(true); }}><div className="vprof-side-left"><span className="vprof-side-icon" style={{color: '#10b981'}}>👤</span><span className="vprof-side-label" style={{color: '#10b981', fontWeight: '600'}}>Edit Profile</span></div><span className="vprof-side-arrow">›</span></button>
              
              <div style={{ height: '1px', background: '#e2e8f0', margin: '10px 20px' }}></div> 

              <button className="vprof-side-item" onClick={() => alert('Opening Privacy Policy...')}><div className="vprof-side-left"><span className="vprof-side-icon">🔒</span><span className="vprof-side-label">Privacy Policy</span></div><span className="vprof-side-arrow">›</span></button>
              <button className="vprof-side-item" onClick={() => alert('Opening About Us...')}><div className="vprof-side-left"><span className="vprof-side-icon">ℹ️</span><span className="vprof-side-label">About Us</span></div><span className="vprof-side-arrow">›</span></button>
              <button className="vprof-side-item" onClick={() => alert('Connecting to Support...')}><div className="vprof-side-left"><span className="vprof-side-icon">❓</span><span className="vprof-side-label">Help</span></div><span className="vprof-side-arrow">›</span></button>

              <div style={{ height: '1px', background: '#e2e8f0', margin: '10px 20px' }}></div> 

              <button className="vprof-side-item" onClick={handleLogout}><div className="vprof-side-left"><span className="vprof-side-icon" style={{color: '#e11d48'}}>🚪</span><span className="vprof-side-label" style={{color: '#e11d48', fontWeight: '600'}}>Logout</span></div></button>
            </div>
          </div>
        </div>
      )}

      <footer className="vprof-bottom-nav">
        <button className="vprof-nav-item" onClick={() => navigate('/vendor-home')}><span>🏠</span><small>Home</small></button>
        <button className="vprof-nav-item" onClick={() => navigate('/vendor-wallet')}><span>💳</span><small>Wallet</small></button>
        <button className="vprof-nav-item" onClick={() => navigate('/vendor-earnings')}><span>💲</span><small>Earnings</small></button>
        <button className="vprof-nav-item active"><span>👤</span><small>Profile</small></button>
      </footer>
    </div>
  );
};

export default VendorProfile;