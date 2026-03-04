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
  
  // Real Cart State (Stores items, prices, and quantities)
  const [cart, setCart] = useState({});

  // --- 1. FETCH SHOP FROM BACKEND ---
  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/shops/${id}`);
        const data = response.data;
        
        // Map backend data to match your UI structure
        setShop({
          id: data._id,
          name: data.hub_name,
          address: data.hub_address,
          rating: data.rating || 4.8, // Default to 4.8 if new
          deliveryTime: data.turnaround_time ? `${data.turnaround_time} Hours` : "24 Hours",
          shortDesc: data.services ? `Specializing in: ${data.services}` : "Premium laundry service offering expert care.",
          longDesc: `Welcome to ${data.hub_name}! We have been serving the area with top-tier laundry and dry cleaning. We use state-of-the-art washing machines, eco-friendly detergents, and ensure every piece of clothing gets the premium care it deserves.`
        });
      } catch (error) {
        console.error("Error fetching shop details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShopDetails();
  }, [id]);

  // Static UI Elements (Can be moved to DB later)
  const galleryImages = [
    "📸 Shop Front", "🫧 Washing Area", "👔 Ironing Station"
  ];

  const services = [
    { id: 101, name: "Wash & Fold", icon: "🧺", price: 40, priceText: "₹40/kg", desc: "Everyday clothes, folded neatly." },
    { id: 102, name: "Wash & Iron", icon: "👔", price: 60, priceText: "₹60/kg", desc: "Crisp finish for office wear." },
    { id: 103, name: "Premium Dry Clean", icon: "✨", price: 150, priceText: "₹150/pc", desc: "For suits and heavy fabrics." }
  ];

  const reviews = [
    { id: 1, name: "Amit S.", rating: 5, comment: "Best laundry in the city! My white shirts look brand new." },
    { id: 2, name: "Priya R.", rating: 4, comment: "Very fast delivery and neat folding. Highly recommend." },
    { id: 3, name: "Rahul M.", rating: 5, comment: "Eco-friendly wash is great. No harsh chemical smells!" }
  ];

  // --- 2. ADVANCED CART LOGIC ---
  const handleAddToCart = (service) => {
    setCart((prevCart) => {
      const currentQty = prevCart[service.id]?.qty || 0;
      return {
        ...prevCart,
        [service.id]: {
          name: service.name,
          price: service.price,
          qty: currentQty + 1
        }
      };
    });
  };

  const handleRemoveFromCart = (serviceId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[serviceId]) {
        if (newCart[serviceId].qty > 1) {
          newCart[serviceId].qty -= 1;
        } else {
          delete newCart[serviceId]; // Remove entirely if qty hits 0
        }
      }
      return newCart;
    });
  };

  const handleCheckout = () => {
    // Save the cart data and the specific shop to localStorage for the Cart page
    const checkoutData = {
      shopId: shop.id,
      shopName: shop.name,
      shopAddress: shop.address,
      items: cart
    };
    localStorage.setItem('quickwash_cart', JSON.stringify(checkoutData));
    navigate('/cart');
  };

  // Calculate totals for the UI
  const cartCount = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Loading & Error States
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
        
        <div className="nav-location">
          <span className="loc-icon">📍</span>
          <div className="loc-text-box">
            <p className="loc-title">Delivering to</p>
            <p className="loc-address">Mangaluru, Karnataka</p>
          </div>
        </div>

        <div className="nav-links">
          <div className="nav-item" onClick={() => navigate('/home')}>🏠 Home</div>
          <div className="nav-item cart-btn" onClick={() => navigate('/cart')}>
            🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
          <div className="nav-item profile-btn" onClick={() => navigate('/profile')}>👤 Profile</div>
        </div>
      </nav>

      <main className="shop-main animate-fade" style={{ paddingBottom: cartCount > 0 ? '80px' : '20px' }}>
        
        {/* --- SHOP BANNER --- */}
        <div className="shop-banner-card">
          <div className="shop-banner-content">
            <h1>{shop.name}</h1>
            <p className="shop-address">📍 {shop.address}</p>
            <div className="shop-stats">
              <span className="stat-pill rating">★ {shop.rating}</span>
              <span className="stat-pill">⏱ {shop.deliveryTime} Turnaround</span>
            </div>
            <p className="shop-short-desc">{shop.shortDesc}</p>
          </div>
        </div>

        {/* --- ABOUT & GALLERY SECTION --- */}
        <div className="shop-info-gallery">
          <div className="shop-about-text">
            <h2>About Our Shop</h2>
            <p>{shop.longDesc}</p>
          </div>
          <div className="shop-gallery">
            {galleryImages.map((imgText, index) => (
              <div key={index} className="gallery-placeholder">
                {imgText}
              </div>
            ))}
          </div>
        </div>

        {/* --- SERVICES LIST --- */}
        <div className="shop-services-section">
          <h2>Available Services</h2>
          <div className="shop-services-list">
            {services.map(service => (
              <div key={service.id} className="shop-service-card">
                <div className="service-info-left">
                  <div className="s-icon">{service.icon}</div>
                  <div>
                    <h3>{service.name}</h3>
                    <p>{service.desc}</p>
                    <span className="s-price">{service.priceText}</span>
                  </div>
                </div>
                
                <div className="service-actions-right">
                  {/* Dynamic Add/Remove Buttons */}
                  {cart[service.id] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '5px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <button onClick={() => handleRemoveFromCart(service.id)} style={{ width: '30px', height: '30px', border: 'none', background: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                      <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{cart[service.id].qty}</span>
                      <button onClick={() => handleAddToCart(service)} style={{ width: '30px', height: '30px', border: 'none', background: '#2563eb', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                    </div>
                  ) : (
                    <button className="add-cart-btn" onClick={() => handleAddToCart(service)}>+ Add to Cart</button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* --- REVIEWS SECTION --- */}
        <div className="shop-reviews-section">
          <h2>Customer Reviews</h2>
          <div className="reviews-grid">
            {reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <strong>{review.name}</strong>
                  <span className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
                </div>
                <p className="review-comment">"{review.comment}"</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* --- FLOATING BOOK NOW BAR --- */}
      {cartCount > 0 && (
        <div className="floating-checkout-bar animate-slide-up" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', background: 'white', borderTop: '2px solid #e2e8f0', boxShadow: '0 -4px 10px rgba(0,0,0,0.05)', zIndex: 1000 }}>
          <div className="float-info">
            <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{cartCount} Items | ₹{cartTotal}</strong>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Ready to schedule your pickup?</p>
          </div>
          <button className="book-now-float-btn" onClick={handleCheckout} style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
            Proceed to Cart ➔
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopPage;