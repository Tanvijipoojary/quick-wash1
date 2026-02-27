import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './r_home.css';

const RiderHome = () => {
  const navigate = useNavigate();
  
  // App States
  const [isOnline, setIsOnline] = useState(true);
  const [activeTask, setActiveTask] = useState(null); 
  const [tripStatus, setTripStatus] = useState(''); 
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Swipe to Online State
  const [swipeValue, setSwipeValue] = useState(0);

  // Mock List of Available Orders
  const [availableOrders, setAvailableOrders] = useState([
    {
      id: 'TSK-8821XB',
      taskType: 'Collection Run', 
      pickup: { label: 'Pickup from Customer', name: 'Sarah Smith', address: 'Flat 402, Crystal Heights, Koramangala' },
      dropoff: { label: 'Drop at Vendor Hub', name: 'Quick Wash Premium', address: 'Crystal Arcade, Koramangala' },
      distance: '3.2 km', time: '15 mins', details: '2 Bags Expected', amount: 'Rs. 80'
    },
    {
      id: 'TSK-9942YC',
      taskType: 'Delivery Run', 
      pickup: { label: 'Pickup from Vendor Hub', name: 'Sparkle Cleaners', address: '1st Main, HSR Layout' },
      dropoff: { label: 'Drop to Customer', name: 'Rahul Verma', address: 'Villa 14, Palm Meadows, HSR' },
      distance: '4.5 km', time: '20 mins', details: '1 Bag (Ironed & Folded)', amount: 'Rs. 110'
    },
    {
      id: 'TSK-7710ZA',
      taskType: 'Collection Run', 
      pickup: { label: 'Pickup from Customer', name: 'Priya Patel', address: 'Apt 2B, Sunshine Residency, BTM' },
      dropoff: { label: 'Drop at Vendor Hub', name: 'Wash & Go Hub', address: 'Outer Ring Road, BTM Layout' },
      distance: '2.1 km', time: '10 mins', details: '1 Bag Expected (Dry Clean)', amount: 'Rs. 50'
    }
  ]);

  // --- Handlers ---
  const handleAcceptOrder = (order) => {
    setActiveTask(order);
    setTripStatus('accepted');
  };

  const handleConfirmPickup = () => setTripStatus('picked_up');
  
  const handleCompleteTrip = () => {
    setShowSuccess(true);
    setAvailableOrders(prev => prev.filter(o => o.id !== activeTask.id));
    
    setTimeout(() => {
      setShowSuccess(false);
      setActiveTask(null); 
      setTripStatus('');
    }, 2500);
  };

  const handleCancelTrip = () => {
    setActiveTask(null);
    setTripStatus('');
  };

  // --- Real Swipe Logic ---
  const handleSwipe = (e) => {
    const val = parseInt(e.target.value, 10);
    setSwipeValue(val);
    
    // If swiped past 85%, trigger the online status!
    if (val > 85) {
      setIsOnline(true);
      setTripStatus('searching');
      setSwipeValue(0); // Reset for next time
    }
  };

  const handleSwipeEnd = () => {
    // Snap back to 0 if they didn't swipe far enough
    if (swipeValue <= 85) {
      setSwipeValue(0);
    }
  };

  // --- Navigation Handlers ---
  const openMapsForPickup = () => {
    const destination = encodeURIComponent(activeTask.pickup.address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=$${destination}`, '_blank');
  };

  const openMapsForDropoff = () => {
    const destination = encodeURIComponent(activeTask.dropoff.address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=$${destination}`, '_blank');
  };

  return (
    <div className="rhome-container">
      
      {/* --- MAP BACKGROUND --- */}
      <div className="rhome-map-area">
        <div className="rhome-road rhome-road-1"></div>
        <div className="rhome-road rhome-road-2"></div>
        <div className="rhome-road rhome-road-3"></div>
        
        <div className="rhome-location-marker">
          <div className="rhome-pulse"></div>
          <div className="rhome-dot">🛵</div>
        </div>

        {isOnline && activeTask && (
          <div className="rhome-destination-pin">
            <div className="rhome-pin-icon">📍</div>
            <div className="rhome-pin-shadow"></div>
          </div>
        )}
      </div>

      {/* --- HEADER --- */}
      <header className="rhome-header">
        <div className="rhome-header-top">
          <div className="rhome-profile-badge" onClick={() => navigate('/rider-profile')}>
            <div className="rhome-avatar">AS</div>
          </div>

          <div className="rhome-status-toggle">
            <span className={`rhome-status-text ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? 'You\'re Online' : 'You\'re Offline'}
            </span>
            <label className="rhome-switch">
              <input 
                type="checkbox" 
                checked={isOnline} 
                onChange={() => {
                  setIsOnline(!isOnline);
                  if(!isOnline && activeTask) handleCancelTrip();
                }} 
              />
              <span className="rhome-slider"></span>
            </label>
          </div>
        </div>

        <div className="rhome-earnings-pill" onClick={() => navigate('/rider-earnings')}>
          <span className="rhome-pill-label">Today's Earnings</span>
          <span className="rhome-pill-amount">Rs. 450</span>
          <span className="rhome-pill-arrow">›</span>
        </div>
      </header>

      {/* --- SUCCESS MODAL --- */}
      {showSuccess && (
        <div className="rhome-success-overlay">
          <div className="rhome-success-card">
            <div className="rhome-success-icon">🎉</div>
            <h2>Trip Completed!</h2>
            <p>You earned <strong>{activeTask?.amount}</strong></p>
          </div>
        </div>
      )}

      {/* --- BOTTOM SHEET --- */}
      <div className={`rhome-bottom-sheet ${!isOnline ? 'offline-sheet' : ''}`}>
        <div className="rhome-drag-handle"></div>

        {!isOnline ? (
          // 1. OFFLINE STATE
          <div className="rhome-offline-state">
            <div className="rhome-sleep-icon">💤</div>
            <h2>You are offline</h2>
            <p>Go online to start receiving laundry requests.</p>
            
            {/* Interactive Swipe Button */}
            <div className="rhome-swipe-container">
              <div className="rhome-swipe-track" style={{ width: `${swipeValue}%` }}></div>
              <span className="rhome-swipe-text">{swipeValue > 20 ? 'Keep Swiping...' : 'Swipe to Go Online'}</span>
              <input 
                type="range" 
                min="0" max="100" 
                value={swipeValue} 
                onChange={handleSwipe}
                onMouseUp={handleSwipeEnd}
                onTouchEnd={handleSwipeEnd}
                className="rhome-swipe-input"
              />
            </div>
            
          </div>
        ) : !activeTask ? (
          // 2. LIST OF AVAILABLE ORDERS STATE
          <div className="rhome-orders-feed">
            <div className="rhome-feed-header">
              <h2>Available Trips</h2>
              <span className="rhome-live-badge"><span className="rhome-blink-dot"></span> Live</span>
            </div>
            
            {availableOrders.length === 0 ? (
              <p style={{textAlign: 'center', color: '#666', marginTop: '10px'}}>No more trips right now. We'll notify you!</p>
            ) : (
              <div className="rhome-orders-scroll-list">
                {availableOrders.map(order => (
                  <div key={order.id} className="rhome-mini-order-card">
                    <div className="rhome-mini-header">
                      <span className={`rhome-task-badge ${order.taskType === 'Collection Run' ? 'collection' : 'delivery'}`}>
                        {order.taskType}
                      </span>
                      <span className="rhome-mini-amount">{order.amount}</span>
                    </div>
                    
                    <div className="rhome-mini-route">
                      <strong>A:</strong> {order.pickup.name} <br/>
                      <strong>B:</strong> {order.dropoff.name}
                    </div>
                    
                    <div className="rhome-mini-footer">
                      <span className="rhome-mini-dist">📍 {order.distance} • ⏱️ {order.time}</span>
                      <button className="rhome-btn-accept-small" onClick={() => handleAcceptOrder(order)}>Accept</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // 3. ACTIVE ORDER FLOW
          <div className="rhome-active-task">
            
            <div className="rhome-task-header">
              <div className={`rhome-task-badge ${activeTask.taskType === 'Collection Run' ? 'collection' : 'delivery'}`}>
                <span className="rhome-blink-dot"></span> Active Trip
              </div>
              <button className="rhome-text-btn-cancel" onClick={handleCancelTrip}>Cancel</button>
            </div>

            <div className="rhome-route-timeline">
              <div className={`rhome-route-node ${tripStatus === 'picked_up' ? 'dimmed-node' : ''}`}>
                <div className={`rhome-node-icon pickup-icon ${tripStatus === 'picked_up' ? 'completed-icon' : ''}`}>
                  {tripStatus === 'picked_up' && '✓'}
                </div>
                <div className="rhome-node-content">
                  <small>{activeTask.pickup.label}</small>
                  <strong>{activeTask.pickup.name}</strong>
                  <p>{activeTask.pickup.address}</p>
                </div>
              </div>

              <div className={`rhome-route-line ${tripStatus === 'picked_up' ? 'completed-line' : ''}`}></div>

              <div className={`rhome-route-node ${tripStatus !== 'picked_up' ? 'dimmed-node' : ''}`}>
                <div className="rhome-node-icon dropoff-icon"></div>
                <div className="rhome-node-content">
                  <small>{activeTask.dropoff.label}</small>
                  <strong>{activeTask.dropoff.name}</strong>
                  <p>{activeTask.dropoff.address}</p>
                </div>
              </div>
            </div>
            
            <div className="rhome-task-details-grid">
              <div className="rhome-detail-box">
                <span className="rhome-detail-label">Distance</span>
                <span className="rhome-detail-value">{activeTask.distance}</span>
              </div>
              <div className="rhome-detail-box">
                <span className="rhome-detail-label">Earning</span>
                <span className="rhome-detail-value" style={{color: '#eb6d1e'}}>{activeTask.amount}</span>
              </div>
            </div>

            <div className="rhome-action-buttons">
              {tripStatus === 'accepted' && (
                <>
                  <button className="rhome-btn-nav" onClick={openMapsForPickup}><span role="img" aria-label="nav">🧭</span> Navigate</button>
                  <button className="rhome-btn-primary" onClick={handleConfirmPickup}>Confirm Pickup</button>
                </>
              )}
              {tripStatus === 'picked_up' && (
                <>
                  <button className="rhome-btn-nav" onClick={openMapsForDropoff}><span role="img" aria-label="nav">🧭</span> Navigate</button>
                  <button className="rhome-btn-primary" onClick={handleCompleteTrip} style={{background: 'linear-gradient(135deg, #10b981, #047857)'}}>Complete Dropoff</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM NAVIGATION --- */}
      <footer className="rhome-bottom-nav">
        <button className="rhome-nav-item active" onClick={() => navigate('/rider-home')}>
          <span className="rhome-nav-icon">🛵</span><small>Ride</small>
        </button>
        <button className="rhome-nav-item" onClick={() => navigate('/rider-wallet')}>
          <span className="rhome-nav-icon">💳</span><small>Wallet</small>
        </button>
        <button className="rhome-nav-item" onClick={() => navigate('/rider-earnings')}>
          <span className="rhome-nav-icon">💲</span><small>Earnings</small>
        </button>
        <button className="rhome-nav-item" onClick={() => navigate('/rider-profile')}>
          <span className="rhome-nav-icon">👤</span><small>Profile</small>
        </button>
      </footer>
    </div>
  );
};

export default RiderHome;