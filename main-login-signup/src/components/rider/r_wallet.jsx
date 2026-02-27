import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './r_wallet.css';

const RiderWallet = () => {
  const navigate = useNavigate();

  // App States
  const [balance, setBalance] = useState(1250); 
  const [pendingPayout, setPendingPayout] = useState(0); // NEW: Pending Payout State
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Modal States
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  // Dynamic Bank Details
  const [bankDetails, setBankDetails] = useState({ name: 'HDFC Bank', ac: '4567' });
  const [newBank, setNewBank] = useState({ name: '', ac: '', ifsc: '' });

  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Filter State
  const [filterType, setFilterType] = useState('all'); // 'all', 'credit', 'debit'

  // Mock Transactions
  const [transactions, setTransactions] = useState([
    { id: 'TXN-8821XB', type: 'credit', title: 'Trip Earning (TSK-8821XB)', date: 'Today, 2:30 PM', amount: '+ Rs. 80', status: 'Completed' },
    { id: 'TXN-9942YC', type: 'credit', title: 'Trip Earning (TSK-9942YC)', date: 'Today, 1:15 PM', amount: '+ Rs. 110', status: 'Completed' },
    { id: 'TXN-BWD771', type: 'debit', title: 'Bank Withdrawal', date: 'Yesterday, 6:00 PM', amount: '- Rs. 850', status: `Processed to ${bankDetails.name}` },
    { id: 'TXN-BNS004', type: 'credit', title: 'Weekly Bonus', date: 'Yesterday, 10:00 AM', amount: '+ Rs. 200', status: 'Credited' },
    { id: 'TXN-5522AA', type: 'credit', title: 'Trip Earning (TSK-5522AA)', date: 'Yesterday, 9:30 AM', amount: '+ Rs. 60', status: 'Completed' },
  ]);

  // --- HANDLERS ---
  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount);
    if (!amount || amount > balance || amount <= 0) return;

    setTimeout(() => {
      setIsWithdrawModalOpen(false);
      
      // NEW: Subtract from balance, Add to pending payout!
      setBalance(prev => prev - amount);
      setPendingPayout(prev => prev + amount);
      
      setShowSuccess(true);
      
      const newTxn = {
        id: `TXN-BWD${Math.floor(Math.random() * 1000)}`,
        type: 'debit',
        title: 'Bank Withdrawal',
        date: 'Just now',
        amount: `- Rs. ${amount}`,
        status: `Processing to ${bankDetails.name}`
      };
      setTransactions([newTxn, ...transactions]);

      setTimeout(() => setShowSuccess(false), 2500);
      setWithdrawAmount('');
    }, 800);
  };

  const handleUpdateBank = (e) => {
    e.preventDefault();
    if(newBank.name && newBank.ac) {
      // Get last 4 digits for display
      const last4 = newBank.ac.slice(-4);
      setBankDetails({ name: newBank.name, ac: last4 });
      setIsBankModalOpen(false);
      setNewBank({ name: '', ac: '', ifsc: '' }); // Reset form
    }
  };

  // Compute Filtered Transactions
  const filteredTransactions = transactions.filter(txn => {
    if (filterType === 'all') return true;
    return txn.type === filterType;
  });

  return (
    <div className="rwall-container">
      
      {/* --- HEADER --- */}
      <header className="rwall-header">
        <button className="rwall-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="rwall-title">My Wallet</h1>
        <div style={{ width: 24 }}></div> 
      </header>

      <main className="rwall-main-content">
        
        {/* --- BALANCE CARD --- */}
        <div className="rwall-balance-card">
          <div className="rwall-balance-top">
            <span className="rwall-balance-label">Available Balance</span>
            <span className="rwall-balance-amount">Rs. {balance}</span>
          </div>
          <div className="rwall-balance-bottom">
            <div className="rwall-bank-info">
              <span className="rwall-bank-icon">🏦</span>
              <div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <strong>{bankDetails.name}</strong>
                  <button className="rwall-change-bank-btn" onClick={() => setIsBankModalOpen(true)}>Change</button>
                </div>
                <small>Ac/ No. **** {bankDetails.ac}</small>
              </div>
            </div>
            <button 
              className="rwall-withdraw-btn" 
              onClick={() => setIsWithdrawModalOpen(true)}
              disabled={balance <= 0}
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* --- QUICK STATS --- */}
        <div className="rwall-stats-grid">
          <div className="rwall-stat-box">
            <small>Today's Earnings</small>
            <strong>Rs. 190</strong>
          </div>
          <div className="rwall-stat-box">
            <small>Pending Payout</small>
            {/* NEW: Dynamically displays the pending payout state */}
            <strong>Rs. {pendingPayout}</strong>
          </div>
        </div>

        {/* --- TRANSACTIONS LIST WITH WORKING FILTER --- */}
        <div className="rwall-transactions-section">
          <div className="rwall-section-header">
            <h2>Recent Transactions</h2>
            <button className="rwall-filter-btn" onClick={() => setIsFilterModalOpen(true)}>
              {filterType === 'all' ? 'Filter: All' : filterType === 'credit' ? 'Filter: Earnings' : 'Filter: Withdrawals'}
            </button>
          </div>

          <div className="rwall-transactions-list">
            {filteredTransactions.length === 0 ? (
              <p style={{textAlign: 'center', color: '#888', marginTop: '20px'}}>No transactions found.</p>
            ) : (
              filteredTransactions.map((txn) => (
                <div key={txn.id} className="rwall-txn-item clickable" onClick={() => setSelectedTxn(txn)}>
                  <div className="rwall-txn-left">
                    <div className={`rwall-txn-icon ${txn.type}`}>
                      {txn.type === 'credit' ? '↓' : '↑'}
                    </div>
                    <div className="rwall-txn-details">
                      <strong>{txn.title}</strong>
                      <small>{txn.date}</small>
                    </div>
                  </div>
                  <div className="rwall-txn-right">
                    <div className={`rwall-txn-amount ${txn.type}`}>
                      {txn.amount}
                    </div>
                    <span className="rwall-txn-arrow">›</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* --- MODALS --- */}

      {/* 1. FILTER MODAL */}
      {isFilterModalOpen && (
        <div className="rwall-modal-overlay">
          <div className="rwall-modal-card">
            <div className="rwall-modal-header">
              <h2>Filter View</h2>
              <button className="rwall-close-btn" onClick={() => setIsFilterModalOpen(false)}>✕</button>
            </div>
            <div className="rwall-filter-options">
              <button className={`rwall-filter-opt ${filterType === 'all' ? 'active' : ''}`} onClick={() => {setFilterType('all'); setIsFilterModalOpen(false);}}>
                All Transactions
              </button>
              <button className={`rwall-filter-opt ${filterType === 'credit' ? 'active' : ''}`} onClick={() => {setFilterType('credit'); setIsFilterModalOpen(false);}}>
                Earnings (Credits ↓)
              </button>
              <button className={`rwall-filter-opt ${filterType === 'debit' ? 'active' : ''}`} onClick={() => {setFilterType('debit'); setIsFilterModalOpen(false);}}>
                Withdrawals (Debits ↑)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHANGE BANK MODAL */}
      {isBankModalOpen && (
        <div className="rwall-modal-overlay">
          <div className="rwall-modal-card">
            <div className="rwall-modal-header">
              <h2>Update Bank Account</h2>
              <button className="rwall-close-btn" onClick={() => setIsBankModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateBank}>
              <div className="rwall-input-group">
                <label>Bank Name</label>
                <input type="text" placeholder="e.g. SBI, ICICI" value={newBank.name} onChange={(e) => setNewBank({...newBank, name: e.target.value})} required />
              </div>
              <div className="rwall-input-group">
                <label>Account Number</label>
                <input type="text" placeholder="Enter Full Ac/ No" value={newBank.ac} onChange={(e) => setNewBank({...newBank, ac: e.target.value})} required />
              </div>
              <div className="rwall-input-group">
                <label>IFSC Code</label>
                <input type="text" placeholder="e.g. SBIN0001234" value={newBank.ifsc} onChange={(e) => setNewBank({...newBank, ifsc: e.target.value})} required style={{textTransform: 'uppercase'}}/>
              </div>
              <button type="submit" className="rwall-submit-btn" style={{marginTop: '8px'}}>Save New Account</button>
            </form>
          </div>
        </div>
      )}

      {/* 3. WITHDRAW MODAL */}
      {isWithdrawModalOpen && (
        <div className="rwall-modal-overlay">
          <div className="rwall-modal-card">
            <div className="rwall-modal-header">
              <h2>Withdraw Funds</h2>
              <button className="rwall-close-btn" onClick={() => setIsWithdrawModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleWithdraw}>
              <div className="rwall-input-group">
                <label>Amount to Withdraw (Rs.)</label>
                <input 
                  type="number" 
                  placeholder={`Max: ${balance}`} 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={balance}
                  required
                />
              </div>
              <p className="rwall-modal-note">Money will be deposited to your linked {bankDetails.name} account within 2-4 hours.</p>
              <button 
                type="submit" 
                className="rwall-submit-btn"
                disabled={!withdrawAmount || withdrawAmount > balance}
              >
                Confirm Withdrawal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. TRANSACTION RECEIPT MODAL */}
      {selectedTxn && (
        <div className="rwall-modal-overlay">
          <div className="rwall-modal-card">
            <div className="rwall-modal-header">
              <h2>Transaction Details</h2>
              <button className="rwall-close-btn" onClick={() => setSelectedTxn(null)}>✕</button>
            </div>
            
            <div className="rwall-txn-detail-body">
              <div className={`rwall-txn-large-icon ${selectedTxn.type}`}>
                {selectedTxn.type === 'credit' ? '↓' : '↑'}
              </div>
              <h3 className="rwall-txn-detail-amount">{selectedTxn.amount}</h3>
              <span className={`rwall-txn-detail-status ${selectedTxn.type}`}>
                {selectedTxn.status}
              </span>
              
              <div className="rwall-txn-info-row">
                <span>Transaction ID</span>
                <strong>{selectedTxn.id}</strong>
              </div>
              <div className="rwall-txn-info-row">
                <span>Description</span>
                <strong>{selectedTxn.title}</strong>
              </div>
              <div className="rwall-txn-info-row">
                <span>Date & Time</span>
                <strong>{selectedTxn.date}</strong>
              </div>
            </div>

            <button className="rwall-submit-btn" onClick={() => setSelectedTxn(null)}>Close Receipt</button>
          </div>
        </div>
      )}

      {/* 5. SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="rwall-success-overlay">
          <div className="rwall-success-box">
            <div className="rwall-success-icon">✅</div>
            <h2>Withdrawal Initiated!</h2>
            <p>Rs. {withdrawAmount} is on its way to your bank.</p>
          </div>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION --- */}
      {/* --- BOTTOM NAVIGATION --- */}
      <footer className="rwall-bottom-nav">
        <button className="rwall-nav-item" onClick={() => navigate('/rider-home')}>
          <span className="rwall-nav-icon">🛵</span><small>Ride</small>
        </button>
        <button className="rwall-nav-item active" onClick={() => navigate('/rider-wallet')}>
          <span className="rwall-nav-icon">💳</span><small>Wallet</small>
        </button>
        
        {/* FIX: This now navigates to the Earnings page instead of showing an alert! */}
        <button className="rwall-nav-item" onClick={() => navigate('/rider-earnings')}>
          <span className="rwall-nav-icon">💲</span><small>Earnings</small>
        </button>
        
        <button className="rwall-nav-item" onClick={() => alert("Profile next!")}>
          <span className="rwall-nav-icon">👤</span><small>Profile</small>
        </button>
      </footer>
    </div>
  );
};

export default RiderWallet;