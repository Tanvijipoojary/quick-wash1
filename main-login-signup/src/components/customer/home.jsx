import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import logo from '../assets/quickwash-logo.png';

const CustomerHome = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState({
    name: "Tanvi", 
    location: "Bejai Main Road, Mangaluru"
  });

  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  const [shops] = useState([
    { id: 1, name: 'Sparkle Clean Laundry', subtitle: 'Fast Delivery & Premium Care', time: '30 mins', price: '₹40/kg', rating: 4.8 },
    { id: 2, name: 'Quick Wash Hub', subtitle: 'Budget Friendly', time: '45 mins', price: '₹30/kg', rating: 4.5 },
    { id: 3, name: 'Elite Dry Cleaners', subtitle: 'Expert Suit Cleaning', time: '24 hrs', price: '₹150/pc', rating: 4.9 },
    { id: 4, name: 'Ocean Fresh Laundry', subtitle: 'Eco-Friendly Detergents', time: '2 hrs', price: '₹50/kg', rating: 4.6 }
  ]);

  // --- FAVORITES LOGIC ---
  const [favorites, setFavorites] = useState(() => {
    const savedFavs = localStorage.getItem('quickwash_favs');
    return savedFavs ? JSON.parse(savedFavs) : [];
  });

  const toggleFavorite = (e, shopId) => {
    e.stopPropagation(); 
    let updatedFavs;
    if (favorites.includes(shopId)) {
      updatedFavs = favorites.filter(id => id !== shopId);
    } else {
      updatedFavs = [...favorites, shopId];
    }
    setFavorites(updatedFavs);
    localStorage.setItem('quickwash_favs', JSON.stringify(updatedFavs));
  };

  const handleEditClick = () => {
    setTempLocation(user.location);
    setIsEditingLocation(true);
  };

  const handleSaveLocation = () => {
    if (tempLocation.trim() !== "") {
      setUser({ ...user, location: tempLocation });
    }
    setIsEditingLocation(false);
  };

  const handleAutoDetect = () => {
    setIsDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            setUser({ ...user, location: "Detected: St. Aloysius Area, Mangaluru" });
            setIsDetecting(false);
            setIsEditingLocation(false);
          }, 1000);
        },
        (error) => {
          alert("Could not detect GPS. Please type it manually.");
          setIsDetecting(false);
        }
      );
    }
  };

  return (
    <div className="web-container">
      <nav className="top-navbar">
        <div className="nav-brand" onClick={() => navigate('/home')}>
          {/* Replaced the bubble emoji with your actual image variable */}
          <img src={logo} alt="Quick Wash Logo" className="nav-logo" />
          <h2>QUICK WASH</h2>
        </div>

        <div className="nav-location">
          <span className="loc-icon">📍</span>
          {isEditingLocation ? (
            <div className="inline-loc-editor animate-fade">
              <input 
                type="text" 
                value={tempLocation} 
                onChange={(e) => setTempLocation(e.target.value)}
                placeholder="Enter area or apartment..."
                autoFocus
              />
              <button className="inline-save-btn" onClick={handleSaveLocation}>Save</button>
              <button className="inline-gps-btn" title="Use GPS" onClick={handleAutoDetect}>
                {isDetecting ? "⏳" : "🎯"}
              </button>
            </div>
          ) : (
            <div className="loc-text-box" onClick={handleEditClick}>
              <p className="loc-title">Delivering to <span className="drop-arrow">✎ Edit</span></p>
              <p className="loc-address">{user.location}</p>
            </div>
          )}
        </div>

        <div className="nav-links">
          <div className="nav-item" onClick={() => navigate('/cart')}>🛒 Cart</div>
          <div className="nav-item profile-btn" onClick={() => navigate('/profile')}>
            👤 {user.name}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <section className="web-banner">
          <div className="banner-text">
            <h1>Fresh Clothes, <br/> Delivered to Your Door.</h1>
          </div>
        </section>

        <section className="web-section">
          <div className="section-header">
            <h2>Popular Shops Around You 🏪</h2>
          </div>
          <div className="laundry-grid">
            {shops.map((shop) => (
              <div key={shop.id} className="web-laundry-card" onClick={() => navigate(`/shop/${shop.id}`)}>
                <div className="card-img-placeholder">
                  <span className="heart-icon" onClick={(e) => toggleFavorite(e, shop.id)}>
                    {favorites.includes(shop.id) ? '❤️' : '🤍'}
                  </span>
                </div>
                <div className="web-card-info">
                  <h3>{shop.name}</h3>
                  <p className="web-subtitle">{shop.subtitle}</p>
                  <div className="web-card-stats">
                    <span className="stat-pill">⏱ {shop.time}</span>
                    <span className="stat-pill">🛵 {shop.price}</span>
                    <span className="stat-pill rating">★ {shop.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="web-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo-container">
              <img src={logo} alt="Quick Wash Logo" className="nav-logo" />
              <h3>QUICK WASH</h3>
            </div>
            <p>Your premium laundry and dry cleaning partner. Fresh clothes delivered right to your doorstep.</p>
          </div>
          
          <div className="footer-links">
            <h4>Company</h4>
            <p className="footer-link" onClick={() => navigate('/about')}>About Us</p>
            <p className="footer-link" onClick={() => navigate('/careers')}>Careers</p>
            <p className="footer-link" onClick={() => navigate('/partner')}>Partner with Us</p>
            <p className="footer-link" onClick={() => navigate('/terms')}>Terms & Conditions</p>
          </div>

          <div className="footer-contact">
            <h4>Contact</h4>
            <p>📞 +91 98765 43210</p>
            <p>📧 support@quickwash.com</p>
            <p>📍 Mangaluru, Karnataka</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Quick Wash. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerHome;