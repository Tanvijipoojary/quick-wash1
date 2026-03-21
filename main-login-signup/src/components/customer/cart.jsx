import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './cart.css';
import logo from '../assets/quickwash-logo.png';

const Cart = () => {
  const navigate = useNavigate();
  
  const savedUserStr = localStorage.getItem('quickwash_user');
  const loggedInUser = savedUserStr ? JSON.parse(savedUserStr) : {};
  const [user] = useState({ name: loggedInUser.name || "Customer" });
  
  // State for multiple shops in the cart
  const [multiCart, setMultiCart] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. LOAD ALL CARTS ON MOUNT ---
  useEffect(() => {
    let loadedMultiCart = {};
    
    // Check for the new multi-cart storage
    const savedMulti = localStorage.getItem('quickwash_multi_cart');
    
    if (savedMulti) {
      loadedMultiCart = JSON.parse(savedMulti);
    } else {
      // MIGRATION: If they have an old single cart, upgrade it automatically!
      const savedSingle = localStorage.getItem('quickwash_cart');
      if (savedSingle) {
        const parsedSingle = JSON.parse(savedSingle);
        loadedMultiCart[parsedSingle.shopId] = parsedSingle;
        localStorage.setItem('quickwash_multi_cart', JSON.stringify(loadedMultiCart));
      }
    }
    
    setMultiCart(loadedMultiCart);
    setIsLoading(false);
  }, []);

  // --- 2. PRACTICAL HANDLERS ---
  const handleRemoveShop = (shopId) => {
    const updatedCart = { ...multiCart };
    delete updatedCart[shopId];
    
    setMultiCart(updatedCart);
    localStorage.setItem('quickwash_multi_cart', JSON.stringify(updatedCart));
  };

  const handleCheckout = (shopId) => {
    const selectedCartData = multiCart[shopId];
    
    // Save ONLY the selected shop back to the 'quickwash_cart' key.
    // This is a magic trick that makes your Checkout.jsx work perfectly without changing any code there!
    localStorage.setItem('quickwash_cart', JSON.stringify(selectedCartData));
    
    navigate('/checkout');
  };

  if (isLoading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading your requests... ⏳</div>;

  const cartShopsArray = Object.values(multiCart);

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

      <main className="cart-main animate-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="cart-title" style={{ textAlign: 'center', marginBottom: '30px' }}>Your Pickup Requests</h1>

        {cartShopsArray.length === 0 ? (
          <div className="empty-cart animate-fade" style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <div className="empty-icon" style={{ fontSize: '4rem', marginBottom: '20px' }}>🛵</div>
            <h2 style={{ color: '#0f172a' }}>No pickups scheduled!</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Select a laundry service from a shop to schedule a rider.</p>
            <button 
              onClick={() => navigate('/home')}
              style={{ background: '#2563eb', color: 'white', padding: '14px 28px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              Browse Shops
            </button>
          </div>
        ) : (
          <div className="multi-cart-list">
            {cartShopsArray.map((shopCart) => {
              // Extract the wash and iron price from the items array
              const servicePrice = Object.values(shopCart.items)[0]?.price || 60;

              return (
                <div key={shopCart.shopId} style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '15px' }}>
                    <div>
                      <h2 style={{ margin: '0 0 5px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🏪 {shopCart.shopName}
                      </h2>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>📍 {shopCart.shopAddress}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveShop(shopCart.shopId)}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      🗑️ Remove
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '2rem' }}>👔</span>
                      <div>
                        <strong style={{ display: 'block', color: '#1e293b', fontSize: '1.1rem' }}>Wash & Iron</strong>
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Instant Dispatch Available</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ display: 'block', color: '#2563eb', fontSize: '1.2rem' }}>₹{servicePrice}<span style={{ fontSize: '0.9rem', color: '#64748b' }}>/kg</span></strong>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleCheckout(shopCart.shopId)}
                    style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.target.style.background = '#059669'}
                    onMouseOut={(e) => e.target.style.background = '#10b981'}
                  >
                    Proceed to Checkout ➔
                  </button>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;