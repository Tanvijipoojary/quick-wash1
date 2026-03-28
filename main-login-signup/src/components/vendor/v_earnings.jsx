import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './v_earnings.css';

const VendorEarnings = () => {
  const navigate = useNavigate();

  // States
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [recentEarnings, setRecentEarnings] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH LIVE ORDERS FROM MONGODB ---
  useEffect(() => {
    const fetchEarnings = async () => {
      const savedVendorStr = localStorage.getItem('quickwash_vendor');
      if (!savedVendorStr) {
        navigate('/vendor-login');
        return;
      }
      
      const parsedVendor = JSON.parse(savedVendorStr);

      try {
        // Call your backend to get ONLY completed orders for this shop
        const res = await axios.get(`http://localhost:5000/api/orders/vendor-earnings/${parsedVendor.shopId}`);
        const orders = res.data;

        // 1. Format the data for the History List
        const formattedEarnings = orders.map(order => {
          const dateObj = new Date(order.createdAt);
          const rawDate = dateObj.toISOString().split('T')[0]; // "YYYY-MM-DD"
          
          // Calculate Fees
          const gross = order.totalAmount || 0;
          const fee = gross * 0.10; // Quick Wash takes 10%
          const net = gross - fee;

          return {
            id: order._id.substring(order._id.length - 6).toUpperCase(), // Short ID
            date: dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            rawDate: rawDate,
            time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            customer: order.customerName || 'Customer',
            service: 'Wash & Iron', // Assuming core service
            gross: gross,
            fee: fee,
            net: net
          };
        });

        setRecentEarnings(formattedEarnings);

        // 2. Format the data for the Weekly Bar Chart (Last 7 Days)
        generateWeeklyChartData(formattedEarnings);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching earnings:", error);
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, [navigate]);


  // --- DYNAMIC CHART GENERATOR ---
  const generateWeeklyChartData = (earningsData) => {
    const daysMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
    
    // Group earnings by day of the week
    earningsData.forEach(item => {
      const dayName = new Date(item.rawDate).toLocaleDateString('en-US', { weekday: 'short' });
      if (daysMap[dayName] !== undefined) {
        daysMap[dayName] += item.net;
      }
    });

    // Find the max value to scale the chart bars correctly
    const maxEarning = Math.max(...Object.values(daysMap), 1); // Avoid division by zero

    const chartData = Object.keys(daysMap).map((day, index) => {
      const amount = daysMap[day];
      // Calculate percentage height (cap at 100%)
      const heightPercent = amount === 0 ? '5%' : `${Math.round((amount / maxEarning) * 100)}%`;
      
      return { id: index, day: day, amount: amount, height: heightPercent };
    });

    setWeeklyData(chartData);
  };


  // Logic to filter orders based on selected dates
  const filteredEarnings = recentEarnings.filter(earning => {
    if (!startDate && !endDate) return true;
    
    const earningDate = new Date(earning.rawDate);
    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-01-01');
    
    return earningDate >= start && earningDate <= end;
  });

  // Calculate the dynamic total based on filtered results
  const totalEarnings = filteredEarnings.reduce((sum, item) => sum + item.net, 0);

  // Clear Filters
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  if (isLoading) return <div style={{padding: '50px', textAlign: 'center'}}>Calculating Earnings... ⏳</div>;

  return (
    <div className="vearn-container">
      
      {/* Glassmorphism Header */}
      <header className="vearn-header">
        <button className="vearn-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="vearn-header-title">Earnings</h1>
        <div style={{ width: 24 }}></div> 
      </header>

      <main className="vearn-main-content">
        
        {/* --- Top Summary & Chart Card --- */}
        <div className="vearn-chart-card">
          <div className="vearn-chart-header">
            <div>
              <span className="vearn-chart-label">
                {(startDate || endDate) ? 'Filtered Net Earnings' : "All Time Net Earnings"}
              </span>
              <h2 className="vearn-chart-total">Rs. {totalEarnings.toLocaleString('en-IN')}</h2>
            </div>
            {!(startDate || endDate) && (
              <div className="vearn-trend-badge">
                Live Data
              </div>
            )}
          </div>

          <div className="vearn-bar-chart">
            {weeklyData.map((data) => (
              <div key={data.id} className="vearn-bar-column">
                <div className="vearn-bar-wrapper">
                  <div className="vearn-bar-fill" style={{ height: data.height }}></div>
                </div>
                <span className="vearn-bar-day">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- Earnings History List --- */}
        <div className="vearn-history-section">
          
          <div className="vearn-history-header">
            <h3 className="vearn-section-title">Completed Orders</h3>
            
            <div className="vearn-date-filters">
              <div className="vearn-date-input-wrapper">
                <input 
                  type="date" 
                  className="vearn-filter-input" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                />
              </div>
              <span className="vearn-filter-to">to</span>
              <div className="vearn-date-input-wrapper">
                <input 
                  type="date" 
                  className="vearn-filter-input" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                />
              </div>
              {(startDate || endDate) && (
                <button className="vearn-clear-filters" onClick={clearFilters}>
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <div className="vearn-history-list">
            {filteredEarnings.length > 0 ? (
              filteredEarnings.map((earning) => (
                <div 
                  key={earning.id} 
                  className="vearn-history-item"
                  onClick={() => setSelectedEarning(earning)}
                >
                  <div className="vearn-item-left">
                    <div className="vearn-item-icon">👕</div>
                    <div className="vearn-item-details">
                      <span className="vearn-item-title">Order #{earning.id}</span>
                      <span className="vearn-item-date">{earning.date}</span>
                    </div>
                  </div>
                  <div className="vearn-item-right">
                    <span className="vearn-item-amount">+ Rs. {earning.net}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="vearn-empty-state">
                <p>No earnings found for these dates.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* =========================================
          EARNING BREAKDOWN MODAL
          ========================================= */}
      {selectedEarning && (
        <div className="vearn-modal-overlay">
          <div className="vearn-modal-box">
            
            <button className="vearn-close-x" onClick={() => setSelectedEarning(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <h3 className="vearn-modal-title">Earning Breakdown</h3>
            <p className="vearn-modal-subtitle">Order #{selectedEarning.id} • {selectedEarning.date}</p>
            
            <div className="vearn-modal-total-box">
              <span>Net Earning</span>
              <strong>Rs. {selectedEarning.net}</strong>
            </div>

            <div className="vearn-modal-details">
              <div className="vearn-detail-row">
                <span>Customer</span>
                <strong>{selectedEarning.customer}</strong>
              </div>
              <div className="vearn-detail-row">
                <span>Service</span>
                <strong>{selectedEarning.service}</strong>
              </div>
              <div className="vearn-detail-divider"></div>
              <div className="vearn-detail-row">
                <span>Gross Order Value</span>
                <strong>Rs. {selectedEarning.gross}</strong>
              </div>
              <div className="vearn-detail-row vearn-fee-row">
                <span>Quick Wash Fee (10%)</span>
                <strong>- Rs. {selectedEarning.fee}</strong>
              </div>
            </div>

            <button className="vearn-action-btn" onClick={() => setSelectedEarning(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <footer className="vearn-bottom-nav">
        <button className="vearn-nav-item" onClick={() => navigate('/vendor-home')}><span>🏠</span><small>Home</small></button>
        <button className="vearn-nav-item" onClick={() => navigate('/vendor-wallet')}><span>💳</span><small>Wallet</small></button>
        <button className="vearn-nav-item active"><span>💲</span><small>Earnings</small></button>
        <button className="vearn-nav-item" onClick={() => navigate('/vendor-profile')}><span>👤</span><small>Profile</small></button>
      </footer>
    </div>
  );
};

export default VendorEarnings;