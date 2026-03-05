import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './r_home.css';

const RiderHome = () => {
  const navigate = useNavigate();
  
  // Get Logged in Rider (Assume you saved this during rider login)
  const [rider, setRider] = useState(() => {
    const saved = localStorage.getItem('quickwash_rider');
    return saved ? JSON.parse(saved) : { name: 'Awesome Rider', email: 'rider@quickwash.com' };
  });

  // App States
  const [isOnline, setIsOnline] = useState(true);
  const [activeTask, setActiveTask] = useState(null); 
  const [tripStatus, setTripStatus] = useState(''); 
  const [showSuccess, setShowSuccess] = useState(false);
  const [swipeValue, setSwipeValue] = useState(0);

  // --- 1. REAL MONGODB AVAILABLE ORDERS ---
  const [availableOrders, setAvailableOrders] = useState([]);

  const fetchAvailableOrders = async () => {
    if (!isOnline || activeTask) return; // Don't fetch if offline or busy
    try {
      const res = await axios.get('http://localhost:5000/api/orders/available-for-rider');
      
      // Map DB data to your UI Card design
      const formattedOrders = res.data.map(o => {
        const isCollection = o.status === 'Picked Up'; // Going to Customer first
        return {
          id: o._id,
          taskType: isCollection ? 'Collection Run' : 'Delivery Run', 
          pickup: isCollection 
            ? { label: 'Pickup from Customer', name: o.customerEmail.split('@')[0], address: o.pickupAddress || 'Customer Address' }
            : { label: 'Pickup from Vendor Hub', name: o.shopName, address: 'Vendor Hub Address' }, // Note: Add shop address to DB if needed
          dropoff: isCollection 
            ? { label: 'Drop at Vendor Hub', name: o.shopName, address: 'Vendor Hub Address' }
            : { label: 'Drop to Customer', name: o.customerEmail.split('@')[0], address: o.pickupAddress || 'Customer Address' },
          distance: 'Est. 4 km', // Real distance requires Google Maps Matrix API
          time: '15 mins', 
          details: o.items.map(i => `${i.name} (x${i.qty})`).join(', '), 
          amount: `Rs. ${o.deliveryFee || 40}`
        };
      });
      setAvailableOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching live orders:", error);
    }
  };

  // Poll for new orders every 5 seconds! (The Broadcast System)
  useEffect(() => {
    fetchAvailableOrders();
    const interval = setInterval(fetchAvailableOrders, 5000);
    return () => clearInterval(interval);
  }, [isOnline, activeTask]);

  // --- Handlers ---
  const handleAcceptOrder = async (order) => {
    try {
      // THE CLAIM SYSTEM: Tell MongoDB we want it!
      await axios.put(`http://localhost:5000/api/orders/claim/${order.id}`, {
        riderEmail: rider.email
      });

      // If success, lock it in!
      setActiveTask(order);
      setTripStatus('accepted');
      setAvailableOrders([]); // Clear background feed
    } catch (error) {
      // If error, someone else took it!
      alert(error.response?.data?.message || "Failed to claim order.");
      fetchAvailableOrders(); // Refresh to remove the stolen order
    }
  };

  // 1. RIDER PICKS UP CLOTHES
  const handleConfirmPickup = async () => {
    try {
      // If the rider is picking up from the Vendor to give to the Customer, update DB!
      if (activeTask.taskType === 'Delivery Run') {
        await axios.put(`http://localhost:5000/api/orders/update-status/${activeTask.id}`, {
          status: 'Out for Delivery' // 👈 Customer Tracker instantly sees this!
        });
      }
      setTripStatus('picked_up'); // Moves the rider's UI to the next step
    } catch (error) {
      alert("Failed to update database. Is backend running?");
    }
  };
  
  // 2. RIDER DROPS OFF CLOTHES
  const handleCompleteTrip = async () => {
    try {
      // If taking to vendor -> 'Dropped at Hub'. If taking to customer -> 'Completed'
      const newStatus = activeTask.taskType === 'Collection Run' ? 'Dropped at Hub' : 'Completed';
      
      // Update Database and free up the rider for the next job!
      await axios.put(`http://localhost:5000/api/orders/update-status/${activeTask.id}`, {
        status: newStatus,
        riderEmail: null 
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTask(null); 
        setTripStatus('');
        fetchAvailableOrders(); // Look for next trip
      }, 2500);

    } catch (error) {
      alert("Failed to complete trip in database!");
    }
  };

  const handleCancelTrip = async () => {
    // If they cancel, we must UN-CLAIM it so others can see it!
    if (activeTask) {
      try {
        await axios.put(`http://localhost:5000/api/orders/update-status/${activeTask.id}`, {
          riderEmail: null // Release back to the pool
        });
      } catch (err) { console.error("Failed to release order"); }
    }
    setActiveTask(null);
    setTripStatus('');
  };

  const handleSwipe = (e) => {
    const val = parseInt(e.target.value, 10);
    setSwipeValue(val);
    if (val > 85) {
      setIsOnline(true);
      setTripStatus('searching');
      setSwipeValue(0); 
    }
  };

  const handleSwipeEnd = () => { if (swipeValue <= 85) setSwipeValue(0); };

  // --- FIXED NAVIGATION LINKS ---
  const openMapsForPickup = () => {
    const destination = encodeURIComponent(activeTask.pickup.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${destination}`, '_blank');
  };

  const openMapsForDropoff = () => {
    const destination = encodeURIComponent(activeTask.dropoff.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${destination}`, '_blank');
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
            <div className="rhome-avatar">{rider.name.charAt(0)}</div>
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
          <div className="rhome-offline-state">
            <div className="rhome-sleep-icon">💤</div>
            <h2>You are offline</h2>
            <p>Go online to start receiving laundry requests.</p>
            
            <div className="rhome-swipe-container">
              <div className="rhome-swipe-track" style={{ width: `${swipeValue}%` }}></div>
              <span className="rhome-swipe-text">{swipeValue > 20 ? 'Keep Swiping...' : 'Swipe to Go Online'}</span>
              <input 
                type="range" min="0" max="100" value={swipeValue} 
                onChange={handleSwipe} onMouseUp={handleSwipeEnd} onTouchEnd={handleSwipeEnd}
                className="rhome-swipe-input"
              />
            </div>
          </div>
        ) : !activeTask ? (
          <div className="rhome-orders-feed">
            <div className="rhome-feed-header">
              <h2>Available Trips</h2>
              <span className="rhome-live-badge"><span className="rhome-blink-dot"></span> Live</span>
            </div>
            
            {availableOrders.length === 0 ? (
              <p style={{textAlign: 'center', color: '#666', marginTop: '10px'}}>No trips right now. Searching for nearby orders...</p>
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