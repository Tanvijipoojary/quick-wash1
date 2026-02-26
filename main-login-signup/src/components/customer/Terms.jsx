import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InfoPages.css';
import logo from '../assets/quickwash-logo.png';

const Terms = () => {
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
        <h1>Terms & Conditions</h1>
        <p>By using Quick Wash, you agree to our terms of service, liability policies regarding garments, and cancellation protocols.</p>
        <p>The full legal text regarding user agreements, privacy policies, and refund guidelines will be published here.</p>
      </main>
    </div>
  );
};
export default Terms;