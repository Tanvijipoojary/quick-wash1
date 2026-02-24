import React from 'react';
import { useNavigate } from 'react-router-dom';
import './r_earnings_history.css';

const RiderEarningsHistory = () => {
  const navigate = useNavigate();

  // Extended mock data for the history page
  const historyActivity = [
    { id: 1, date: '20.02.2023', type: 'Total Earning', amount: 'Rs. 600' },
    { id: 2, date: '20.02.2023', type: 'Total Earning', amount: 'Rs. 100' },
    { id: 3, date: '20.02.2023', type: 'Total Earning', amount: 'Rs. 100' },
    { id: 4, date: '20.02.2023', type: 'Total Earning', amount: 'Rs. 100' },
    { id: 5, date: '20.02.2023', type: 'Total Earning', amount: 'Rs. 100' },
    { id: 6, date: '20.02.2023', type: 'Total Earning', amount: 'Rs. 100' },
    { id: 7, date: '19.02.2023', type: 'Total Earning', amount: 'Rs. 450' },
    { id: 8, date: '18.02.2023', type: 'Total Earning', amount: 'Rs. 320' },
  ];

  return (
    <div className="rhist-container">
      {/* Header */}
      <header className="rhist-header">
        <button className="rhist-back-btn" onClick={() => navigate('/rider-earnings')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="rhist-header-title">01/21/2023 - 02/20/2023</h1>
        <button className="rhist-filter-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="rhist-main-content">
        
        {/* Summary Box */}
        <div className="rhist-summary-box">
          <h3 className="rhist-summary-title">Summary</h3>
          <div className="rhist-summary-stats">
            <div className="rhist-stat-column">
              <span className="rhist-stat-label">Hours</span>
              <span className="rhist-stat-value">175h 50m</span>
            </div>
            <div className="rhist-stat-column">
              <span className="rhist-stat-label">Deliveries</span>
              <span className="rhist-stat-value">267</span>
            </div>
            <div className="rhist-stat-column rhist-stat-last">
              <span className="rhist-stat-label">Total Earnings</span>
              <span className="rhist-stat-value">Rs. 1200</span>
            </div>
          </div>
        </div>

        {/* Extended Activity List */}
        <div className="rhist-activity-list">
          {historyActivity.map((activity) => (
            <div key={activity.id} className="rhist-activity-item">
              <div className="rhist-activity-left">
                <span className="rhist-activity-date">{activity.date}</span>
                <span className="rhist-activity-type">{activity.type}</span>
              </div>
              <div className="rhist-activity-right">
                <span className="rhist-activity-amount">{activity.amount}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
};

export default RiderEarningsHistory;