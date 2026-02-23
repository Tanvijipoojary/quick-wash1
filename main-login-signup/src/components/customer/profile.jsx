import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import logo from '../assets/quickwash-logo.png'; 

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  // ==========================================
  // 🚀 BACKEND READY STATE
  // ==========================================
  const [user, setUser] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+91 9876543210",
    location: "Bejai Main Road, Mangaluru"
  });

  const [orders, setOrders] = useState([
    { id: "ORD-9921", date: "20 Feb 2026", status: "Delivered", total: "₹120" },
    { id: "ORD-9954", date: "21 Feb 2026", status: "In Progress", total: "₹340" }
  ]);

  const handleLogout = () => {
    // Add logic to clear tokens/session here
    console.log("Logging out...");
    navigate('/');
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
          <div className="nav-item">🛒 Cart</div>
          <div className="nav-item profile-btn active">👤 {user.name}</div>
        </div>
      </nav>

      {/* --- MAIN DASHBOARD LAYOUT --- */}
      <main className="profile-main">
        <div className="profile-layout">
          
          {/* --- SIDEBAR --- */}
          <aside className="profile-sidebar">
            <div className="sidebar-header">
              <div className="avatar-large">{user.name.charAt(0)}</div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
            
            <ul className="sidebar-menu">
              <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                👤 My Profile
              </li>
              <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                📦 Order History
              </li>
              <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                ⚙️ Settings
              </li>
              <li className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </li>
            </ul>
          </aside>

          {/* --- CONTENT AREA --- */}
          <section className="profile-content">
            
            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="tab-section animate-fade">
                <h2>Personal Information</h2>
                <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" defaultValue={user.name} />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" defaultValue={user.email} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" defaultValue={user.phone} />
                  </div>
                  <div className="form-group">
                    <label>Default Address</label>
                    <textarea defaultValue={user.location}></textarea>
                  </div>
                  <button type="submit" className="save-btn">Save Changes</button>
                </form>
              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <div className="tab-section animate-fade">
                <h2>Recent Orders</h2>
                <div className="orders-list">
                  
                  {/* Fake "Pending" Order for demonstration */}
                  <div className="order-card pending-card" onClick={() => navigate('/order/ORD-9999')}>
                    <div className="order-info">
                      <h4>ORD-9999</h4>
                      <p>23 Feb 2026</p>
                    </div>
                    <div className="order-status">
                      <span className="status-badge orange">Pending Weight</span>
                      <p className="order-action-text">Track Order ➔</p>
                    </div>
                  </div>

                  {orders.map((order) => (
                    <div key={order.id} className="order-card" style={{ opacity: order.status === 'Delivered' ? 0.7 : 1 }}>
                      <div className="order-info">
                        <h4>{order.id}</h4>
                        <p>{order.date}</p>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge ${order.status === 'Delivered' ? 'green' : 'orange'}`}>
                          {order.status}
                        </span>
                        <p className="order-total">{order.total}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="tab-section animate-fade">
                <h2>Account Settings</h2>
                
                <div className="settings-card">
                  <h3>Notifications</h3>
                  <div className="toggle-row">
                    <span>Email Receipts</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="toggle-row">
                    <span>SMS Delivery Updates</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="toggle-row">
                    <span>Promotional Offers</span>
                    <input type="checkbox" />
                  </div>
                </div>

                <div className="settings-card">
                  <h3>Security</h3>
                  <button className="outline-btn">Change Password</button>
                  <button className="outline-btn danger">Delete Account</button>
                </div>
              </div>
            )}

          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;