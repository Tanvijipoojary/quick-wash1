import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './v_profile.css';

const VendorProfile = () => {
  const navigate = useNavigate();
  
  // Sidebar & Status State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);

  // Dynamic Profile Data State (Includes Services now!)
  const [profileData, setProfileData] = useState({
    hubName: 'Quick Wash Premium Hub',
    owner: 'Anurag S.',
    capacity: '150',
    turnaround: '24',
    services: 'Wash & Fold, Steam Ironing, Dry Cleaning, Shoe Cleaning',
    address: 'Shop No. 12, Ground Floor, Crystal Arcade,\nKoramangala, Bengaluru, Karnataka 560034'
  });

  const [editForm, setEditForm] = useState({ ...profileData });

  const handleSaveProfile = () => {
    setProfileData({ ...editForm });
    setIsEditModalOpen(false);
  };

  const handleDocumentAction = (docName, action) => {
    setActiveDocument({ name: docName, action: action });
  };

  return (
    <div className="vprof-container">
      
      {/* --- Updated Header: Back on Left, Menu on Right --- */}
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
        
        {/* --- Top Identity Card --- */}
        <div className="vprof-identity-card">
          <div className="vprof-identity-top">
            <div className="vprof-avatar-large">QW</div>
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

        {/* --- Hub Operations Details --- */}
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
                {/* Dynamically generates tags based on comma-separated string */}
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

        {/* --- Compliance & KYC --- */}
        <div className="vprof-section">
          <h3 className="vprof-section-title">Compliance & KYC</h3>
          <div className="vprof-card vprof-docs-card">
            
            <div className="vprof-doc-item">
              <div className="vprof-doc-left">
                <span className="vprof-doc-icon">📄</span>
                <div className="vprof-doc-text">
                  <strong>GST Registration</strong>
                  <span className="vprof-pill vprof-pill-success">Verified</span>
                </div>
              </div>
              <button className="vprof-doc-action" onClick={() => handleDocumentAction('GST Registration', 'View')}>View</button>
            </div>

            <div className="vprof-doc-item">
              <div className="vprof-doc-left">
                <span className="vprof-doc-icon">🏬</span>
                <div className="vprof-doc-text">
                  <strong>Shop & Establishment</strong>
                  <span className="vprof-pill vprof-pill-success">Verified</span>
                </div>
              </div>
              <button className="vprof-doc-action" onClick={() => handleDocumentAction('Shop & Establishment', 'View')}>View</button>
            </div>

            {/* NEW: Aadhar Card */}
            <div className="vprof-doc-item">
              <div className="vprof-doc-left">
                <span className="vprof-doc-icon">🪪</span>
                <div className="vprof-doc-text">
                  <strong>Aadhar Card</strong>
                  <span className="vprof-pill vprof-pill-success">Verified</span>
                </div>
              </div>
              <button className="vprof-doc-action" onClick={() => handleDocumentAction('Aadhar Card', 'View')}>View</button>
            </div>

            <div className="vprof-doc-item">
              <div className="vprof-doc-left">
                <span className="vprof-doc-icon">💳</span>
                <div className="vprof-doc-text">
                  <strong>Owner PAN Card</strong>
                  <span className="vprof-pill vprof-pill-warning">Pending Review</span>
                </div>
              </div>
              <button className="vprof-doc-action" onClick={() => handleDocumentAction('Owner PAN Card', 'Update')}>Update</button>
            </div>

            <div className="vprof-doc-item" style={{ borderBottom: 'none' }}>
              <div className="vprof-doc-left">
                <span className="vprof-doc-icon" style={{color: '#e11d48'}}>⚠️</span>
                <div className="vprof-doc-text">
                  <strong>Cancelled Cheque</strong>
                  <span className="vprof-pill vprof-pill-danger">Missing</span>
                </div>
              </div>
              <button className="vprof-doc-action" style={{color: '#e11d48'}} onClick={() => handleDocumentAction('Cancelled Cheque', 'Upload')}>Upload</button>
            </div>

          </div>
        </div>
        
        <button className="vprof-edit-btn" onClick={() => setIsEditModalOpen(true)}>Edit Profile Details</button>

      </main>

      {/* =========================================
          MODALS
          ========================================= */}
      
      {/* 1. Edit Profile Modal */}
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
            
            {/* NEW: Editable Services */}
            <div className="vprof-input-group">
              <label>Services (Comma Separated)</label>
              <textarea rows="2" value={editForm.services} onChange={(e) => setEditForm({...editForm, services: e.target.value})}></textarea>
            </div>

            <div className="vprof-input-group">
              <label>Hub Address</label>
              <textarea rows="3" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})}></textarea>
            </div>

            <button className="vprof-save-btn" onClick={handleSaveProfile}>Save Changes</button>
          </div>
        </div>
      )}

      {/* 2. Document Action Modal */}
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

      {/* =========================================
          SLIDE-OUT SIDEBAR MENU
          ========================================= */}
      {isSidebarOpen && (
        <div className="vprof-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}>
          <div className="vprof-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="vprof-sidebar-header">
              <div className="vprof-avatar-small">AS</div>
              <div className="vprof-sidebar-user-text"><h2>{profileData.owner}</h2><p>Vendor ID-7853</p></div>
            </div>
            <div className="vprof-sidebar-menu">
              <div className="vprof-side-item">
                <div className="vprof-side-left"><span className="vprof-side-icon">⏱️</span><span className="vprof-side-label">Store Open</span></div>
                <div className="vprof-toggle-wrapper">
                  <label className="vprof-toggle">
                    <input type="checkbox" checked={isAvailable} onChange={() => setIsAvailable(!isAvailable)}/>
                    <span className="vprof-slider"></span>
                  </label>
                </div>
              </div>
              
              <button className="vprof-side-item" onClick={() => navigate('/vendor-language')}><div className="vprof-side-left"><span className="vprof-side-icon">🌐</span><span className="vprof-side-label">Language</span></div><span className="vprof-side-arrow">›</span></button>
              <button className="vprof-side-item" onClick={() => navigate('/vendor-bank')}><div className="vprof-side-left"><span className="vprof-side-icon">💳</span><span className="vprof-side-label">Bank Management</span></div><span className="vprof-side-arrow">›</span></button>
              <button className="vprof-side-item" onClick={() => navigate('/vendor-schedule')}><div className="vprof-side-left"><span className="vprof-side-icon">📅</span><span className="vprof-side-label">Work schedule</span></div><span className="vprof-side-arrow">›</span></button>
              <button className="vprof-side-item" onClick={() => navigate('/vendor-profile')}><div className="vprof-side-left"><span className="vprof-side-icon" style={{color: '#10b981'}}>👤</span><span className="vprof-side-label" style={{color: '#10b981'}}>Profile</span></div><span className="vprof-side-arrow">›</span></button>
              
              <button className="vprof-side-item" onClick={() => alert('Opening Privacy Policy...')}><div className="vprof-side-left"><span className="vprof-side-icon">🔒</span><span className="vprof-side-label">Privacy Policy</span></div><span className="vprof-side-arrow">›</span></button>
              <button className="vprof-side-item" onClick={() => alert('Opening About Us...')}><div className="vprof-side-left"><span className="vprof-side-icon">ℹ️</span><span className="vprof-side-label">About Us</span></div><span className="vprof-side-arrow">›</span></button>
              <button className="vprof-side-item" onClick={() => alert('Connecting to Support...')}><div className="vprof-side-left"><span className="vprof-side-icon">❓</span><span className="vprof-side-label">Help</span></div><span className="vprof-side-arrow">›</span></button>

              <button className="vprof-side-item" onClick={() => navigate('/')}><div className="vprof-side-left"><span className="vprof-side-icon" style={{color: '#e11d48'}}>🚪</span><span className="vprof-side-label" style={{color: '#e11d48'}}>Logout</span></div></button>
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