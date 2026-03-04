import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './cart.css';
import logo from '../assets/quickwash-logo.png';

const Cart = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Tanvi" });
  
  // Real State for Cart Data
  const [cartData, setCartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. LOAD DATA FROM LOCAL STORAGE ON MOUNT ---
  useEffect(() => {
    const savedCart = localStorage.getItem('quickwash_cart');
    if (savedCart) {
      setCartData(JSON.parse(savedCart));
    }
    setIsLoading(false);
  }, []);

  const deliveryFee = 40; // Flat fee for the rider

  // --- 2. PRACTICAL HANDLERS ---
  const removeItem = (itemId) => {
    const updatedItems = { ...cartData.items };
    delete updatedItems[itemId];

    // If no items left, clear the whole cart from storage
    if (Object.keys(updatedItems).length === 0) {
      localStorage.removeItem('quickwash_cart');
      setCartData(null);
    } else {
      const newCart = { ...cartData, items: updatedItems };
      setCartData(newCart);
      localStorage.setItem('quickwash_cart', JSON.stringify(newCart));
    }
  };

  const handleCheckout = () => {
    // Before moving to checkout, we ensure the current cart is locked in
    localStorage.setItem('quickwash_final_booking', JSON.stringify(cartData));
    navigate('/checkout'); 
  };

  if (isLoading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading your requests... ⏳</div>;

  // Transform cart object into an array for easier mapping
  const itemsArray = cartData ? Object.entries(cartData.items) : [];

  return (
    <div className="web-container">
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

        {!cartData || itemsArray.length === 0 ? (
          <div className="empty-cart animate-fade">
            <div className="empty-icon">🛵</div>
            <h2>No pickups scheduled!</h2>
            <p>Select a laundry service from a shop to schedule a rider.</p>
            <button className="book-btn" onClick={() => navigate('/home')}>Browse Shops</button>
          </div>
        ) : (
          <div className="cart-layout animate-fade">
            
            {/* --- LEFT COLUMN: REAL SERVICES REQUESTED --- */}
            <div className="cart-items-section">
              <div className="vendor-group">
                
                <div className="vendor-header">
                  <h3>🏪 {cartData.shopName}</h3>
                  <span className="vendor-badge">Verified Partner</span>
                </div>

                <div className="vendor-items-list">
                  {itemsArray.map(([id, item]) => (
                    <div key={id} className="cart-item-card">
                      <div className="item-icon-box">🧺</div>
                      
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p className="item-service">Quantity: {item.qty}</p>
                        <p className="item-rate">Base Rate: ₹{item.price}</p>
                      </div>

                      <div className="item-status-actions">
                        <div className="pending-badge">
                          ⏳ Weighing at Shop
                        </div>
                        <button className="remove-btn" onClick={() => removeItem(id)}>🗑️ Cancel</button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* --- RIGHT COLUMN: PRACTICAL SUMMARY --- */}
            <div className="cart-summary-section">
              <div className="summary-card">
                <h2>Booking Summary</h2>
                
                <div className="info-box blue-box">
                  <strong>Practical Workflow:</strong>
                  <ol>
                    <li>Rider picks up your clothes.</li>
                    <li>Vendor weighs them at <strong>{cartData.shopName}</strong>.</li>
                    <li>The final bill is generated based on real weight.</li>
                  </ol>
                </div>
                
                <div className="summary-row">
                  <span>Items Requested</span>
                  <span>{itemsArray.length} Services</span>
                </div>
                <div className="summary-row">
                  <span>Wash Subtotal</span>
                  <span className="pending-text">Pending Weight</span>
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
                <p className="pay-later-text">You will pay the total amount after the hub processes your clothes.</p>

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