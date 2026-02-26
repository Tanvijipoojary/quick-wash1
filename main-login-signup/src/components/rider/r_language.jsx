import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './r_settings.css';

const RiderLanguage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('en');

  const languages = [
    { id: 'en', label: 'English', icon: '🇬🇧' },
    { id: 'fr', label: 'Francais', icon: '🇫🇷' },
    { id: 'ja', label: 'Japanese', icon: '🇯🇵' },
    { id: 'zh', label: 'Chinese', icon: '🇨🇳' },
    { id: 'de', label: 'Deutsche', icon: '🇩🇪' },
    { id: 'ar', label: 'Arabic', icon: '🇸🇦' },
  ];

  const handleUpdate = () => {
    alert("Language updated successfully!");
    navigate('/rider-profile');
  };

  return (
    <div className="rset-container">
      <header className="rset-header">
        <button className="rset-back-btn" onClick={() => navigate('/rider-profile')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="rset-header-title">Language</h1>
      </header>
      <main className="rset-main-content">
        <div className="rset-card">
          {languages.map((lang) => (
            <div key={lang.id} className="rset-list-item" onClick={() => setSelected(lang.id)}>
              <div className="rset-item-left">
                <span>{lang.icon}</span>
                <span>{lang.label}</span>
              </div>
              <div className={`rset-radio ${selected === lang.id ? 'rset-radio-active' : ''}`}>
                {selected === lang.id && <div className="rset-radio-dot"></div>}
              </div>
            </div>
          ))}
        </div>
        <button className="rset-action-btn" onClick={handleUpdate}>Update Language</button>
      </main>
    </div>
  );
};
export default RiderLanguage;