import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './shoppage.css';
import logo from '../assets/quickwash-logo.png';

const ShopPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Real Data State
  const [shop, setShop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. CART LOGIC ---
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('quickwash_cart');
    if (savedCart) {
      const parsedData = JSON.parse(savedCart);
      // Only load the cart if it belongs to THIS shop, otherwise start fresh
      if (parsedData.shopId === id) return parsedData.items;
    }
    return {};
  });

  // --- 2. FETCH SHOP FROM BACKEND ---
  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/vendors/shop/${id}`);
        const data = response.data;
        
        setShop({
          id: data._id,
          name: data.hubName || data.hub_name || "Unknown Shop",
          address: data.address || data.hub_address || "No Address Provided",
          rating: data.rating || 4.8, 
          deliveryTime: data.turnaround_time ? `${data.turnaround_time} Hours` : "24 Hours",
          longDesc: `Welcome to ${data.hubName || data.hub_name || 'our shop'}! We specialize in premium Wash & Iron services. We use state-of-the-art washing machines and ensure every piece of clothing gets the crisp, clean finish it deserves.`,
          pricing: data.pricing || {}
        });
      } catch (error) {
        console.error("Error fetching shop details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShopDetails();
  }, [id]);

  // --- 3. AUTO-SAVE CART ---
  useEffect(() => {
    if (shop) {
      if (Object.keys(cart).length > 0) {
        localStorage.setItem('quickwash_cart', JSON.stringify({
          shopId: shop.id,
          shopName: shop.name,
          shopAddress: shop.address,
          items: cart
        }));
      } else {
        localStorage.removeItem('quickwash_cart');
      }
    }
  }, [cart, shop]);

  // --- 4. BUTTON HANDLERS ---
  const washAndIronPrice = shop?.pricing?.washAndIron || 60;
  const serviceId = 102; // Hardcoded ID for Wash & Iron

  const handleAddToCart = () => {
    // 1. Update the local UI state
    setCart({
      [serviceId]: { name: "Wash & Iron", price: washAndIronPrice, qty: 1 }
    });

    // 2. Safely add this shop to the MULTI-CART storage
    const existingCartsStr = localStorage.getItem('quickwash_multi_cart');
    const multiCart = existingCartsStr ? JSON.parse(existingCartsStr) : {};
    
    multiCart[shop.id] = {
      shopId: shop.id,
      shopName: shop.name,
      shopAddress: shop.address,
      items: { [serviceId]: { name: "Wash & Iron", price: washAndIronPrice, qty: 1 } }
    };
    
    localStorage.setItem('quickwash_multi_cart', JSON.stringify(multiCart));
  };

  const handleRemoveFromCart = () => {
    setCart({}); // Clear UI
    
    // Remove from MULTI-CART storage
    const existingCartsStr = localStorage.getItem('quickwash_multi_cart');
    if (existingCartsStr) {
      const multiCart = JSON.parse(existingCartsStr);
      delete multiCart[shop.id];
      localStorage.setItem('quickwash_multi_cart', JSON.stringify(multiCart));
    }
  };

  const handleBookNow = () => {
    // 1. Prepare the specific shop data
    const cartData = {
      shopId: shop.id,
      shopName: shop.name,
      shopAddress: shop.address,
      items: {
        [serviceId]: { name: "Wash & Iron", price: washAndIronPrice, qty: 1 }
      }
    };
    
    // 2. Save it as the active checkout cart
    localStorage.setItem('quickwash_cart', JSON.stringify(cartData));
    
    // 3. Fast-track straight to Checkout!
    navigate('/checkout'); 
  };

  const isInCart = !!cart[serviceId];

  if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Shop Details... ⏳</div>;
  if (!shop) return <div style={{ padding: '50px', textAlign: 'center' }}>Shop not found! ❌</div>;

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
          <div className="nav-item cart-btn" onClick={() => navigate('/cart')}>
            🛒 Cart {isInCart && <span className="cart-badge">1</span>}
          </div>
          <div className="nav-item profile-btn" onClick={() => navigate('/profile')}>👤 Profile</div>
        </div>
      </nav>

      <main className="shop-main animate-fade" style={{ paddingBottom: isInCart ? '100px' : '40px' }}>
        
        {/* SHOP BANNER */}
        <div className="shop-banner-card" style={{ marginBottom: '30px' }}>
          <div className="shop-banner-content">
            <h1>{shop.name}</h1>
            <p className="shop-address">📍 {shop.address}</p>
            <div className="shop-stats">
              <span className="stat-pill rating">★ {shop.rating}</span>
              <span className="stat-pill">⏱ {shop.deliveryTime} Turnaround</span>
            </div>
          </div>
        </div>

        {/* SHOP DETAILS & BOOKING ACTION */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#0f172a', marginBottom: '15px' }}>About This Hub</h2>
          <p style={{ color: '#475569', lineHeight: '1.6', marginBottom: '30px', fontSize: '1.05rem' }}>
            {shop.longDesc}
          </p>

          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '1.2rem' }}>👔 Standard Wash & Iron</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Crisp finish for your everyday and office wear.</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                  ₹{washAndIronPrice}<span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal' }}>/kg</span>
                </span>
              </div>
            </div>

            {/* DUAL BUTTONS */}
            <div style={{ display: 'flex', gap: '15px' }}>
              {isInCart ? (
                <button 
                  onClick={handleRemoveFromCart}
                  style={{ flex: 1, background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '14px', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Remove from Cart
                </button>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  style={{ flex: 1, background: 'white', color: '#2563eb', border: '2px solid #2563eb', padding: '14px', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Add to Cart
                </button>
              )}
              
              <button 
                onClick={handleBookNow}
                style={{ flex: 1, background: '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)', transition: 'background 0.2s' }}
              >
                Book Now ➔
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- FIXED FLOATING CART BAR --- */}
      {isInCart && (
        <div style={{ 
          position: 'fixed', bottom: 0, left: 0, width: '100%', 
          backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', 
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)', zIndex: 9999, 
          boxSizing: 'border-box', padding: '16px 5%',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div className="float-info">
            <strong style={{ fontSize: '1.1rem', color: '#0f172a', display: 'block', margin: 0 }}>
              1 Service Selected
            </strong>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Laundry Hub: {shop.name}</span>
          </div>
          <button 
            onClick={() => navigate('/cart')} 
            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
          >
            View Cart ➔
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopPage;