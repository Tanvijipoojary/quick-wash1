import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './orderdetails.css';
import logo from '../assets/quickwash-logo.png';

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Gets the real Order ID from the URL
  
  // Real State for database data
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. FETCH REAL ORDER FROM BACKEND ---
  useEffect(() => {
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
    
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Tracking Details... ⏳</div>;
  if (!order) return <div style={{ padding: '50px', textAlign: 'center' }}>Order not found! ❌</div>;

  // Format the real order date
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  // Helper function to figure out which step we are on
  const getStepStatus = (stepName) => {
    const statuses = ['Pending Pickup', 'Picked Up', 'At Shop', 'Ready', 'Out for Delivery', 'Completed'];
    const currentIndex = statuses.indexOf(order.status);
    const stepIndex = statuses.indexOf(stepName);

    if (currentIndex > stepIndex) return "completed";
    if (currentIndex === stepIndex) return "active";
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
          <h1>Order {order._id.substring(order._id.length - 6).toUpperCase()}</h1>
          <span className="status-pill active-status">{order.status}</span>
        </div>

        <div className="tracking-layout">
          
          {/* --- LEFT COLUMN: LIVE TRACKER --- */}
          <div className="tracker-section">
            <div className="tracking-card">
              <h2>Track Your Wash</h2>
              
              <div className="vertical-stepper">
                {/* Step 1: Booking Confirmed */}
                <div className={`step ${getStepStatus('Pending Pickup')}`}>
                  <div className="step-icon">✅</div>
                  <div className="step-content">
                    <h4>Booking Confirmed</h4>
                    <p>We received your request.</p>
                  </div>
                </div>

                {/* Step 2: Rider Assigned */}
                <div className={`step ${getStepStatus('Picked Up')}`}>
                  <div className="step-icon">🛵</div>
                  <div className="step-content">
                    <h4>Rider Picked Up</h4>
                    <p>Rider has collected your clothes.</p>
                  </div>
                </div>

                {/* Step 3: Weighing & Billing */}
                <div className={`step ${getStepStatus('At Shop')}`}>
                  <div className="step-icon">⚖️</div>
                  <div className="step-content">
                    <h4>Weighing & Washing</h4>
                    <p>Vendor is processing your clothes and generating the final bill.</p>
                  </div>
                </div>

                {/* Step 4: Ready for Delivery */}
                <div className={`step ${getStepStatus('Ready')}`}>
                  <div className="step-icon">🫧</div>
                  <div className="step-content">
                    <h4>Ready for Pickup</h4>
                    <p>Washing is complete!</p>
                  </div>
                </div>

                {/* Step 5: Delivered */}
                <div className={`step ${getStepStatus('Completed')}`}>
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
              <p><strong>Time:</strong> ASAP</p>
            </div>

            <div className="info-card">
              <h3>Requested Services</h3>
              {/* Loop through the REAL items the customer added to the cart */}
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
              
              {/* Dynamic Bill Logic: If the total is 0, it means the shop hasn't weighed it yet! */}
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