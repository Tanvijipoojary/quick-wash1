import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './v_wallet.css';

const VendorWallet = () => {
  const navigate = useNavigate();

  // Modal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null); 
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Mock Vendor Transactions (Withdrawals/Cash Outs)
  const [transactions, setTransactions] = useState([
    { id: 1, title: 'Withdrawal to SBI', date: '27 Feb 2026, 09:30 AM', amount: '5,000', status: 'Pending', txId: 'TXN-98237492', bank: 'SBI ending in 4411' },
    { id: 2, title: 'Withdrawal to SBI', date: '20 Feb 2026, 09:15 AM', amount: '12,000', status: 'Completed', txId: 'TXN-87236412', bank: 'SBI ending in 4411' },
    { id: 3, title: 'Withdrawal to HDFC', date: '12 Feb 2026, 02:20 PM', amount: '8,500', status: 'Completed', txId: 'TXN-45920183', bank: 'HDFC ending in 0922' },
    { id: 4, title: 'Withdrawal to SBI', date: '01 Feb 2026, 11:00 AM', amount: '15,200', status: 'Completed', txId: 'TXN-11203948', bank: 'SBI ending in 4411' },
  ]);

  const handleConfirmWithdraw = () => {
    if (withdrawAmount && withdrawAmount > 0) {
      const newTx = {
        id: Date.now(),
        title: 'Withdrawal to SBI',
        date: new Date().toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        amount: parseFloat(withdrawAmount).toLocaleString('en-IN'),
        status: 'Pending',
        txId: `TXN-${Math.floor(Math.random() * 100000000)}`,
        bank: 'SBI ending in 4411'
      };
      
      setTransactions([newTx, ...transactions]);
      setShowWithdrawModal(false);
      setShowSuccessModal(true);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setWithdrawAmount('');
  };

  return (
    <div className="vwal-container">
      
      {/* Glassmorphism Header (View Earnings button removed) */}
      <header className="vwal-header" style={{ justifyContent: 'center' }}>
        <h1 className="vwal-header-title">Wallet</h1>
      </header>

      <main className="vwal-main-content">
        
        {/* Premium Dark Green Balance Card */}
        <div className="vwal-balance-card">
          <div className="vwal-card-top">
            <span className="vwal-balance-label">Available Balance</span>
            <span className="vwal-currency-badge">INR</span>
          </div>
          <h2 className="vwal-balance-amount">Rs. 14,250.00</h2>
          
          <div className="vwal-card-bottom">
            <div className="vwal-bank-info">
              <span className="vwal-bank-icon">🏦</span>
              <div className="vwal-bank-text-stack">
                <span>State Bank of India •••• 4411</span>
                <button className="vwal-change-bank-link" onClick={() => navigate('/vendor-bank')}>
                  Change Account 
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '4px'}}><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </div>
            <button 
              className="vwal-withdraw-btn"
              onClick={() => setShowWithdrawModal(true)}
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Withdrawal Requests List */}
        <div className="vwal-transactions-section">
          <h3 className="vwal-section-title">Withdrawal Requests</h3>
          
          <div className="vwal-transactions-list">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="vwal-transaction-item vwal-clickable"
                onClick={() => setSelectedTx(tx)}
              >
                <div className="vwal-tx-left">
                  <div className="vwal-tx-icon vwal-icon-debit">
                    ↑
                  </div>
                  <div className="vwal-tx-details">
                    <span className="vwal-tx-title">{tx.title}</span>
                    <span className="vwal-tx-date">{tx.date}</span>
                  </div>
                </div>
                <div className="vwal-tx-right">
                  <span className="vwal-tx-amount vwal-text-debit">- Rs. {tx.amount}</span>
                  <span className={`vwal-status-pill ${tx.status === 'Pending' ? 'vwal-status-pending' : 'vwal-status-completed'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* =========================================
          MODALS (Withdraw, Success, Details)
          ========================================= */}
      {(showWithdrawModal || showSuccessModal || selectedTx) && (
        <div className="vwal-modal-overlay">
          
          {/* Withdraw Modal */}
          {showWithdrawModal && (
            <div className="vwal-modal-box">
              <div className="vwal-modal-top-row">
                <span className="vwal-modal-label">Available to Withdraw</span>
                <span className="vwal-modal-balance">Rs. 14,250</span>
              </div>
              <div className="vwal-input-group">
                <label>Enter Amount (Rs)</label>
                <input type="number" placeholder="0.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
              </div>
              <div className="vwal-bank-preview">
                <span className="vwal-bank-icon">🏦</span>
                <div className="vwal-bank-text">
                  <strong>Transfer to SBI</strong>
                  <span>Account ending in 4411</span>
                </div>
              </div>
              <button className={`vwal-confirm-btn ${withdrawAmount > 0 ? 'active' : ''}`} onClick={handleConfirmWithdraw} disabled={!withdrawAmount || withdrawAmount <= 0}>
                Confirm Withdraw
              </button>
              <button className="vwal-cancel-btn" onClick={() => setShowWithdrawModal(false)}>Cancel</button>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="vwal-modal-box vwal-success-box">
              <button className="vwal-close-x" onClick={handleCloseSuccess}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <div className="vwal-success-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 className="vwal-success-title">Withdrawal Initiated!</h3>
              <p className="vwal-success-subtitle">
                Your request for <strong>Rs. {withdrawAmount}</strong> has been submitted. It usually reflects in your account within 1-2 business days.
              </p>
              <button className="vwal-confirm-btn active" style={{marginTop: '16px'}} onClick={handleCloseSuccess}>Back to Wallet</button>
            </div>
          )}

          {/* Transaction Details Receipt Modal */}
          {selectedTx && (
            <div className="vwal-modal-box">
              <button className="vwal-close-x" onClick={() => setSelectedTx(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <h3 className="vwal-modal-title" style={{textAlign: 'center', margin: '0 0 8px 0'}}>Transaction Details</h3>
              
              <div className="vwal-receipt-header">
                <span className="vwal-receipt-amount">Rs. {selectedTx.amount}</span>
                <span className={`vwal-status-pill ${selectedTx.status === 'Pending' ? 'vwal-status-pending' : 'vwal-status-completed'}`} style={{marginTop: '8px', fontSize: '14px', padding: '6px 16px'}}>
                  {selectedTx.status}
                </span>
              </div>

              <div className="vwal-receipt-body">
                <div className="vwal-receipt-row">
                  <span>Type</span>
                  <strong>Withdrawal</strong>
                </div>
                <div className="vwal-receipt-row">
                  <span>Date & Time</span>
                  <strong>{selectedTx.date}</strong>
                </div>
                <div className="vwal-receipt-row">
                  <span>Transaction ID</span>
                  <strong>{selectedTx.txId}</strong>
                </div>
                <div className="vwal-receipt-row">
                  <span>Transferred to</span>
                  <strong>{selectedTx.bank}</strong>
                </div>
              </div>

              <button className="vwal-cancel-btn" style={{marginTop: '24px'}} onClick={() => setSelectedTx(null)}>Close</button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <footer className="vwal-bottom-nav">
        <button className="vwal-nav-item" onClick={() => navigate('/vendor-home')}><span>🏠</span><small>Home</small></button>
        <button className="vwal-nav-item active"><span>💳</span><small>Wallet</small></button>
        <button className="vwal-nav-item" onClick={() => navigate('/vendor-earnings')}><span>💲</span><small>Earnings</small></button>
        <button className="vwal-nav-item" onClick={() => navigate('/vendor-profile')}><span>👤</span><small>Profile</small></button>
      </footer>
    </div>
  );
};

export default VendorWallet;