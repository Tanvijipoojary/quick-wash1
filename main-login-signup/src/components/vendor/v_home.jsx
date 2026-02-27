import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './v_home.css';

const VendorHome = () => {
  const navigate = useNavigate();
  
  // State for Navigation Tabs
  const [activeTab, setActiveTab] = useState('New Orders');
  const [subTab, setSubTab] = useState('Delivery Orders');

  // Mock Laundry Order Data (Adapted from screenshot template)
  const [orders, setOrders] = useState([
    { 
      id: '1234UA', 
      status: 'New Orders',
      type: 'Delivery Orders',
      items: [
        { name: 'Premium Wash & Fold', desc: 'Colored clothes, cold wash', qty: 2, price: 8 },
        { name: 'Dry Clean Suit', desc: 'Handle with extreme care', qty: 1, price: 15 }
      ],
      total: 31,
      comment: 'Please do not use heavy bleach.'
    },
    { 
      id: '8821XB', 
      status: 'New Orders',
      type: 'Pickup Orders',
      items: [
        { name: 'Ironing Only', desc: 'Cotton shirts', qty: 5, price: 2 },
      ],
      total: 10,
      comment: 'Fold them neatly.'
    }
  ]);

  // Filter orders based on selected tabs
  const displayedOrders = orders.filter(o => o.status === activeTab && o.type === subTab);

  const handleAction = (orderId, action) => {
    if (action === 'accept') {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Processing' } : o));
    } else {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  return (
    <div className="vhome-container">
      
      {/* Header */}
      <header className="vhome-header">
        <button className="vhome-menu-btn" onClick={() => navigate('/vendor-profile')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 className="vhome-header-title">Orders</h1>
        <div style={{ width: 24 }}></div> {/* Empty div for center alignment */}
      </header>

      {/* Main Tabs */}
      <nav className="vhome-main-tabs">
        {['New Orders', 'Processing', 'Delivered'].map(tab => (
          <button 
            key={tab} 
            className={`vhome-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Main Scrollable Content */}
      <main className="vhome-main-content">
        
        {/* Delivery / Pickup Sub-Tabs */}
        <div className="vhome-sub-tabs">
          <button 
            className={`vhome-sub-tab ${subTab === 'Delivery Orders' ? 'active' : ''}`}
            onClick={() => setSubTab('Delivery Orders')}
          >
            Delivery Orders
          </button>
          <button 
            className={`vhome-sub-tab ${subTab === 'Pickup Orders' ? 'active' : ''}`}
            onClick={() => setSubTab('Pickup Orders')}
          >
            Pickup Orders
          </button>
        </div>

        {/* Orders List */}
        <div className="vhome-orders-list">
          {displayedOrders.length > 0 ? (
            displayedOrders.map(order => (
              <div key={order.id} className="vhome-order-card">
                
                {/* Order ID Header */}
                <div className="vhome-card-header">
                  <div className="vhome-id-block">
                    <span className="vhome-label">Order ID</span>
                    <span className="vhome-id">#{order.id}</span>
                  </div>
                  <div className="vhome-price-header-labels">
                    <span className="vhome-label">ORDER</span>
                    <span className="vhome-label">PRICE</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="vhome-items-list">
                  {order.items.map((item, index) => (
                    <div key={index} className="vhome-item-row">
                      <div className="vhome-item-image">🧺</div>
                      <div className="vhome-item-details">
                        <h4>{item.name}</h4>
                        <p>{item.desc}</p>
                        <span className="vhome-item-qty">x{item.qty}</span>
                      </div>
                      <div className="vhome-item-price">Rs. {item.price}</div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="vhome-total-row">
                  <span className="vhome-total-label">Total</span>
                  <span className="vhome-total-amount">Rs. {order.total}</span>
                </div>

                {/* Comment */}
                {order.comment && (
                  <div className="vhome-comment-box">
                    <span className="vhome-label">Comment</span>
                    <p className="vhome-comment-text">{order.comment}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {order.status === 'New Orders' && (
                  <div className="vhome-actions">
                    <button className="vhome-btn-decline" onClick={() => handleAction(order.id, 'decline')}>
                      Decline
                    </button>
                    <button className="vhome-btn-accept" onClick={() => handleAction(order.id, 'accept')}>
                      Accept
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="vhome-empty">
              <p>No {activeTab.toLowerCase()} for {subTab.toLowerCase()}.</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="vhome-bottom-nav">
        <button className="vhome-nav-item active">
          <span>🏠</span>
          <small>Home</small>
        </button>
        <button className="vhome-nav-item" onClick={() => navigate('/vendor-wallet')}>
          <span>💳</span>
          <small>Wallet</small>
        </button>
        <button className="vhome-nav-item" onClick={() => navigate('/vendor-earnings')}>
          <span>💲</span>
          <small>Earnings</small>
        </button>
        <button className="vhome-nav-item" onClick={() => navigate('/vendor-profile')}>
          <span>👤</span>
          <small>Profile</small>
        </button>
      </footer>
    </div>
  );
};

export default VendorHome;