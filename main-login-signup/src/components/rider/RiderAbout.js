import React from 'react';
import { useNavigate } from 'react-router-dom';
import './r_profile.css';

const RiderAbout = () => {
  const navigate = useNavigate();

  return (
    <div className="rprof-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <header className="rprof-header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#1e293b' }}>←</button>
        <h1 className="rprof-title" style={{ margin: 0 }}>About Us</h1>
      </header>

      <main className="rprof-main-content" style={{ marginTop: '20px' }}>
        
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          {/* You can replace this emoji with your actual app logo image */}
          <div style={{ fontSize: '4rem', marginBottom: '10px' }}>💧</div>
          <h2 style={{ color: '#1e293b', margin: '0 0 5px 0', fontSize: '1.8rem' }}>Quick Wash</h2>
          <span style={{ background: '#e2e8f0', color: '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            Rider App v1.0.0
          </span>
        </div>

        <div className="rprof-info-card" style={{ padding: '24px', lineHeight: '1.6', color: '#334155', textAlign: 'center' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>Our Mission</h3>
          <p style={{ fontSize: '0.95rem', marginBottom: '20px' }}>
            To revolutionize the laundry experience by connecting local hubs with dedicated delivery partners, making clean clothes accessible and hassle-free for everyone.
          </p>
          
          <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '20px 0' }} />
          
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Powered by Quick Wash Technologies.<br/>
            © {new Date().getFullYear()} All Rights Reserved.
          </p>
        </div>
      </main>
    </div>
  );
};

export default RiderAbout;