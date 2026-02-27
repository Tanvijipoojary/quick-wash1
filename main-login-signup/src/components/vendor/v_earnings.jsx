import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './v_earnings.css';

const VendorEarnings = () => {
  const navigate = useNavigate();

  // States
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Mock Chart Data for the week
  const weeklyData = [
    { id: 1, day: 'Mon', amount: 1200, height: '40%' },
    { id: 2, day: 'Tue', amount: 2100, height: '70%' },
    { id: 3, day: 'Wed', amount: 800, height: '30%' },
    { id: 4, day: 'Thu', amount: 3200, height: '100%' },
    { id: 5, day: 'Fri', amount: 2800, height: '85%' },
    { id: 6, day: 'Sat', amount: 0, height: '5%' },
    { id: 7, day: 'Sun', amount: 0, height: '5%' },
  ];

  // Mock Completed Orders (Added 'rawDate' for easy filtering, and made 'net' a number for math)
  const recentEarnings = [
    { id: '8821XB', date: '27 Feb 2026', rawDate: '2026-02-27', time: '10:30 AM', customer: 'Sarah Smith', service: 'Premium Wash & Fold', gross: 800, fee: 80, net: 720 },
    { id: '1234UA', date: '26 Feb 2026', rawDate: '2026-02-26', time: '04:15 PM', customer: 'Alex Johnson', service: 'Dry Clean Suit', gross: 1500, fee: 150, net: 1350 },
    { id: '5566YC', date: '25 Feb 2026', rawDate: '2026-02-25', time: '02:00 PM', customer: 'Mike Ross', service: 'Wash & Iron', gross: 450, fee: 45, net: 405 },
    { id: '9988ZD', date: '25 Feb 2026', rawDate: '2026-02-25', time: '11:45 AM', customer: 'Harvey Specter', service: 'Wash & Fold', gross: 600, fee: 60, net: 540 },
    { id: '3344WE', date: '24 Feb 2026', rawDate: '2026-02-24', time: '09:20 AM', customer: 'Donna Paulsen', service: 'Ironing Only', gross: 200, fee: 20, net: 180 },
  ];

  // Logic to filter orders based on selected dates
  const filteredEarnings = recentEarnings.filter(earning => {
    if (!startDate && !endDate) return true;
    
    const earningDate = new Date(earning.rawDate);
    // Set start bounds (if no start date, default to very old date)
    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    // Set end bounds (if no end date, default to future date)
    const end = endDate ? new Date(endDate) : new Date('2100-01-01');
    
    return earningDate >= start && earningDate <= end;
  });

  // Calculate the dynamic total based on filtered results
  const totalEarnings = filteredEarnings.reduce((sum, item) => sum + item.net, 0);

  // Clear Filters
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="vearn-container">
      
      {/* Glassmorphism Header */}
      <header className="vearn-header">
        <button className="vearn-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="vearn-header-title">Earnings</h1>
        <div style={{ width: 24 }}></div> {/* Spacer for centering */}
      </header>

      <main className="vearn-main-content">
        
        {/* --- Top Summary & Chart Card --- */}
        <div className="vearn-chart-card">
          <div className="vearn-chart-header">
            <div>
              <span className="vearn-chart-label">
                {(startDate || endDate) ? 'Filtered Net Earnings' : "This Week's Net Earnings"}
              </span>
              <h2 className="vearn-chart-total">Rs. {totalEarnings.toLocaleString('en-IN')}</h2>
            </div>
            {!(startDate || endDate) && (
              <div className="vearn-trend-badge">
                ↑ 12% vs last week
              </div>
            )}
          </div>

          <div className="vearn-bar-chart">
            {weeklyData.map((data) => (
              <div key={data.id} className="vearn-bar-column">
                <div className="vearn-bar-wrapper">
                  <div className="vearn-bar-fill" style={{ height: data.height }}></div>
                </div>
                <span className="vearn-bar-day">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- Earnings History List --- */}
        <div className="vearn-history-section">
          
          <div className="vearn-history-header">
            <h3 className="vearn-section-title">Completed Orders</h3>
            
            {/* NEW: Date Filter UI */}
            <div className="vearn-date-filters">
              <div className="vearn-date-input-wrapper">
                <input 
                  type="date" 
                  className="vearn-filter-input" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
              </div>
              <span className="vearn-filter-to">to</span>
              <div className="vearn-date-input-wrapper">
                <input 
                  type="date" 
                  className="vearn-filter-input" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </div>
              {(startDate || endDate) && (
                <button className="vearn-clear-filters" onClick={clearFilters}>
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <div className="vearn-history-list">
            {filteredEarnings.length > 0 ? (
              filteredEarnings.map((earning) => (
                <div 
                  key={earning.id} 
                  className="vearn-history-item"
                  onClick={() => setSelectedEarning(earning)}
                >
                  <div className="vearn-item-left">
                    <div className="vearn-item-icon">👕</div>
                    <div className="vearn-item-details">
                      <span className="vearn-item-title">Order #{earning.id}</span>
                      <span className="vearn-item-date">{earning.date}</span>
                    </div>
                  </div>
                  <div className="vearn-item-right">
                    <span className="vearn-item-amount">+ Rs. {earning.net}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="vearn-empty-state">
                <p>No earnings found for these dates.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* =========================================
          EARNING BREAKDOWN MODAL
          ========================================= */}
      {selectedEarning && (
        <div className="vearn-modal-overlay">
          <div className="vearn-modal-box">
            
            <button className="vearn-close-x" onClick={() => setSelectedEarning(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <h3 className="vearn-modal-title">Earning Breakdown</h3>
            <p className="vearn-modal-subtitle">Order #{selectedEarning.id} • {selectedEarning.date}</p>
            
            <div className="vearn-modal-total-box">
              <span>Net Earning</span>
              <strong>Rs. {selectedEarning.net}</strong>
            </div>

            <div className="vearn-modal-details">
              <div className="vearn-detail-row">
                <span>Customer</span>
                <strong>{selectedEarning.customer}</strong>
              </div>
              <div className="vearn-detail-row">
                <span>Service</span>
                <strong>{selectedEarning.service}</strong>
              </div>
              <div className="vearn-detail-divider"></div>
              <div className="vearn-detail-row">
                <span>Gross Order Value</span>
                <strong>Rs. {selectedEarning.gross}</strong>
              </div>
              <div className="vearn-detail-row vearn-fee-row">
                <span>Quick Wash Fee (10%)</span>
                <strong>- Rs. {selectedEarning.fee}</strong>
              </div>
            </div>

            <button className="vearn-action-btn" onClick={() => setSelectedEarning(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <footer className="vearn-bottom-nav">
        <button className="vearn-nav-item" onClick={() => navigate('/vendor-home')}><span>🏠</span><small>Home</small></button>
        <button className="vearn-nav-item" onClick={() => navigate('/vendor-wallet')}><span>💳</span><small>Wallet</small></button>
        <button className="vearn-nav-item active"><span>💲</span><small>Earnings</small></button>
        <button className="vearn-nav-item" onClick={() => navigate('/vendor-profile')}><span>👤</span><small>Profile</small></button>
      </footer>
    </div>
  );
};

export default VendorEarnings;