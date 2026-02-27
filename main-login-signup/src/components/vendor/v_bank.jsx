import React from 'react';
import { useNavigate } from 'react-router-dom';
import './v_settings.css';

const VendorBank = () => {
  const navigate = useNavigate();

  return (
    <div className="vset-container">
      {/* Glassmorphism Header */}
      <header className="vset-header">
        <button className="vset-back-btn" onClick={() => navigate('/vendor-home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="vset-header-title">Bank Management</h1>
      </header>

      <main className="vset-main-content">
        <div className="vset-card vset-form-card">
          
          <div className="vset-input-group">
            <label>Full Name of Account Holder</label>
            <input type="text" className="vset-input" defaultValue="Anurag S." />
          </div>

          <div className="vset-input-group">
            <label>Bank Name</label>
            <input type="text" className="vset-input" defaultValue="State Bank of India" />
          </div>

          <div className="vset-input-group">
            <label>Account Number</label>
            <input type="password" className="vset-input" defaultValue="3254465164614411" />
          </div>

          <div className="vset-input-group">
            <label>Confirm Account Number</label>
            <input type="text" className="vset-input" defaultValue="3254465164614411" />
          </div>

          <div className="vset-input-group">
            <label>IFSC Code</label>
            <input type="text" className="vset-input" defaultValue="SBIN0001234" style={{textTransform: 'uppercase'}} />
          </div>

          <div className="vset-input-group">
            <label>Business UPI ID (Optional)</label>
            <input type="text" className="vset-input" defaultValue="quickwash.vendor@oksbi" />
          </div>

        </div>

        <button className="vset-action-btn" onClick={() => navigate('/vendor-home')}>
          Secure & Save Details
        </button>
      </main>
    </div>
  );
};

export default VendorBank;