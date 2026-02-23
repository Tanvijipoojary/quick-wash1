import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './cart.css';
import logo from '../assets/quickwash-logo.png';

const Cart = () => {
  const navigate = useNavigate();

  // ==========================================
  // 🚀 BACKEND READY STATE
  // ==========================================
  const [user, setUser] = useState({
    name: "John Doe",
  });

  // Dummy cart data (You will fetch this from your state/backend later)
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "Men's Shirt", service: "Wash & Iron", price: 30, quantity: 2, icon: "👔" },
    { id: 2, name: "Jeans / Trousers", service: "Wash & Iron", price: 40, quantity: 1, icon: "👖" },
    { id: 3, name: "Double Bedsheet", service: "Wash & Fold", price: 50, quantity: 1, icon: "🛏️" }
  ]);

  const deliveryFee = 40;
  const taxRate = 0.05; // 5% GST

  // --- Helpers ---
  const updateQuantity = (id, change) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return { ...item, quantity: Math.max(1, newQuantity) }; // Prevents going below 1
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTax = () => getSubtotal() * taxRate;
  const getTotal = () => getSubtotal() + getTax() + deliveryFee;

  const handleCheckout = () => {
    alert("Proceeding to schedule pickup...");
    // navigate('/checkout'); // Create this route later if needed
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
        <h1 className="cart-title">Your Laundry Cart</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart animate-fade">
            <div className="empty-icon">🧺</div>
            <h2>Your cart is empty!</h2>
            <p>Looks like you haven't added any clothes yet.</p>
            <button className="book-btn" onClick={() => navigate('/home')}>Go Back Home</button>
          </div>
        ) : (
          <div className="cart-layout animate-fade">
            
            {/* --- LEFT COLUMN: ITEMS --- */}
            <div className="cart-items-section">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <div className="item-icon-box">{item.icon}</div>
                  
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-service">{item.service}</p>
                    <p className="item-price">₹{item.price} / pc</p>
                  </div>

                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                    <p className="item-total-price">₹{item.price * item.quantity}</p>
                    <button className="remove-btn" onClick={() => removeItem(item.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>

            {/* --- RIGHT COLUMN: ORDER SUMMARY --- */}
            <div className="cart-summary-section">
              <div className="summary-card">
                <h2>Order Summary</h2>
                
                <div className="summary-row">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{getSubtotal().toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Taxes (5% GST)</span>
                  <span>₹{getTax().toFixed(2)}</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total-row">
                  <span>Total Amount</span>
                  <span>₹{getTotal().toFixed(2)}</span>
                </div>

                <button className="checkout-btn" onClick={handleCheckout}>
                  Proceed to Checkout ➔
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