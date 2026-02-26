import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './r_profile.css';

const RiderProfile = () => {
  const navigate = useNavigate();
  
  // State for the slide-out sidebar and the availability toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <div className="rprof-container">
      
      {/* --- Main Header --- */}
      <header className="rprof-header">
        <div className="rprof-header-left">
          <button className="rprof-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 className="rprof-header-title">Profile</h1>
        </div>
      </header>

      {/* --- Main Content (Centered for Desktop) --- */}
      <main className="rprof-main-content">
        
        {/* User Info Header */}
        <div className="rprof-user-top">
          <div className="rprof-avatar-large">AS</div>
          <div className="rprof-user-text">
            <h2>Anurag S.</h2>
            <p>ID-7853</p>
          </div>
        </div>

        {/* Missing Data Section */}
        <div className="rprof-docs-section">
          <div className="rprof-doc-row">
            <div className="rprof-doc-left">
              <span className="rprof-doc-label">Driving License</span>
              <span className="rprof-missing-pill">Missing Data</span>
            </div>
            <button className="rprof-action-link">Add</button>
          </div>

          <div className="rprof-divider"></div>

          <div className="rprof-doc-row">
            <div className="rprof-doc-left">
              <span className="rprof-doc-label">Vehicle Plate</span>
              <span className="rprof-missing-pill">Missing Data</span>
            </div>
            <button className="rprof-action-link">Add</button>
          </div>
        </div>

        {/* Other Information Section */}
        <div className="rprof-info-section">
          <h3 className="rprof-section-title">Other information</h3>
          
          <div className="rprof-info-card">
            <span className="rprof-card-label">Email</span>
            <span className="rprof-card-value">anurags@gmail.com</span>
          </div>

          <div className="rprof-info-card rprof-card-with-action">
            <div className="rprof-card-content">
              <span className="rprof-card-label">Password</span>
              <span className="rprof-card-value">*********</span>
            </div>
            <button className="rprof-action-link">Change</button>
          </div>

          <div className="rprof-info-card">
            <span className="rprof-card-label">Mobile Number</span>
            <span className="rprof-card-value">+91-123-456-7890</span>
          </div>
        </div>

      </main>

      {/* =========================================
          SLIDE-OUT SIDEBAR MENU
          ========================================= */}
      {isSidebarOpen && (
        <div className="rprof-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}>
          <div className="rprof-sidebar" onClick={(e) => e.stopPropagation()}>
            
            {/* Sidebar Header */}
            <div className="rprof-sidebar-header">
              <div className="rprof-avatar-small">AS</div>
              <div className="rprof-sidebar-user-text">
                <h2>Anurag S.</h2>
                <p>ID-7853</p>
              </div>
            </div>

            {/* Sidebar Menu Items */}
            <div className="rprof-sidebar-menu">
              
              <div className="rprof-side-item">
                <div className="rprof-side-left">
                  <span className="rprof-side-icon">⏱️</span>
                  <span className="rprof-side-label">Availability</span>
                </div>
                <div className="rprof-toggle-wrapper">
                  <label className="rprof-toggle">
                    <input 
                      type="checkbox" 
                      checked={isAvailable} 
                      onChange={() => setIsAvailable(!isAvailable)}
                    />
                    <span className="rprof-slider"></span>
                  </label>
                  <small className="rprof-toggle-text">{isAvailable ? 'Available' : 'Offline'}</small>
                </div>
              </div>

              <button className="rprof-side-item" onClick={() => navigate('/rider-language')}>
                <div className="rprof-side-left">
                  <span className="rprof-side-icon">🌐</span>
                  <span className="rprof-side-label">Language</span>
                </div>
                <span className="rprof-side-arrow">›</span>
              </button>

              <button className="rprof-side-item" onClick={() => navigate('/rider-vehicle')}>
                <div className="rprof-side-left">
                  <span className="rprof-side-icon">🛵</span>
                  <span className="rprof-side-label">Vehicle Type</span>
                </div>
                <span className="rprof-side-arrow">›</span>
              </button>

              <button className="rprof-side-item" onClick={() => navigate('/rider-bank')}>
                <div className="rprof-side-left">
                  <span className="rprof-side-icon">💳</span>
                  <span className="rprof-side-label">Bank Management</span>
                </div>
                <span className="rprof-side-arrow">›</span>
              </button>

              <button className="rprof-side-item" onClick={() => navigate('/rider-schedule')}>
                <div className="rprof-side-left">
                  <span className="rprof-side-icon">📅</span>
                  <span className="rprof-side-label">Work schedule</span>
                </div>
                <span className="rprof-side-arrow">›</span>
              </button>

              <button className="rprof-side-item" onClick={() => setIsSidebarOpen(false)}>
                <div className="rprof-side-left">
                  <span className="rprof-side-icon">👤</span>
                  <span className="rprof-side-label">Profile</span>
                </div>
                <span className="rprof-side-arrow">›</span>
              </button>

              <button className="rprof-side-item">
                <div className="rprof-side-left">
                  <span className="rprof-side-icon">ℹ️</span>
                  <span className="rprof-side-label">About Us</span>
                </div>
                <span className="rprof-side-arrow">›</span>
              </button>

              <button className="rprof-side-item">
                <div className="rprof-side-left">
                  <span className="rprof-side-icon">❓</span>
                  <span className="rprof-side-label">Help</span>
                </div>
                <span className="rprof-side-arrow">›</span>
              </button>

              <button className="rprof-side-item" onClick={() => navigate('/')}>
                <div className="rprof-side-left">
                  <span className="rprof-side-icon" style={{color: '#d94a4a'}}>🚪</span>
                  <span className="rprof-side-label" style={{color: '#d94a4a'}}>Logout</span>
                </div>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* --- Fixed Bottom Nav --- */}
      <footer className="rprof-bottom-nav">
        <button className="rprof-nav-item" onClick={() => navigate('/rider-home')}>
          <span>🏠</span>
          <small>Home</small>
        </button>
        <button className="rprof-nav-item" onClick={() => navigate('/rider-wallet')}>
          <span>💳</span>
          <small>Wallet</small>
        </button>
        <button className="rprof-nav-item" onClick={() => navigate('/rider-earnings')}>
          <span>💲</span>
          <small>Earnings</small>
        </button>
        <button className="rprof-nav-item rprof-nav-active">
          <span>👤</span>
          <small>Profile</small>
        </button>
      </footer>
    </div>
  );
};

export default RiderProfile;