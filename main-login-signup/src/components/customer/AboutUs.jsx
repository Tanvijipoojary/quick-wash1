import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InfoPages.css';
import logo from '../assets/quickwash-logo.png';

const AboutUs = () => {
  const navigate = useNavigate();
  return (
    <div className="info-page-bg animate-fade">
      <nav className="top-navbar">
        <div className="nav-brand" onClick={() => navigate('/home')}>
          <img src={logo} alt="Quick Wash Logo" className="nav-logo" />
          <h2>QUICK WASH</h2>
        </div>
        <div className="nav-links">
          <div className="nav-item" onClick={() => navigate('/home')}>🏠 Home</div>
        </div>
      </nav>
      <main className="info-main-content">
        <h1>About Us</h1>
        <p>Welcome to Quick Wash! We are dedicated to providing the highest quality laundry and dry-cleaning services in Mangaluru.</p>
        <p>Our mission is to take the hassle out of laundry day, giving you more time to focus on what matters most. More details about our journey and team will be updated here soon.</p>
      </main>
    </div>
  );
};
export default AboutUs;