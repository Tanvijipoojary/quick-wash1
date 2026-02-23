import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './billing.css';
import logo from '../assets/quickwash-logo.png';

const Billing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Dummy data: This represents the finalized bill from the vendor
  const orderId = id || "ORD-9999";
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const finalItems = [
    { id: 1, name: "Daily Mixed Wear", service: "Wash & Fold", rate: "₹40/kg", qty: "2.5 kg", total: 100 },
    { id: 2, name: "Bedsheets & Curtains", service: "Wash & Iron", rate: "₹60/kg", qty: "1.5 kg", total: 90 },
    { id: 3, name: "Suits & Heavy Jackets", service: "Premium Dry Clean", rate: "₹150/pc", qty: "2 pcs", total: 300 }
  ];

  const subtotal = finalItems.reduce((acc, item) => acc + item.total, 0);
  const deliveryFee = 40;
  const tax = subtotal * 0.05; // 5% GST
  const finalTotal = subtotal + deliveryFee + tax;

  const handlePayment = () => {
    alert(`✅ Payment of ₹${finalTotal.toFixed(2)} successful via ${paymentMethod}!\n\nYour clothes will be delivered soon.`);
    navigate(`/order/${orderId}`); // Send them back to tracking page
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
          <div className="nav-item profile-btn" onClick={() => navigate('/profile')}>👤 Tanvi</div>
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
                  <p>Order #{orderId}</p>
                </div>
                <span className="status-badge orange">Payment Pending</span>
              </div>

              <div className="invoice-table">
                <div className="table-header">
                  <span>Item / Service</span>
                  <span>Qty / Weight</span>
                  <span>Amount</span>
                </div>
                
                {finalItems.map(item => (
                  <div key={item.id} className="table-row">
                    <div className="item-name-block">
                      <strong>{item.name}</strong>
                      <small>{item.service} ({item.rate})</small>
                    </div>
                    <span>{item.qty}</span>
                    <strong>₹{item.total.toFixed(2)}</strong>
                  </div>
                ))}
              </div>

              <div className="invoice-summary">
                <div className="summary-line">
                  <span>Subtotal</span>
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
              
              <div className="payment-options">
                <div 
                  className={`pay-option ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('UPI')}
                >
                  <span className="pay-icon">📱</span>
                  <div className="pay-text">
                    <strong>UPI (GPay, PhonePe)</strong>
                    <p>Instant digital payment</p>
                  </div>
                  <div className="radio-circle"></div>
                </div>

                <div 
                  className={`pay-option ${paymentMethod === 'Card' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Card')}
                >
                  <span className="pay-icon">💳</span>
                  <div className="pay-text">
                    <strong>Credit / Debit Card</strong>
                    <p>Visa, MasterCard, RuPay</p>
                  </div>
                  <div className="radio-circle"></div>
                </div>

                <div 
                  className={`pay-option ${paymentMethod === 'Cash' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Cash')}
                >
                  <span className="pay-icon">💵</span>
                  <div className="pay-text">
                    <strong>Cash on Delivery</strong>
                    <p>Pay rider when clothes arrive</p>
                  </div>
                  <div className="radio-circle"></div>
                </div>
              </div>

              <button className="pay-now-btn" onClick={handlePayment}>
                Pay ₹{finalTotal.toFixed(2)} Securely
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Billing;