import React from 'react';
import { useNavigate } from 'react-router-dom';
import './v_profile.css'; // Reusing your premium profile styles!

const VendorPrivacy = () => {
  const navigate = useNavigate();

  return (
    <div className="vprof-container">
      <header className="vprof-header">
        <button className="vprof-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="vprof-header-title">Privacy Policy</h1>
        <div style={{ width: 24 }}></div>
      </header>

      <main style={{ padding: '20px', color: '#334155', lineHeight: '1.6' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ color: '#064e3b', marginTop: 0 }}>1. Data Collection</h3>
          <p style={{ fontSize: '0.95rem', marginBottom: '20px' }}>Quick Wash collects your basic shop information, location, and KYC documents strictly to verify your business and connect you with nearby customers.</p>

          <h3 style={{ color: '#064e3b' }}>2. Data Security</h3>
          <p style={{ fontSize: '0.95rem', marginBottom: '20px' }}>Your banking details and KYC documents are encrypted and stored securely. We do not share your private financial data with any third-party services.</p>

          <h3 style={{ color: '#064e3b' }}>3. Customer Information</h3>
          <p style={{ fontSize: '0.95rem', marginBottom: '0' }}>Vendors are strictly prohibited from storing, copying, or misusing customer phone numbers or addresses outside of the active order delivery window.</p>
        </div>
      </main>
    </div>
  );
};

export default VendorPrivacy;