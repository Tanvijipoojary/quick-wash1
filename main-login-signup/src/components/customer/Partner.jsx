import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InfoPages.css';
import logo from '../assets/quickwash-logo.png';

const Partner = () => {
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
        <h1>Partner With Us</h1>
        <p>Are you a laundry shop owner looking to grow your business? Partner with Quick Wash and get access to hundreds of daily orders.</p>
        <p>Partnership requirements and onboarding details will be updated here soon.</p>
      </main>
    </div>
  );
};
export default Partner;