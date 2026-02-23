import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './cart.css';
import logo from '../assets/quickwash-logo.png';

const Cart = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: "John Doe" });

  // ==========================================
  // 🚀 PICKUP REQUEST CART STATE
  // Customers just add the *Service* they want.
  // Weight is 0 until the vendor updates it later.
  // ==========================================
  const [cartRequests, setCartRequests] = useState([
    {
      vendorId: 1,
      vendorName: "Sparkle Clean Laundry",
      items: [
        { id: 101, name: "Daily Mixed Wear", service: "Wash & Fold", rate: "₹40/kg", icon: "🧺" },
        { id: 102, name: "Bedsheets & Curtains", service: "Wash & Iron", rate: "₹60/kg", icon: "🛏️" }
      ]
    },
    {
      vendorId: 2,
      vendorName: "Elite Dry Cleaners",
      items: [
        { id: 103, name: "Suits & Heavy Jackets", service: "Premium Dry Clean", rate: "₹150/pc", icon: "👔" }
      ]
    }
  ]);

  const deliveryFee = 40; // Flat fee for the rider

  const removeItem = (vendorId, itemId) => {
    setCartRequests(prevRequests => {
      return prevRequests.map(vendor => {
        if (vendor.vendorId === vendorId) {
          return { ...vendor, items: vendor.items.filter(item => item.id !== itemId) };
        }
        return vendor;
      }).filter(vendor => vendor.items.length > 0); 
    });
  };

  const handleCheckout = () => {
    navigate('/checkout'); // Moves the user to the scheduling page
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
          <div className="nav-item active">🛒 Cart</div>
          <div className="nav-item profile-btn" onClick={() => navigate('/profile')}>👤 {user.name}</div>
        </div>
      </nav>

      <main className="cart-main">
        <h1 className="cart-title">Your Pickup Requests</h1>

        {cartRequests.length === 0 ? (
          <div className="empty-cart animate-fade">
            <div className="empty-icon">🛵</div>
            <h2>No pickups scheduled!</h2>
            <p>Select a laundry service from the home page to schedule a rider.</p>
            <button className="book-btn" onClick={() => navigate('/home')}>Browse Services</button>
          </div>
        ) : (
          <div className="cart-layout animate-fade">
            
            {/* --- LEFT COLUMN: SERVICES REQUESTED --- */}
            <div className="cart-items-section">
              {cartRequests.map((vendor) => (
                <div key={vendor.vendorId} className="vendor-group">
                  
                  {/* Vendor Header */}
                  <div className="vendor-header">
                    <h3>🏪 {vendor.vendorName}</h3>
                    <span className="vendor-badge">Verified Partner</span>
                  </div>

                  {/* Requested Services */}
                  <div className="vendor-items-list">
                    {vendor.items.map((item) => (
                      <div key={item.id} className="cart-item-card">
                        <div className="item-icon-box">{item.icon}</div>
                        
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p className="item-service">{item.service}</p>
                          <p className="item-rate">Rate: {item.rate}</p>
                        </div>

                        <div className="item-status-actions">
                          <div className="pending-badge">
                            ⏳ Weight Pending
                          </div>
                          <button className="remove-btn" onClick={() => removeItem(vendor.vendorId, item.id)}>🗑️ Cancel</button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>

            {/* --- RIGHT COLUMN: ORDER SUMMARY --- */}
            <div className="cart-summary-section">
              <div className="summary-card">
                <h2>Booking Summary</h2>
                
                <div className="info-box blue-box">
                  <strong>How it works:</strong>
                  <ol>
                    <li>Rider picks up your clothes.</li>
                    <li>Vendor weighs them at the shop.</li>
                    <li>You receive the final bill on your app to pay!</li>
                  </ol>
                </div>
                
                <div className="summary-row">
                  <span>Wash Subtotal</span>
                  <span className="pending-text">To be calculated</span>
                </div>
                <div className="summary-row">
                  <span>Taxes (5% GST)</span>
                  <span className="pending-text">To be calculated</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total-row">
                  <span>Amount to Pay Now</span>
                  <span>₹0.00</span>
                </div>
                <p className="pay-later-text">You will pay the total amount after the vendor generates the bill.</p>

                <button className="checkout-btn" onClick={handleCheckout}>
                  Schedule Pickup ➔
                </button>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;