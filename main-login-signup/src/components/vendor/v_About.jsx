import React from 'react';
import { useNavigate } from 'react-router-dom';
import './v_profile.css'; 

const VendorAbout = () => {
  const navigate = useNavigate();

  return (
    <div className="vprof-container">
      <header className="vprof-header">
        <button className="vprof-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="vprof-header-title">About Us</h1>
        <div style={{ width: 24 }}></div>
      </header>

      <main style={{ padding: '20px', color: '#334155', textAlign: 'center' }}>
        <div style={{ background: 'white', padding: '40px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🧺</div>
          <h2 style={{ color: '#064e3b', margin: '0 0 15px 0' }}>Quick Wash</h2>
          <p style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '20px' }}>
            Quick Wash is Mangaluru's premier on-demand laundry network. We bridge the gap between busy customers and high-quality local laundry hubs.
          </p>
          <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#16a34a', fontWeight: 'bold' }}>
            Empowering Local Businesses to thrive in the digital age.
          </div>
          <p style={{ marginTop: '30px', fontSize: '0.85rem', color: '#94a3b8' }}>Version 1.0.0<br/>© 2026 Quick Wash Inc.</p>
        </div>
      </main>
    </div>
  );
};

export default VendorAbout;