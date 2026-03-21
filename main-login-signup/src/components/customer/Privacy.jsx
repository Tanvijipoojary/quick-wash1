import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/quickwash-logo.png'; // Adjust path if needed

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="web-container" style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      {/* --- TOP NAVBAR --- */}
      <nav className="top-navbar">
        <div className="nav-brand" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="Quick Wash Logo" className="nav-logo" />
          <h2>QUICK WASH</h2>
        </div>
        <div className="nav-links">
          <div className="nav-item" onClick={() => navigate('/home')}>🏠 Home</div>
          <div className="nav-item" onClick={() => navigate('/profile')}>👤 Profile</div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }} className="animate-fade">
        <div style={{ background: 'white', padding: '50px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h1 style={{ color: '#0f172a', marginBottom: '10px', fontSize: '2.5rem' }}>Privacy Policy</h1>
          <p style={{ color: '#64748b', marginBottom: '40px', fontWeight: '500' }}>Last updated: {new Date().toLocaleDateString()}</p>

          <div style={{ color: '#475569', lineHeight: '1.8', fontSize: '1.05rem' }}>
            <h3 style={{ color: '#1e293b', marginTop: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>1. Information We Collect</h3>
            <p>At Quick Wash, we collect information you provide directly to us. This includes your name, email address, phone number, and pickup/delivery addresses to ensure seamless order fulfillment.</p>

            <h3 style={{ color: '#1e293b', marginTop: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>2. How We Use Your Information</h3>
            <p>We use the information we collect to provide, maintain, and improve our services. This includes processing transactions, running our live order tracker, generating invoices, and communicating with you about your account.</p>

            <h3 style={{ color: '#1e293b', marginTop: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>3. Information Sharing</h3>
            <p>Your privacy is our priority. We only share necessary order details (such as your name, address, and requested services) with our verified Vendor Partners and Delivery Riders strictly for the purpose of washing and delivering your clothes.</p>

            <h3 style={{ color: '#1e293b', marginTop: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>4. Data Security</h3>
            <p>We implement appropriate technical and organizational security measures, including 256-bit SSL encryption for payments, to protect your personal data against accidental loss, alteration, or unauthorized access.</p>

            <h3 style={{ color: '#1e293b', marginTop: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>5. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact our support team through the Help section in your Profile dashboard.</p>
          </div>

          <button 
            onClick={() => navigate('/profile')} 
            style={{ 
              marginTop: '50px', 
              padding: '14px 28px', 
              background: '#f8fafc', 
              color: '#0f172a', 
              border: '1px solid #cbd5e1', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            ← Back to Settings
          </button>
        </div>
      </main>
    </div>
  );
};

export default Privacy;