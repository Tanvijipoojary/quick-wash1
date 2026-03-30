import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './r_earnings.css';

const RiderEarnings = () => {
  const navigate = useNavigate();
  
  // --- TIMEFRAME & FILTER STATES ---
  const [timeframe, setTimeframe] = useState('overall'); // 'today', 'week', 'overall', 'custom'
  const [filterType, setFilterType] = useState('all'); // 'all', 'collection', 'delivery'
  
  // Custom Date States
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [allTrips, setAllTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const BASE_FARE = 40; // Flat Rs. 40 per trip

  useEffect(() => {
    const fetchEarnings = async () => {
      const savedRider = localStorage.getItem('quickwash_rider');
      if (!savedRider) {
        navigate('/');
        return;
      }
      const parsedData = JSON.parse(savedRider);

      try {
        const res = await axios.get(`http://localhost:5000/api/riders/earnings/${parsedData.email}`);
        
        // 🚨 NEW LOGIC: Split 1 Order into 2 Trips if the rider did BOTH!
        let processedTrips = [];
        const myEmail = parsedData.email;

        res.data.forEach(order => {
          // If they did the pickup, create a Collection Receipt
          if (order.pickupRiderEmail === myEmail) {
            processedTrips.push({ ...order, runType: 'Collection', sortDate: new Date(order.createdAt) });
          }
          // If they did the delivery, create a Delivery Receipt
          if (order.deliveryRiderEmail === myEmail) {
            processedTrips.push({ ...order, runType: 'Delivery', sortDate: new Date(order.updatedAt) });
          }
        });

        // Sort them so the newest trips are at the top
        processedTrips.sort((a, b) => b.sortDate - a.sortDate);
        setAllTrips(processedTrips);

      } catch (error) {
        console.error("Failed to fetch trips:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, [navigate]);

  // --- SMART FILTER: Handles Timeframe, Custom Dates, and Trip Type ---
  const getFilteredTrips = () => {
    const now = new Date();
    
    // Step 1: Filter by Timeframe
    let filtered = allTrips;
    
    if (timeframe === 'today') {
      filtered = filtered.filter(trip => new Date(trip.updatedAt || trip.createdAt).toDateString() === now.toDateString());
    } 
    else if (timeframe === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter(trip => new Date(trip.updatedAt || trip.createdAt) >= oneWeekAgo);
    }
    else if (timeframe === 'custom' && customStart && customEnd) {
      // 👈 NEW: Custom Date Filtering Logic
      const start = new Date(customStart);
      start.setHours(0, 0, 0, 0); // Start of the day
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999); // End of the day
      
      filtered = filtered.filter(trip => {
        const tripDate = new Date(trip.updatedAt || trip.createdAt);
        return tripDate >= start && tripDate <= end;
      });
    }
    // If timeframe is 'overall', we skip the date filter completely!

    // Step 2: Filter by Trip Type (Updated!)
    if (filterType === 'delivery') {
      filtered = filtered.filter(trip => trip.runType === 'Delivery');
    } else if (filterType === 'collection') {
      filtered = filtered.filter(trip => trip.runType === 'Collection');
    }

    return filtered;
  };

  const filteredTrips = getFilteredTrips();

  // --- CALCULATE BREAKDOWN ---
  const currentStats = {
    total: filteredTrips.length * BASE_FARE,
    fares: filteredTrips.length * BASE_FARE,
    hours: '--', 
    trips: filteredTrips.length
  };

  if (isLoading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading Earnings... ⏳</div>;

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
        
        {/* --- TIMEFRAME & FILTER CONTROLS --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
          
          {/* 1. Timeframe Toggle (Now includes Custom Date) */}
          <div className="rearn-toggle-wrapper" style={{ marginBottom: 0 }}>
            <button className={`rearn-toggle-btn ${timeframe === 'today' ? 'active' : ''}`} onClick={() => setTimeframe('today')}>Today</button>
            <button className={`rearn-toggle-btn ${timeframe === 'week' ? 'active' : ''}`} onClick={() => setTimeframe('week')}>Week</button>
            <button className={`rearn-toggle-btn ${timeframe === 'overall' ? 'active' : ''}`} onClick={() => setTimeframe('overall')}>Overall</button>
            <button className={`rearn-toggle-btn ${timeframe === 'custom' ? 'active' : ''}`} onClick={() => setTimeframe('custom')}>Custom</button>
          </div>

          {/* 👈 NEW: Custom Date Picker Inputs (Only shows if 'custom' is clicked) */}
          {timeframe === 'custom' && (
            <div style={{ display: 'flex', gap: '10px', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>Start Date</label>
                <input 
                  type="date" 
                  value={customStart} 
                  onChange={(e) => setCustomStart(e.target.value)}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>End Date</label>
                <input 
                  type="date" 
                  value={customEnd} 
                  onChange={(e) => setCustomEnd(e.target.value)}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </div>
            </div>
          )}

          {/* 2. Run Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 5px' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold' }}>Run Type:</span>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', flex: 1, color: '#334155', fontSize: '0.95rem', fontWeight: '500' }}
            >
              <option value="all">All Trips</option>
              <option value="collection">Collection Runs Only</option>
              <option value="delivery">Delivery Runs Only</option>
            </select>
          </div>

        </div>

        {/* --- BIG EARNINGS DISPLAY --- */}
        <div className="rearn-hero-section">
          <small>
            Total Earnings (
            {timeframe === 'week' ? 'Past 7 Days' : 
             timeframe === 'today' ? 'Today' : 
             timeframe === 'custom' && customStart && customEnd ? `${new Date(customStart).toLocaleDateString()} - ${new Date(customEnd).toLocaleDateString()}` : 
             'Lifetime'}
            )
          </small>
          <h2>Rs. {currentStats.total}</h2>
          <div className="rearn-online-time">
            <span>⏱️ {currentStats.hours} Online</span>
            <span>🛵 {currentStats.trips} Trips</span>
          </div>
        </div>

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
        </div>

        {/* --- RECENT TRIPS (DYNAMICALLY FILTERED) --- */}
        <div className="rearn-trips-section">
          <div className="rearn-section-header">
            <h3>Recent Trips</h3>
            <button className="rearn-text-link" onClick={() => navigate('/rider-wallet')}>See Wallet</button>
          </div>
          <div className="rearn-trips-list">
            {filteredTrips.length === 0 ? (
              <p style={{textAlign: 'center', color: '#64748b', padding: '20px 0'}}>
                {timeframe === 'custom' && (!customStart || !customEnd) ? "Please select a Start and End date above." : "No trips found for this filter."}
              </p>
            ) : (
              filteredTrips.map((trip, idx) => ( 
                <div key={idx} className="rearn-trip-item clickable" onClick={() => setSelectedTrip(trip)}>
                  <div className="rearn-trip-left">
                    <div className={`rearn-trip-dot ${trip.status === 'Completed' ? 'delivery' : 'collection'}`}></div>
                    <div className="rearn-trip-info">
                      <strong>{trip.status === 'Completed' ? 'Delivery Run' : 'Collection Run'}</strong>
                      <small>{new Date(trip.updatedAt || trip.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}</small>
                    </div>
                  </div>
                  <div className="rearn-trip-right">
                    <strong>Rs. {BASE_FARE}</strong>
                    <span className="rearn-trip-arrow">›</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* --- DETAILED EARNING RECEIPT MODAL --- */}
      {selectedTrip && (
        <div className="rearn-modal-overlay">
          <div className="rearn-modal-card">
            <div className="rearn-modal-header">
              <h2>Trip Earning Details</h2>
              <button className="rearn-close-btn" onClick={() => setSelectedTrip(null)}>✕</button>
            </div>
            
            <div className="rearn-receipt-body">
              <div className="rearn-receipt-top">
                <span className="rearn-receipt-id">ID: {selectedTrip._id.slice(-6).toUpperCase()}</span>
                <h3 className="rearn-receipt-total">Rs. {BASE_FARE}</h3>
                <span className={`rearn-receipt-badge ${selectedTrip.status === 'Completed' ? 'delivery' : 'collection'}`}>
                  {selectedTrip.status === 'Completed' ? 'Delivery Run' : 'Collection Run'}
                </span>
              </div>
              
              <div className="rearn-receipt-divider"></div>

              <div className="rearn-receipt-row">
                <span>Base Fare</span>
                <strong>Rs. {BASE_FARE}</strong>
              </div>
              <div className="rearn-receipt-row">
                <span>Distance Pay</span>
                <strong>Rs. 0</strong>
              </div>
            </div>

            <button className="rearn-submit-btn" onClick={() => setSelectedTrip(null)}>Close Details</button>
          </div>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION --- */}
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
        <button className="rearn-nav-item" onClick={() => navigate('/rider-profile')}>
          <span className="rearn-nav-icon">👤</span><small>Profile</small>
        </button>
      </footer>

    </div>
  );
};

export default RiderEarnings;