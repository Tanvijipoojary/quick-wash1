import React from 'react';
import './rider.css'; // Using existing rider CSS for consistent orange theme

const RiderHome = () => {
  return (
    <div className="rider-container" style={{ alignItems: 'flex-start', paddingTop: '20px' }}>
      <div className="rider-box" style={{ maxWidth: '400px', width: '90%' }}>
        
        <div className="rider-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Rider Dashboard</h2>
          <span style={{ background: '#22c55e', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>On Duty</span>
        </div>

        <div style={{ background: '#ffedd5', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #fdba74' }}>
          <p style={{ margin: 0, color: '#9a3412' }}>Today's Earnings</p>
          <h1 style={{ margin: '5px 0', color: '#ea580c' }}>₹ 850</h1>
          <small style={{ color: '#c2410c' }}>5 Orders Completed</small>
        </div>

        <h3>New Requests</h3>
        <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '10px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>Pickup: Quick Wash Hub</strong>
            <span style={{ color: '#ea580c', fontWeight: 'bold' }}>₹40</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#666', margin: '5px 0' }}>Drop: Bejai Main Road (1.2km)</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button style={{ flex: 1, padding: '8px', background: '#e5e7eb', border: 'none', borderRadius: '5px' }}>Reject</button>
            <button style={{ flex: 1, padding: '8px', background: '#ea580c', color: 'white', border: 'none', borderRadius: '5px' }}>Accept</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RiderHome;