import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import logo from '../assets/quickwash-logo.png'; 

const CustomerHome = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState({
    name: "John Doe",
    location: "Bejai Main Road, Mangaluru"
  });

  const [laundries, setLaundries] = useState([
    { id: 1, name: 'Sparkle Clean', subtitle: 'Fast Delivery & Premium Care', time: '30 mins', price: '₹40/kg', rating: 4.8 },
    { id: 2, name: 'Quick Wash Hub', subtitle: 'Budget Friendly', time: '45 mins', price: '₹30/kg', rating: 4.5 },
    { id: 3, name: 'Elite Dry Cleaners', subtitle: 'Expert Suit Cleaning', time: '24 hrs', price: '₹150/pc', rating: 4.9 },
    { id: 4, name: 'Mama\'s Ironing', subtitle: 'Crisp & Wrinkle Free', time: '2 hrs', price: '₹15/pc', rating: 4.2 }
  ]);

  useEffect(() => {
    // Backend fetch logic will go here
    //change the code
  }, []);

  return (
    <div className="web-container">
      
      {/* --- TOP NAVBAR --- */}
      <nav className="top-navbar">
        <div className="nav-brand" onClick={() => navigate('/home')}>
          <img src={logo} alt="Quick Wash Logo" className="nav-logo" />
          <h2>QUICK WASH</h2>
        </div>

        <div className="nav-location">
          <span>📍</span>
          <div>
            <p className="loc-title">Current Location</p>
            <p className="loc-address">{user.location}</p>
          </div>
        </div>

        <div className="nav-search">
          <input type="text" placeholder="Search for laundries or services..." />
          <button>🔍</button>
        </div>

        <div className="nav-links">
          <div className="nav-item" onClick={() => navigate('/store')}>🏪 Store</div>
          <div className="nav-item">🛒 Cart</div>
          <div className="nav-item profile-btn" onClick={() => navigate('/profile')}>
            👤 {user.name}
          </div>
        </div>
      </nav>

      <main className="main-content">
        
        {/* --- WEB BANNER --- */}
        <section className="web-banner">
          <div className="banner-text">
            <h1>Fresh Clothes, <br/> Delivered to Your Door.</h1>
            <p>Get 20% off your first wash with code <strong>QUICK20</strong></p>
          </div>
        </section>

        {/* --- POPULAR LAUNDRY GRID --- */}
        <section className="web-section">
          <div className="section-header">
            <h2>Popular Laundries Around You 🔥</h2>
            <button className="see-all-btn">View All</button>
          </div>
          
          <div className="laundry-grid">
            {laundries.map((laundry) => (
              <div key={laundry.id} className="web-laundry-card">
                <div className="card-img-placeholder">
                  <span className="heart-icon">🤍</span>
                </div>
                <div className="web-card-info">
                  <h3>{laundry.name}</h3>
                  <p className="web-subtitle">{laundry.subtitle}</p>
                  
                  <div className="web-card-stats">
                    <span className="stat-pill">⏱ {laundry.time}</span>
                    <span className="stat-pill">🛵 {laundry.price}</span>
                    <span className="stat-pill rating">★ {laundry.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* --- FOOTER (Credentials & Info) --- */}
      <footer className="web-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo-container">
              <img src={logo} alt="Quick Wash Logo" className="footer-logo" />
              <h3>QUICK WASH</h3>
            </div>
            <p>Your premium laundry and dry cleaning partner. Fresh clothes delivered right to your doorstep.</p>
          </div>
          
          <div className="footer-links">
            <h4>Company</h4>
            <p>About Us</p>
            <p>Careers</p>
            <p>Partner with Us</p>
            <p>Terms & Conditions</p>
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