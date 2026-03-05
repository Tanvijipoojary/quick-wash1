import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './home.css';
import logo from '../assets/quickwash-logo.png';

const CustomerHome = () => {
  const navigate = useNavigate();
  
  // Dynamically load the logged-in user's data from localStorage!
  // Dynamically load the logged-in user's data from localStorage!
  const [user, setUser] = useState(() => {
    const savedUserStr = localStorage.getItem('quickwash_user');
    
    if (savedUserStr) {
      const parsedUser = JSON.parse(savedUserStr);
      return {
        // If they don't have a name saved, it will use their email prefix instead of "Guest"
        name: parsedUser.name || parsedUser.email.split('@')[0], 
        email: parsedUser.email,
        location: parsedUser.address || "Bejai Main Road, Mangaluru"
      };
    }
    
    // If absolutely nothing is found, THEN default to Guest
    return { name: "Guest", email: null, location: "Bejai Main Road, Mangaluru" };
  });

  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  // --- REAL BACKEND SHOPS STATE ---
  const [shops, setShops] = useState([]);
  const [isLoadingShops, setIsLoadingShops] = useState(true);

  // 1. Fetch all active vendors from the database
  const fetchActiveShops = async () => {
    setIsLoadingShops(true);
    try {
      const response = await axios.get('http://localhost:5000/api/vendors/all-vendors');
      
      const formattedShops = response.data.map(shop => ({
        id: shop._id,
        name: shop.hubName,     
        subtitle: shop.address, 
        time: '24 hrs',             
        price: '₹40/kg',            
        rating: shop.rating ? shop.rating : 'New!' 
      }));
      
      setShops(formattedShops);
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setIsLoadingShops(false);
    }
  };

  useEffect(() => {
    fetchActiveShops();
  }, []);

  // 3. Fake GPS Button
  const handleAutoDetect = () => {
    setIsDetecting(true);
    setTimeout(() => {
      setUser({ ...user, location: "📍 Mangaluru, Karnataka" });
      setIsDetecting(false);
      setIsEditingLocation(false);
    }, 800);
  };

  // ==========================================
  // --- REAL MONGODB FAVORITES LOGIC ---
  // ==========================================
  const [favorites, setFavorites] = useState([]);

  // Fetch real favorites on load
  useEffect(() => {
    const fetchFavorites = async () => {
      if (user.email) {
        try {
          const res = await axios.get(`http://localhost:5000/api/favorites/${user.email}`);
          // Map the database response to just an array of IDs for the UI to read easily
          const favIds = res.data.map(fav => fav.shopId);
          setFavorites(favIds);
        } catch (error) {
          console.error("Error fetching favorites:", error);
        }
      }
    };
    fetchFavorites();
  }, [user.email]);

  // Toggle favorite in database
  const toggleFavorite = async (e, shop) => {
    e.stopPropagation(); // Stop the card from clicking through to the shop page
    
    // Security check
    if (!user.email) {
      alert("Please log in to save favourite shops!");
      return;
    }

    // 1. Optimistic UI update (change color instantly for speed)
    const isAlreadyFav = favorites.includes(shop.id);
    if (isAlreadyFav) {
      setFavorites(favorites.filter(id => id !== shop.id));
    } else {
      setFavorites([...favorites, shop.id]);
    }

    // 2. Tell the backend to toggle it
    try {
      await axios.post('http://localhost:5000/api/favorites/toggle', {
        customerEmail: user.email,
        shopId: shop.id,
        shopName: shop.name,
        // Convert "New!" to a default number for the database
        shopRating: shop.rating === 'New!' ? 4.5 : parseFloat(shop.rating)
      });
    } catch (error) {
      console.error("Error toggling favorite in DB:", error);
      // Revert the UI if the database failed
      if (isAlreadyFav) {
        setFavorites([...favorites, shop.id]);
      } else {
        setFavorites(favorites.filter(id => id !== shop.id));
      }
      alert("Failed to update favorites. Please check your connection.");
    }
  };
  // ==========================================

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

  return (
    <div className="web-container">
      <nav className="top-navbar">
        <div className="nav-brand" onClick={() => navigate('/home')}>
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
            {isLoadingShops ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                Fetching nearby active shops... ⏳
              </p>
            ) : shops.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                No active shops available right now. Check back later!
              </p>
            ) : (
              shops.map((shop) => (
                <div key={shop.id} className="web-laundry-card" onClick={() => navigate(`/shop/${shop.id}`)}>
                  <div className="card-img-placeholder">
                    {/* 👇 Pass the whole 'shop' object so we can send its name to the DB 👇 */}
                    <span className="heart-icon" onClick={(e) => toggleFavorite(e, shop)}>
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
              ))
            )}
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