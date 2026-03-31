import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './v_home.css';

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

const VendorHome = () => {
  const navigate = useNavigate();
  
  // Navigation & Menus
  const [activeTab, setActiveTab] = useState('New Requests');

  // Modal States
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [vendorRate, setVendorRate] = useState(60);
  const [readyTime, setReadyTime] = useState('');
  
  // --- STREAMLINED BILLING STATE ---
  const [bagWeight, setBagWeight] = useState('');
  const [totalBill, setTotalBill] = useState(0);

  // --- 1. REAL VENDOR AUTH ---
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    const savedVendorStr = localStorage.getItem('quickwash_vendor');
    if (savedVendorStr) {
      setVendor(JSON.parse(savedVendorStr));
    } else {
      navigate('/vendor-login'); 
    }
  }, [navigate]);

  // --- 2. REAL ORDERS FROM DB ---
  const [orders, setOrders] = useState([]);

  const fetchVendorOrders = async () => {
    if (!vendor?.shopId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/vendor/${vendor.shopId}`);
      
      const formattedOrders = res.data.map(o => ({
        id: o._id,
        customer: o.customerEmail.split('@')[0], 
        service: "Wash & Iron", 
        
        status: ['Pending', 'Searching Rider', 'Pending Pickup', 'Picked Up', 'Dropped at Hub'].includes(o.status) ? 'New Requests' : 
                ['At Shop', 'Ready'].includes(o.status) ? 'Processing' : 'Dispatched',
                
        subStatus: o.status === 'Pending' ? 'needs_vendor_approval' : 
                   o.status === 'Searching Rider' ? 'broadcasting' : 
                   o.status === 'Pending Pickup' ? 'rider_notified' :
                   o.status === 'Picked Up' ? 'awaiting_rider' :
                   o.status === 'Dropped at Hub' ? 'ready_to_receive' : 
                   o.status === 'At Shop' && o.totalAmount === 0 ? 'needs_pricing' :
                   o.status === 'At Shop' && o.totalAmount > 0 ? 'washing' :
                   o.status === 'Ready' ? 'return_requested' : 'dispatched',
                   
        laundryStage: o.laundryStage || 'Washing',
        weight: o.weightInKg || '0', 
        total: o.totalAmount || '0',
        estimatedReady: o.estimatedReady || '',
        dateTime: o.updatedAt,
        
        // Garment Data
        garmentDetails: o.garmentDetails || {},
        totalExpectedGarments: o.totalExpectedGarments || 0
      }));
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching vendor orders:", error);
    }
  };

  // 👇 ADD THIS NEW FUNCTION 👇
  const fetchLivePricing = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/vendors/shop/${vendor.shopId}`);
      if (res.data && res.data.pricing && res.data.pricing.washAndIron) {
        setVendorRate(res.data.pricing.washAndIron); // Saves the real DB rate!
      }
    } catch (error) {
      console.error("Failed to fetch live pricing");
    }
  };

  useEffect(() => {
    if (vendor && vendor.shopId) {
      fetchVendorOrders();
      fetchLivePricing(); // 👈 TRIGGER IT HERE
      const interval = setInterval(fetchVendorOrders, 10000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor]);

  const displayedOrders = orders.filter(o => o.status === activeTab);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };


  // --- Workflow Actions ---
  const updateOrderStatus = async (orderId, updateData) => {
    console.log(`🔘 Button Clicked! Updating Order ${orderId} to:`, updateData);
    
    try {
      await axios.put(`http://localhost:5000/api/orders/update-status/${orderId}`, updateData);
      console.log("✅ Backend updated successfully! Refreshing orders..."); 
      fetchVendorOrders(); 
    } catch (error) {
      console.error("❌ Failed to update order:", error);
      alert("Failed to update order status.");
    }
  };

  const handleAcceptOrder = (orderId) => {
    updateOrderStatus(orderId, { status: 'Searching Rider' });
  };

  const handleRejectOrder = (orderId) => {
    const isSure = window.confirm("Are you sure you want to reject this order?");
    if (isSure) {
      updateOrderStatus(orderId, { status: 'Rejected', subStatus: 'rejected_by_vendor' });
    }
  };

  const handleReceiveAtHub = (orderId) => {
    updateOrderStatus(orderId, { status: 'At Shop' });
    setActiveTab('Processing');
  };

  const handleOpenPricing = (orderId) => {
    setActiveOrderId(orderId);
    setBagWeight(''); 
    setTotalBill(0);
    setReadyTime('');
    setShowPricingModal(true);
  };

  const handleWeightChange = (e) => {
    const weight = e.target.value;
    setBagWeight(weight);
    
    // 👇 Use the live rate here
    setTotalBill(Number(weight || 0) * vendorRate);
  };

  const handleSendBill = async () => {
    if (!readyTime || totalBill <= 0 || !bagWeight) {
      alert("Please enter a valid weight and a ready time.");
      return;
    }

    const dateObj = new Date(readyTime);
    const prettyReadyTime = dateObj.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });

    try {
      await axios.put(`http://localhost:5000/api/orders/generate-bill/${activeOrderId}`, {
        weightInKg: Number(bagWeight),
        pricePerKg: vendorRate, // 👈 Use the live rate here
        estimatedReady: prettyReadyTime, 
        laundryStage: 'Washing'
      });
      
      setShowPricingModal(false);
      fetchVendorOrders(); 
    } catch (error) {
      alert("Failed to generate bill securely.");
    }
  };

  const handleUpdateStage = (orderId, newStage) => {
    let updateData = { laundryStage: newStage };
    if (newStage === 'Ready') updateData.status = 'Ready'; 
    updateOrderStatus(orderId, updateData);
  };

  const handleRequestRider = (orderId) => {
    updateOrderStatus(orderId, { 
      status: 'Ready', 
      subStatus: 'return_requested',
      
    });
  };

  // ==========================================
  // --- 3. REVIEWS LOGIC (NEW) ---
  // ==========================================
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const fetchReviews = async () => {
    if (!vendor?.shopId) return;
    setIsLoadingReviews(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/vendor/${vendor.shopId}`);
      setReviews(response.data.reviews);
      setAverageRating(response.data.averageRating);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

// Fetch reviews only when the user clicks on the 'Reviews' tab
  useEffect(() => {
    if (activeTab === 'Reviews') {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, vendor]);

  // Helper function to render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#e2e8f0', fontSize: '1.2rem' }}>★</span>
      );
    }
    return stars;
  };
  // ==========================================

  return (
    <div className="vhome-container">
      <header className="vhome-header">
        <div style={{ width: 24 }}></div> 
        <h1 className="vhome-header-title">{vendor?.name || 'Laundry Hub'} Dashboard</h1>
        <div style={{ width: 24 }}></div> 
      </header>

      {/* 👇 ADDED 'Reviews' TO THE TABS ARRAY 👇 */}
      <nav className="vhome-main-tabs" style={{ display: 'flex', overflowX: 'auto', whiteSpace: 'nowrap', padding: '0 10px' }}>
        {['New Requests', 'Processing', 'Dispatched', 'Reviews'].map(tab => (
          <button 
            key={tab} 
            className={`vhome-tab ${activeTab === tab ? 'active' : ''}`} 
            onClick={() => setActiveTab(tab)}
            style={{ flexShrink: 0, padding: '10px 15px', marginRight: '5px' }} // Added styling for horizontal scrolling
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="vhome-main-content">
        
        {/* REVIEWS TAB CONTENT */}
        {activeTab === 'Reviews' ? (
          <div className="vhome-reviews-area animate-fade" style={{ padding: '10px' }}>
            
            {/* Top Score Banner */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#475569', fontSize: '1rem', textTransform: 'uppercase' }}>Overall Rating</h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#0f172a', lineHeight: '1' }}>
                {averageRating > 0 ? averageRating : '—'}
              </div>
              <div style={{ marginTop: '5px' }}>
                {averageRating > 0 ? renderStars(Math.round(averageRating)) : <span style={{ color: '#94a3b8' }}>No ratings yet</span>}
              </div>
              <p style={{ margin: '10px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Based on {reviews.length} customer reviews</p>
            </div>

            {/* List of Reviews */}
            {isLoadingReviews ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>Loading reviews... ⏳</p>
            ) : reviews.length === 0 ? (
              <div className="vhome-empty" style={{ background: 'white', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '2rem' }}>🌟</span>
                <p style={{ color: '#64748b', marginTop: '10px' }}>You haven't received any reviews yet. Keep providing great service!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {reviews.map(review => (
                  <div key={review._id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <strong style={{ display: 'block', color: '#0f172a', fontSize: '1.05rem' }}>
                          {review.customerId?.name || 'Anonymous Customer'}
                        </strong>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                          {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    {review.comment && (
                      <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          
          /* ORIGINAL ORDERS TABS CONTENT */
          <div className="vhome-orders-list">
            {displayedOrders.length > 0 ? (
              displayedOrders.map(order => (
                <div key={order.id} className="vhome-order-card">
                  <div className="vhome-card-header">
                    <div className="vhome-id-block">
                      <span className="vhome-label">Order ID</span>
                      <span className="vhome-id">#{order.id.slice(-6).toUpperCase()}</span>
                    </div>
                    {order.status === 'Dispatched' ? (
                      <span className="vhome-pill vhome-pill-success">Dispatched</span>
                    ) : order.subStatus === 'return_requested' ? (
                      <span className="vhome-pill vhome-pill-warning">Waiting for Rider</span>
                    ) : order.subStatus === 'awaiting_rider' ? (
                      <span className="vhome-pill vhome-pill-warning">Rider En Route</span>
                    ) : order.subStatus === 'needs_pricing' ? (
                      <span className="vhome-pill vhome-pill-alert">Needs Weighing</span>
                    ) : (
                      <span className="vhome-pill vhome-pill-active">Action Required</span>
                    )}
                  </div>

                  <div className="vhome-customer-details">
                    <div className="vhome-avatar">{order.customer.charAt(0).toUpperCase()}</div>
                    <div>
                      <h3 className="vhome-customer-name">{order.customer}</h3>
                      <p className="vhome-service-text">Service: {order.service}</p>
                    </div>
                  </div>

                  {/* GARMENT INVENTORY SLIP */}
                  {order.totalExpectedGarments > 0 && (
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', margin: '15px 0', border: '1px dashed #cbd5e1' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        🧺 Declared Bag Contents ({order.totalExpectedGarments} Items)
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {Object.entries(order.garmentDetails)
                          .filter(([key, value]) => value > 0)
                          .map(([key, value]) => (
                            <span key={key} style={{ background: '#e2e8f0', color: '#334155', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500' }}>
                              {garmentLabels[key] || key}: <strong style={{color: '#0f172a'}}>{value}</strong>
                            </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AUTOMATED RADAR ACTIONS */}
                  {order.status === 'New Requests' && (
                    <div className="vhome-actions">
                      {order.subStatus === 'needs_vendor_approval' && (
                        <div style={{ display: 'flex', width: '100%', gap: '12px', marginTop: '16px' }}>
                          <button 
                            onClick={() => handleAcceptOrder(order.id)} 
                            style={{ 
                              flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                              background: '#10b981', color: 'white', padding: '12px 0', fontSize: '1.05rem', 
                              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Accept
                          </button>

                          <button 
                            onClick={() => handleRejectOrder(order.id)} 
                            style={{ 
                              flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                              background: '#fef2f2', color: '#ef4444', padding: '12px 0', fontSize: '1.05rem', 
                              border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                            }}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Reject
                          </button>
                        </div>
                      )}

                      {order.subStatus === 'broadcasting' && (
                        <div style={{ textAlign: 'center', padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', color: '#1d4ed8', fontWeight: 'bold' }}>
                          📡 Broadcasting to nearby riders...
                        </div>
                      )}

                      {order.subStatus === 'rider_notified' && (
                        <div style={{ textAlign: 'center', padding: '12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', color: '#059669', fontWeight: 'bold' }}>
                          🛵 Rider assigned! Heading to customer...
                        </div>
                      )}

                      {order.subStatus === 'awaiting_rider' && (
                        <div style={{ textAlign: 'center', padding: '10px', background: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa', color: '#ea580c', fontWeight: 'bold' }}>
                          🛵 Rider has the clothes and is driving to your hub!
                        </div>
                      )}

                      {order.subStatus === 'ready_to_receive' && (
                        <button className="vhome-btn-full" onClick={() => handleReceiveAtHub(order.id)} style={{ background: '#10b981', color: 'white' }}>
                          📦 Mark as Received from Rider
                        </button>
                      )}
                    </div>
                  )}

                  {/* PROCESSING & WEIGHING AREA */}
                  {order.status === 'Processing' && (
                    <div className="vhome-processing-area">
                      {order.subStatus === 'needs_pricing' && (
                        <div className="vhome-pricing-alert">
                          <p>Clothes received! Weigh the bag to generate the bill.</p>
                          <button className="vhome-btn-full" onClick={() => handleOpenPricing(order.id)}>Weigh & Generate Bill</button>
                        </div>
                      )}

                      {order.subStatus !== 'needs_pricing' && (
                        <div className="vhome-laundry-tracker">
                          <div className="vhome-weight-row">
                            <span className="vhome-label">Weight: <strong>{order.weight} kg</strong></span>
                            <span className="vhome-label">Bill: <strong style={{color: '#16a34a'}}>₹{order.total}</strong></span>
                          </div>
                          
                          <div className="vhome-timeline-banner">
                            <span className="vhome-timer-icon">⏱️</span>
                            <div className="vhome-timeline-text">
                              <span className="vhome-label" style={{color: '#d94a4a'}}>Promised To Customer By:</span>
                              <strong>{formatDateTime(order.estimatedReady)}</strong>
                            </div>
                          </div>
                          
                          <div className="vhome-stage-selector">
                            <span className="vhome-label">Current Stage:</span>
                            <select 
                              className="vhome-select-dropdown"
                              value={order.laundryStage}
                              onChange={(e) => handleUpdateStage(order.id, e.target.value)}
                              disabled={order.subStatus === 'return_requested'}
                            >
                              <option value="Washing">Washing</option>
                              <option value="Drying">Drying</option>
                              <option value="Folding/Ironing">Folding & Ironing</option>
                              <option value="Ready">Ready for Delivery</option>
                            </select>
                          </div>

                          {order.laundryStage === 'Ready' && order.subStatus !== 'return_requested' && (
                            <button 
                              className="vhome-btn-accept" 
                              style={{width: '100%', marginTop: '16px', background: '#2563eb', color: 'white'}} 
                              onClick={() => handleRequestRider(order.id)}
                            >
                              📦 Request Rider for Pickup
                            </button>
                          )}

                          {order.laundryStage === 'Ready' && order.subStatus === 'return_requested' && (
                            <div style={{marginTop: '16px', padding: '12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', textAlign: 'center', color: '#ea580c', fontWeight: 'bold'}}>
                              🛵 Waiting for Rider to collect clean clothes...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="vhome-empty"><p>No {activeTab.toLowerCase()} right now.</p></div>
            )}
          </div>
        )}
      </main>

      {/* PRICING MODAL */}
      {showPricingModal && (
        <div className="vhome-modal-overlay">
          <div className="vhome-pricing-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="vhome-modal-close" onClick={() => setShowPricingModal(false)}>✕</button>
            <h3 className="vhome-modal-title">Generate Wash & Iron Bill</h3>
            <p className="vhome-modal-subtitle" style={{marginBottom: '20px'}}>Enter the total weight of the laundry bag in Kg.</p>
            
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: 'bold' }}>Weight (Kg)</span>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="e.g. 2.5"
                  value={bagWeight} 
                  onChange={handleWeightChange} 
                  style={{ width: '100px', padding: '12px', borderRadius: '8px', border: '2px solid #3b82f6', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px dashed #cbd5e1' }}>
                <span style={{ color: '#64748b' }}>Your Rate</span>
                {/* 👇 Use the live rate here */}
                <span>₹{vendorRate} / Kg</span> 
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '1.4rem' }}>
                <strong>Grand Total:</strong>
                <strong style={{ color: '#10b981' }}>₹{totalBill.toFixed(2)}</strong>
              </div>
            </div>

            <div className="vhome-input-group">
              <label>Estimated Ready Time</label>
              <input type="datetime-local" value={readyTime} onChange={(e) => setReadyTime(e.target.value)} className="vhome-date-input"/>
            </div>
            
            <button className="vhome-btn-accept" style={{width: '100%', marginTop: '16px', padding: '16px', fontSize: '1.1rem'}} onClick={handleSendBill} disabled={totalBill <= 0 || !readyTime}>
              Send Bill to Customer
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <footer className="vhome-bottom-nav">
        <button className="vhome-nav-item active"><span>🏠</span><small>Home</small></button>
        <button className="vhome-nav-item" onClick={() => navigate('/vendor-wallet')}><span>💳</span><small>Wallet</small></button>
        <button className="vhome-nav-item" onClick={() => navigate('/vendor-earnings')}><span>💲</span><small>Earnings</small></button>
        <button className="vhome-nav-item" onClick={() => navigate('/vendor-profile')}><span>👤</span><small>Profile</small></button>
      </footer>
    </div>
  );
};

export default VendorHome;