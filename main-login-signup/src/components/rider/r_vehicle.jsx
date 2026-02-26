import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './r_settings.css';

const RiderVehicle = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('moto');

  const vehicles = [
    { id: 'bike', label: 'Bicycle', icon: '🚲' },
    { id: 'moto', label: 'Motorcycle', icon: '🛵' },
    { id: 'car', label: 'Car', icon: '🚗' },
    { id: 'truck', label: 'Truck', icon: '🚚' },
  ];

  const handleUpdate = () => {
    alert("Vehicle updated successfully!");
    navigate('/rider-profile');
  };

  return (
    <div className="rset-container">
      <header className="rset-header">
        <button className="rset-back-btn" onClick={() => navigate('/rider-profile')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="rset-header-title">Vehicle Type</h1>
      </header>
      <main className="rset-main-content">
        <div className="rset-card">
          {vehicles.map((veh) => (
            <div key={veh.id} className="rset-list-item" onClick={() => setSelected(veh.id)}>
              <div className="rset-item-left">
                <span>{veh.icon}</span>
                <span>{veh.label}</span>
              </div>
              <div className={`rset-radio ${selected === veh.id ? 'rset-radio-active' : ''}`}>
                {selected === veh.id && <div className="rset-radio-dot"></div>}
              </div>
            </div>
          ))}
        </div>
        <button className="rset-action-btn" onClick={handleUpdate}>Update Vehicle</button>
      </main>
    </div>
  );
};
export default RiderVehicle;