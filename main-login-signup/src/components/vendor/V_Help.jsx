import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './v_profile.css'; 

const VendorHelp = () => {
  const navigate = useNavigate();
  
  // Form States
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState(null); // null, 'success', or 'error'
  const [vendorEmail, setVendorEmail] = useState('');

  // Get the vendor's email automatically when the page loads
  useEffect(() => {
    const savedVendorStr = localStorage.getItem('quickwash_vendor');
    if (savedVendorStr) {
      const parsedVendor = JSON.parse(savedVendorStr);
      setVendorEmail(parsedVendor.email);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setSuccessStatus(null);

    try {
      await axios.post('http://localhost:5000/api/vendors/support-message', {
        vendorEmail: vendorEmail || 'Unknown Vendor',
        subject: subject,
        message: message
      });
      
      setSuccessStatus('success');
      setSubject('');
      setMessage('');
      
      // Hide the success message after 4 seconds
      setTimeout(() => setSuccessStatus(null), 4000);
    } catch (error) {
      console.error("Failed to send support message:", error);
      setSuccessStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vprof-container">
      <header className="vprof-header">
        <button className="vprof-back-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="vprof-header-title">Help & Support</h1>
        <div style={{ width: 24 }}></div>
      </header>

      <main style={{ padding: '20px', color: '#334155', maxWidth: '600px', margin: '0 auto' }}>
        
        {/* FAQ Section */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
          <h3 style={{ color: '#064e3b', marginTop: 0, textAlign: 'center' }}>Frequently Asked Questions</h3>
          
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px', marginTop: '20px' }}>
            <strong style={{ display: 'block', marginBottom: '5px' }}>When do I get paid?</strong>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Withdrawals requested from your Wallet take 1-2 business days to reflect in your linked bank account.</span>
          </div>

          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
            <strong style={{ display: 'block', marginBottom: '5px' }}>How do I contact a rider?</strong>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Once a rider is assigned to an order, their contact button will appear on the order card in your Processing tab.</span>
          </div>

          <div>
            <strong style={{ display: 'block', marginBottom: '5px' }}>How is the 10% fee calculated?</strong>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>The fee is calculated based strictly on the final bill you generate after weighing the clothes.</span>
          </div>
        </div>

        {/* Complaint / Contact Form */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ color: '#064e3b', marginTop: 0, borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
            ✉️ Contact Support
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
            Have a complaint or need help with an order? Send us a message and we will respond to your email.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#334155' }}>Subject</label>
              <input 
                type="text" 
                placeholder="e.g., Payment issue, App bug, Order #123"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#334155' }}>Your Message</label>
              <textarea 
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows="5"
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            {successStatus === 'success' && (
              <div style={{ background: '#ecfdf5', color: '#059669', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #a7f3d0' }}>
                ✅ Message sent successfully! We will get back to you soon.
              </div>
            )}

            {successStatus === 'error' && (
              <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #fecaca' }}>
                ❌ Failed to send message. Please check your connection.
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting || !subject.trim() || !message.trim()}
              style={{ 
                background: isSubmitting ? '#94a3b8' : '#10b981', 
                color: 'white', padding: '14px', borderRadius: '8px', border: 'none', 
                fontWeight: 'bold', fontSize: '1.05rem', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: '10px', transition: 'background 0.3s'
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

export default VendorHelp;