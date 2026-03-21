import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './billing.css';
import logo from '../assets/quickwash-logo.png'; // Adjust path if needed

const Billing = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchInvoice();
  }, [id]);

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    
    // Simulate a 2-second payment gateway delay (like Razorpay processing)
    setTimeout(async () => {
      try {
        // Tell the database this order is officially PAID
        await axios.put(`http://localhost:5000/api/orders/update-status/${id}`, {
          paymentStatus: 'Paid'
        });
        
        setIsProcessing(false);
        setPaymentSuccess(true);
        
        // After showing the success tick, redirect back to the tracker
        setTimeout(() => {
          navigate(`/tracking/${id}`);
        }, 2000);

      } catch (error) {
        alert("Payment failed to verify with server.");
        setIsProcessing(false);
      }
    }, 2000);
  };

  if (isLoading) return <div className="billing-loading">Generating Invoice... ⏳</div>;
  if (!order) return <div className="billing-loading">Invoice not found! ❌</div>;

  const invoiceDate = new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <div className="web-container billing-bg">
      <nav className="top-navbar">
        <div className="nav-brand" onClick={() => navigate('/home')}>
          <img src={logo} alt="Quick Wash Logo" className="nav-logo" />
          <h2>QUICK WASH</h2>
        </div>
      </nav>

      <main className="billing-main animate-fade">
        <div className="invoice-card">
          
          {/* INVOICE HEADER */}
          <div className="invoice-header">
            <div>
              <h1 className="invoice-title">Tax Invoice</h1>
              <p className="invoice-id">Order #{order._id.substring(order._id.length - 6).toUpperCase()}</p>
            </div>
            <div className="invoice-shop-details">
              <strong>{order.shopName}</strong>
              <p>Date: {invoiceDate}</p>
            </div>
          </div>

          <div className="invoice-divider"></div>

          {/* CUSTOMER DETAILS */}
          <div className="invoice-customer">
            <p className="billed-to-label">Billed To:</p>
            <h3>{order.customerEmail.split('@')[0]}</h3>
            <p>{order.customerEmail}</p>
            <p>{order.pickupAddress}</p>
          </div>

          {/* ITEMIZED TABLE */}
          <div className="invoice-table-container">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Service Description</th>
                  <th style={{textAlign: 'center'}}>Type</th>
                  <th style={{textAlign: 'right'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td style={{textAlign: 'center'}} className="text-muted">
                      {item.name.includes('Dry') ? 'Per Piece' : 'Per Kg'}
                    </td>
                    {/* Note: We show a placeholder here since the vendor sets the grand total dynamically */}
                    <td style={{textAlign: 'right'}}>Included</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALS CALCULATION */}
          <div className="invoice-totals">
            <div className="totals-row">
              <span>Laundry Services Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
            <div className="totals-row">
              <span>Pickup & Delivery Fee</span>
              <span>₹{order.deliveryFee || 40}</span>
            </div>
            <div className="invoice-divider"></div>
            <div className="totals-row grand-total">
              <span>Grand Total</span>
              <span>₹{(order.totalAmount + (order.deliveryFee || 40)).toFixed(2)}</span>
            </div>
          </div>

          {/* PAYMENT ACTION AREA */}
          <div className="invoice-actions">
            {paymentSuccess ? (
              <div className="payment-success-banner animate-pop">
                <span className="success-icon">✅</span>
                <h3>Payment Successful!</h3>
                <p>Redirecting to your tracker...</p>
              </div>
            ) : order.paymentStatus === 'Paid' ? (
               <div className="payment-success-banner">
                <span className="success-icon">✅</span>
                <h3>Invoice Paid</h3>
                <button className="secondary-btn" onClick={() => navigate(`/tracking/${id}`)}>Back to Tracker</button>
              </div>
            ) : (
              <button 
                className={`pay-now-btn ${isProcessing ? 'processing' : ''}`}
                onClick={handleSimulatePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="loader-text">🔒 Processing Secure Payment...</span>
                ) : (
                  <>💳 Pay ₹{(order.totalAmount + (order.deliveryFee || 40)).toFixed(2)} Securely</>
                )}
              </button>
            )}
            
            <p className="secure-badge">🔒 Secure 256-bit SSL Encryption</p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Billing;