import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './r_settings.css';

const RiderSchedule = () => {
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

  const handleUpdate = () => {
    alert("Work Schedule updated!");
    navigate('/rider-profile');
  };

  return (
    <div className="rset-container">
      <header className="rset-header">
        <button className="rset-back-btn" onClick={() => navigate('/rider-profile')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="rset-header-title">Work Schedule</h1>
      </header>
      <main className="rset-main-content">
        
        {schedule.map((item, index) => (
          <div key={item.day} className="rset-sched-card">
            <div className="rset-sched-header">
              <span className="rset-sched-day">{item.day}</span>
              <label className="rset-toggle">
                <input type="checkbox" checked={item.active} onChange={() => toggleDay(index)} />
                <span className="rset-slider"></span>
              </label>
            </div>
            {item.active && (
              <div className="rset-sched-times">
                <input type="time" className="rset-time-input" defaultValue={item.start} />
                <span style={{color: '#888'}}>—</span>
                <input type="time" className="rset-time-input" defaultValue={item.end} />
                <button className="rset-add-btn">+</button>
              </div>
            )}
          </div>
        ))}

        <button className="rset-action-btn" onClick={handleUpdate}>Update Schedule</button>
      </main>
    </div>
  );
};
export default RiderSchedule;