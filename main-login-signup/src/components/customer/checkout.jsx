import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './checkout.css';
import logo from '../assets/quickwash-logo.png';

const Checkout = () => {
  const navigate = useNavigate();

  // --- 1. REAL DATA LOADING ---
  const [cartData, setCartData] = useState(null);
  const [user, setUser] = useState({
    name: "Tanvi",
    phone: "+91 7353863409",
    address: "Bejai Main Road, Mangaluru, Karnataka 575004"
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('quickwash_cart');
    if (savedCart) {
      setCartData(JSON.parse(savedCart));
    } else {
      // If someone lands here with no cart, send them back home
      navigate('/home');
    }
  }, [navigate]);

  const [schedule, setSchedule] = useState({
    date: '',
    timeSlot: '',
    instructions: ''
  });

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    phone: user.phone,
    address: user.address
  });

  const deliveryFee = 40;
  const timeSlots = [
    "09:00 AM - 11:00 AM",
    "12:00 PM - 02:00 PM",
    "03:00 PM - 05:00 PM",
    "06:00 PM - 08:00 PM"
  ];

  const handleAddressSave = () => {
    setUser({ ...user, ...editForm });
    setIsEditingAddress(false);
  };

  const handleAddressCancel = () => {
    setEditForm({ name: user.name, phone: user.phone, address: user.address });
    setIsEditingAddress(false); 
  };

  // --- 2. PRACTICAL ORDER CONFIRMATION ---
  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!schedule.date || !schedule.timeSlot) {
      alert("Please select a pickup date and time.");
      return;
    }

    try {
      // Package the data for your Backend API
      const orderPayload = {
        customerId: "CUST_123", // In a real app, get this from Auth state
        customerName: user.name,
        customerPhone: user.phone,
        pickupAddress: user.address,
        shopId: cartData.shopId,
        shopName: cartData.shopName,
        items: cartData.items,
        pickupDate: schedule.date,
        pickupSlot: schedule.timeSlot,
        instructions: schedule.instructions,
        deliveryFee: deliveryFee
      };

      console.log("Sending order to backend:", orderPayload);

      // --- MOCK SUCCESS FOR NOW ---
      const fakeOrderId = "ORD-" + Math.floor(Math.random() * 90000 + 10000);
      
      // Clear cart as it's now a real order
      localStorage.removeItem('quickwash_cart');
      
      // Navigate to tracking
      navigate(`/order/${fakeOrderId}`); 
      
      // In next step, we will replace this with:
      // const res = await axios.post('http://localhost:5000/api/orders/create', orderPayload);
      // navigate(`/order/${res.data.orderId}`);
      
    } catch (error) {
      console.error("Order failed:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (!cartData) return <div style={{padding: '50px', textAlign: 'center'}}>Preparing checkout...</div>;

  return (
    <div className="web-container">
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
          <div className="checkout-form-section">
            <form onSubmit={handleConfirmOrder}>
              
              <div className="form-card">
                <div className="card-header">
                  <h3>📍 Pickup Location</h3>
                  {!isEditingAddress && (
                    <button type="button" className="edit-link" onClick={() => setIsEditingAddress(true)}>Edit</button>
                  )}
                </div>

                {isEditingAddress ? (
                  <div className="address-edit-box animate-fade">
                    <div className="input-group">
                      <label>Contact Name</label>
                      <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>Phone Number</label>
                      <input type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>Full Address</label>
                      <textarea value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})}></textarea>
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

              <div className="form-card">
                <h3>📝 Rider Instructions (Optional)</h3>
                <textarea 
                  placeholder="e.g., Gate code is 1234, please call before arriving."
                  value={schedule.instructions}
                  onChange={(e) => setSchedule({...schedule, instructions: e.target.value})}
                ></textarea>
              </div>
            </form>
          </div>

          <div className="checkout-summary-section">
            <div className="summary-card">
              <h2>Booking Summary</h2>
              
              <div className="pickup-vendors">
                <p><strong>Laundry Hub:</strong></p>
                <ul>
                  <li>{cartData.shopName}</li>
                </ul>
              </div>

              <div className="summary-row">
                <span>Services Requested</span>
                <span>{Object.keys(cartData.items).length}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              
              <div className="summary-divider"></div>

              <div className="total-info-box">
                <p><strong>Total Due Now: ₹0.00</strong></p>
                <small>Payment is collected after the vendor weighs and bills your clothes.</small>
              </div>

              <button 
                type="submit" 
                className="confirm-btn" 
                onClick={handleConfirmOrder}
                disabled={!schedule.date || !schedule.timeSlot || isEditingAddress}
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