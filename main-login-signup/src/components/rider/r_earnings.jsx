import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './r_earnings.css';

const RiderEarnings = () => {
  const navigate = useNavigate();

  // State to manage the popup modal
  const [selectedEarning, setSelectedEarning] = useState(null);

  const weeklyData = [
    { id: 1, dateRange: '02 Feb- 08 Feb', amount: 200, height: '40%' },
    { id: 2, dateRange: '09 Feb- 15 Feb', amount: 400, height: '65%' },
    { id: 3, dateRange: '16 Feb- 22 Feb', amount: 600, height: '100%' }, 
    { id: 4, dateRange: '23 Feb- 01 Mar', amount: 300, height: '50%' },
  ];

  // Updated mock data with detailed breakdown for the modal
  const recentActivity = [
    { id: 1, date: '20.02.2023', type: 'Total Earning', amount: 'Rs. 600', hours: '6h 1m', tips: 'Rs. 50', deliveriesCount: 8, deliveryEarnings: 'Rs. 550' },
    { id: 2, date: '19.02.2023', type: 'Total Earning', amount: 'Rs. 100', hours: '1h 30m', tips: 'Rs. 10', deliveriesCount: 2, deliveryEarnings: 'Rs. 90' },
    { id: 3, date: '18.02.2023', type: 'Total Earning', amount: 'Rs. 150', hours: '2h 15m', tips: 'Rs. 20', deliveriesCount: 3, deliveryEarnings: 'Rs. 130' },
    { id: 4, date: '17.02.2023', type: 'Total Earning', amount: 'Rs. 200', hours: '3h 0m', tips: 'Rs. 0', deliveriesCount: 4, deliveryEarnings: 'Rs. 200' },
    { id: 5, date: '16.02.2023', type: 'Total Earning', amount: 'Rs. 300', hours: '4h 45m', tips: 'Rs. 40', deliveriesCount: 5, deliveryEarnings: 'Rs. 260' },
    { id: 6, date: '15.02.2023', type: 'Total Earning', amount: 'Rs. 100', hours: '1h 10m', tips: 'Rs. 5', deliveriesCount: 1, deliveryEarnings: 'Rs. 95' },
  ];

  // Function to close modal
  const closeModal = () => {
    setSelectedEarning(null);
  };

  return (
    <div className="rearn-container">
      <header className="rearn-header">
        <div className="rearn-header-left">
          <button className="rearn-back-btn" onClick={() => navigate('/rider-home')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h1 className="rearn-header-title">EARNINGS</h1>
        </div>
      </header>

      <main className="rearn-main-content">
        
        {/* Weekly Earnings Chart Section */}
        <div className="rearn-chart-section">
          <h3 className="rearn-section-title" style={{ textAlign: 'center', marginBottom: '24px' }}>
            Weekly Earnings
          </h3>
          
          <div className="rearn-chart-container">
            {weeklyData.map((data) => (
              <div key={data.id} className="rearn-chart-column">
                <div className="rearn-chart-bar-wrapper">
                  <span className="rearn-chart-amount">Rs. {data.amount}</span>
                  <div className="rearn-chart-bar" style={{ height: data.height }}></div>
                </div>
                <div className="rearn-chart-date-wrapper">
                  <span className="rearn-chart-date">{data.dateRange}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rearn-activity-section">
          <div className="rearn-activity-header">
            <h3 className="rearn-section-title">Recent Activity</h3>
     <button className="rearn-see-more-btn"onClick={() => navigate('/rider-earnings-history')}>
  See More
</button>
          </div>
          
          <div className="rearn-activity-list">
            {recentActivity.map((activity) => (
              <div 
                key={activity.id} 
                className="rearn-activity-item"
                onClick={() => setSelectedEarning(activity)} // Opens the popup!
              >
                <div className="rearn-activity-left">
                  <span className="rearn-activity-date">{activity.date}</span>
                  <span className="rearn-activity-type">{activity.type}</span>
                </div>
                <div className="rearn-activity-right">
                  <span className="rearn-activity-amount">{activity.amount}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* =========================================
          EARNINGS DETAILS MODAL
          ========================================= */}
      {selectedEarning && (
        <div className="rearn-modal-overlay">
          <div className="rearn-modal-box">
            
            {/* Modal Header */}
            <div className="rearn-modal-header">
              <h3 className="rearn-modal-title">Earnings</h3>
              <button className="rearn-modal-close" onClick={closeModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Total Row (Gray Background) */}
            <div className="rearn-modal-total-row">
              <span>Total Earnings</span>
              <span>{selectedEarning.amount}</span>
            </div>

            {/* Breakdown Rows */}
            <div className="rearn-modal-breakdown">
              <div className="rearn-modal-row">
                <span className="rearn-modal-label">Hours Worked</span>
                <span className="rearn-modal-value">{selectedEarning.hours}</span>
              </div>
              <div className="rearn-modal-row">
                <span className="rearn-modal-label">Tips</span>
                <span className="rearn-modal-value">{selectedEarning.tips}</span>
              </div>
              <div className="rearn-modal-row rearn-modal-link-row">
                <span className="rearn-modal-blue-text">Deliveries({selectedEarning.deliveriesCount})</span>
                <span className="rearn-modal-blue-text">
                  {selectedEarning.deliveryEarnings}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px', marginBottom: '-3px' }}>
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <footer className="rearn-bottom-nav">
        <button className="rearn-nav-item" onClick={() => navigate('/rider-home')}>
          <span>🏠</span>
          <small>Home</small>
        </button>
        <button className="rearn-nav-item" onClick={() => navigate('/rider-wallet')}>
          <span>💳</span>
          <small>Wallet</small>
        </button>
        <button className="rearn-nav-item rearn-nav-active">
          <span>💲</span>
          <small>Earnings</small>
        </button>
        <button className="rearn-nav-item">
          <span>👤</span>
          <small>Profile</small>
        </button>
      </footer>
    </div>
  );
};

export default RiderEarnings;