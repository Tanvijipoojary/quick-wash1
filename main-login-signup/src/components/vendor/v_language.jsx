import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './v_settings.css';

const VendorLanguage = () => {
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

  return (
    <div className="vset-container">
      <header className="vset-header">
        <button className="vset-back-btn" onClick={() => navigate('/vendor-home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="vset-header-title">Language</h1>
      </header>
      <main className="vset-main-content">
        <div className="vset-card">
          {languages.map((lang) => (
            <div key={lang.id} className="vset-list-item" onClick={() => setSelected(lang.id)}>
              <div className="vset-item-left"><span>{lang.icon}</span><span>{lang.label}</span></div>
              <div className={`vset-radio ${selected === lang.id ? 'vset-radio-active' : ''}`}>
                {selected === lang.id && <div className="vset-radio-dot"></div>}
              </div>
            </div>
          ))}
        </div>
        <button className="vset-action-btn" onClick={() => navigate('/vendor-home')}>Update Language</button>
      </main>
    </div>
  );
};
export default VendorLanguage;