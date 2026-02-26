import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InfoPages.css';
import logo from '../assets/quickwash-logo.png';

const Careers = () => {
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
        <h1>Careers</h1>
        <p>Join the Quick Wash team! We are always looking for passionate individuals to join us in operations, tech, and delivery.</p>
        <p>Current job openings and application forms will be listed on this page shortly. Stay tuned!</p>
      </main>
    </div>
  );
};
export default Careers;