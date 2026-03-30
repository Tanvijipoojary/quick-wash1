import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './r_wallet.css';

const RiderWallet = () => {
  const navigate = useNavigate();

  // App States
  const [riderEmail, setRiderEmail] = useState('');
  const [balance, setBalance] = useState(0); 
  const [pendingPayout, setPendingPayout] = useState(0); 
  const [todaysEarnings, setTodaysEarnings] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Modal States
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  // Dynamic Bank Details
  const [bankDetails, setBankDetails] = useState({ name: '', ac: '', ifsc: '' });
  const [newBank, setNewBank] = useState({ name: '', ac: '', ifsc: '' });

  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter State
  const [filterType, setFilterType] = useState('all'); 

  // --- 1. FETCH WALLET DATA ---
  const fetchWalletData = async (email) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/riders/wallet/${email}`);
      setBalance(res.data.balance);
      setPendingPayout(res.data.pendingPayout);
      setTodaysEarnings(res.data.todaysEarnings);
      if (res.data.bankDetails && res.data.bankDetails.ac) {
        setBankDetails(res.data.bankDetails);
      }
      setTransactions(res.data.transactions);
    } catch (error) {
      console.error("Failed to load wallet data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedRider = localStorage.getItem('quickwash_rider');
    if (!savedRider) {
      navigate('/');
      return;
    }
    const parsedData = JSON.parse(savedRider);
    setRiderEmail(parsedData.email);
    fetchWalletData(parsedData.email);
  }, [navigate]);


  // --- 2. HANDLERS ---
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount);
    if (!amount || amount > balance || amount <= 0) return;
    
    if (!bankDetails.ac) {
      alert("Please add a Bank Account first!");
      setIsWithdrawModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/riders/wallet/withdraw', {
        email: riderEmail,
        amount: amount
      });
      
      setIsWithdrawModalOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      setWithdrawAmount('');
      
      // Refresh data securely from backend!
      fetchWalletData(riderEmail); 
    } catch (error) {
      alert("Failed to process withdrawal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBank = async (e) => {
    e.preventDefault();
    if(newBank.name && newBank.ac && newBank.ifsc) {
      try {
        await axios.put('http://localhost:5000/api/riders/wallet/bank', {
          email: riderEmail,
          bankDetails: newBank
        });
        
        setBankDetails(newBank);
        setIsBankModalOpen(false);
        setNewBank({ name: '', ac: '', ifsc: '' }); 
      } catch (error) {
        console.error("Bank Error:", error);
        // 👇 Now shows the EXACT error so we know what to fix
        alert(error.response?.data?.message || "Failed to reach backend. Did you restart the server?");
      }
    }
  };

  // Compute Filtered Transactions
  const filteredTransactions = transactions.filter(txn => {
    if (filterType === 'all') return true;
    return txn.type === filterType;
  });

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' });
  };

  if (isLoading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading Wallet... ⏳</div>;

  return (
    <div className="rwall-container">
      
      {/* --- HEADER --- */}
      <header className="rwall-header">
        <button className="rwall-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
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
                  <strong>{bankDetails.name || 'No Bank Added'}</strong>
                  <button className="rwall-change-bank-btn" onClick={() => setIsBankModalOpen(true)}>
                    {bankDetails.ac ? 'Change' : 'Add Bank'}
                  </button>
                </div>
                <small>
                  {bankDetails.ac ? `Ac/ No. **** ${bankDetails.ac.slice(-4)}` : 'Link bank to withdraw'}
                </small>
              </div>
            </div>
            <button 
              className="rwall-withdraw-btn" 
              onClick={() => setIsWithdrawModalOpen(true)}
              disabled={balance <= 0 || !bankDetails.ac}
              style={{ opacity: (balance <= 0 || !bankDetails.ac) ? 0.5 : 1 }}
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* --- QUICK STATS --- */}
        <div className="rwall-stats-grid">
          <div className="rwall-stat-box">
            <small>Today's Earnings</small>
            <strong>Rs. {todaysEarnings}</strong>
          </div>
          <div className="rwall-stat-box">
            <small>Pending Payout</small>
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
              filteredTransactions.map((txn, idx) => (
                <div key={idx} className="rwall-txn-item clickable" onClick={() => setSelectedTxn(txn)}>
                  <div className="rwall-txn-left">
                    <div className={`rwall-txn-icon ${txn.type}`}>
                      {txn.type === 'credit' ? '↓' : '↑'}
                    </div>
                    <div className="rwall-txn-details">
                      <strong>{txn.title}</strong>
                      <small>{formatDate(txn.date)}</small>
                    </div>
                  </div>
                  <div className="rwall-txn-right">
                    <div className={`rwall-txn-amount ${txn.type}`}>
                      {txn.type === 'credit' ? '+' : '-'} Rs. {txn.amount}
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
              <button className={`rwall-filter-opt ${filterType === 'all' ? 'active' : ''}`} onClick={() => {setFilterType('all'); setIsFilterModalOpen(false);}}>All Transactions</button>
              <button className={`rwall-filter-opt ${filterType === 'credit' ? 'active' : ''}`} onClick={() => {setFilterType('credit'); setIsFilterModalOpen(false);}}>Earnings (Credits ↓)</button>
              <button className={`rwall-filter-opt ${filterType === 'debit' ? 'active' : ''}`} onClick={() => {setFilterType('debit'); setIsFilterModalOpen(false);}}>Withdrawals (Debits ↑)</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHANGE BANK MODAL */}
      {isBankModalOpen && (
        <div className="rwall-modal-overlay">
          <div className="rwall-modal-card">
            <div className="rwall-modal-header">
              <h2>{bankDetails.ac ? 'Update Bank Account' : 'Link Bank Account'}</h2>
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
              <button type="submit" className="rwall-submit-btn" style={{marginTop: '8px'}}>Save Account</button>
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
                disabled={!withdrawAmount || withdrawAmount > balance || isSubmitting}
                style={{ opacity: (!withdrawAmount || withdrawAmount > balance || isSubmitting) ? 0.6 : 1 }}
              >
                {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
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
              <h3 className="rwall-txn-detail-amount">{selectedTxn.type === 'credit' ? '+' : '-'} Rs. {selectedTxn.amount}</h3>
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
                <strong>{formatDate(selectedTxn.date)}</strong>
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
            <p>Your funds are on the way to your bank.</p>
          </div>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION --- */}
      <footer className="rwall-bottom-nav">
        <button className="rwall-nav-item" onClick={() => navigate('/rider-home')}>
          <span className="rwall-nav-icon">🛵</span><small>Ride</small>
        </button>
        <button className="rwall-nav-item active" onClick={() => navigate('/rider-wallet')}>
          <span className="rwall-nav-icon">💳</span><small>Wallet</small>
        </button>
        <button className="rwall-nav-item" onClick={() => navigate('/rider-earnings')}>
          <span className="rwall-nav-icon">💲</span><small>Earnings</small>
        </button>
        <button className="rwall-nav-item" onClick={() => navigate('/rider-profile')}>
          <span className="rwall-nav-icon">👤</span><small>Profile</small>
        </button>
      </footer>
    </div>
  );
};

export default RiderWallet;