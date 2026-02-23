import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './checkout.css';
import logo from '../assets/quickwash-logo.png';

const Checkout = () => {
  const navigate = useNavigate();

  // ==========================================
  // 🚀 SCHEDULING & USER STATE
  // ==========================================
  const [user, setUser] = useState({
    name: "John Doe",
    phone: "+91 98765 43210",
    address: "Flat 4B, Seaview Apartments, Bejai Main Road, Mangaluru, Karnataka 575004"
  });

  const [schedule, setSchedule] = useState({
    date: '',
    timeSlot: '',
    instructions: ''
  });

  // --- New Address Editing State ---
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    phone: user.phone,
    address: user.address
  });

  const vendorsToPickup = ["Sparkle Clean Laundry", "Elite Dry Cleaners"];
  const deliveryFee = 40;

  const timeSlots = [
    "09:00 AM - 11:00 AM",
    "12:00 PM - 02:00 PM",
    "03:00 PM - 05:00 PM",
    "06:00 PM - 08:00 PM"
  ];

  // --- Handlers for Address ---
  const handleAddressSave = () => {
    setUser({ ...user, ...editForm }); // Update main user state
    setIsEditingAddress(false); // Close edit mode
  };

  const handleAddressCancel = () => {
    // Reset form back to original user data if they cancel
    setEditForm({ name: user.name, phone: user.phone, address: user.address });
    setIsEditingAddress(false); 
  };

const handleConfirmOrder = (e) => {
    e.preventDefault();
    if (!schedule.date || !schedule.timeSlot) {
      alert("Please select a valid pickup date and time slot.");
      return;
    }
    
    // Create a fake order ID to simulate a successful booking
    const newOrderId = "ORD-" + Math.floor(Math.random() * 90000 + 10000); 
    
    // Send user straight to the tracking page!
    navigate(`/order/${newOrderId}`); 
  };
  return (
    <div className="web-container">
      {/* --- TOP NAVBAR --- */}
      <nav className="top-navbar">
        <div className="nav-brand" onClick={() => navigate('/home')}>
          <img src={logo} alt="Quick Wash Logo" className="nav-logo" />
          <h2>QUICK WASH</h2>
        </div>
        
        <div className="nav-links">
          <div className="nav-item" onClick={() => navigate('/home')}>🏠 Home</div>
          <div className="nav-item" onClick={() => navigate('/cart')}>🛒 Cart</div>
          <div className="nav-item profile-btn" onClick={() => navigate('/profile')}>👤 {user.name}</div>
        </div>
      </nav>

      <main className="checkout-main animate-fade">
        <h1 className="checkout-title">Schedule Pickup</h1>

        <div className="checkout-layout">
          
          {/* --- LEFT COLUMN: SCHEDULING FORM --- */}
          <div className="checkout-form-section">
            <form onSubmit={handleConfirmOrder}>
              
              {/* 1. Address Section (Now Editable!) */}
              <div className="form-card">
                <div className="card-header">
                  <h3>📍 Pickup Location</h3>
                  {!isEditingAddress && (
                    <button 
                      type="button" 
                      className="edit-link" 
                      onClick={() => setIsEditingAddress(true)}
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditingAddress ? (
                  <div className="address-edit-box animate-fade">
                    <div className="input-group">
                      <label>Contact Name</label>
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                      />
                    </div>
                    <div className="input-group">
                      <label>Phone Number</label>
                      <input 
                        type="text" 
                        value={editForm.phone} 
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
                      />
                    </div>
                    <div className="input-group">
                      <label>Full Address</label>
                      <textarea 
                        value={editForm.address} 
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      ></textarea>
                    </div>
                    <div className="address-action-btns">
                      <button type="button" className="address-cancel-btn" onClick={handleAddressCancel}>Cancel</button>
                      <button type="button" className="address-save-btn" onClick={handleAddressSave}>Save Address</button>
                    </div>
                  </div>
                ) : (
                  <div className="address-display">
                    <strong>{user.name}</strong> ({user.phone})
                    <p>{user.address}</p>
                  </div>
                )}
              </div>

              {/* 2. Date & Time Section */}
              <div className="form-card">
                <h3>📅 Select Date & Time</h3>
                
                <div className="input-group">
                  <label>Pickup Date</label>
                  <input 
                    type="date" 
                    required
                    min={new Date().toISOString().split('T')[0]} 
                    value={schedule.date}
                    onChange={(e) => setSchedule({...schedule, date: e.target.value})} 
                  />
                </div>

                <div className="input-group">
                  <label>Preferred Time Slot</label>
                  <div className="time-slots-grid">
                    {timeSlots.map(slot => (
                      <div 
                        key={slot}
                        className={`time-slot-pill ${schedule.timeSlot === slot ? 'selected' : ''}`}
                        onClick={() => setSchedule({...schedule, timeSlot: slot})}
                      >
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Instructions Section */}
              <div className="form-card">
                <h3>📝 Rider Instructions (Optional)</h3>
                <textarea 
                  placeholder="e.g., Ring the doorbell twice, or leave bags at the security gate."
                  value={schedule.instructions}
                  onChange={(e) => setSchedule({...schedule, instructions: e.target.value})}
                ></textarea>
              </div>

            </form>
          </div>

          {/* --- RIGHT COLUMN: ORDER SUMMARY --- */}
          <div className="checkout-summary-section">
            <div className="summary-card">
              <h2>Booking Summary</h2>
              
              <div className="pickup-vendors">
                <p><strong>Vendors for Pickup:</strong></p>
                <ul>
                  {vendorsToPickup.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              </div>

              <div className="summary-row">
                <span>Wash Bill</span>
                <span className="pending-text">To be calculated</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              
              <div className="summary-divider"></div>

              <div className="total-info-box">
                <p><strong>Total Due Now: ₹0.00</strong></p>
                <small>Pay after your clothes are weighed and billed by the vendor.</small>
              </div>

              <button 
                type="submit" 
                className="confirm-btn" 
                onClick={handleConfirmOrder}
                disabled={!schedule.date || !schedule.timeSlot || isEditingAddress} // Disables if they are still editing their address
              >
                Confirm Booking ➔
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Checkout;