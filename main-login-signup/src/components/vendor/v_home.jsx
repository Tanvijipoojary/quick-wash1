import React from 'react';
import './vendor.css'; // Using existing vendor CSS for consistent green theme

const VendorHome = () => {
  return (
    <div className="vendor-container" style={{ alignItems: 'flex-start', paddingTop: '20px' }}>
      <div className="vendor-box" style={{ maxWidth: '400px', width: '90%' }}>
        
        <div className="vendor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Shop Dashboard</h2>
          <span style={{ background: '#dcfce7', color: '#166534', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', fontSize: '0.8rem' }}>Open</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
            <h1 style={{ margin: '0', color: '#15803d' }}>3</h1>
            <small>Active Orders</small>
          </div>
          <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '10px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
            <h1 style={{ margin: '0', color: '#15803d' }}>₹12k</h1>
            <small>This Month</small>
          </div>
        </div>

        <h3>Active Orders</h3>
        <div style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>#ORD-001 (Suit Dry Clean)</strong>
            <span style={{ color: '#eab308', fontWeight: 'bold', fontSize: '0.9rem' }}>Processing</span>
          </div>
          <div style={{ marginTop: '5px' }}>
            <button style={{ padding: '6px 12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>Mark Ready</button>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>#ORD-002 (5kg Wash & Fold)</strong>
            <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '0.9rem' }}>Ready</span>
          </div>
          <small style={{ color: '#666' }}>Rider assigned: John D.</small>
        </div>

      </div>
    </div>
  );
};

export default VendorHome;