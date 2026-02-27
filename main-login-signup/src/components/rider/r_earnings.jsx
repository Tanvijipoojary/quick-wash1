import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './r_earnings.css';

const RiderEarnings = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('week'); // 'today', 'week', 'month'
  
  // NEW: State to hold the specific trip a rider clicks on for details
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Mock Chart Data for the Week
  const weeklyData = [
    { day: 'Mon', amount: 350, height: '40%' },
    { day: 'Tue', amount: 420, height: '50%' },
    { day: 'Wed', amount: 210, height: '25%' },
    { day: 'Thu', amount: 680, height: '80%' },
    { day: 'Fri', amount: 550, height: '65%' },
    { day: 'Sat', amount: 890, height: '100%' }, 
    { day: 'Sun', amount: 190, height: '20%' }, 
  ];

  // Dynamic Breakdown based on Timeframe
  const getBreakdown = () => {
    if (timeframe === 'today') return { total: '190', fares: '150', bonus: '0', tips: '40', hours: '3h 15m', trips: '4' };
    if (timeframe === 'month') return { total: '12,450', fares: '10,200', bonus: '1,500', tips: '750', hours: '98h 30m', trips: '142' };
    return { total: '3,290', fares: '2,650', bonus: '500', tips: '140', hours: '24h 15m', trips: '42' }; // Week default
  };

  const currentStats = getBreakdown();

  // Mock Trip History with Detailed Breakdown
  const recentTrips = [
    { id: 'TSK-8821XB', type: 'Collection', time: 'Today, 2:30 PM', total: 'Rs. 80', baseFare: 'Rs. 50', distancePay: 'Rs. 20', tip: 'Rs. 10' },
    { id: 'TSK-9942YC', type: 'Delivery', time: 'Today, 1:15 PM', total: 'Rs. 110', baseFare: 'Rs. 50', distancePay: 'Rs. 40', tip: 'Rs. 20' },
    { id: 'TSK-5522AA', type: 'Collection', time: 'Yesterday, 9:30 AM', total: 'Rs. 60', baseFare: 'Rs. 50', distancePay: 'Rs. 10', tip: 'Rs. 0' },
  ];

  return (
    <div className="rearn-container">
      
      {/* --- HEADER --- */}
      <header className="rearn-header">
        <button className="rearn-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="rearn-title">Earnings</h1>
        <div style={{ width: 24 }}></div> 
      </header>

      <main className="rearn-main-content">
        
        {/* --- TIMEFRAME TOGGLE --- */}
        <div className="rearn-toggle-wrapper">
          <button className={`rearn-toggle-btn ${timeframe === 'today' ? 'active' : ''}`} onClick={() => setTimeframe('today')}>Today</button>
          <button className={`rearn-toggle-btn ${timeframe === 'week' ? 'active' : ''}`} onClick={() => setTimeframe('week')}>This Week</button>
          <button className={`rearn-toggle-btn ${timeframe === 'month' ? 'active' : ''}`} onClick={() => setTimeframe('month')}>This Month</button>
        </div>

        {/* --- BIG EARNINGS DISPLAY --- */}
        <div className="rearn-hero-section">
          <small>Total Earnings ({timeframe === 'week' ? 'Mon - Sun' : timeframe === 'today' ? 'Today' : 'Feb 1 - Feb 28'})</small>
          <h2>Rs. {currentStats.total}</h2>
          <div className="rearn-online-time">
            <span>⏱️ {currentStats.hours} Online</span>
            <span>🛵 {currentStats.trips} Trips</span>
          </div>
        </div>

        {/* --- CSS BAR CHART (Shows only on 'week' view) --- */}
        {timeframe === 'week' && (
          <div className="rearn-chart-card">
            <div className="rearn-chart-header">
              <h3>Weekly Trends</h3>
              <span>Best Day: Saturday</span>
            </div>
            
            <div className="rearn-chart-area">
              {weeklyData.map((data, index) => (
                <div key={index} className="rearn-bar-column">
                  <div className="rearn-bar-track">
                    <div 
                      className={`rearn-bar-fill ${data.day === 'Sat' ? 'peak' : ''}`} 
                      style={{ height: data.height }}
                    ></div>
                  </div>
                  <span className="rearn-day-label">{data.day}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- EARNINGS BREAKDOWN --- */}
        <div className="rearn-breakdown-card">
          <h3>Earnings Breakdown</h3>
          <div className="rearn-breakdown-row">
            <div className="rearn-bd-left">
              <span className="rearn-bd-icon" style={{background: '#e0f2fe', color: '#0284c7'}}>🛵</span>
              <span>Trip Fares</span>
            </div>
            <strong>Rs. {currentStats.fares}</strong>
          </div>
          <div className="rearn-breakdown-row">
            <div className="rearn-bd-left">
              <span className="rearn-bd-icon" style={{background: '#dcfce7', color: '#10b981'}}>🎁</span>
              <span>Bonuses</span>
            </div>
            <strong>Rs. {currentStats.bonus}</strong>
          </div>
          <div className="rearn-breakdown-row">
            <div className="rearn-bd-left">
              <span className="rearn-bd-icon" style={{background: '#fef3c7', color: '#d97706'}}>⭐</span>
              <span>Customer Tips</span>
            </div>
            <strong>Rs. {currentStats.tips}</strong>
          </div>
        </div>

        {/* --- RECENT TRIPS (Now Clickable!) --- */}
        <div className="rearn-trips-section">
          <div className="rearn-section-header">
            <h3>Recent Trips</h3>
            {/* Navigates to Wallet to see the full transaction history */}
            <button className="rearn-text-link" onClick={() => navigate('/rider-wallet')}>See Wallet</button>
          </div>
          <div className="rearn-trips-list">
            {recentTrips.map((trip, idx) => (
              <div key={idx} className="rearn-trip-item clickable" onClick={() => setSelectedTrip(trip)}>
                <div className="rearn-trip-left">
                  <div className={`rearn-trip-dot ${trip.type === 'Collection' ? 'collection' : 'delivery'}`}></div>
                  <div className="rearn-trip-info">
                    <strong>{trip.type} Run</strong>
                    <small>{trip.time}</small>
                  </div>
                </div>
                <div className="rearn-trip-right">
                  <strong>{trip.total}</strong>
                  <span className="rearn-trip-arrow">›</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* --- NEW: DETAILED EARNING RECEIPT MODAL --- */}
      {selectedTrip && (
        <div className="rearn-modal-overlay">
          <div className="rearn-modal-card">
            <div className="rearn-modal-header">
              <h2>Trip Earning Details</h2>
              <button className="rearn-close-btn" onClick={() => setSelectedTrip(null)}>✕</button>
            </div>
            
            <div className="rearn-receipt-body">
              <div className="rearn-receipt-top">
                <span className="rearn-receipt-id">ID: {selectedTrip.id}</span>
                <h3 className="rearn-receipt-total">{selectedTrip.total}</h3>
                <span className={`rearn-receipt-badge ${selectedTrip.type === 'Collection' ? 'collection' : 'delivery'}`}>
                  {selectedTrip.type} Run
                </span>
              </div>
              
              <div className="rearn-receipt-divider"></div>

              <div className="rearn-receipt-row">
                <span>Base Fare</span>
                <strong>{selectedTrip.baseFare}</strong>
              </div>
              <div className="rearn-receipt-row">
                <span>Distance Pay</span>
                <strong>{selectedTrip.distancePay}</strong>
              </div>
              <div className="rearn-receipt-row">
                <span>Customer Tip</span>
                <strong style={{color: '#10b981'}}>{selectedTrip.tip}</strong>
              </div>
            </div>

            <button className="rearn-submit-btn" onClick={() => setSelectedTrip(null)}>Close Details</button>
          </div>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION (Fully Wired!) --- */}
      <footer className="rearn-bottom-nav">
        <button className="rearn-nav-item" onClick={() => navigate('/rider-home')}>
          <span className="rearn-nav-icon">🛵</span><small>Ride</small>
        </button>
        <button className="rearn-nav-item" onClick={() => navigate('/rider-wallet')}>
          <span className="rearn-nav-icon">💳</span><small>Wallet</small>
        </button>
        <button className="rearn-nav-item active" onClick={() => navigate('/rider-earnings')}>
          <span className="rearn-nav-icon">💲</span><small>Earnings</small>
        </button>
        {/* We will build the profile page next! */}
        <button className="rearn-nav-item" onClick={() => navigate('/rider-profile')}>
          <span className="rearn-nav-icon">👤</span><small>Profile</small>
        </button>
      </footer>

    </div>
  );
};

export default RiderEarnings;