import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './shoppage.css';
import logo from '../assets/quickwash-logo.png';

const ShopPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Dummy data: Fetch this from your backend later!
  const shop = {
    name: "Sparkle Clean Laundry",
    address: "Shop No 4, City Centre, Mangaluru",
    rating: 4.8,
    deliveryTime: "30 mins",
    shortDesc: "Premium laundry service offering expert stain removal.",
    longDesc: "Welcome to Sparkle Clean! We have been serving the Mangaluru area for over 5 years. We use state-of-the-art washing machines, eco-friendly detergents, and ensure every piece of clothing gets the premium care it deserves. Whether it's your daily wear or expensive suits, we handle it all."
  };

  const galleryImages = [
    "📸 Shop Front", "🫧 Washing Area", "👔 Ironing Station"
  ];

  const services = [
    { id: 101, name: "Wash & Fold", icon: "🧺", price: "₹40/kg", desc: "Everyday clothes, folded neatly." },
    { id: 102, name: "Wash & Iron", icon: "👔", price: "₹60/kg", desc: "Crisp finish for office wear." },
    { id: 103, name: "Premium Dry Clean", icon: "✨", price: "₹150/pc", desc: "For suits and heavy fabrics." }
  ];

  const reviews = [
    { id: 1, name: "Amit S.", rating: 5, comment: "Best laundry in the city! My white shirts look brand new." },
    { id: 2, name: "Priya R.", rating: 4, comment: "Very fast delivery and neat folding. Highly recommend." },
    { id: 3, name: "Rahul M.", rating: 5, comment: "Eco-friendly wash is great. No harsh chemical smells!" }
  ];

  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = () => {
    setCartCount(cartCount + 1);
  };

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
            <p className="loc-address">Bejai Main Road, Mangaluru</p>
          </div>
        </div>

        <div className="nav-links">
          <div className="nav-item" onClick={() => navigate('/home')}>🏠 Home</div>
          <div className="nav-item cart-btn" onClick={() => navigate('/cart')}>
            🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
          <div className="nav-item profile-btn" onClick={() => navigate('/profile')}>👤 Tanvi</div>
        </div>
      </nav>

      <main className="shop-main animate-fade">
        
        {/* --- SHOP BANNER (Moved down & rounded) --- */}
        <div className="shop-banner-card">
          <div className="shop-banner-content">
            <h1>{shop.name}</h1>
            <p className="shop-address">📍 {shop.address}</p>
            <div className="shop-stats">
              <span className="stat-pill rating">★ {shop.rating}</span>
              <span className="stat-pill">⏱ {shop.deliveryTime} Delivery</span>
            </div>
            <p className="shop-short-desc">{shop.shortDesc}</p>
          </div>
        </div>

        {/* --- NEW: ABOUT & GALLERY SECTION --- */}
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
                    <span className="s-price">{service.price}</span>
                  </div>
                </div>
                <div className="service-actions-right">
                  <button className="add-cart-btn" onClick={handleAddToCart}>+ Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- NEW: REVIEWS SECTION --- */}
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
        <div className="floating-checkout-bar animate-slide-up">
          <div className="float-info">
            <strong>{cartCount} Items Added</strong>
            <p>Ready to schedule your pickup?</p>
          </div>
          <button className="book-now-float-btn" onClick={() => navigate('/cart')}>
            Proceed to Cart ➔
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopPage;