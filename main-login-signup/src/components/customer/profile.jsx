import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import logo from '../assets/quickwash-logo.png'; 

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings'); // Defaulted to settings so you can see it!

  // --- USER DATA ---
  const [user, setUser] = useState({
    name: "Tanvi G Poojary",
    phone: "7353863409",
    email: "tanvijipoojary@gmail.com"
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...user });

  const openEditModal = () => {
    setEditForm({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUser(editForm); // Used here!
    setIsEditModalOpen(false); 
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
    alert(`Support ticket created for Order #${selectedHelpOrder.id}.`);
    setIsHelpModalOpen(false);
    setHelpMessage("");
  };

  const handleReorder = (shopId) => {
    alert("Items added to your cart! Redirecting to checkout...");
    navigate('/cart');
  };

  // --- LOGOUT HANDLER ---
  const handleLogout = () => {
    alert("You have been successfully logged out.");
    navigate('/'); 
  };

  // --- STATIC DATA (Warnings Fixed!) ---
  const [addresses] = useState([
    { id: 1, type: "Work", text: "Sai Fancy, Karnad, Mulki, Hejamadi, Karnataka, India", icon: "💼" },
    { id: 2, type: "Home", text: "305, Durga Recidency, Karnad, Mulki, Hejamadi, Karnataka, India", icon: "🏠" },
    { id: 3, type: "Hotel", text: "InvenTree Hotel, Dange Chowk Rd, Wakad, Pune", icon: "🏨" },
    { id: 4, type: "Friends And Family", text: "Roveena House, 5th Cross Road, Lakshmi Nagar, Bejai, Mangalore", icon: "📍" }
  ]);

  const [orders] = useState([
    { 
      id: "225916035022394", shopId: 1, shopName: "Sparkle Clean Laundry", location: "City Centre",
      date: "Sun, Dec 28, 2025, 11:57 PM", deliveredDate: "Mon, Dec 29, 2025, 12:17 AM",
      items: "Wash & Fold (2.5 kg) x 1, Premium Dry Clean (Suit) x 1", total: "₹250"
    },
    { 
      id: "225896182673846", shopId: 2, shopName: "Quick Wash Hub", location: "Bejai Main Road",
      date: "Sun, Dec 28, 2025, 06:26 PM", deliveredDate: "Sun, Dec 28, 2025, 06:49 PM",
      items: "Wash & Iron (Shirts) x 5, Shoe Cleaning x 1", total: "₹380"
    }
  ]);

  const allShops = [
    { id: 1, name: 'Sparkle Clean Laundry', rating: 4.8 },
    { id: 2, name: 'Quick Wash Hub', rating: 4.5 },
  ];
  const [favoriteIds, setFavoriteIds] = useState([]);
  
  useEffect(() => {
    const savedFavs = localStorage.getItem('quickwash_favs');
    if (savedFavs) setFavoriteIds(JSON.parse(savedFavs));
  }, []);
  
  const favoriteShops = allShops.filter(shop => favoriteIds.includes(shop.id));

  return (
    <div className="profile-page-bg">
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

        <section className="profile-content-area">
          {activeTab === 'orders' && (
            <div className="animate-fade">
              <h2 className="tab-main-title">Past Orders</h2>
              <div className="orders-tab-wrapper">
                {orders.map(order => (
                  <div key={order.id} className="swiggy-order-card">
                    <div className="order-top-section">
                      <div className="order-shop-details">
                        <div className="shop-image-box">🏪</div>
                        <div className="shop-text-info">
                          <h3>{order.shopName}</h3>
                          <p className="shop-location">{order.location}</p>
                          <p className="order-id-date">ORDER #{order.id} | {order.date}</p>
                          <button className="view-details-text-btn" onClick={() => navigate(`/order/${order.id}`)}>VIEW DETAILS</button>
                        </div>
                      </div>
                      <div className="order-delivery-status">
                        Delivered on {order.deliveredDate} <span className="green-tick">✓</span>
                      </div>
                    </div>
                    <div className="order-dashed-divider"></div>
                    <div className="order-middle-section">
                      <p className="order-items-text">{order.items}</p>
                      <p className="order-total-text">Total Paid: {order.total}</p>
                    </div>
                    <div className="order-bottom-section">
                      <button className="reorder-btn" onClick={() => handleReorder(order.shopId)}>REORDER</button>
                      <button className="help-btn" onClick={() => handleOpenHelp(order)}>HELP</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="animate-fade">
              <h2 className="tab-main-title">Manage Addresses</h2>
              <div className="swiggy-addresses-grid">
                {addresses.map(addr => (
                  <div key={addr.id} className="swiggy-address-card">
                    <div className="addr-icon-wrapper">{addr.icon}</div>
                    <div className="addr-content-wrapper">
                      <h3>{addr.type}</h3>
                      <p>{addr.text}</p>
                      <div className="addr-actions">
                        <button>EDIT</button>
                        <button>DELETE</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="animate-fade">
              <h2 className="tab-main-title">Favourite Shops</h2>
              {favoriteShops.length === 0 ? (
                <p className="empty-text">No favourites saved yet.</p>
              ) : (
                <div className="swiggy-addresses-grid">
                  {favoriteShops.map(shop => (
                     <div key={shop.id} className="swiggy-address-card">
                       <div className="addr-content-wrapper">
                         <h3>{shop.name}</h3>
                         <p style={{marginTop: '5px', color: '#fc8019'}}>★ {shop.rating}</p>
                         <div className="addr-actions" style={{marginTop: '15px'}}>
                           <button onClick={() => navigate(`/shop/${shop.id}`)}>VISIT SHOP</button>
                         </div>
                       </div>
                     </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="animate-fade">
              <h2 className="tab-main-title">Payments</h2>
              <p className="empty-text">This section will be available soon.</p>
            </div>
          )}

          {/* --- SETTINGS TAB (HandleLogout is connected here!) --- */}
          {activeTab === 'settings' && (
            <div className="animate-fade">
              <h2 className="tab-main-title">Settings</h2>
              
              <div className="settings-card-modern">
                <div className="settings-row">
                  <div>
                    <h3>SMS & WhatsApp Updates</h3>
                    <p>Receive order updates on your registered number.</p>
                  </div>
                  <span style={{ color: '#20a161', fontWeight: 'bold' }}>Enabled ✓</span>
                </div>
                
                <div className="settings-divider"></div>

                <div className="settings-row">
                  <div>
                    <h3>Account Security</h3>
                    <p>Change your password or update security questions.</p>
                  </div>
                  <button className="settings-text-btn">UPDATE</button>
                </div>

                <div className="settings-divider"></div>

                <div className="settings-row">
                  <div>
                    <h3>Log Out</h3>
                    <p>Sign out of your Quick Wash account securely.</p>
                  </div>
                  <button className="logout-action-btn" onClick={handleLogout}>LOG OUT</button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* --- EDIT MODAL --- */}
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
                <label>Email Address</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} required />
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
            <div className="help-order-summary">
              <strong>Order #{selectedHelpOrder.id}</strong>
              <p>{selectedHelpOrder.shopName}</p>
            </div>
            <form onSubmit={handleSubmitHelp} className="edit-profile-form">
              <div className="form-group-modern">
                <label>How can we help you?</label>
                <select className="help-dropdown" required>
                  <option value="">Select an issue...</option>
                  <option value="missing">Items missing from delivery</option>
                  <option value="quality">Poor wash/iron quality</option>
                  <option value="late">Order was significantly delayed</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group-modern">
                <label>Additional Details</label>
                <textarea 
                  className="help-textarea"
                  placeholder="Please describe your issue in detail..." 
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                  required 
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-edit-btn" onClick={() => setIsHelpModalOpen(false)}>Cancel</button>
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