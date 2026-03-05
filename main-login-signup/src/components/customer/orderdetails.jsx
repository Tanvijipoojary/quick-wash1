import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './orderdetails.css';
import logo from '../assets/quickwash-logo.png';

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. FETCH REAL ORDER WITH AUTO-REFRESH ---
  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails(); // Fetch immediately on load
      
      // LIVE TRACKING: Poll the database every 5 seconds for updates!
      const interval = setInterval(fetchOrderDetails, 5000);
      return () => clearInterval(interval);
    }
  }, [id]);

  if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Tracking Details... ⏳</div>;
  if (!order) return <div style={{ padding: '50px', textAlign: 'center' }}>Order not found! ❌</div>;

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  // --- 2. SMART STEPPER LOGIC ---
  // Maps our 7 backend statuses to the 5 visual UI steps
  const getActiveStepNumber = (status) => {
    switch (status) {
      case 'Pending Pickup': return 1; 
      case 'Picked Up': 
      case 'Dropped at Hub': return 2; 
      case 'At Shop': return 3; 
      case 'Ready': 
      case 'Out for Delivery': return 4; 
      case 'Completed': return 5; 
      default: return 1;
    }
  };

  const getStepClass = (stepNum) => {
    const currentStep = getActiveStepNumber(order.status);
    if (currentStep > stepNum) return "completed";
    if (currentStep === stepNum) return "active";
    return "pending";
  };

  return (
    <div className="web-container">
      {/* --- TOP NAVBAR --- */}
      <nav className="top-navbar">
        <div className="nav-brand" onClick={() => navigate('/home')}>
          <img src={logo} alt="Quick Wash Logo" className="nav-logo" />
          <h2>QUICK WASH</h2>
        </div>
        <div className="nav-links">
          <div className="nav-item" onClick={() => navigate('/home')}>🏠 Home</div>
          <div className="nav-item profile-btn" onClick={() => navigate('/profile')}>👤 Profile</div>
        </div>
      </nav>

      <main className="tracking-main animate-fade">
        <div className="tracking-header">
          <h1>Order #{order._id.substring(order._id.length - 6).toUpperCase()}</h1>
          <span className="status-pill active-status">{order.status}</span>
        </div>

        <div className="tracking-layout">
          
          {/* --- LEFT COLUMN: LIVE TRACKER --- */}
          <div className="tracker-section">
            <div className="tracking-card">
              <h2>Track Your Wash</h2>
              
              <div className="vertical-stepper">
                {/* Step 1: Booking Confirmed */}
                <div className={`step ${getStepClass(1)}`}>
                  <div className="step-icon">✅</div>
                  <div className="step-content">
                    <h4>Booking Confirmed</h4>
                    <p>We received your request.</p>
                  </div>
                </div>

                {/* Step 2: Rider Assigned */}
                <div className={`step ${getStepClass(2)}`}>
                  <div className="step-icon">🛵</div>
                  <div className="step-content">
                    <h4>{order.status === 'Dropped at Hub' ? 'Arrived at Shop' : 'Rider Picked Up'}</h4>
                    <p>{order.status === 'Dropped at Hub' ? 'Clothes dropped at vendor hub.' : 'Rider has collected your clothes.'}</p>
                  </div>
                </div>

                {/* Step 3: Weighing & Billing */}
                <div className={`step ${getStepClass(3)}`}>
                  <div className="step-icon">⚖️</div>
                  <div className="step-content">
                    <h4>Weighing & Washing</h4>
                    <p>Vendor is processing your clothes and generating the final bill.</p>
                  </div>
                </div>

                {/* Step 4: Ready for Delivery */}
                <div className={`step ${getStepClass(4)}`}>
                  <div className="step-icon">🫧</div>
                  <div className="step-content">
                    {/* Dynamically changes text when rider accepts the return trip! */}
                    <h4>{order.status === 'Out for Delivery' ? 'Out for Delivery' : 'Ready for Pickup'}</h4>
                    <p>{order.status === 'Out for Delivery' ? 'Rider is bringing your clean clothes!' : 'Washing is complete!'}</p>
                  </div>
                </div>

                {/* Step 5: Delivered */}
                <div className={`step ${getStepClass(5)}`}>
                  <div className="step-icon">📦</div>
                  <div className="step-content">
                    <h4>Delivered</h4>
                    <p>Fresh clothes back at your door.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* --- RIGHT COLUMN: ORDER INFO --- */}
          <div className="order-info-section">
            
            <div className="info-card">
              <h3>Pickup Details</h3>
              <p><strong>Date:</strong> {orderDate}</p>
              <p><strong>Shop:</strong> {order.shopName}</p>
              <p><strong>Time:</strong> {order.pickupSlot || 'ASAP'}</p>
            </div>

            <div className="info-card">
              <h3>Requested Services</h3>
              {order.items.map((item, i) => (
                <div key={i} className="service-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <strong>{item.name}</strong>
                    <p className="service-subtext" style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Qty: {item.qty}</p>
                  </div>
                  <span className="rate-badge" style={{ fontWeight: 'bold' }}>₹{item.price}{item.name.includes("Dry Clean") ? "/pc" : "/kg"}</span>
                </div>
              ))}
            </div>

            <div className="info-card billing-card">
              <h3>Final Bill</h3>
              
              {order.totalAmount === 0 ? (
                <div className="pending-bill-box" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#64748b' }}>⏳ Waiting for shop to weigh items and finalize bill.</p>
                </div>
              ) : (
                <div className="ready-to-pay-box">
                  <div className="bill-summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.1rem' }}>
                    <span>Total Amount Due</span>
                    <strong>₹{order.totalAmount}</strong>
                  </div>
                  
                  {order.paymentStatus === 'Paid' ? (
                    <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                      ✅ Payment Complete
                    </div>
                  ) : (
                    <button 
                      className="pay-bill-btn" 
                      onClick={() => navigate(`/billing/${order._id}`)}
                      style={{ width: '100%', background: '#2563eb', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      View Invoice & Pay
                    </button>
                  )}
                </div>
              )}
            </div>

            <button className="back-profile-btn" onClick={() => navigate('/profile')} style={{ width: '100%', background: 'transparent', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>
              Go to My Orders
            </button>

          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;