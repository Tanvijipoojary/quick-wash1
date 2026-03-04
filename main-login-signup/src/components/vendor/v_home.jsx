import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './v_home.css';

const VendorHome = () => {
  const navigate = useNavigate();
  
  // Navigation & Menus
  const [activeTab, setActiveTab] = useState('New Requests');

  // Modal States
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('');
  const [readyTime, setReadyTime] = useState('');

  // Laundry Order Data Flow
  const [orders, setOrders] = useState([
    { 
      id: '8821XB', customer: 'Sarah Smith', service: 'Premium Wash & Fold', 
      status: 'New Requests', subStatus: 'pending_acceptance',
      comment: 'Please pick up from the front desk.'
    },
    { 
      id: '1234UA', customer: 'Alex Johnson', service: 'Dry Clean Suit', 
      status: 'New Requests', subStatus: 'awaiting_rider',
      comment: 'Rider is currently bringing this to your hub.'
    },
    { 
      id: '5566YC', customer: 'Mike Ross', service: 'Wash & Iron', 
      status: 'Processing', subStatus: 'needs_pricing',
      comment: 'Check pockets please.'
    },
    { 
      id: '9988ZD', customer: 'Harvey Specter', service: 'Wash & Fold', 
      status: 'Processing', subStatus: 'washing', laundryStage: 'Washing',
      weight: '4.5', total: '450', estimatedReady: '2026-03-01T17:00'
    },
    { 
      id: '7722KL', customer: 'Louis Litt', service: 'Dry Cleaning', 
      status: 'Processing', subStatus: 'return_requested', laundryStage: 'Ready',
      weight: '1.5', total: '350', estimatedReady: '2026-02-27T18:00'
    },
    { 
      id: '3344WE', customer: 'Donna Paulsen', service: 'Ironing Only', 
      status: 'Dispatched', weight: '2.0', total: '200', dateTime: 'Feb 6, 2026 / 4:30 PM'
    }
  ]);

  const displayedOrders = orders.filter(o => o.status === activeTab);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // --- Workflow Actions ---

  const handleAcceptOrder = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, subStatus: 'awaiting_rider' } : o));
  };

  const handleReceiveAtHub = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Processing', subStatus: 'needs_pricing' } : o));
    setActiveTab('Processing');
  };

  const handleOpenPricing = (orderId) => {
    setActiveOrderId(orderId);
    setWeight('');
    setPrice('');
    setReadyTime('');
    setShowPricingModal(true);
  };

  const handleSendBill = () => {
    if (!weight || !price || !readyTime) return;
    setOrders(prev => prev.map(o => o.id === activeOrderId ? { 
      ...o, subStatus: 'washing', laundryStage: 'Washing', weight: weight, total: price, estimatedReady: readyTime 
    } : o));
    setShowPricingModal(false);
  };

  const handleUpdateStage = (orderId, newStage) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, laundryStage: newStage } : o));
  };

  const handleRequestRider = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, subStatus: 'return_requested' } : o));
  };

  const handleHandoverToRider = (orderId) => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    setOrders(prev => prev.map(o => o.id === orderId ? { 
      ...o, status: 'Dispatched', dateTime: `${today} / ${time}` 
    } : o));
    setActiveTab('Dispatched');
  };

  return (
    <div className="vhome-container">
      
      {/* Updated Header: No Sidebar Button */}
      <header className="vhome-header">
        <div style={{ width: 24 }}></div> 
        <h1 className="vhome-header-title">Laundry Hub</h1>
        <div style={{ width: 24 }}></div> 
      </header>

      {/* Main Tabs */}
      <nav className="vhome-main-tabs">
        {['New Requests', 'Processing', 'Dispatched'].map(tab => (
          <button 
            key={tab} 
            className={`vhome-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
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
                    <span className="vhome-id">#{order.id}</span>
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
                    <span className="vhome-pill vhome-pill-active">{order.service}</span>
                  )}
                </div>

                <div className="vhome-customer-details">
                  <div className="vhome-avatar">{order.customer.charAt(0)}</div>
                  <div>
                    <h3 className="vhome-customer-name">{order.customer}</h3>
                    <p className="vhome-service-text">Service: {order.service}</p>
                  </div>
                </div>

                {order.comment && (
                  <div className="vhome-comment-box">
                    <span className="vhome-label">Note</span>
                    <p className="vhome-comment-text">{order.comment}</p>
                  </div>
                )}

                {order.status === 'New Requests' && (
                  <div className="vhome-actions">
                    {order.subStatus === 'pending_acceptance' ? (
                      <>
                        <button className="vhome-btn-decline" onClick={() => setOrders(prev => prev.filter(o => o.id !== order.id))}>Decline</button>
                        <button className="vhome-btn-accept" onClick={() => handleAcceptOrder(order.id)}>Accept & Notify Rider</button>
                      </>
                    ) : (
                      <button className="vhome-btn-full" onClick={() => handleReceiveAtHub(order.id)}>Mark as Arrived at Hub</button>
                    )}
                  </div>
                )}

                {order.status === 'Processing' && (
                  <div className="vhome-processing-area">
                    {order.subStatus === 'needs_pricing' ? (
                      <div className="vhome-pricing-alert">
                        <p>Clothes received! Weigh them and set the final price & timeline.</p>
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
                          <button className="vhome-btn-accept" style={{width: '100%', marginTop: '12px'}} onClick={() => handleRequestRider(order.id)}>
                            Request Return Drop-off
                          </button>
                        )}

                        {order.laundryStage === 'Ready' && order.subStatus === 'return_requested' && (
                          <div className="vhome-rider-arriving-box">
                            <div className="vhome-rider-header">
                              <span className="vhome-rider-icon">🛵</span>
                              <div>
                                <h4>Rider is on the way</h4>
                                <p>To pick up the clean clothes.</p>
                              </div>
                            </div>
                            <button className="vhome-btn-full" style={{marginTop: '16px'}} onClick={() => handleHandoverToRider(order.id)}>
                              Handover to Rider
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {order.status === 'Dispatched' && (
                  <div className="vhome-dispatched-info">
                    <div className="vhome-info-row"><span className="vhome-label">Weight Processed</span><strong>{order.weight} kg</strong></div>
                    <div className="vhome-info-row"><span className="vhome-label">Final Bill</span><strong>Rs. {order.total}</strong></div>
                    <div className="vhome-info-row"><span className="vhome-label">Dispatched On</span><strong>{order.dateTime}</strong></div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="vhome-empty"><p>No {activeTab.toLowerCase()} right now.</p></div>
          )}
        </div>
      </main>

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="vhome-modal-overlay">
          <div className="vhome-pricing-modal">
            <button className="vhome-modal-close" onClick={() => setShowPricingModal(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h3 className="vhome-modal-title">Weigh & Bill Customer</h3>
            <p className="vhome-modal-subtitle">Set the exact weight, final price, and when the clothes will be ready.</p>
            <div className="vhome-input-group">
              <label>Weight (in Kg)</label>
              <input type="number" placeholder="e.g. 4.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="vhome-input-group">
              <label>Final Bill Amount (Rs)</label>
              <input type="number" placeholder="e.g. 450" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="vhome-input-group">
              <label>Estimated Ready Time</label>
              <input type="datetime-local" value={readyTime} onChange={(e) => setReadyTime(e.target.value)} className="vhome-date-input"/>
            </div>
            <button className={`vhome-btn-accept ${weight && price && readyTime ? '' : 'disabled'}`} style={{width: '100%', marginTop: '16px'}} onClick={handleSendBill} disabled={!weight || !price || !readyTime}>
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