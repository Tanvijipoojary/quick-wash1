import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './v_settings.css';

const VendorSchedule = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([
    { day: 'MON', active: true, start: '00:00', end: '23:59' },
    { day: 'TUE', active: true, start: '00:00', end: '23:59' },
    { day: 'WED', active: true, start: '00:00', end: '23:59' },
    { day: 'THU', active: true, start: '00:00', end: '23:59' },
    { day: 'FRI', active: true, start: '00:00', end: '23:59' },
  ]);

  const toggleDay = (index) => {
    const newSched = [...schedule];
    newSched[index].active = !newSched[index].active;
    setSchedule(newSched);
  };

  return (
    <div className="vset-container">
      <header className="vset-header">
        <button className="vset-back-btn" onClick={() => navigate('/vendor-home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="vset-header-title">Work Schedule</h1>
      </header>
      <main className="vset-main-content">
        {schedule.map((item, index) => (
          <div key={item.day} className="vset-sched-card">
            <div className="vset-sched-header">
              <span className="vset-sched-day">{item.day}</span>
              <label className="vset-toggle">
                <input type="checkbox" checked={item.active} onChange={() => toggleDay(index)} />
                <span className="vset-slider"></span>
              </label>
            </div>
            {item.active && (
              <div className="vset-sched-times">
                <input type="time" className="vset-time-input" defaultValue={item.start} />
                <span style={{color: '#888'}}>—</span>
                <input type="time" className="vset-time-input" defaultValue={item.end} />
                <button className="vset-add-btn">+</button>
              </div>
            )}
          </div>
        ))}
        <button className="vset-action-btn" onClick={() => navigate('/vendor-home')}>Update Schedule</button>
      </main>
    </div>
  );
};
export default VendorSchedule;