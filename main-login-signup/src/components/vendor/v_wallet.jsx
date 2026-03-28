import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './v_wallet.css';

const VendorWallet = () => {
  const navigate = useNavigate();

  // State
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [vendorEmail, setVendorEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null); 
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // --- 1. FETCH LIVE WALLET DATA ---
  useEffect(() => {
    const fetchWallet = async () => {
      const savedVendorStr = localStorage.getItem('quickwash_vendor');
      if (!savedVendorStr) {
        navigate('/vendor-login');
        return;
      }
      
      const parsedVendor = JSON.parse(savedVendorStr);
      setVendorEmail(parsedVendor.email);

      try {
        const res = await axios.get(`http://localhost:5000/api/vendors/wallet/${parsedVendor.email}/${parsedVendor.shopId}`);
        setBalance(res.data.balance);
        
        // Format dates for the UI
        const formattedTx = res.data.transactions.map(tx => ({
          ...tx,
          displayDate: new Date(tx.date).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        }));
        
        setTransactions(formattedTx);
      } catch (error) {
        console.error("Failed to fetch wallet data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallet();
  }, [navigate]);

  // --- 2. HANDLE LIVE WITHDRAWAL ---
  const handleConfirmWithdraw = async () => {
    if (withdrawAmount && withdrawAmount > 0) {
      if (withdrawAmount > balance) {
        alert("Amount exceeds your available balance!");
        return;
      }

      try {
        const res = await axios.post('http://localhost:5000/api/vendors/withdraw', {
          email: vendorEmail,
          amount: withdrawAmount,
          bankInfo: 'Default Bank Account' // You can link this to real bank data later
        });

        // Update UI instantly
        setBalance(res.data.newBalance);
        
        const newlyAddedTx = {
          ...res.data.transaction,
          displayDate: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
        
        setTransactions([newlyAddedTx, ...transactions]);
        setShowWithdrawModal(false);
        setShowSuccessModal(true);
      } catch (error) {
        console.error("Withdrawal failed:", error);
        alert(error.response?.data?.message || "Failed to process withdrawal.");
      }
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setWithdrawAmount('');
  };

  if (isLoading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading Wallet... ⏳</div>;

  return (
    <div className="vwal-container">
      
      {/* Glassmorphism Header */}
      <header className="vwal-header">
        <button className="vwal-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="vwal-header-title">Wallet</h1>
        <div style={{ width: 24 }}></div> 
      </header>

      <main className="vwal-main-content">
        
        {/* Premium Dark Green Balance Card */}
        <div className="vwal-balance-card">
          <div className="vwal-card-top">
            <span className="vwal-balance-label">Available Balance</span>
            <span className="vwal-currency-badge">INR</span>
          </div>
          <h2 className="vwal-balance-amount">Rs. {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          
          <div className="vwal-card-bottom">
            <div className="vwal-bank-info">
              <span className="vwal-bank-icon">🏦</span>
              <div className="vwal-bank-text-stack">
                <span>Linked Bank Account</span>
                <button className="vwal-change-bank-link" onClick={() => navigate('/vendor-bank')}>
                  Manage 
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '4px'}}><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </div>
            <button 
              className="vwal-withdraw-btn"
              onClick={() => setShowWithdrawModal(true)}
              disabled={balance <= 0}
              style={{ opacity: balance <= 0 ? 0.5 : 1 }}
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Withdrawal Requests List */}
        <div className="vwal-transactions-section">
          <h3 className="vwal-section-title">Withdrawal History</h3>
          
          <div className="vwal-transactions-list">
            {transactions.length > 0 ? transactions.map((tx) => (
              <div 
                key={tx.txId || tx._id} 
                className="vwal-transaction-item vwal-clickable"
                onClick={() => setSelectedTx(tx)}
              >
                <div className="vwal-tx-left">
                  <div className="vwal-tx-icon vwal-icon-debit">↑</div>
                  <div className="vwal-tx-details">
                    <span className="vwal-tx-title">{tx.title}</span>
                    <span className="vwal-tx-date">{tx.displayDate}</span>
                  </div>
                </div>
                <div className="vwal-tx-right">
                  <span className="vwal-tx-amount vwal-text-debit">- Rs. {tx.amount.toLocaleString('en-IN')}</span>
                  <span className={`vwal-status-pill ${tx.status === 'Pending' ? 'vwal-status-pending' : 'vwal-status-completed'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            )) : (
              <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No transactions yet.</p>
            )}
          </div>
        </div>
      </main>

      {/* =========================================
          MODALS
          ========================================= */}
      {(showWithdrawModal || showSuccessModal || selectedTx) && (
        <div className="vwal-modal-overlay">
          
          {/* Withdraw Modal */}
          {showWithdrawModal && (
            <div className="vwal-modal-box">
              <div className="vwal-modal-top-row">
                <span className="vwal-modal-label">Available to Withdraw</span>
                <span className="vwal-modal-balance">Rs. {balance.toLocaleString('en-IN')}</span>
              </div>
              <div className="vwal-input-group">
                <label>Enter Amount (Rs)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={withdrawAmount} 
                  onChange={(e) => setWithdrawAmount(e.target.value)} 
                  max={balance}
                />
              </div>
              <div className="vwal-bank-preview">
                <span className="vwal-bank-icon">🏦</span>
                <div className="vwal-bank-text">
                  <strong>Transfer to Bank</strong>
                  <span>Standard processing time</span>
                </div>
              </div>
              <button 
                className={`vwal-confirm-btn ${withdrawAmount > 0 && withdrawAmount <= balance ? 'active' : ''}`} 
                onClick={handleConfirmWithdraw} 
                disabled={!withdrawAmount || withdrawAmount <= 0 || withdrawAmount > balance}
              >
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
                Your request for <strong>Rs. {Number(withdrawAmount).toLocaleString('en-IN')}</strong> has been submitted. It usually reflects in your account within 1-2 business days.
              </p>
              <button className="vwal-confirm-btn active" style={{marginTop: '16px'}} onClick={handleCloseSuccess}>Back to Wallet</button>
            </div>
          )}

          {/* Transaction Details Modal */}
          {selectedTx && (
            <div className="vwal-modal-box">
              <button className="vwal-close-x" onClick={() => setSelectedTx(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <h3 className="vwal-modal-title" style={{textAlign: 'center', margin: '0 0 8px 0'}}>Transaction Details</h3>
              
              <div className="vwal-receipt-header">
                <span className="vwal-receipt-amount">Rs. {selectedTx.amount.toLocaleString('en-IN')}</span>
                <span className={`vwal-status-pill ${selectedTx.status === 'Pending' ? 'vwal-status-pending' : 'vwal-status-completed'}`} style={{marginTop: '8px', fontSize: '14px', padding: '6px 16px'}}>
                  {selectedTx.status}
                </span>
              </div>

              <div className="vwal-receipt-body">
                <div className="vwal-receipt-row">
                  <span>Type</span>
                  <strong>{selectedTx.title}</strong>
                </div>
                <div className="vwal-receipt-row">
                  <span>Date & Time</span>
                  <strong>{selectedTx.displayDate}</strong>
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