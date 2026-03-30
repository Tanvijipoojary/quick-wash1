import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './r_home.css';

// --- DICTIONARY FOR PRETTY GARMENT LABELS ---
const garmentLabels = {
  shirt: '👔 Shirts',
  tshirt: '👕 T-Shirts',
  tops: '👚 Tops',
  trousers: '👖 Trousers/Jeans',
  shorts: '🩳 Shorts',
  shawls: '🧣 Shawls',
  bedsheets: '🛏️ Bedsheets/Towels',
  undergarments: '🧦 Undergarments'
};

const RiderHome = () => {
  const navigate = useNavigate();
  
  const [rider] = useState(() => {
    const saved = localStorage.getItem('quickwash_rider');
    return saved ? JSON.parse(saved) : null;
  });

  // 👇 REVERTED: Back to your original local state! 👇
  const [isOnline, setIsOnline] = useState(true); 
  const [todaysEarnings, setTodaysEarnings] = useState(0);
  const BASE_FARE = 40;

  const [activeTask, setActiveTask] = useState(null); 
  const [tripStatus, setTripStatus] = useState(''); 
  const [showSuccess, setShowSuccess] = useState(false);
  const [swipeValue, setSwipeValue] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [availableOrders, setAvailableOrders] = useState([]);

  // --- 0. INITIAL LOAD: FETCH EARNINGS ---
  const fetchTodaysEarnings = useCallback(async (email) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/riders/earnings/${email}`);
      const now = new Date();
      let todayTotal = 0;

      res.data.forEach(order => {
        if (order.pickupRiderEmail === email && new Date(order.createdAt).toDateString() === now.toDateString()) {
          todayTotal += BASE_FARE;
        }
        if (order.deliveryRiderEmail === email && new Date(order.updatedAt).toDateString() === now.toDateString()) {
          todayTotal += BASE_FARE;
        }
      });
      setTodaysEarnings(todayTotal);
    } catch (error) {
      console.error("Failed to load earnings:", error);
    }
  }, []);

  useEffect(() => {
    if (!rider) {
      navigate('/');
      return;
    }
    fetchTodaysEarnings(rider.email);
  }, [rider, navigate, fetchTodaysEarnings]);

  // --- 1. FETCH LIVE BROADCASTS (THE RADAR) ---
  const fetchAvailableOrders = useCallback(async () => {
    if (!isOnline || activeTask) return; 
    try {
      const res = await axios.get('http://localhost:5000/api/orders/available-for-rider');
      
      const validOrders = res.data.filter(o => ['Searching Rider', 'Ready'].includes(o.status));
      
      const formattedOrders = validOrders.map(o => {
        const isCollection = ['Pending', 'Searching Rider', 'Pending Pickup'].includes(o.status); 
        
        return {
          id: o._id,
          taskType: isCollection ? 'Collection Run' : 'Delivery Run', 
          pickup: isCollection 
            ? { label: 'Pickup from Customer', name: o.customerEmail?.split('@')[0] || 'Customer', address: o.pickupAddress || 'Customer Address' }
            : { label: 'Pickup from Vendor Hub', name: o.shopName || 'Vendor', address: 'Vendor Hub (See Map)' }, 
          dropoff: isCollection 
            ? { label: 'Drop at Vendor Hub', name: o.shopName || 'Vendor', address: 'Vendor Hub (See Map)' }
            : { label: 'Drop to Customer', name: o.customerEmail?.split('@')[0] || 'Customer', address: o.pickupAddress || 'Customer Address' },
          distance: 'Est. 4 km', 
          time: '15 mins', 
          garmentDetails: o.garmentDetails || {},
          totalExpectedGarments: o.totalExpectedGarments || 0,
          amount: `Rs. ${BASE_FARE}`
        };
      });
      
      setAvailableOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching live orders:", error);
    }
  }, [isOnline, activeTask]);

  useEffect(() => {
    let interval;
    if (isOnline && !activeTask) {
      fetchAvailableOrders();
      interval = setInterval(fetchAvailableOrders, 5000); 
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnline, activeTask, fetchAvailableOrders]);


  // --- 2. CLAIM THE ORDER (SMART ROUTING) ---
  const handleAcceptOrder = async (order) => {
    try {
      const riderField = order.taskType === 'Collection Run' ? 'pickupRiderEmail' : 'deliveryRiderEmail';
      const newStatus = order.taskType === 'Collection Run' ? 'Pending Pickup' : 'Out for Delivery';

      await axios.put(`http://localhost:5000/api/orders/update-status/${order.id}`, { 
        [riderField]: rider.email,
        status: newStatus
      });
      
      setActiveTask(order);
      setTripStatus('accepted');
      setIsVerified(false); 
      setAvailableOrders([]); 
    } catch (error) {
      alert("Too slow! Another rider claimed this order.");
      fetchAvailableOrders(); 
    }
  };

  // --- 3. CONFIRM PICKUP ---
  const handleConfirmPickup = async () => {
    try {
      const newStatus = activeTask.taskType === 'Collection Run' ? 'Picked Up' : 'Out for Delivery';
      await axios.put(`http://localhost:5000/api/orders/update-status/${activeTask.id}`, { status: newStatus });
      setTripStatus('picked_up');
    } catch (error) {
      alert("Failed to update database.");
    }
  };
  
  // --- 4. COMPLETE DROPOFF ---
  const handleCompleteTrip = async () => {
    try {
      const newStatus = activeTask.taskType === 'Collection Run' ? 'Dropped at Hub' : 'Completed';
      await axios.put(`http://localhost:5000/api/orders/update-status/${activeTask.id}`, { status: newStatus });

      setShowSuccess(true);
      fetchTodaysEarnings(rider.email); // Refresh earnings pill

      setTimeout(() => {
        setShowSuccess(false);
        setActiveTask(null); 
        setTripStatus('');
        setIsVerified(false);
      }, 2500);

    } catch (error) {
      alert("Failed to complete trip in database!");
    }
  };

  // --- 5. CANCEL/RELEASE TRIP ---
  const handleCancelTrip = async () => {
    if (activeTask) {
      try {
        const riderField = activeTask.taskType === 'Collection Run' ? 'pickupRiderEmail' : 'deliveryRiderEmail';
        const revertStatus = activeTask.taskType === 'Collection Run' ? 'Searching Rider' : 'Ready';
        await axios.put(`http://localhost:5000/api/orders/update-status/${activeTask.id}`, { 
          [riderField]: null, 
          status: revertStatus 
        });
      } catch (err) { console.error("Failed to release order"); }
    }
    setActiveTask(null);
    setTripStatus('');
    setIsVerified(false); 
  };

  // 👇 REVERTED: Your original swipe logic 👇
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

  const openMapsForPickup = () => {
    const destination = encodeURIComponent(activeTask.pickup.address);
    window.open(`http://googleusercontent.com/maps.google.com/?q=${destination}`, '_blank');
  };

  const openMapsForDropoff = () => {
    const destination = encodeURIComponent(activeTask.dropoff.address);
    window.open(`http://googleusercontent.com/maps.google.com/?q=${destination}`, '_blank');
  };

  if (!rider) return null;

  return (
    <div className="rhome-container">
      
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

      <header className="rhome-header">
        <div className="rhome-header-top">
          <div className="rhome-profile-badge" onClick={() => navigate('/rider-profile')}>
            <div className="rhome-avatar">{rider.name.charAt(0).toUpperCase()}</div>
          </div>

          <div className="rhome-status-toggle">
            <span className={`rhome-status-text ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? 'You\'re Online' : 'You\'re Offline'}
            </span>
            <label className="rhome-switch">
              {/* 👇 REVERTED: Your original checkbox logic 👇 */}
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
          <span className="rhome-pill-amount">Rs. {todaysEarnings}</span>
          <span className="rhome-pill-arrow">›</span>
        </div>
      </header>

      {showSuccess && (
        <div className="rhome-success-overlay">
          <div className="rhome-success-card">
            <div className="rhome-success-icon">🎉</div>
            <h2>Trip Completed!</h2>
            <p>You earned <strong>Rs. {BASE_FARE}</strong></p>
          </div>
        </div>
      )}

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
          <div className="rhome-active-task" style={{ paddingBottom: '20px' }}>
            
            <div className="rhome-task-header">
              <div className={`rhome-task-badge ${activeTask.taskType === 'Collection Run' ? 'collection' : 'delivery'}`}>
                <span className="rhome-blink-dot"></span> Active Trip
              </div>
              <button className="rhome-text-btn-cancel" onClick={handleCancelTrip}>Cancel</button>
            </div>

            <div className="rhome-route-timeline" style={{ marginBottom: '15px' }}>
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
            
            <div className="rhome-task-details-grid" style={{ marginBottom: '15px' }}>
              <div className="rhome-detail-box">
                <span className="rhome-detail-label">Distance</span>
                <span className="rhome-detail-value">{activeTask.distance}</span>
              </div>
              <div className="rhome-detail-box">
                <span className="rhome-detail-label">Earning</span>
                <span className="rhome-detail-value" style={{color: '#eb6d1e'}}>{activeTask.amount}</span>
              </div>
            </div>

            {/* UNIVERSAL VERIFICATION CHECKLIST */}
            {tripStatus === 'accepted' && (
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📦 {activeTask.taskType === 'Collection Run' ? 'Verify Customer Bag' : 'Verify Clean Laundry'}
                </h4>
                
                {activeTask.totalExpectedGarments > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                    {Object.entries(activeTask.garmentDetails)
                      .filter(([key, value]) => value > 0)
                      .map(([key, value]) => (
                        <span key={key} style={{ background: '#e2e8f0', color: '#334155', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500' }}>
                          {garmentLabels[key] || key}: <strong style={{color: '#0f172a'}}>{value}</strong>
                        </span>
                    ))}
                  </div>
                ) : (
                  <p style={{fontSize: '0.85rem', color: '#64748b', margin: '0 0 15px 0'}}>
                    {activeTask.taskType === 'Collection Run' 
                      ? 'Customer did not declare items. Please ensure the bag is securely tied.' 
                      : 'No item breakdown available. Please ensure the clean laundry bag is securely tied.'}
                  </p>
                )}

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', color: '#475569', padding: '10px', background: isVerified ? '#dcfce7' : '#fff', border: isVerified ? '1px solid #86efac' : '1px solid #e2e8f0', borderRadius: '6px', transition: 'all 0.2s' }}>
                  <input 
                    type="checkbox" 
                    checked={isVerified} 
                    onChange={(e) => setIsVerified(e.target.checked)} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#16a34a' }}
                  />
                  <strong style={{ color: isVerified ? '#16a34a' : '#334155' }}>I have verified the contents of this bag.</strong>
                </label>
              </div>
            )}

            <div className="rhome-action-buttons">
              {tripStatus === 'accepted' && (
                <>
                  <button className="rhome-btn-nav" onClick={openMapsForPickup}><span role="img" aria-label="nav">🧭</span> Navigate</button>
                  <button 
                    className="rhome-btn-primary" 
                    onClick={handleConfirmPickup}
                    disabled={!isVerified}
                    style={{ 
                      opacity: !isVerified ? 0.4 : 1,
                      cursor: !isVerified ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Confirm Pickup
                  </button>
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