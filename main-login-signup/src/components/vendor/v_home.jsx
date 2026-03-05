import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './v_home.css';

const VendorHome = () => {
  const navigate = useNavigate();
  
  // Navigation & Menus
  const [activeTab, setActiveTab] = useState('New Requests');

  // Modal States
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [readyTime, setReadyTime] = useState('');
  
  // --- NEW: DYNAMIC BILLING STATE ---
  const [billingDetails, setBillingDetails] = useState([]);
  const [totalBill, setTotalBill] = useState(0);

  // --- 1. REAL VENDOR AUTH ---
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    const savedVendorStr = localStorage.getItem('quickwash_vendor');
    // Using fallback if none found, matching previous fixes
    if (savedVendorStr) {
      setVendor(JSON.parse(savedVendorStr));
    } else {
      const savedVendorEmail = localStorage.getItem('vendorEmail'); 
      setVendor({ shopId: '69a8f49b1850c7244b743702', email: savedVendorEmail, name: 'Laundry Hub' }); 
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
        service: o.items.map(i => i.name).join(', '),
        rawItems: o.items, // 👈 Saving raw items for our new dynamic billing calculator
        // Inside fetchVendorOrders, update the mapping:
        status: ['Pending Pickup', 'Picked Up', 'Dropped at Hub'].includes(o.status) ? 'New Requests' : 
                ['At Shop', 'Ready'].includes(o.status) ? 'Processing' : 
                ['Out for Delivery', 'Completed'].includes(o.status) ? 'Dispatched' : 'Dispatched',
        subStatus: o.status === 'Pending Pickup' ? 'pending_acceptance' :
                   o.status === 'Picked Up' ? 'awaiting_rider' :
                   o.status === 'Dropped at Hub' ? 'ready_to_receive' : // 👈 The new handoff state!
                   o.status === 'At Shop' && o.totalAmount === 0 ? 'needs_pricing' :
                   o.status === 'At Shop' && o.totalAmount > 0 ? 'washing' :
                   o.status === 'Ready' ? 'return_requested' : 'dispatched',
        laundryStage: o.laundryStage || 'Washing',
        weight: o.weight || '0',
        total: o.totalAmount || '0',
        estimatedReady: o.estimatedReady || '',
        dateTime: o.updatedAt
      }));
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching vendor orders:", error);
    }
  };

  useEffect(() => {
    fetchVendorOrders();
    const interval = setInterval(fetchVendorOrders, 10000);
    return () => clearInterval(interval);
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
    try {
      await axios.put(`http://localhost:5000/api/orders/update-status/${orderId}`, updateData);
      fetchVendorOrders(); 
    } catch (error) {
      alert("Failed to update order status.");
    }
  };

  const handleAcceptOrder = (orderId) => updateOrderStatus(orderId, { status: 'Picked Up' }); 
  const handleReceiveAtHub = (orderId) => {
    updateOrderStatus(orderId, { status: 'At Shop' });
    setActiveTab('Processing');
  };

  // ==========================================
  // --- NEW SMART BILLING LOGIC ---
  // ==========================================
  const handleOpenPricing = (orderId) => {
    setActiveOrderId(orderId);
    const order = orders.find(o => o.id === orderId);
    
    // Create an itemized bill based on what the customer requested
    const initialBilling = order.rawItems.map(item => {
      // Logic to decide if it's billed by Kg or by Piece
      const isWeightBased = item.name.toLowerCase().includes('wash') && !item.name.toLowerCase().includes('iron');
      const standardRate = isWeightBased ? 40 : (item.name.toLowerCase().includes('dry') ? 100 : 15);
      
      const category = isWeightBased ? 'Kg' : 'Pcs';
      const defaultInput = isWeightBased ? '' : (item.qty || 1);
      
      return {
        name: item.name,
        category: category,
        rate: item.price || standardRate, // Use DB price if exists, else fallback
        inputValue: defaultInput,
        cost: defaultInput ? Number(defaultInput) * (item.price || standardRate) : 0
      };
    });

    setBillingDetails(initialBilling);
    calculateTotal(initialBilling);
    setReadyTime('');
    setShowPricingModal(true);
  };

  const handleBillingChange = (index, newValue) => {
    const updated = [...billingDetails];
    updated[index].inputValue = newValue;
    updated[index].cost = Number(newValue || 0) * updated[index].rate;
    setBillingDetails(updated);
    calculateTotal(updated);
  };

  const calculateTotal = (details) => {
    const sum = details.reduce((acc, curr) => acc + curr.cost, 0);
    setTotalBill(sum);
  };

  const handleSendBill = () => {
    if (!readyTime || totalBill === 0) {
      alert("Please enter weights/quantities and a ready time.");
      return;
    }

    // Auto-calculate the total weight (Sum of all Kg items)
    const totalWeight = billingDetails
      .filter(item => item.category === 'Kg')
      .reduce((acc, curr) => acc + Number(curr.inputValue || 0), 0);

    updateOrderStatus(activeOrderId, { 
      status: 'At Shop', 
      totalAmount: totalBill, 
      weight: totalWeight > 0 ? totalWeight.toFixed(1) : 'N/A', // Save total Kg
      estimatedReady: readyTime,
      laundryStage: 'Washing'
    });
    setShowPricingModal(false);
  };
  // ==========================================

  const handleUpdateStage = (orderId, newStage) => {
    let updateData = { laundryStage: newStage };
    if (newStage === 'Ready') updateData.status = 'Ready'; 
    updateOrderStatus(orderId, updateData);
  };

  const handleRequestRider = (orderId) => {
    // This updates the database to broadcast the order to riders
    updateOrderStatus(orderId, { 
      status: 'Ready', 
      subStatus: 'return_requested' 
    });
  };

  return (
    <div className="vhome-container">
      <header className="vhome-header">
        <div style={{ width: 24 }}></div> 
        <h1 className="vhome-header-title">{vendor?.name || 'Laundry Hub'} Dashboard</h1>
        <div style={{ width: 24 }}></div> 
      </header>

      <nav className="vhome-main-tabs">
        {['New Requests', 'Processing', 'Dispatched'].map(tab => (
          <button key={tab} className={`vhome-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </nav>

      <main className="vhome-main-content">
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
                    <span className="vhome-pill vhome-pill-alert">Needs Pricing</span>
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

                {order.status === 'New Requests' && (
                  <div className="vhome-actions">
                    {order.subStatus === 'pending_acceptance' && (
                      <button className="vhome-btn-accept" style={{width: '100%'}} onClick={() => handleAcceptOrder(order.id)}>
                        Accept & Notify Rider
                      </button>
                    )}
                    
                    {order.subStatus === 'awaiting_rider' && (
                      <div style={{ textAlign: 'center', padding: '10px', background: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa', color: '#ea580c', fontWeight: 'bold' }}>
                        🛵 Rider is collecting clothes from customer...
                      </div>
                    )}

                    {order.subStatus === 'ready_to_receive' && (
                      <button className="vhome-btn-full" onClick={() => handleReceiveAtHub(order.id)} style={{ background: '#10b981', color: 'white' }}>
                        📦 Mark as Received from Rider
                      </button>
                    )}
                  </div>
                )}

                {order.status === 'Processing' && (
                  <div className="vhome-processing-area">
                    {order.subStatus === 'needs_pricing' ? (
                      <div className="vhome-pricing-alert">
                        <p>Clothes received! Weigh them and set the final price.</p>
                        <button className="vhome-btn-full" onClick={() => handleOpenPricing(order.id)}>Weigh & Generate Bill</button>
                      </div>
                    ) : (
                      <div className="vhome-laundry-tracker">
                        <div className="vhome-weight-row">
                          <span className="vhome-label">Weight: <strong>{order.weight} kg</strong></span>
                          <span className="vhome-label">Bill: <strong>Rs. {order.total}</strong></span>
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
      </main>

      {/* --- NEW SMART PRICING MODAL --- */}
      {showPricingModal && (
        <div className="vhome-modal-overlay">
          <div className="vhome-pricing-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="vhome-modal-close" onClick={() => setShowPricingModal(false)}>✕</button>
            <h3 className="vhome-modal-title">Itemized Billing</h3>
            <p className="vhome-modal-subtitle" style={{marginBottom: '20px'}}>Enter weight or quantities for requested services.</p>
            
            {/* Dynamic Inputs per service */}
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              {billingDetails.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px dashed #cbd5e1' }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#1e293b' }}>{item.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Rate: Rs. {item.rate} / {item.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="number" 
                      placeholder={item.category}
                      value={item.inputValue} 
                      onChange={(e) => handleBillingChange(idx, e.target.value)} 
                      style={{ width: '70px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}
                    />
                    <strong style={{ width: '70px', textAlign: 'right', color: '#2563eb' }}>Rs. {item.cost.toFixed(2)}</strong>
                  </div>
                </div>
              ))}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '1.2rem' }}>
                <strong>Total Bill:</strong>
                <strong style={{ color: '#10b981' }}>Rs. {totalBill.toFixed(2)}</strong>
              </div>
            </div>

            <div className="vhome-input-group">
              <label>Estimated Ready Time</label>
              <input type="datetime-local" value={readyTime} onChange={(e) => setReadyTime(e.target.value)} className="vhome-date-input"/>
            </div>
            
            <button className="vhome-btn-accept" style={{width: '100%', marginTop: '16px'}} onClick={handleSendBill} disabled={totalBill === 0 || !readyTime}>
              Send Bill & Start Washing
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