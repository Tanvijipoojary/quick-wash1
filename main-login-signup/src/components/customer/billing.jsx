import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './billing.css';
import logo from '../assets/quickwash-logo.png';

const Billing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

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
    
    if (id) fetchOrderDetails();
  }, [id]);

  // --- 2. HANDLE REAL PAYMENT ---
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Tell the database this order is now Paid!
      await axios.put(`http://localhost:5000/api/orders/update-status/${id}`, {
        paymentStatus: 'Paid'
      });
      
      alert(`✅ Payment of ₹${finalTotal.toFixed(2)} successful via ${paymentMethod}!\n\nYour clothes will be delivered soon.`);
      navigate(`/order/${id}`); // Send them right back to live tracking
    } catch (error) {
      alert("Payment failed! Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div style={{ padding: '50px', textAlign: 'center', fontSize: '1.2rem' }}>Loading Invoice... ⏳</div>;
  if (!order) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>Invoice not found! ❌</div>;

  // --- 3. DYNAMIC MATH FOR REAL BILL ---
  // We take the totalAmount the vendor entered as the washing subtotal
  const subtotal = order.totalAmount || 0; 
  const deliveryFee = order.deliveryFee || 40;
  const tax = subtotal * 0.05; // 5% GST
  const finalTotal = subtotal + deliveryFee + tax;

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

      <main className="billing-main animate-fade">
        <h1 className="billing-title">Payment & Invoice</h1>

        <div className="billing-layout">
          
          {/* --- LEFT COLUMN: INVOICE BREAKDOWN --- */}
          <div className="invoice-section">
            <div className="invoice-card">
              <div className="invoice-header">
                <div>
                  <h3>Final Bill</h3>
                  <p>Order #{order._id.substring(order._id.length - 6).toUpperCase()}</p>
                </div>
                <span className={`status-badge ${order.paymentStatus === 'Paid' ? 'green' : 'orange'}`}>
                  {order.paymentStatus === 'Paid' ? 'Payment Complete' : 'Payment Pending'}
                </span>
              </div>

              <div className="invoice-table">
                <div className="table-header">
                  <span>Item / Service</span>
                  <span>Qty</span>
                  <span>Rate</span>
                </div>
                
                {/* Dynamically list the REAL items the customer ordered */}
                {order.items.map((item, index) => (
                  <div key={index} className="table-row">
                    <div className="item-name-block">
                      <strong>{item.name}</strong>
                    </div>
                    <span>{item.qty}</span>
                    <strong>₹{item.price}</strong>
                  </div>
                ))}
              </div>

              <div className="invoice-summary">
                <div className="summary-line">
                  <span>Washing Subtotal (Set by Shop)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Taxes (5% GST)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="summary-line grand-total">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: PAYMENT METHODS --- */}
          <div className="payment-section">
            <div className="payment-card">
              <h2>Select Payment Method</h2>
              
              {/* If already paid, hide the payment options and show a success message */}
              {order.paymentStatus === 'Paid' ? (
                 <div style={{ textAlign: 'center', padding: '30px', background: '#ecfdf5', borderRadius: '12px', color: '#059669' }}>
                   <h3 style={{ margin: 0 }}>🎉 Bill Already Paid!</h3>
                   <p>Your payment was successful.</p>
                   <button className="pay-now-btn" style={{ background: '#10b981', marginTop: '15px' }} onClick={() => navigate(`/order/${id}`)}>
                     Back to Tracking
                   </button>
                 </div>
              ) : (
                <>
                  <div className="payment-options">
                    <div className={`pay-option ${paymentMethod === 'UPI' ? 'selected' : ''}`} onClick={() => setPaymentMethod('UPI')}>
                      <span className="pay-icon">📱</span>
                      <div className="pay-text">
                        <strong>UPI (GPay, PhonePe)</strong>
                        <p>Instant digital payment</p>
                      </div>
                      <div className="radio-circle"></div>
                    </div>

                    <div className={`pay-option ${paymentMethod === 'Card' ? 'selected' : ''}`} onClick={() => setPaymentMethod('Card')}>
                      <span className="pay-icon">💳</span>
                      <div className="pay-text">
                        <strong>Credit / Debit Card</strong>
                        <p>Visa, MasterCard, RuPay</p>
                      </div>
                      <div className="radio-circle"></div>
                    </div>

                    <div className={`pay-option ${paymentMethod === 'Cash' ? 'selected' : ''}`} onClick={() => setPaymentMethod('Cash')}>
                      <span className="pay-icon">💵</span>
                      <div className="pay-text">
                        <strong>Cash on Delivery</strong>
                        <p>Pay rider when clothes arrive</p>
                      </div>
                      <div className="radio-circle"></div>
                    </div>
                  </div>

                  <button className="pay-now-btn" onClick={handlePayment} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : `Pay ₹${finalTotal.toFixed(2)} Securely`}
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Billing;