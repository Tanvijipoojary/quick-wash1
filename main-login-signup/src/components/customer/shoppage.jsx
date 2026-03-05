import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './shoppage.css';
import logo from '../assets/quickwash-logo.png';

const ShopPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Real Data States
  const [shop, setShop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState([]);
  
  // --- 1. CART LOGIC WITH AUTO-SAVE ---
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('quickwash_cart');
    if (savedCart) {
      const parsedData = JSON.parse(savedCart);
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
          shortDesc: data.services ? `Specializing in: ${data.services}` : "Premium laundry service offering expert care.",
          longDesc: `Welcome to ${data.hubName || data.hub_name || 'our shop'}! We have been serving the area with top-tier laundry and dry cleaning. We use state-of-the-art washing machines, eco-friendly detergents, and ensure every piece of clothing gets the premium care it deserves.`,
          pricing: data.pricing 
        });
      } catch (error) {
        console.error("Error fetching shop details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShopDetails();
  }, [id]);

  // --- 3. DYNAMIC SERVICES ARRAY ---
  useEffect(() => {
    if (shop) {
      const prices = shop.pricing || {};
      setServices([
        { id: 101, name: "Wash & Fold", icon: "🧺", price: prices.washAndFold || 40, priceText: `₹${prices.washAndFold || 40}/kg`, desc: "Everyday clothes, folded neatly." },
        { id: 102, name: "Wash & Iron", icon: "👔", price: prices.washAndIron || 60, priceText: `₹${prices.washAndIron || 60}/kg`, desc: "Crisp finish for office wear." },
        { id: 103, name: "Premium Dry Clean", icon: "✨", price: prices.dryClean || 150, priceText: `₹${prices.dryClean || 150}/pc`, desc: "For suits and heavy fabrics." }
      ]);
    }
  }, [shop]);

  // --- 4. AUTO-SAVE CART ---
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

  // --- NEW: SIMPLIFIED CART HANDLERS (No Quantity, Just Add/Remove) ---
  const handleAddToCart = (service) => {
    setCart((prevCart) => ({
      ...prevCart,
      // We keep qty: 1 strictly so the CartPage math doesn't break
      [service.id]: { name: service.name, price: service.price, qty: 1 } 
    }));
  };

  const handleRemoveFromCart = (serviceId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      delete newCart[serviceId]; // Instantly removes it
      return newCart;
    });
  };

  const cartCount = Object.keys(cart).length; // Count unique services, not qty
  const cartTotal = Object.values(cart).reduce((sum, item) => sum + item.price, 0);

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
            🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
          <div className="nav-item profile-btn" onClick={() => navigate('/profile')}>👤 Profile</div>
        </div>
      </nav>

      <main className="shop-main animate-fade" style={{ paddingBottom: cartCount > 0 ? '100px' : '20px' }}>
        
        {/* SHOP BANNER */}
        <div className="shop-banner-card">
          <div className="shop-banner-content">
            <h1>{shop.name}</h1>
            <p className="shop-address">📍 {shop.address}</p>
            <div className="shop-stats">
              <span className="stat-pill rating">★ {shop.rating}</span>
              <span className="stat-pill">⏱ {shop.deliveryTime} Turnaround</span>
            </div>
          </div>
        </div>

        {/* SERVICES LIST */}
        <div className="shop-services-section">
          <h2>Available Services</h2>
          <div className="shop-services-list">
            {services.map(service => (
              <div key={service.id} className="shop-service-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '15px' }}>
                
                <div className="service-info-left" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div className="s-icon" style={{ fontSize: '2rem' }}>{service.icon}</div>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{service.name}</h3>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#64748b' }}>{service.desc}</p>
                    <span className="s-price" style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      {service.priceText}
                    </span>
                  </div>
                </div>
                
                <div className="service-actions-right">
                  {cart[service.id] ? (
                    <button 
                      onClick={() => handleRemoveFromCart(service.id)} 
                      style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Added ✓
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAddToCart(service)} 
                      style={{ background: 'white', color: '#2563eb', border: '1px solid #2563eb', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      + Add
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

      </main>

      {/* --- FIXED FLOATING BOOK NOW BAR --- */}
      {cartCount > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          width: '100%', 
          backgroundColor: '#ffffff', 
          borderTop: '1px solid #e2e8f0', 
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)', 
          zIndex: 9999, 
          boxSizing: 'border-box',
          padding: '16px 5%',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <div className="float-info">
            <strong style={{ fontSize: '1.2rem', color: '#0f172a', display: 'block', margin: 0 }}>
              {cartCount} Service{cartCount > 1 ? 's' : ''} Selected
            </strong>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Base Rate Total: ₹{cartTotal}</span>
          </div>
          <button 
            onClick={() => navigate('/cart')} 
            style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              fontSize: '1rem' 
            }}
          >
            Proceed to Cart ➔
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopPage;