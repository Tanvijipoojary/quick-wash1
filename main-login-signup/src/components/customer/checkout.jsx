import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './checkout.css';
import logo from '../assets/quickwash-logo.png';

const Checkout = () => {
  const navigate = useNavigate();

  // --- 1. REAL DATA LOADING ---
  const [cartData, setCartData] = useState(null);
  
  // Load real user from login!
  const savedUserStr = localStorage.getItem('quickwash_user');
  const loggedInUser = savedUserStr ? JSON.parse(savedUserStr) : {};

  const [user, setUser] = useState({
    name: loggedInUser.name || "Tanvi Poojary",
    phone: loggedInUser.phone || "+91 7353863409",
    email: loggedInUser.email || "tanviipoojary@gmail.com"
  });

  // --- NEW: SAVED ADDRESSES STATE ---
  // In a real app, this array would come from your backend (loggedInUser.addresses). 
  // For now, we seed it with their primary profile address + a mock second one to show the feature.
  // --- REAL SAVED ADDRESSES ---
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressText, setSelectedAddressText] = useState("");

  useEffect(() => {
    const fetchAddresses = async () => {
      if (user.email) {
        try {
          const res = await axios.get(`http://localhost:5000/api/addresses/${user.email}`);
          // Map MongoDB data to match your UI format
          const formattedAddresses = res.data.map(a => ({
            id: a._id,
            label: a.type,
            text: a.text
          }));
          
          setAddresses(formattedAddresses);
          
          // Auto-select the first address if they have one
          if (formattedAddresses.length > 0) {
            setSelectedAddressText(formattedAddresses[0].text);
          } else {
            // Fallback if they have NO saved addresses in DB
            setSelectedAddressText(user.address || "Please add an address in your profile.");
          }
        } catch (error) { console.error("Error fetching addresses", error); }
      }
    };
    fetchAddresses();
  }, [user.email]);
  
  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [isChangingAddress, setIsChangingAddress] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('quickwash_cart');
    if (savedCart) {
      setCartData(JSON.parse(savedCart));
    } else {
      navigate('/home'); // Send home if empty
    }
  }, [navigate]);

  const [schedule, setSchedule] = useState({
    date: '',
    timeSlot: '',
    instructions: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const deliveryFee = 40;
  const timeSlots = [
    "09:00 AM - 11:00 AM",
    "12:00 PM - 02:00 PM",
    "03:00 PM - 05:00 PM",
    "06:00 PM - 08:00 PM"
  ];

  // --- 2. ORDER CONFIRMATION ---
  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!schedule.date || !schedule.timeSlot) {
      alert("Please select a pickup date and time.");
      return;
    }

    // Get the actual text of the address the user just clicked
    const finalSelectedAddress = addresses.find(a => a.id === selectedAddressId)?.text;

    setIsSaving(true);
    try {
      const orderPayload = {
        customerEmail: user.email, 
        shopId: cartData.shopId,
        shopName: cartData.shopName,
        items: cartData.items,
        deliveryFee: deliveryFee,
        pickupDate: schedule.date,
        pickupSlot: schedule.timeSlot,
        instructions: schedule.instructions,
        pickupAddress: selectedAddressText // 👈 Sending the chosen address!
      };

      console.log("Sending order to backend:", orderPayload);

      // Send to your MongoDB
      const res = await axios.post('http://localhost:5000/api/orders/place-order', orderPayload);

      // Clear cart and go to tracker
      localStorage.removeItem('quickwash_cart');
      navigate(`/tracking/${res.data.orderId}`); 
      
    } catch (error) {
      console.error("Order failed:", error);
      alert("Something went wrong saving the order. Is your backend running?");
    } finally {
      setIsSaving(false);
    }
  };

  if (!cartData) return <div style={{padding: '50px', textAlign: 'center'}}>Preparing checkout...</div>;

  // Find the active address object to display
  const activeAddress = addresses.find(a => a.id === selectedAddressId);

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
              
              {/* --- NEW ADDRESS SELECTOR BLOCK --- */}
              <div className="form-card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0 }}>📍 Pickup Location</h3>
                  <button 
                    type="button" 
                    onClick={() => setIsChangingAddress(!isChangingAddress)}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
                  >
                    {isChangingAddress ? "Close" : "Change"}
                  </button>
                </div>

                {isChangingAddress ? (
                  // The List of Addresses
                  <div className="address-selection-list animate-fade">
                    {addresses.map(addr => (
                      <div 
                        key={addr.id} 
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setIsChangingAddress(false); // Auto-close when selected
                        }}
                        style={{
                          padding: '15px', 
                          border: selectedAddressId === addr.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          marginBottom: '10px',
                          cursor: 'pointer',
                          background: selectedAddressId === addr.id ? '#eff6ff' : '#fff',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <strong style={{ color: '#0f172a' }}>{addr.label}</strong>
                          {selectedAddressId === addr.id && <span style={{ color: '#2563eb', fontWeight: 'bold' }}>✓ Selected</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: '1.4' }}>{addr.text}</p>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => alert("Redirecting to profile to add new address...")}
                      style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontWeight: 'bold', marginTop: '5px' }}
                    >
                      + Add New Address
                    </button>
                  </div>
                ) : (
                  // The Default View
                  <div className="address-display" style={{ padding: '5px 0' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', fontSize: '1.05rem', color: '#0f172a' }}>
                      {user.name} ({user.phone})
                      <span style={{ marginLeft: '12px', padding: '4px 10px', background: '#e2e8f0', color: '#475569', borderRadius: '12px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {activeAddress?.label}
                      </span>
                    </strong>
                    <p style={{ margin: 0, color: '#475569', lineHeight: '1.5' }}>
                      {activeAddress?.text}
                    </p>
                  </div>
                )}
              </div>

              {/* DATE & TIME CARD */}
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

              {/* INSTRUCTIONS CARD */}
              <div className="form-card">
                <h3>📝 Rider Instructions (Optional)</h3>
                <textarea 
                  placeholder="e.g., Call before arriving."
                  value={schedule.instructions}
                  onChange={(e) => setSchedule({...schedule, instructions: e.target.value})}
                ></textarea>
              </div>
            </form>
          </div>

          {/* SUMMARY SIDEBAR */}
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
                disabled={!schedule.date || !schedule.timeSlot || isChangingAddress || isSaving}
              >
                {isSaving ? "Booking..." : "Confirm Booking ➔"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;