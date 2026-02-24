import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './r_wallet.css';

const RiderWallet = () => {
  const navigate = useNavigate();

  // State to handle the withdrawal modals
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Mock data for recent transactions
  const transactions = [
    { id: 1, type: 'Cash out', date: '20 Feb', amount: 'Rs. 1000' },
    { id: 2, type: 'Cash out', date: '18 Feb', amount: 'Rs. 600' },
    { id: 3, type: 'Cash out', date: '15 Feb', amount: 'Rs. 500' },
    { id: 4, type: 'Cash out', date: '12 Feb', amount: 'Rs. 460' },
    { id: 5, type: 'Cash out', date: '10 Feb', amount: 'Rs. 5650' },
    { id: 6, type: 'Cash out', date: '08 Feb', amount: 'Rs. 600' },
  ];

  // Logic to handle button clicks
  const handleConfirmWithdraw = () => {
    if (withdrawAmount > 0) {
      setShowWithdrawModal(false);
      setShowSuccessModal(true); // Open the success popup
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setWithdrawAmount(''); // Reset input
  };

  return (
    <div className="rwallet-container">
      {/* Header */}
      <header className="rwallet-header">
        <div className="rwallet-header-left">
          <button className="rwallet-back-btn" onClick={() => navigate('/rider-home')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h1 className="rwallet-header-title">Wallet</h1>
        </div>
      </header>

      {/* Main Content Centered for Web */}
      <main className="rwallet-main-content">
        
        {/* Balance Card */}
        <div className="rwallet-balance-card">
          <span className="rwallet-balance-label">Current Balance</span>
          <h2 className="rwallet-balance-amount">Rs. 2500</h2>
          <button 
            className="rwallet-withdraw-btn"
            onClick={() => setShowWithdrawModal(true)}
          >
            Withdraw Now
          </button>
        </div>

        {/* Transactions List */}
        <div className="rwallet-transactions-section">
          <h3 className="rwallet-section-title">Recent Transactions</h3>
          <div className="rwallet-transactions-list">
            {transactions.map((tx) => (
              <div key={tx.id} className="rwallet-transaction-item">
                <div className="rwallet-tx-left">
                  <div className="rwallet-tx-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <div className="rwallet-tx-details">
                    <span className="rwallet-tx-type">{tx.type}</span>
                    <span className="rwallet-tx-date">{tx.date}</span>
                  </div>
                </div>
                <div className="rwallet-tx-right">
                  <span className="rwallet-tx-amount">{tx.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* =========================================
          MODALS OVERLAY
          ========================================= */}
      {(showWithdrawModal || showSuccessModal) && (
        <div className="rwallet-modal-overlay">
          
          {/* 1. Enter Amount Modal */}
          {showWithdrawModal && (
            <div className="rwallet-modal-box">
              <div className="rwallet-modal-top-row">
                <span className="rwallet-modal-label">Available Amount</span>
                <span className="rwallet-modal-balance">Rs. 2500</span>
              </div>
              
              <div className="rwallet-input-group">
                <label>Enter Amount</label>
                <input 
                  type="number" 
                  placeholder="Rs. 0.00" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>

              <button 
                className="rwallet-withdraw-btn rwallet-confirm-btn"
                onClick={handleConfirmWithdraw}
              >
                Confirm Withdraw
              </button>
              <button 
                className="rwallet-cancel-btn"
                onClick={() => setShowWithdrawModal(false)}
              >
                Cancel
              </button>
            </div>
          )}

          {/* 2. Success Modal */}
          {showSuccessModal && (
            <div className="rwallet-modal-box rwallet-success-box">
              <button className="rwallet-close-x" onClick={handleCloseSuccess}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              
              <div className="rwallet-success-emoji">💰</div>
              <h3 className="rwallet-success-title">
                Your request for withdrawal has been submitted
              </h3>
              <p className="rwallet-success-subtitle">
                Usually it takes 1-2 business days
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <footer className="rwallet-bottom-nav">
        <button className="rwallet-nav-item" onClick={() => navigate('/rider-home')}>
          <span>🏠</span>
          <small>Home</small>
        </button>
        <button className="rwallet-nav-item rwallet-nav-active">
          <span>💳</span>
          <small>Wallet</small>
        </button>
       <button 
          className="rwallet-nav-item" 
          onClick={() => navigate('/rider-earnings')}>
          <span>💲</span>
          <small>Earnings</small>
        </button>
        <button className="rwallet-nav-item">
          <span>👤</span>
          <small>Profile</small>
        </button>
      </footer>
    </div>
  );
};

export default RiderWallet;