import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './v_profile.css';

const VendorProfile = () => {
  const navigate = useNavigate();
  
  // Sidebar & Status State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vendor, setVendor] = useState(null);

  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Profile Data State
  // Dynamic Profile Data State
  const [profileData, setProfileData] = useState({
    hubName: '', owner: '', capacity: '', turnaround: '', services: '', address: '', adminStatus: 'Pending',
    // 👇 ADD PRICING HERE
    pricing: { washAndFold: 40, washAndIron: 60, dryClean: 80 } 
  });
  
  // This state controls the Open/Closed switch and talks to the database
  const [isOpen, setIsOpen] = useState(true); 
  const [editForm, setEditForm] = useState({ ...profileData });

  // --- 1. FETCH PROFILE ON LOAD ---
  useEffect(() => {
    // Look for the NEW database session we created
    const savedVendorStr = localStorage.getItem('quickwash_vendor');
    
    if (savedVendorStr) {
      setVendor(JSON.parse(savedVendorStr));
    } else {
      // If it fails, THIS is what kicks you out. 
      // Make sure it's not failing because it's looking for the wrong localStorage key!
      navigate('/vendor-login'); 
    }
  }, [navigate]);

  // --- NEW: HANDLE TOGGLE SWITCH ---
  const handleToggleStatus = async () => {
    const email = localStorage.getItem('vendorEmail');
    const newStatus = !isOpen;
    setIsOpen(newStatus); // Instantly flip UI switch for a fast user experience

    try {
      await axios.put('http://localhost:5000/api/vendors/toggle-status', {
        email: email,
        is_open: newStatus
      });
    } catch (error) {
      console.error("Failed to update status", error);
      setIsOpen(!newStatus); // Flip it back if the database fails
      alert("Failed to update status on server.");
    }
  };

  // --- 2. SAVE PROFILE EDITS TO BACKEND ---
  const handleSaveProfile = async () => {
    const email = localStorage.getItem('vendorEmail');
    try {
      await axios.put('http://localhost:5000/api/vendors/profile', {
        email: email,
        hub_name: editForm.hubName,
        owner_name: editForm.owner,
        washing_capacity_kg: editForm.capacity,
        turnaround_time: editForm.turnaround,
        services: editForm.services,
        hub_address: editForm.address,
        pricing: editForm.pricing
      });
      
      setProfileData({ ...editForm });
      setIsEditModalOpen(false);
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("❌ Failed to update profile.");
    }
  };

  const handleDocumentAction = (docName, action) => {
    setActiveDocument({ name: docName, action: action });
  };

  // --- 3. SECURE LOGOUT ---
  const handleLogout = () => {
    localStorage.removeItem('vendorEmail'); // Delete the saved login
    navigate('/'); // Send back to main screen
  };

  if (isLoading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading Profile... ⏳</div>;

  return (
    <div className="vprof-container">
      
      <header className="vprof-header">
        <button className="vprof-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="vprof-header-title">Business Profile</h1>
        <button className="vprof-menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </header>

      <main className="vprof-main-content">
        
        <div className="vprof-identity-card">
          <div className="vprof-identity-top">
            <div className="vprof-avatar-large">{profileData.hubName ? profileData.hubName.substring(0,2).toUpperCase() : 'QW'}</div>
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
              <strong>85%</strong>
            </div>
            <div className="vprof-progress-bar">
              <div className="vprof-progress-fill" style={{ width: '85%' }}></div>
            </div>
            <small>Complete your KYC documents to reach 100%</small>
          </div>
        </div>

        <div className="vprof-section">
          <h3 className="vprof-section-title">Hub Operations</h3>
          <div className="vprof-card">
            
            <div className="vprof-info-row">
              <div className="vprof-info-item">
                <span className="vprof-label">Daily Capacity</span>
                <span className="vprof-value">{profileData.capacity} Kg / Day</span>
              </div>
              <div className="vprof-info-item">
                <span className="vprof-label">Avg. Turnaround</span>
                <span className="vprof-value">{profileData.turnaround} Hours</span>
              </div>
            </div>

            <div className="vprof-divider"></div>

            <div className="vprof-info-block">
              <span className="vprof-label">Services Offered</span>
              <div className="vprof-tags-wrapper">
                {profileData.services.split(',').map((service, index) => (
                  <span key={index} className="vprof-tag">{service.trim()}</span>
                ))}
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

        {/* --- NEW: PRICING SECTION --- */}
        <div className="vprof-section">
          <h3 className="vprof-section-title">Current Pricing (per Kg)</h3>
          <div className="vprof-card">
            <div className="vprof-info-row" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <span className="vprof-label">Wash & Fold</span>
              <span className="vprof-value" style={{ color: '#16a34a', fontWeight: 'bold' }}>₹{profileData.pricing?.washAndFold}</span>
            </div>
            <div className="vprof-info-row" style={{ borderBottom: '1px solid #f1f5f9', padding: '10px 0' }}>
              <span className="vprof-label">Wash & Iron</span>
              <span className="vprof-value" style={{ color: '#16a34a', fontWeight: 'bold' }}>₹{profileData.pricing?.washAndIron}</span>
            </div>
            <div className="vprof-info-row" style={{ paddingTop: '10px' }}>
              <span className="vprof-label">Premium Dry Clean</span>
              <span className="vprof-value" style={{ color: '#16a34a', fontWeight: 'bold' }}>₹{profileData.pricing?.dryClean}</span>
            </div>
          </div>
        </div>

        <div className="vprof-section">
          <h3 className="vprof-section-title">Compliance & KYC</h3>
          <div className="vprof-card vprof-docs-card">
            
            {/* Dynamic Status Logic */}
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
        
        <button className="vprof-edit-btn" onClick={() => setIsEditModalOpen(true)}>Edit Profile Details</button>

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
            <div className="vprof-input-group">
              <label>Owner Name</label>
              <input type="text" value={editForm.owner} onChange={(e) => setEditForm({...editForm, owner: e.target.value})} />
            </div>
            <div className="vprof-row-inputs">
              <div className="vprof-input-group" style={{flex: 1}}>
                <label>Capacity (Kg/Day)</label>
                <input type="number" value={editForm.capacity} onChange={(e) => setEditForm({...editForm, capacity: e.target.value})} />
              </div>
              <div className="vprof-input-group" style={{flex: 1}}>
                <label>Turnaround (Hrs)</label>
                <input type="number" value={editForm.turnaround} onChange={(e) => setEditForm({...editForm, turnaround: e.target.value})} />
              </div>
            </div>
            
            <div className="vprof-input-group">
              <label>Services (Comma Separated)</label>
              <textarea rows="2" value={editForm.services} onChange={(e) => setEditForm({...editForm, services: e.target.value})}></textarea>
            </div>

            <div className="vprof-input-group">
              <label>Hub Address</label>
              <textarea rows="3" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})}></textarea>
            </div>

            <h4 style={{ marginTop: '20px', marginBottom: '10px', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>
              Update Pricing (₹ per Kg)
            </h4>
            
            <div className="vprof-row-inputs">
              <div className="vprof-input-group" style={{flex: 1}}>
                <label>Wash & Fold</label>
                <input 
                  type="number" 
                  value={editForm.pricing?.washAndFold} 
                  onChange={(e) => setEditForm({...editForm, pricing: {...editForm.pricing, washAndFold: e.target.value}})} 
                />
              </div>
              <div className="vprof-input-group" style={{flex: 1}}>
                <label>Wash & Iron</label>
                <input 
                  type="number" 
                  value={editForm.pricing?.washAndIron} 
                  onChange={(e) => setEditForm({...editForm, pricing: {...editForm.pricing, washAndIron: e.target.value}})} 
                />
              </div>
            </div>
            
            <div className="vprof-input-group">
              <label>Premium Dry Clean</label>
              <input 
                type="number" 
                value={editForm.pricing?.dryClean} 
                onChange={(e) => setEditForm({...editForm, pricing: {...editForm.pricing, dryClean: e.target.value}})} 
              />
            </div>

            <button className="vprof-save-btn" onClick={handleSaveProfile}>Save Changes</button>
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
              {activeDocument.action === 'View' ? 'This document is verified and stored securely.' : 'Upload a clear, scanned copy of your document in PDF or JPG format.'}
            </p>
            <button className="vprof-save-btn" style={{width: '100%'}} onClick={() => setActiveDocument(null)}>
              {activeDocument.action === 'View' ? 'Close Viewer' : 'Select File to Upload'}
            </button>
          </div>
        </div>
      )}

      {/* SLIDE-OUT SIDEBAR MENU */}
      {isSidebarOpen && (
        <div className="vprof-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}>
          <div className="vprof-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="vprof-sidebar-header">
              <div className="vprof-avatar-small">{profileData.owner ? profileData.owner.substring(0,2).toUpperCase() : 'AS'}</div>
              <div className="vprof-sidebar-user-text"><h2>{profileData.owner}</h2><p>Active Vendor</p></div>
            </div>
            <div className="vprof-sidebar-menu">
              
              {/* THE UPDATED OPEN/CLOSED SWITCH */}
              <div className="vprof-side-item">
                <div className="vprof-side-left">
                  <span className="vprof-side-icon">⏱️</span>
                  <span className="vprof-side-label">{isOpen ? 'Store Open' : 'Store Closed'}</span>
                </div>
                <div className="vprof-toggle-wrapper">
                  <label className="vprof-toggle">
                    <input type="checkbox" checked={isOpen} onChange={handleToggleStatus}/>
                    <span className="vprof-slider"></span>
                  </label>
                </div>
              </div>
              
              <button className="vprof-side-item" onClick={() => navigate('/vendor-language')}><div className="vprof-side-left"><span className="vprof-side-icon">🌐</span><span className="vprof-side-label">Language</span></div><span className="vprof-side-arrow">›</span></button>
              <button className="vprof-side-item" onClick={() => navigate('/vendor-bank')}><div className="vprof-side-left"><span className="vprof-side-icon">💳</span><span className="vprof-side-label">Bank Management</span></div><span className="vprof-side-arrow">›</span></button>
              <button className="vprof-side-item" onClick={() => navigate('/vendor-schedule')}><div className="vprof-side-left"><span className="vprof-side-icon">📅</span><span className="vprof-side-label">Work schedule</span></div><span className="vprof-side-arrow">›</span></button>
              <button className="vprof-side-item" onClick={() => { setIsSidebarOpen(false); setIsEditModalOpen(true); }}><div className="vprof-side-left"><span className="vprof-side-icon" style={{color: '#10b981'}}>👤</span><span className="vprof-side-label" style={{color: '#10b981'}}>Edit Profile</span></div><span className="vprof-side-arrow">›</span></button>
              
              <button className="vprof-side-item" onClick={() => alert('Opening Privacy Policy...')}><div className="vprof-side-left"><span className="vprof-side-icon">🔒</span><span className="vprof-side-label">Privacy Policy</span></div><span className="vprof-side-arrow">›</span></button>
              <button className="vprof-side-item" onClick={() => alert('Opening About Us...')}><div className="vprof-side-left"><span className="vprof-side-icon">ℹ️</span><span className="vprof-side-label">About Us</span></div><span className="vprof-side-arrow">›</span></button>
              <button className="vprof-side-item" onClick={() => alert('Connecting to Support...')}><div className="vprof-side-left"><span className="vprof-side-icon">❓</span><span className="vprof-side-label">Help</span></div><span className="vprof-side-arrow">›</span></button>

              <button className="vprof-side-item" onClick={handleLogout}><div className="vprof-side-left"><span className="vprof-side-icon" style={{color: '#e11d48'}}>🚪</span><span className="vprof-side-label" style={{color: '#e11d48'}}>Logout</span></div></button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
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