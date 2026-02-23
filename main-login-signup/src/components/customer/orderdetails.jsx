import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './orderdetails.css';
import logo from '../assets/quickwash-logo.png';

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Gets the Order ID from the URL (e.g., ORD-9999)
  
  // Dummy order data (Normally fetched from backend using the 'id')
  const order = {
    id: id || "ORD-9999",
    date: "23 Feb 2026",
    pickupSlot: "09:00 AM - 11:00 AM",
    status: "Confirmed", // Could be Confirmed, Rider Assigned, Weighed, In Progress, Delivered
    address: "Flat 4B, Seaview Apartments, Bejai Main Road, Mangaluru",
    vendors: [
      { name: "Sparkle Clean Laundry", service: "Wash & Fold", rate: "₹40/kg" },
      { name: "Elite Dry Cleaners", service: "Premium Dry Clean", rate: "₹150/pc" }
    ]
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
          <h1>Order {order.id}</h1>
          <span className="status-pill active-status">Waiting for Rider</span>
        </div>

        <div className="tracking-layout">
          
          {/* --- LEFT COLUMN: LIVE TRACKER --- */}
          <div className="tracker-section">
            <div className="tracking-card">
              <h2>Track Your Wash</h2>
              
              <div className="vertical-stepper">
                {/* Step 1: Booking Confirmed */}
                <div className="step completed">
                  <div className="step-icon">✅</div>
                  <div className="step-content">
                    <h4>Booking Confirmed</h4>
                    <p>We received your request.</p>
                  </div>
                </div>

                {/* Step 2: Rider Assigned */}
                <div className="step active">
                  <div className="step-icon">🛵</div>
                  <div className="step-content">
                    <h4>Assigning Rider</h4>
                    <p>Looking for a nearby rider to pick up your clothes between {order.pickupSlot}.</p>
                  </div>
                </div>

                {/* Step 3: Weighing & Billing */}
                <div className="step pending">
                  <div className="step-icon">⚖️</div>
                  <div className="step-content">
                    <h4>Weighing & Billing</h4>
                    <p>Vendor will weigh the clothes and generate the final bill.</p>
                  </div>
                </div>

                {/* Step 4: Washing */}
                <div className="step pending">
                  <div className="step-icon">🫧</div>
                  <div className="step-content">
                    <h4>In Process</h4>
                    <p>Your clothes are being cleaned.</p>
                  </div>
                </div>

                {/* Step 5: Delivered */}
                <div className="step pending">
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
              <p><strong>Date:</strong> {order.date}</p>
              <p><strong>Time:</strong> {order.pickupSlot}</p>
              <p><strong>Location:</strong> {order.address}</p>
            </div>

            <div className="info-card">
              <h3>Requested Services</h3>
              {order.vendors.map((v, i) => (
                <div key={i} className="service-row">
                  <div>
                    <strong>{v.name}</strong>
                    <p className="service-subtext">{v.service}</p>
                  </div>
                  <span className="rate-badge">{v.rate}</span>
                </div>
              ))}
            </div>

            <div className="info-card billing-card">
              <h3>Final Bill</h3>
              {/* Replacing the "Pending" box with a "Ready to Pay" box */}
              <div className="ready-to-pay-box">
                <div className="bill-summary-row">
                  <span>Total Amount Due</span>
                  <strong>₹530.00</strong>
                </div>
                <button 
                  className="pay-bill-btn" 
                  onClick={() => navigate(`/billing/${order.id}`)}
                >
                  View Invoice & Pay
                </button>
              </div>
            </div>

            <button className="back-profile-btn" onClick={() => navigate('/profile')}>
              Go to My Orders
            </button>

          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;