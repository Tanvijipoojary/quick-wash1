import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './r_profile.css'; 

const RiderSupport = () => {
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState(null); 
  const [riderEmail, setRiderEmail] = useState('');

  useEffect(() => {
    const savedRiderStr = localStorage.getItem('quickwash_rider');
    if (savedRiderStr) {
      const parsedRider = JSON.parse(savedRiderStr);
      setRiderEmail(parsedRider.email);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setSuccessStatus(null);

    try {
      await axios.post('http://localhost:5000/api/riders/support-message', {
        riderEmail: riderEmail || 'Unknown Rider',
        subject: subject,
        message: message
      });
      
      setSuccessStatus('success');
      setSubject('');
      setMessage('');
      setTimeout(() => setSuccessStatus(null), 4000);
    } catch (error) {
      console.error("Failed to send support message:", error);
      setSuccessStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rprof-container" style={{ background: '#fffcf9', minHeight: '100vh' }}>
      <header className="rprof-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'white', borderBottom: '1px solid #fed7aa' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea580c', display: 'flex', alignItems: 'center', padding: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="rprof-title" style={{ margin: 0, fontSize: '1.2rem', color: '#7c2d12' }}>Help & Support</h1>
        <div style={{ width: 24 }}></div> 
      </header>

      <main style={{ padding: '20px', color: '#431407', maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Urgent Hotline Button (Orange Theme) */}
        <button onClick={() => alert("Dialing Quick Wash Hotline...")} style={{ width: '100%', background: 'white', border: '1px solid #fdba74', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', marginBottom: '20px', boxShadow: '0 2px 8px rgba(234, 88, 12, 0.05)' }}>
          <span style={{ fontSize: '1.8rem', background: '#fff7ed', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>📞</span>
          <div style={{ textAlign: 'left' }}>
            <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '4px', color: '#9a3412' }}>Call Hotline</strong>
            <small style={{ color: '#c2410c', fontSize: '0.85rem' }}>For urgent live order issues</small>
          </div>
        </button>

        {/* FAQ Section (Orange Theme) */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.08)', marginBottom: '20px', border: '1px solid #ffedd5' }}>
          <h3 style={{ color: '#ea580c', marginTop: 0, textAlign: 'center' }}>Rider FAQ</h3>
          
          <div style={{ borderBottom: '1px solid #fed7aa', paddingBottom: '15px', marginBottom: '15px', marginTop: '20px' }}>
            <strong style={{ display: 'block', marginBottom: '5px', color: '#7c2d12' }}>When do I get my payout?</strong>
            <span style={{ fontSize: '0.9rem', color: '#9a3412' }}>Withdrawals requested from your Wallet take 1-2 business days to reflect in your linked bank account.</span>
          </div>

          <div style={{ borderBottom: '1px solid #fed7aa', paddingBottom: '15px', marginBottom: '15px' }}>
            <strong style={{ display: 'block', marginBottom: '5px', color: '#7c2d12' }}>What if the customer isn't responding?</strong>
            <span style={{ fontSize: '0.9rem', color: '#9a3412' }}>Try calling twice. If no response after 5 mins, contact support.</span>
          </div>
        </div>

        {/* Contact Form (Orange Theme) */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.08)', border: '1px solid #ffedd5' }}>
          <h3 style={{ color: '#ea580c', marginTop: 0, borderBottom: '2px solid #fff7ed', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✉️ Contact Support
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#9a3412', marginBottom: '20px' }}>
            Have a payout dispute or app issue? Send us a message below.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#7c2d12' }}>Subject</label>
              <input 
                type="text" 
                placeholder="e.g., Payout issue, Order #123"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #fdba74', fontSize: '1rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#7c2d12' }}>Your Message</label>
              <textarea 
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows="5"
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #fdba74', fontSize: '1rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            {successStatus === 'success' && (
              <div style={{ background: '#fff7ed', color: '#c2410c', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #fdba74' }}>
                ✅ Message sent! We will respond soon.
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ 
                background: isSubmitting ? '#fed7aa' : '#f97316', 
                color: 'white', padding: '14px', borderRadius: '8px', border: 'none', 
                fontWeight: 'bold', fontSize: '1.05rem', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: '10px', transition: '0.3s'
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RiderSupport;