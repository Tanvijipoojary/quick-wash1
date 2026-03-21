import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './profile.css';
import logo from '../assets/quickwash-logo.png'; 

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); 

  // --- 1. REAL USER DATA FROM LOGIN ---
  const [user, setUser] = useState({ name: "", phone: "", email: "" });
  // --- SETTINGS STATES ---
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);

  useEffect(() => {
    const savedUserStr = localStorage.getItem('quickwash_user');
    if (savedUserStr) {
      const loggedInUser = JSON.parse(savedUserStr);
      setUser({
        name: loggedInUser.name || "Customer",
        phone: loggedInUser.phone || "No phone added",
        email: loggedInUser.email || ""
      });
    } else {
      navigate('/');
    }
  }, [navigate]);

  // --- 2. REAL ORDERS FROM MONGODB ---
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user.email) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/user/${user.email}`);
        const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    if (activeTab === 'orders') fetchMyOrders();
  }, [user.email, activeTab]);

  // --- 3. REAL FAVORITES FROM MONGODB ---
  const [favoriteShops, setFavoriteShops] = useState([]);
  const [isLoadingFavs, setIsLoadingFavs] = useState(true);

  useEffect(() => {
    const fetchMyFavorites = async () => {
      if (!user.email) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/favorites/${user.email}`);
        setFavoriteShops(response.data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setIsLoadingFavs(false);
      }
    };
    if (activeTab === 'favorites') fetchMyFavorites();
  }, [user.email, activeTab]);

  // ==========================================
  // --- 4. REAL ADDRESSES FROM MONGODB ---
  // ==========================================
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({ type: 'Home', text: '' });

  // Fetch Addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user.email) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/addresses/${user.email}`);
        setAddresses(res.data);
      } catch (error) { 
        console.error("Error fetching addresses", error); 
      }
    };
    if (activeTab === 'addresses') fetchAddresses();
  }, [user.email, activeTab]);

  // Add Address Handler
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddressForm.text.trim()) return;

    // Assign appropriate icon based on type
    let icon = '📍';
    if (newAddressForm.type === 'Home') icon = '🏠';
    if (newAddressForm.type === 'Work') icon = '💼';
    if (newAddressForm.type === 'Hotel') icon = '🏨';

    try {
      const res = await axios.post('http://localhost:5000/api/addresses/add', {
        customerEmail: user.email,
        type: newAddressForm.type,
        text: newAddressForm.text,
        icon: icon
      });
      setAddresses([...addresses, res.data]); // Update UI instantly
      setIsAddingAddress(false);
      setNewAddressForm({ type: 'Home', text: '' }); // Reset form
    } catch (error) { 
      alert("Failed to save address. Check if your backend is running."); 
    }
  };

  // Delete Address Handler
  const handleDeleteAddress = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/addresses/delete/${id}`);
      setAddresses(addresses.filter(addr => addr._id !== id)); // Remove from UI instantly
    } catch (error) { 
      alert("Failed to delete address."); 
    }
  };
  // ==========================================


  // --- PROFILE EDITING ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...user });

  const openEditModal = () => {
    setEditForm({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Send the new data to your MongoDB backend
      // Make sure the URL matches where you put the route in Step 1!
      await axios.put('http://localhost:5000/api/auth/update-profile', {
        email: editForm.email, // Used to find the user in DB
        name: editForm.name,   // The new name
        phone: editForm.phone  // The new phone
      });

      // 2. Update the live UI with the new data
      setUser({ ...user, name: editForm.name, phone: editForm.phone });
      
      // 3. Update local storage so the changes stay if they refresh the page
      const existingStorage = JSON.parse(localStorage.getItem('quickwash_user'));
      const updatedStorage = { ...existingStorage, name: editForm.name, phone: editForm.phone };
      // Change whatever key you had to 'quickwash_user'
      localStorage.setItem('quickwash_user', JSON.stringify(updatedStorage));

      setIsEditModalOpen(false); 
      alert("✅ Profile updated successfully!");

    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("❌ Failed to update profile. Is your backend server running?");
    }
  };

  // --- LOGOUT HANDLER ---
  const handleLogout = () => {
    localStorage.removeItem('quickwash_user');
    localStorage.removeItem('quickwash_cart');
    alert("You have been successfully logged out.");
    navigate('/'); 
  };

  // --- HELP MODAL ---
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [selectedHelpOrder, setSelectedHelpOrder] = useState(null);
  const [helpMessage, setHelpMessage] = useState("");

  const handleOpenHelp = (order) => {
    setSelectedHelpOrder(order);
    setIsHelpModalOpen(true);
  };

  const handleSubmitHelp = (e) => {
    e.preventDefault();
    alert(`Support ticket created for Order #${selectedHelpOrder._id.slice(-6).toUpperCase()}.`);
    setIsHelpModalOpen(false);
    setHelpMessage("");
  };

  return (
    <div className="profile-page-bg">
      {/* --- TOP NAVBAR --- */}
      <nav className="top-navbar">
        <div className="nav-brand" onClick={() => navigate('/home')}>
          <img src={logo} alt="Quick Wash Logo" className="nav-logo" />
          <h2>QUICK WASH</h2>
        </div>
        <div className="nav-links">
          <div className="nav-item" onClick={() => navigate('/home')}>🏠 Home</div>
          <div className="nav-item" onClick={() => navigate('/cart')}>🛒 Cart</div>
          <div className="nav-item profile-btn active">👤 Profile</div>
        </div>
      </nav>

      {/* --- HEADER BANNER --- */}
      <div className="profile-header-banner">
        <div className="profile-header-content">
          <div className="user-info-block">
            <h1>{user.name}</h1>
            <p>{user.phone} <span className="dot-divider">•</span> {user.email}</p>
          </div>
          <button className="edit-profile-btn" onClick={openEditModal}>EDIT PROFILE</button>
        </div>
      </div>

      <main className="profile-main-body">
        {/* --- SIDEBAR TABS --- */}
        <aside className="profile-sidebar-nav">
          <ul>
            <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
              <span className="tab-icon">🛍️</span> Orders
            </li>
            <li className={activeTab === 'favorites' ? 'active' : ''} onClick={() => setActiveTab('favorites')}>
              <span className="tab-icon">🤍</span> Favourites
            </li>
            <li className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>
              <span className="tab-icon">💳</span> Payments
            </li>
            <li className={activeTab === 'addresses' ? 'active' : ''} onClick={() => setActiveTab('addresses')}>
              <span className="tab-icon">📍</span> Addresses
            </li>
            <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              <span className="tab-icon">⚙️</span> Settings
            </li>
          </ul>
        </aside>

        {/* --- CONTENT AREA --- */}
        <section className="profile-content-area">
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="animate-fade">
              <h2 className="tab-main-title">Past Orders</h2>
              {isLoadingOrders ? (
                <p>Loading your orders... ⏳</p>
              ) : orders.length === 0 ? (
                <p className="empty-text">You haven't placed any orders yet.</p>
              ) : (
                <div className="orders-tab-wrapper">
                  {orders.map(order => (
                    <div key={order._id} className="swiggy-order-card">
                      <div className="order-top-section">
                        <div className="order-shop-details">
                          <div className="shop-image-box">🏪</div>
                          <div className="shop-text-info">
                            <h3>{order.shopName}</h3>
                            <p className="order-id-date">
                              ORDER #{order._id.slice(-6).toUpperCase()} | {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <button className="view-details-text-btn" onClick={() => navigate(`/tracking/${order._id}`)}>
                              VIEW STATUS
                            </button>
                          </div>
                        </div>
                        <div className="order-delivery-status" style={{ color: order.status === 'Completed' ? '#16a34a' : '#2563eb' }}>
                          Status: {order.status}
                        </div>
                      </div>
                      <div className="order-dashed-divider"></div>
                      <div className="order-middle-section">
                        <p className="order-items-text">
                          {order.items.map(i => `${i.name} (x${i.qty})`).join(', ')}
                        </p>
                        <p className="order-total-text">
                          Total: {order.totalAmount === 0 ? "Pending Weighing" : `₹${order.totalAmount}`}
                        </p>
                      </div>
                      <div className="order-bottom-section">
                        <button className="reorder-btn" onClick={() => navigate(`/shop/${order.shopId}`)}>VISIT SHOP</button>
                        <button className="help-btn" onClick={() => handleOpenHelp(order)}>HELP</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FAVORITES TAB */}
          {activeTab === 'favorites' && (
            <div className="animate-fade">
              <h2 className="tab-main-title">Favourite Shops</h2>
              {isLoadingFavs ? (
                <p>Loading your favorite shops... ⏳</p>
              ) : favoriteShops.length === 0 ? (
                <p className="empty-text">No favourites saved yet.</p>
              ) : (
                <div className="swiggy-addresses-grid">
                  {favoriteShops.map(shop => (
                     <div key={shop._id} className="swiggy-address-card">
                       <div className="addr-content-wrapper">
                         <h3>{shop.shopName}</h3>
                         <p style={{marginTop: '5px', color: '#fc8019'}}>★ {shop.shopRating || 4.5}</p>
                         <div className="addr-actions" style={{marginTop: '15px'}}>
                           <button onClick={() => navigate(`/shop/${shop.shopId}`)}>VISIT SHOP</button>
                         </div>
                       </div>
                     </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="animate-fade">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="tab-main-title" style={{ margin: 0 }}>Manage Addresses</h2>
                <button 
                  onClick={() => setIsAddingAddress(!isAddingAddress)} 
                  style={{ padding: '8px 16px', background: isAddingAddress ? '#ef4444' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {isAddingAddress ? "✕ Cancel" : "+ Add New"}
                </button>
              </div>
              
              {/* Add New Address Form */}
              {isAddingAddress && (
                <div className="animate-fade" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1e293b' }}>Add New Address</h3>
                  <form onSubmit={handleAddAddress}>
                    <select 
                      value={newAddressForm.type} 
                      onChange={(e) => setNewAddressForm({...newAddressForm, type: e.target.value})} 
                      style={{ padding: '12px', width: '100%', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Other">Other</option>
                    </select>
                    <textarea 
                      value={newAddressForm.text} 
                      onChange={(e) => setNewAddressForm({...newAddressForm, text: e.target.value})} 
                      placeholder="Full Address (e.g., Flat 4B, Seaview Apartments, Bejai Main Road...)" 
                      required 
                      style={{ padding: '12px', width: '100%', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '80px', fontSize: '1rem', resize: 'none' }}
                    ></textarea>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" style={{ flex: 1, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                        Save Address
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Display Saved Addresses */}
              {addresses.length === 0 && !isAddingAddress ? (
                <p className="empty-text">No addresses saved yet.</p>
              ) : (
                <div className="swiggy-addresses-grid">
                  {addresses.map(addr => (
                    <div key={addr._id} className="swiggy-address-card">
                      <div className="addr-icon-wrapper">{addr.icon}</div>
                      <div className="addr-content-wrapper">
                        <h3>{addr.type}</h3>
                        <p>{addr.text}</p>
                        <div className="addr-actions">
                          <button onClick={() => handleDeleteAddress(addr._id)} style={{ color: '#ef4444' }}>DELETE</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div className="animate-fade">
              <h2 className="tab-main-title">Payments</h2>
              <p className="empty-text">This section will be available soon.</p>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="animate-fade">
              <h2 className="tab-main-title">Account Settings</h2>

              {/* Group 1: Notifications */}
              <div className="settings-group" style={{ marginBottom: '30px' }}>
                <h3 className="settings-group-title">Notifications</h3>
                <div className="settings-card-modern">
                  <div className="settings-row">
                    <div>
                      <h4>Email Notifications</h4>
                      <p>Receive order invoices and updates via email.</p>
                    </div>
                    <label className="settings-toggle">
                      <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  
                  <div className="settings-divider"></div>
                  
                  <div className="settings-row">
                    <div>
                      <h4>SMS Updates</h4>
                      <p>Get real-time tracking alerts on your phone.</p>
                    </div>
                    <label className="settings-toggle">
                      <input type="checkbox" checked={smsNotif} onChange={() => setSmsNotif(!smsNotif)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Group 2: About & Support */}
              <div className="settings-group" style={{ marginBottom: '30px' }}>
                <h3 className="settings-group-title">About & Legal</h3>
                <div className="settings-card-modern">
                  {/* Just make sure '/privacy' and '/terms' match the actual paths you set in your App.jsx routes! */}
                  <div className="settings-row clickable" onClick={() => navigate('/privacy')}>
                    <div>
                      <h4>Privacy Policy</h4>
                      <p>Read about how we protect your data.</p>
                    </div>
                    <span className="settings-chevron">›</span>
                  </div>

                  <div className="settings-divider"></div>

                  <div className="settings-row clickable" onClick={() => navigate('/terms')}>
                    <div>
                      <h4>Terms of Service</h4>
                      <p>Our rules and user guidelines.</p>
                    </div>
                    <span className="settings-chevron">›</span>
                  </div>
                </div>
              </div>

              {/* Group 3: Danger Zone */}
              <div className="settings-group">
                <h3 className="settings-group-title" style={{ color: '#ef4444' }}>Account Security</h3>
                <div className="settings-card-modern" style={{ border: '1px solid #fca5a5' }}>
                  <div className="settings-row">
                    <div>
                      <h4>Log Out</h4>
                      <p>Sign out of your Quick Wash account securely.</p>
                    </div>
                    <button className="logout-action-btn" onClick={handleLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      LOG OUT
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </section>
      </main>

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditModalOpen && (
        <div className="profile-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="profile-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-modal-btn" onClick={() => setIsEditModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveProfile} className="edit-profile-form">
              <div className="form-group-modern">
                <label>Full Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} required />
              </div>
              <div className="form-group-modern">
                <label>Phone Number</label>
                <input type="text" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} required />
              </div>
              <div className="form-group-modern">
                <label>Email Address (Cannot be changed)</label>
                <input 
                  type="email" 
                  value={editForm.email} 
                  readOnly 
                  style={{ backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-edit-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-edit-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- HELP MODAL --- */}
      {isHelpModalOpen && selectedHelpOrder && (
        <div className="profile-modal-overlay" onClick={() => setIsHelpModalOpen(false)}>
          <div className="profile-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Support</h2>
              <button className="close-modal-btn" onClick={() => setIsHelpModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmitHelp} className="edit-profile-form">
              <div className="form-group-modern">
                <label>How can we help you?</label>
                <select 
                  className="help-dropdown" 
                  required
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                >
                  <option value="">Select an issue...</option>
                  <option value="late">Order is delayed</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-edit-btn">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;