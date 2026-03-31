import React, { useState } from 'react';
import axios from 'axios';

const ReviewModal = ({ isOpen, onClose, orderId, vendorId, customerId, shopName }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // 'success' or 'error'

  if (!isOpen) return null; // Don't render anything if the modal is closed

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a star rating!");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await axios.post('http://localhost:5000/api/reviews/add', {
        orderId,
        customerId,
        vendorId,
        rating,
        comment
      });
      
      setStatusMessage('success');
      // Wait 2 seconds so they can see the success message, then close the modal
      setTimeout(() => {
        onClose(); 
        setRating(0);
        setComment('');
        setStatusMessage(null);
      }, 2000);

    } catch (error) {
      console.error("Review Error:", error);
      // If the backend sends a specific error (like "already reviewed"), show it
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        setStatusMessage('error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.4rem' }}>Rate your experience</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        <p style={{ color: '#475569', marginBottom: '20px', fontSize: '0.95rem' }}>
          How was the service from <strong>{shopName || 'the laundry shop'}</strong>?
        </p>

        {statusMessage === 'success' ? (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '15px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
            🎉 Thank you for your review!
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* --- INTERACTIVE STAR RATING --- */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: '2.5rem',
                    cursor: 'pointer',
                    color: (hoverRating || rating) >= star ? '#f59e0b' : '#e2e8f0', // Gold if selected/hovered, gray if not
                    transition: 'color 0.2s'
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            {/* --- WRITTEN COMMENT --- */}
            <textarea 
              placeholder="Tell us what you liked or what could be better... (Optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', width: '100%', boxSizing: 'border-box', outline: 'none', resize: 'vertical' }}
            />

            {statusMessage === 'error' && (
              <div style={{ color: '#dc2626', fontSize: '0.9rem', textAlign: 'center' }}>
                Failed to submit review. Please try again.
              </div>
            )}

            {/* --- ACTION BUTTONS --- */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={onClose}
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || rating === 0}
                style={{ flex: 1, padding: '12px', background: rating === 0 ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: rating === 0 ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;