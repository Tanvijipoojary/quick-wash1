import React from 'react';
import { useNavigate } from 'react-router-dom';
import './r_profile.css';

const RiderPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="rprof-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <header className="rprof-header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#1e293b' }}>←</button>
        <h1 className="rprof-title" style={{ margin: 0 }}>Privacy Policy</h1>
      </header>

      <main className="rprof-main-content" style={{ marginTop: '20px' }}>
        <div className="rprof-info-card" style={{ padding: '24px', lineHeight: '1.6', color: '#334155' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>1. Information We Collect</h3>
          <p style={{ fontSize: '0.95rem', marginBottom: '20px' }}>
            To provide the Quick Wash delivery service, we collect personal details (name, phone number, vehicle registration) and KYC documents.
          </p>

          <h3 style={{ color: '#1e293b' }}>2. Location Tracking</h3>
          <p style={{ fontSize: '0.95rem', marginBottom: '20px' }}>
            When you are marked as "Active" or have claimed an order, we track your live GPS location to provide accurate ETAs to customers and laundry hubs. Location tracking stops when you log out.
          </p>

          <h3 style={{ color: '#1e293b' }}>3. Data Sharing</h3>
          <p style={{ fontSize: '0.95rem', marginBottom: '20px' }}>
            We share your first name, vehicle type, and live location with customers while you are actively delivering their order. We do not sell your personal data to third parties.
          </p>

          <h3 style={{ color: '#1e293b' }}>4. Data Security</h3>
          <p style={{ fontSize: '0.95rem', margin: 0 }}>
            Your KYC documents are stored securely and are only used for background verification and legal compliance.
          </p>
        </div>
      </main>
    </div>
  );
};

export default RiderPolicy;