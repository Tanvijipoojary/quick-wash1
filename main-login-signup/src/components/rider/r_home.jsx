import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './r_home.css';

const RiderHome = () => {
  const navigate = useNavigate(); // <-- Add this line
  const [activeTab, setActiveTab] = useState('New Orders');
 

  // Our master list of orders
  const [orders, setOrders] = useState([
    { id: '1234UA', type: 'Wash & Fold', distance: '1.7 Km', price: 'Rs.10.1', comment: 'Please do not mix colored clothes.', status: 'New Orders' },
    { id: '1235UB', type: 'Dry Cleaning', distance: '2.4 Km', price: 'Rs.15.5', comment: 'Handle suit with care.', status: 'New Orders' },
    { id: '1236UC', type: 'Ironing Only', distance: '0.8 Km', price: 'Rs.5.0', comment: 'Call upon arrival.', status: 'Delivered' }
  ]);

  // 1. NEW LOGIC: Check if the rider currently has any order in "Processing"
  const hasActiveOrder = orders.some(order => order.status === 'Processing');

  // Filter orders based on the clicked tab
  const filteredOrders = orders.filter(order => order.status === activeTab);

  // --- Helper Functions ---
  const getPillText = (status) => {
    if (status === 'New Orders') return 'Waiting to pickup';
    if (status === 'Processing') return 'Assigned';
    return 'Completed';
  };

  const getPillClass = (status) => {
    if (status === 'New Orders') return 'rhome-status-pill-waiting';
    if (status === 'Processing') return 'rhome-status-pill-assigned';
    return 'rhome-status-pill-completed';
  };

  // 2. UPDATED BUTTON LOGIC: Handle the 1-order limit and auto-tab switching
  const handleActionClick = (orderId, currentStatus) => {
    let nextStatus = '';
    let nextTab = activeTab;
    
    if (currentStatus === 'New Orders') {
      nextStatus = 'Processing';
      nextTab = 'Processing'; // Automatically jump to Processing tab!
    } else if (currentStatus === 'Processing') {
      nextStatus = 'Delivered';
      nextTab = 'New Orders'; // Jump back to New Orders to find the next gig!
    }

    if (nextStatus) {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: nextStatus } : order
        )
      );
      // Change the tab automatically
      setActiveTab(nextTab);
    }
  };

  return (
    <div className="rhome-container">
      {/* Header */}
      <header className="rhome-header">
        <div className="rhome-header-left">
          <button className="rhome-menu-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 className="rhome-header-title">QUICK WASH RIDER</h1>
        </div>
      </header>

      {/* Tabs */}
      <nav className="rhome-tabs">
        {['New Orders', 'Processing', 'Delivered'].map((tab) => (
          <button
            key={tab}
            className={`rhome-tab-btn ${activeTab === tab ? 'rhome-tab-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="rhome-main-grid">
        
        {/* 3. NEW LOGIC: If they are looking at New Orders but already have an active gig, block the screen! */}
        {activeTab === 'New Orders' && hasActiveOrder ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#6a4a3a', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #faeedf' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚴</div>
            <h3>You have an active order!</h3>
            <p style={{ color: '#888', marginBottom: '24px' }}>Please complete your current delivery before accepting a new one.</p>
            <button 
              className="rhome-assign-btn" 
              style={{ maxWidth: '250px', margin: '0 auto' }}
              onClick={() => setActiveTab('Processing')}
            >
              View Active Order
            </button>
          </div>
        ) : filteredOrders.length > 0 ? (
          /* Normal rendering if the tab isn't blocked and has data */
          filteredOrders.map((order) => (
            <div key={order.id} className="rhome-card">
              
              <div className="rhome-card-header">
                <span className="rhome-label">Status</span>
                <span className={getPillClass(order.status)}>
                  {getPillText(order.status)}
                </span>
              </div>

              <div className="rhome-order-id-row">
                <span className="rhome-label">Order ID</span>
                <span className="rhome-order-id">#{order.id}</span>
              </div>

              <div className="rhome-vendor-info">
                <div className="rhome-vendor-icon">🧺</div>
                <span className="rhome-vendor-name">{order.type}</span>
              </div>

              <div className="rhome-address-section">
                <div className="rhome-address-item">
                  <div className="rhome-icon-wrapper">🏠</div>
                  <div className="rhome-address-details">
                    <span className="rhome-address-type">Pickup From Customer</span>
                    <span className="rhome-address-text">N.38 St. 118, Appt 4B</span>
                  </div>
                </div>

                <div className="rhome-address-item">
                  <div className="rhome-icon-wrapper">🏢</div>
                  <div className="rhome-address-details">
                    <span className="rhome-address-type">Deliver to Laundry Hub</span>
                    <span className="rhome-address-text">Quick Wash Central Station</span>
                  </div>
                </div>
              </div>

              <div className="rhome-meta-row">
                <div className="rhome-meta-item"><span>💰</span> 0.71/km</div>
                <div className="rhome-meta-item"><span>🕒</span> 9:25 PM</div>
                <div className="rhome-meta-item"><span>🚲</span> {order.distance}</div>
              </div>

              {order.status === 'New Orders' ? (
                <div className="rhome-payment-row">
                  <span className="rhome-label">Est. Earnings</span>
                  <span className="rhome-payment-amount">
                    {order.price} <span className="rhome-payment-status">(Pending)</span>
                  </span>
                </div>
              ) : (
                <div className="rhome-payment-row">
                  <span className="rhome-label">Order Amount</span>
                  <span className="rhome-payment-amount">{order.price}</span>
                </div>
              )}

              {order.status === 'New Orders' && (
                <div className="rhome-comment-section">
                  <span className="rhome-label">Customer Note</span>
                  <p className="rhome-comment-text">{order.comment}</p>
                </div>
              )}

              {order.status !== 'Delivered' && (
                <button 
                  className="rhome-assign-btn"
                  onClick={() => handleActionClick(order.id, order.status)}
                >
                  {order.status === 'New Orders' ? 'Accept Pickup' : 'Mark as Picked Up'}
                </button>
              )}
            </div>
          ))
        ) : (
          /* Empty state for tabs with no data */
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#888' }}>
            <h3>No {activeTab.toLowerCase()} right now.</h3>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <footer className="rhome-bottom-nav">
        <button className="rhome-nav-item rhome-nav-active">
          <span>🏠</span>
          <small>Home</small>
        </button>
        <button className="rhome-nav-item" onClick={() => navigate('/rider-wallet')}>
          <span>💳</span>
          <small>Wallet</small>
        </button>
     <button 
          className="rhome-nav-item" 
          onClick={() => navigate('/rider-earnings')} >
          <span>💲</span>
          <small>Earnings</small>
        </button>
        
        <button className="rhome-nav-item">
          <span>👤</span>
          <small>Profile</small>
        </button>
      </footer>
    </div>
  );
};

export default RiderHome;