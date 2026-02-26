import React from 'react';
import { useNavigate } from 'react-router-dom';
import './r_settings.css';

const RiderBank = () => {
  const navigate = useNavigate();

  const handleUpdate = () => {
    alert("Bank Details confirmed!");
    navigate('/rider-profile');
  };

  return (
    <div className="rset-container">
      <header className="rset-header">
        <button className="rset-back-btn" onClick={() => navigate('/rider-profile')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="rset-header-title">Bank management</h1>
      </header>
      <main className="rset-main-content">
        <div className="rset-input-group">
          <label>Currency</label>
          <select className="rset-select" defaultValue="EUR">
            <option value="EUR">🇪🇺 EUR</option>
            <option value="USD">🇺🇸 USD</option>
            <option value="INR">🇮🇳 INR</option>
          </select>
        </div>
        <div className="rset-input-group">
          <label>Full Name of the Bank Account Holder</label>
          <input type="text" className="rset-input" defaultValue="Gabriel Gutkowski" />
        </div>
        <div className="rset-input-group">
          <label>IBAN / Swift / BSB</label>
          <input type="text" className="rset-input" defaultValue="IT25M0680218128171X4075J102" />
        </div>
        <div className="rset-input-group">
          <label>Account Number</label>
          <input type="text" className="rset-input" defaultValue="3254465164614411" />
        </div>
        
        <button className="rset-action-btn" onClick={handleUpdate}>Confirm</button>
      </main>
    </div>
  );
};
export default RiderBank;