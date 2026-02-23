import React, { useState } from 'react';
import './r_home.css';

const RiderHome = () => {
  const [activeTab, setActiveTab] = useState('New Orders');

  // Laundry-specific mock data for the web grid
  const mockOrders = [
    { id: '1234UA', type: 'Wash & Fold', distance: '1.7 Km', price: 'Rs.10.1', comment: 'Please do not mix colored clothes.' },
    { id: '1235UB', type: 'Dry Cleaning', distance: '2.4 Km', price: 'Rs.15.5', comment: 'Handle suit with care.' },
    { id: '1236UC', type: 'Ironing Only', distance: '0.8 Km', price: 'Rs.5.0', comment: 'Call upon arrival.' }
  ];

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
          <h1 className="rhome-header-title">Quick Wash Rider</h1>
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

      {/* Main Content (Responsive Web Grid) */}
      <main className="rhome-main-grid">
        {mockOrders.map((order) => (
          <div key={order.id} className="rhome-card">
            <div className="rhome-card-header">
              <span className="rhome-label">Status</span>
              <span className="rhome-status-pill">Waiting to pickup</span>
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

            <div className="rhome-payment-row">
              <span className="rhome-label">Est. Earnings</span>
              <span className="rhome-payment-amount">
                {order.price} <span className="rhome-payment-status">(Pending)</span>
              </span>
            </div>

            <div className="rhome-comment-section">
              <span className="rhome-label">Customer Note</span>
              <p className="rhome-comment-text">{order.comment}</p>
            </div>

            <button className="rhome-assign-btn">Accept Pickup</button>
          </div>
        ))}
      </main>

      {/* Bottom Navigation */}
      <footer className="rhome-bottom-nav">
        <button className="rhome-nav-item rhome-nav-active">
          <span>🏠</span>
          <small>Home</small>
        </button>
        <button className="rhome-nav-item">
          <span>💳</span>
          <small>Wallet</small>
        </button>
        <button className="rhome-nav-item">
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