import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './checkout.css';
import logo from '../assets/quickwash-logo.png';

const Checkout = () => {
  const navigate = useNavigate();

  // --- 1. REAL DATA LOADING ---
  const [cartData, setCartData] = useState(null);
  
  const savedUserStr = localStorage.getItem('quickwash_user');
  const loggedInUser = savedUserStr ? JSON.parse(savedUserStr) : {};

  const [user] = useState({
    name: loggedInUser.name || "Customer",
    phone: loggedInUser.phone || "",
    email: loggedInUser.email || ""
  });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressText, setSelectedAddressText] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isChangingAddress, setIsChangingAddress] = useState(false);

  // --- NEW: GARMENT INVENTORY STATE ---
  const [garments, setGarments] = useState({
    shirt: 0, tshirt: 0, tops: 0, trousers: 0, 
    shorts: 0, shawls: 0, bedsheets: 0, undergarments: 0
  });

  const garmentCategories = [
    { id: 'shirt', label: 'Shirts', icon: '👔' },
    { id: 'tshirt', label: 'T-Shirts', icon: '👕' },
    { id: 'tops', label: 'Tops', icon: '👚' },
    { id: 'trousers', label: 'Trousers / Jeans', icon: '👖' },
    { id: 'shorts', label: 'Shorts', icon: '🩳' },
    { id: 'shawls', label: 'Shawls', icon: '🧣' },
    { id: 'bedsheets', label: 'Bedsheets / Towels', icon: '🛏️' },
    { id: 'undergarments', label: 'Undergarments', icon: '🧦' }
  ];

  const updateGarmentCount = (id, delta) => {
    setGarments(prev => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta) // Prevents negative numbers!
    }));
  };

  const totalGarments = Object.values(garments).reduce((acc, curr) => acc + curr, 0);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (user.email) {
        try {
          const res = await axios.get(`http://localhost:5000/api/addresses/${user.email}`);
          const formattedAddresses = res.data.map(a => ({
            id: a._id,
            label: a.type,
            text: a.text
          }));
          
          setAddresses(formattedAddresses);
          
          if (formattedAddresses.length > 0) {
            setSelectedAddressText(formattedAddresses[0].text);
            setSelectedAddressId(formattedAddresses[0].id);
          } else {
            setSelectedAddressText(user.address || "Please add an address in your profile.");
          }
        } catch (error) { console.error("Error fetching addresses", error); }
      }
    };
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.email]);
  
  useEffect(() => {
    const savedCart = localStorage.getItem('quickwash_cart');
    if (savedCart) {
      setCartData(JSON.parse(savedCart));
    } else {
      navigate('/home'); 
    }
  }, [navigate]);

  const [instructions, setInstructions] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const deliveryFee = 40;

  // --- 2. ORDER CONFIRMATION (INSTANT DISPATCH LOGIC) ---
  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    
    if (!selectedAddressId && !selectedAddressText) {
      alert("Please select a valid pickup address.");
      return;
    }

    setIsSaving(true);
    try {
      const orderPayload = {
        customerEmail: user.email, 
        shopId: cartData.shopId,
        shopName: cartData.shopName,
        items: cartData.items,
        deliveryFee: deliveryFee,
        
        // Hardcoded ASAP so the database still gets what it needs
        pickupDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        pickupSlot: 'ASAP', 
        
        instructions: instructions,
        pickupAddress: selectedAddressText, 
        status: 'Pending', 
        riderEmail: null,

        // NEW: SENDING THE INVENTORY TO THE DATABASE!
        garmentDetails: garments,
        totalExpectedGarments: totalGarments
      };

      const res = await axios.post('http://localhost:5000/api/orders/place-order', orderPayload);

      localStorage.removeItem('quickwash_cart');
      navigate(`/tracking/${res.data.orderId}`); 
      
    } catch (error) {
      console.error("Order failed:", error);
      alert("Something went wrong saving the order.");
    } finally {
      setIsSaving(false);
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
              
              {/* --- ADDRESS SELECTOR BLOCK --- */}
              <div className="form-card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0 }}>📍 Pickup Location</h3>
                  <button 
                    type="button" 
                    onClick={() => setIsChangingAddress(!isChangingAddress)}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
                  >
                    {isChangingAddress ? "Close" : "Select"}
                  </button>
                </div>

                {isChangingAddress ? (
                  <div className="address-selection-list animate-fade">
                    {addresses.map(addr => (
                      <div 
                        key={addr.id} 
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setSelectedAddressText(addr.text);
                          setIsChangingAddress(false); 
                        }}
                        style={{
                          padding: '15px', 
                          border: selectedAddressId === addr.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          marginBottom: '10px',
                          cursor: 'pointer',
                          background: selectedAddressId === addr.id ? '#eff6ff' : '#fff',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <strong style={{ color: '#0f172a' }}>{addr.label}</strong>
                          {selectedAddressId === addr.id && <span style={{ color: '#2563eb', fontWeight: 'bold' }}>✓ Selected</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{addr.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="address-display" style={{ padding: '5px 0' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', fontSize: '1.05rem', color: '#0f172a' }}>
                      {user.name} ({user.phone})
                    </strong>
                    <p style={{ margin: 0, color: '#475569', lineHeight: '1.5', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      {selectedAddressText || "No address selected"}
                    </p>
                  </div>
                )}
              </div>

              <br></br>

              {/* --- NEW: GARMENT DETAILS COUNTER --- */}
              <div className="form-card">
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>🧺 Garment Details <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: '#64748b'}}>(Optional)</span></h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Let the laundry hub know what is in the bag.</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {garmentCategories.map((category) => (
                    <div key={category.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{category.icon}</span>
                        <span style={{ color: '#334155', fontWeight: '500' }}>{category.label}</span>
                      </div>
                      
                      {/* Counter Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '4px' }}>
                        <button 
                          type="button" // CRITICAL: prevents submitting the form
                          onClick={() => updateGarmentCount(category.id, -1)}
                          style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: garments[category.id] > 0 ? '#e2e8f0' : '#f1f5f9', color: garments[category.id] > 0 ? '#0f172a' : '#cbd5e1', cursor: garments[category.id] > 0 ? 'pointer' : 'not-allowed', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                        >-</button>
                        
                        <span style={{ width: '20px', textAlign: 'center', fontWeight: 'bold', color: '#0f172a' }}>
                          {garments[category.id]}
                        </span>
                        
                        <button 
                          type="button" 
                          onClick={() => updateGarmentCount(category.id, 1)}
                          style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#e0e7ff', color: '#4f46e5', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '15px', padding: '12px', background: '#f8fafc', borderRadius: '8px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>
                  Total Items in Bag: <span style={{color: '#2563eb'}}>{totalGarments}</span>
                </div>
              </div>

              <br></br>

              {/* --- INSTRUCTIONS CARD --- */}
              <div className="form-card">
                <h3>📝 Rider Instructions <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: '#64748b'}}>(Optional)</span></h3>
                <textarea 
                  placeholder="e.g., Call before arriving, doorbell is broken."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', fontFamily: 'inherit', boxSizing: 'border-box', marginTop: '10px' }}
                ></textarea>
              </div>
            </form>
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="checkout-summary-section">
            <div className="summary-card">
              <h2>Booking Summary</h2>
              
              <div className="pickup-vendors" style={{ marginBottom: '20px' }}>
                <p><strong>Laundry Hub:</strong></p>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                  • {cartData.shopName}
                </div>
              </div>

              <div className="summary-row">
                <span>Services Requested</span>
                <span>{Object.keys(cartData.items).length}</span>
              </div>

              {/* NEW: Show total garments in the summary box! */}
              {totalGarments > 0 && (
                <div className="summary-row" style={{ color: '#2563eb', fontWeight: '500' }}>
                  <span>Garments Declared</span>
                  <span>{totalGarments} items</span>
                </div>
              )}

              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              
              <div className="summary-divider"></div>

              <div className="total-info-box" style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <p style={{ color: '#1e3a8a', fontSize: '1.1rem', margin: '0 0 5px 0' }}><strong>Total Due Now: ₹0.00</strong></p>
                <small style={{ color: '#3b82f6', display: 'block', lineHeight: '1.4' }}>Payment is collected after the vendor weighs and bills your clothes.</small>
              </div>

              <button 
                type="button" 
                className="confirm-btn" 
                onClick={handleConfirmOrder}
                disabled={isSaving}
                style={{ width: '100%', background: '#cbd5e1', color: 'white', padding: '16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'background 0.3s', backgroundColor: isSaving ? '#94a3b8' : '#2563eb' }}
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