import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import logo from '../assets/quickwash-logo.png';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- FINANCIAL FILTERS ---
  const [financeFilter, setFinanceFilter] = useState('All'); // Table Status Filter
  const [timeFilter, setTimeFilter] = useState('Overall'); // NEW: Top Stats Time Filter

  // ==========================================
  // 👥 MOCK DATA
  // ==========================================
  const [usersData, setUsersData] = useState([
    { id: "U-1001", name: "Tanvi G Poojary", email: "tanvijipoojary@gmail.com", phone: "+91 7353863409", status: "Active", joined: "Jan 12, 2026", stats: { totalOrders: 12, completed: 10, cancelled: 1, pending: 1, totalSpent: 4250 } },
    { id: "U-1002", name: "Rahul M.", email: "rahul.m@example.com", phone: "+91 9876543211", status: "Active", joined: "Feb 03, 2026", stats: { totalOrders: 5, completed: 5, cancelled: 0, pending: 0, totalSpent: 1800 } }
  ]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null); 

  const [shopsData, setShopsData] = useState([
    { id: "S-2001", name: "Sparkle Clean Laundry", owner: "Ramesh M.", phone: "+91 8888811111", location: "City Centre", rating: 4.8, status: "Active", stats: { totalOrders: 450, accepted: 430, rejected: 10, pending: 10, totalEarned: 125000, withdrawn: 105000, walletBal: 20000 } },
    { id: "S-2002", name: "Ocean Fresh Laundry", owner: "Vikram S.", phone: "+91 8888844444", location: "Surathkal", rating: "N/A", status: "Pending", stats: { totalOrders: 12, accepted: 12, rejected: 0, pending: 0, totalEarned: 4500, withdrawn: 0, walletBal: 4500 } }
  ]);
  const [isShopEditModalOpen, setIsShopEditModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [viewingShop, setViewingShop] = useState(null);

  const [ridersData, setRidersData] = useState([
    { id: "R-3001", name: "Kiran Kumar", phone: "+91 9999911111", zone: "Bejai & Kadri", rating: 4.7, status: "Active", stats: { totalDeliveries: 140, accepted: 135, rejected: 3, pending: 2, totalEarned: 14000, withdrawn: 12000, walletBal: 2000 } },
    { id: "R-3004", name: "Ravi Naik", phone: "+91 9999944444", zone: "Kuloor", rating: "N/A", status: "Pending", stats: { totalDeliveries: 0, accepted: 0, rejected: 0, pending: 0, totalEarned: 0, withdrawn: 0, walletBal: 0 } }
  ]);
  const [isRiderEditModalOpen, setIsRiderEditModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState(null);
  const [viewingRider, setViewingRider] = useState(null);

  const [transactionsData] = useState([
    { id: "TXN-901", date: "Feb 26, 2026", orderId: "#ORD-9921", customerName: "Rahul M.", shopName: "Sparkle Clean Laundry", total: 340, shopCut: 270, riderCut: 40, profit: 30, status: "Completed" },
    { id: "TXN-902", date: "Feb 25, 2026", orderId: "#ORD-9922", customerName: "Priya S.", shopName: "Quick Wash Hub", total: 120, shopCut: 95, riderCut: 15, profit: 10, status: "Pending" },
    { id: "TXN-903", date: "Feb 25, 2026", orderId: "#ORD-9923", customerName: "Amit K.", shopName: "Ocean Fresh Laundry", total: 450, shopCut: 360, riderCut: 50, profit: 40, status: "Completed" },
    { id: "TXN-904", date: "Feb 24, 2026", orderId: "#ORD-9924", customerName: "Tanvi G.", shopName: "Elite Dry Cleaners", total: 890, shopCut: 710, riderCut: 80, profit: 100, status: "Pending" }
  ]);

  // NEW: Dynamic Financial Stats based on Time Filter
  const financialStats = {
    Overall: { total: 1800, shop: 1435, rider: 185, profit: 180 },
    Yearly: { total: 24500, shop: 19600, rider: 2450, profit: 2450 },
    Monthly: { total: 3200, shop: 2560, rider: 320, profit: 320 }
  };
  const currentStats = financialStats[timeFilter];

  // --- HANDLERS ---
  const handleLogout = () => { navigate('/'); };
  
  const handleMenuClick = (menu) => { 
    setActiveMenu(menu); 
    setSearchTerm(''); 
    setFinanceFilter('All'); 
  };
  
  const handleExportCSV = () => { alert("CSV Downloaded successfully!"); };

  // --- FILTER LOGIC ---
  const filteredUsers = usersData.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredShops = shopsData.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.location.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredRiders = ridersData.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.zone.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const filteredTransactions = transactionsData.filter(t => {
    const matchesSearch = t.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.shopName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = financeFilter === 'All' || t.status === financeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const toggleUserStatus = (id, currentStatus) => setUsersData(usersData.map(u => u.id === id ? { ...u, status: currentStatus === 'Active' ? 'Banned' : 'Active' } : u));
  const handleEditUser = (e) => { e.preventDefault(); setUsersData(usersData.map(u => u.id === editingUser.id ? editingUser : u)); setIsEditModalOpen(false); };

  const toggleShopStatus = (id, currentStatus) => setShopsData(shopsData.map(s => s.id === id ? { ...s, status: currentStatus === 'Active' ? 'Suspended' : 'Active' } : s));
  const handleEditShop = (e) => { e.preventDefault(); setShopsData(shopsData.map(s => s.id === editingShop.id ? editingShop : s)); setIsShopEditModalOpen(false); };

  const toggleRiderStatus = (id, currentStatus) => setRidersData(ridersData.map(r => r.id === id ? { ...r, status: currentStatus === 'Active' ? 'Suspended' : 'Active' } : r));
  const handleEditRider = (e) => { e.preventDefault(); setRidersData(ridersData.map(r => r.id === editingRider.id ? editingRider : r)); setIsRiderEditModalOpen(false); };

  return (
    <div className="admin-container">
      
      {/* --- SIDEBAR --- */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={logo} alt="Logo" className="admin-logo" />
          <h2>ADMIN PANEL</h2>
        </div>
        <ul className="admin-menu">
          <li className={activeMenu === 'dashboard' ? 'active' : ''} onClick={() => handleMenuClick('dashboard')}>📊 Dashboard Overview</li>
          <li className={activeMenu === 'users' ? 'active' : ''} onClick={() => handleMenuClick('users')}>👥 Manage Users</li>
          <li className={activeMenu === 'vendors' ? 'active' : ''} onClick={() => handleMenuClick('vendors')}>🏪 Manage Shops</li>
          <li className={activeMenu === 'riders' ? 'active' : ''} onClick={() => handleMenuClick('riders')}>🛵 Manage Riders</li>
          <li className={activeMenu === 'reports' ? 'active' : ''} onClick={() => handleMenuClick('reports')}>📈 Financial Reports</li>
        </ul>
        <div className="admin-logout-box"><button className="admin-logout-btn" onClick={handleLogout}>🚪 Log Out</button></div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)} Management</h1>
          <div className="admin-profile"><span className="admin-avatar">A</span><div className="admin-info"><strong>Admin User</strong><small>System Owner</small></div></div>
        </header>

        {/* --- DASHBOARD TAB --- */}
        {activeMenu === 'dashboard' && (
          <div className="admin-dashboard-content animate-fade">
            <div className="admin-stats-grid grid-2x2">
              <div className="stat-card blue-gradient"><h3>Total Revenue</h3><h2>₹45,280</h2><p>+12% from last week</p></div>
              <div className="stat-card orange-gradient"><h3>Total Orders</h3><h2>1,284</h2><p>48 pending today</p></div>
              <div className="stat-card green-gradient"><h3>Active Shops</h3><h2>24</h2><p>3 pending approval</p></div>
              <div className="stat-card purple-gradient"><h3>Active Riders</h3><h2>42</h2><p>8 currently online</p></div>
            </div>

            <div className="dashboard-split-layout">
              <div className="admin-table-container">
                <div className="table-header-row">
                  <h2>Recent Platform Orders</h2>
                </div>
                <table className="admin-table">
                  <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {transactionsData.slice(0, 4).map(txn => (
                      <tr key={txn.id}>
                        <td>{txn.orderId}</td>
                        <td><strong>{txn.customerName}</strong></td>
                        <td>₹{txn.total}</td>
                        <td><span className={`status-badge ${txn.status === 'Completed' ? 'green' : 'orange'}`}>{txn.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-table-container">
                <div className="table-header-row"><h2>System Alerts</h2></div>
                <div className="alert-box warning">
                  <strong>Pending Approval</strong>
                  <p>2 Shops and 1 Rider are waiting for verification.</p>
                </div>
                <div className="alert-box info" style={{marginTop: '15px'}}>
                  <strong>Top Shop Today</strong>
                  <p>Sparkle Clean Laundry completed 18 orders.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeMenu === 'users' && (
          <div className="admin-dashboard-content animate-fade">
            <div className="admin-header-actions">
              <div className="admin-search-bar"><span className="search-icon">🔍</span><input type="text" placeholder="Search users by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
              <button className="export-btn" onClick={handleExportCSV}>📥 Export CSV</button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>User ID</th><th>Customer Name</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td><td><strong>{u.name}</strong><br/><small>{u.email}</small></td>
                      <td><span className={`status-badge ${u.status === 'Active' ? 'green' : 'red'}`}>{u.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="view-btn" onClick={() => setViewingUser(u)} title="View Details">👁️</button>
                          <button className="edit-btn" onClick={() => { setEditingUser(u); setIsEditModalOpen(true); }} title="Edit">✏️</button>
                          <button className="ban-btn" onClick={() => toggleUserStatus(u.id, u.status)}>{u.status === 'Banned' ? '🔓' : '🚫'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="no-results">No users found matching "{searchTerm}"</div>}
            </div>
          </div>
        )}

        {/* --- VENDORS TAB --- */}
        {activeMenu === 'vendors' && (
          <div className="admin-dashboard-content animate-fade">
             <div className="admin-header-actions">
              <div className="admin-search-bar"><span className="search-icon">🔍</span><input type="text" placeholder="Search shops by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
              <button className="export-btn" onClick={handleExportCSV}>📥 Export CSV</button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Shop ID</th><th>Shop Name & Location</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredShops.map(shop => (
                    <tr key={shop.id}>
                      <td>{shop.id}</td><td><strong>{shop.name}</strong><br/><small>📍 {shop.location}</small></td>
                      <td><span className={`status-badge ${shop.status === 'Active' ? 'green' : shop.status === 'Suspended' ? 'red' : 'blue'}`}>{shop.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="view-btn" onClick={() => setViewingShop(shop)} title="View Analytics">👁️</button>
                          <button className="edit-btn" onClick={() => { setEditingShop(shop); setIsShopEditModalOpen(true); }} title="Edit">✏️</button>
                          <button className="ban-btn" onClick={() => toggleShopStatus(shop.id, shop.status)}>{shop.status === 'Pending' ? '✅' : '🛑'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredShops.length === 0 && <div className="no-results">No shops found matching "{searchTerm}"</div>}
            </div>
          </div>
        )}

        {/* --- RIDERS TAB --- */}
        {activeMenu === 'riders' && (
          <div className="admin-dashboard-content animate-fade">
             <div className="admin-header-actions">
              <div className="admin-search-bar"><span className="search-icon">🔍</span><input type="text" placeholder="Search riders by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
              <button className="export-btn" onClick={handleExportCSV}>📥 Export CSV</button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Rider ID</th><th>Rider Name</th><th>Assigned Zone</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredRiders.map(rider => (
                    <tr key={rider.id}>
                      <td>{rider.id}</td><td><strong>{rider.name}</strong><br/><small>📞 {rider.phone}</small></td>
                      <td><strong>📍 {rider.zone}</strong></td>
                      <td><span className={`status-badge ${rider.status === 'Active' ? 'green' : rider.status === 'Suspended' ? 'red' : 'blue'}`}>{rider.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="view-btn" onClick={() => setViewingRider(rider)} title="View Performance">👁️</button>
                          <button className="edit-btn" onClick={() => { setEditingRider(rider); setIsRiderEditModalOpen(true); }} title="Edit">✏️</button>
                          <button className="ban-btn" onClick={() => toggleRiderStatus(rider.id, rider.status)}>{rider.status === 'Pending' ? '✅' : '🛑'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRiders.length === 0 && <div className="no-results">No riders found matching "{searchTerm}"</div>}
            </div>
          </div>
        )}

        {/* ==========================================
            📈 FINANCIAL REPORTS TAB 
        ========================================== */}
        {activeMenu === 'reports' && (
          <div className="admin-dashboard-content animate-fade">
            
            {/* NEW: Time Filter Dropdown for the Top Stats */}
            <div className="financial-stats-header">
              <h2>Financial Overview</h2>
              <select 
                className="admin-filter-dropdown" 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="Overall">Overall / All Time</option>
                <option value="Yearly">This Year</option>
                <option value="Monthly">This Month</option>
              </select>
            </div>

            <div className="admin-stats-grid grid-2x2">
              <div className="stat-card" style={{background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0'}}>
                <h3 style={{color: '#64748b'}}>Customer Total Payments</h3>
                <h2 style={{color: '#0f172a'}}>₹{currentStats.total.toLocaleString()}</h2>
                <p style={{background: '#e2e8f0', color: '#475569'}}>Gross Volume Received</p>
              </div>
              <div className="stat-card" style={{background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa'}}>
                <h3 style={{color: '#ea580c'}}>Total Shop Payments</h3>
                <h2 style={{color: '#c2410c'}}>₹{currentStats.shop.toLocaleString()}</h2>
                <p style={{background: '#ffedd5', color: '#9a3412'}}>Owed to Vendors</p>
              </div>
              <div className="stat-card" style={{background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0'}}>
                <h3 style={{color: '#16a34a'}}>Total Rider Payments</h3>
                <h2 style={{color: '#15803d'}}>₹{currentStats.rider.toLocaleString()}</h2>
                <p style={{background: '#dcfce7', color: '#166534'}}>Owed to Drivers</p>
              </div>
              <div className="stat-card" style={{background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe'}}>
                <h3 style={{color: '#2563eb'}}>Quick Wash Profit</h3>
                <h2 style={{color: '#1d4ed8'}}>₹{currentStats.profit.toLocaleString()}</h2>
                <p style={{background: '#dbeafe', color: '#1e40af'}}>Net Income Retained</p>
              </div>
            </div>

            {/* LOWER SECTION: Search & Table Filter */}
            <div className="admin-header-actions" style={{ marginTop: '40px' }}>
              <div className="admin-actions-left" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: '#2b3674', fontSize: '1.3rem', marginRight: '10px' }}>Detailed Ledger</h2>
                <div className="admin-search-bar">
                  <span className="search-icon">🔍</span>
                  <input type="text" placeholder="Search Order ID or Shop..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                
                <select className="admin-filter-dropdown" value={financeFilter} onChange={(e) => setFinanceFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending Payout</option>
                </select>
              </div>

              <button className="export-btn" onClick={handleExportCSV}>📥 Export Finance CSV</button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>TXN ID</th><th>Order Ref</th><th>Customer & Shop</th><th>Customer Paid</th><th>Shop Pay</th><th>Rider Pay</th><th>Our Profit</th><th>Status</th></tr></thead>
                <tbody>
                  {filteredTransactions.map(txn => (
                    <tr key={txn.id}>
                      <td><strong>{txn.id}</strong></td>
                      <td><span style={{color: '#4318ff', fontWeight: 'bold'}}>{txn.orderId}</span></td>
                      <td><strong>{txn.customerName}</strong><br/><small>via {txn.shopName}</small></td>
                      <td><strong>₹{txn.total}</strong></td>
                      <td style={{color: '#ea580c'}}>₹{txn.shopCut}</td>
                      <td style={{color: '#16a34a'}}>₹{txn.riderCut}</td>
                      <td style={{color: '#2563eb', fontWeight: 'bold'}}>₹{txn.profit}</td>
                      <td><span className={`status-badge ${txn.status === 'Completed' ? 'green' : 'orange'}`}>{txn.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTransactions.length === 0 && <div className="no-results">No transactions match your search/filter.</div>}
            </div>
          </div>
        )}

      </main>

      {/* ==========================================
          DETAILED VIEW MODALS 
      ========================================== */}
      {viewingUser && (
        <div className="admin-modal-overlay" onClick={() => setViewingUser(null)}>
          <div className="admin-modal-box wide animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h2>Customer Profile: {viewingUser.name}</h2><button className="admin-close-modal-btn" onClick={() => setViewingUser(null)}>✕</button></div>
            <div className="profile-details-section"><p><strong>ID:</strong> {viewingUser.id} &nbsp;|&nbsp; <strong>Phone:</strong> {viewingUser.phone} &nbsp;|&nbsp; <strong>Email:</strong> {viewingUser.email}</p></div>
            <h3 className="stats-heading">Order History</h3>
            <div className="modal-stats-grid">
              <div className="modal-stat-box"><h4>Total Orders</h4><h2>{viewingUser.stats.totalOrders}</h2></div>
              <div className="modal-stat-box"><h4>Completed</h4><h2 style={{color: '#059669'}}>{viewingUser.stats.completed}</h2></div>
              <div className="modal-stat-box"><h4>Cancelled</h4><h2 style={{color: '#dc2626'}}>{viewingUser.stats.cancelled}</h2></div>
              <div className="modal-stat-box"><h4>Total Spent</h4><h2 style={{color: '#2563eb'}}>₹{viewingUser.stats.totalSpent}</h2></div>
            </div>
          </div>
        </div>
      )}

      {viewingShop && (
        <div className="admin-modal-overlay" onClick={() => setViewingShop(null)}>
          <div className="admin-modal-box wide animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h2>Shop Profile: {viewingShop.name}</h2><button className="admin-close-modal-btn" onClick={() => setViewingShop(null)}>✕</button></div>
            <div className="profile-details-section"><p><strong>Owner:</strong> {viewingShop.owner} &nbsp;|&nbsp; <strong>Phone:</strong> {viewingShop.phone} &nbsp;|&nbsp; <strong>Location:</strong> {viewingShop.location}</p></div>
            <h3 className="stats-heading">Order Performance</h3>
            <div className="modal-stats-grid">
              <div className="modal-stat-box"><h4>Total Requests</h4><h2>{viewingShop.stats.totalOrders}</h2></div>
              <div className="modal-stat-box"><h4>Accepted</h4><h2 style={{color: '#059669'}}>{viewingShop.stats.accepted}</h2></div>
              <div className="modal-stat-box"><h4>Rejected</h4><h2 style={{color: '#dc2626'}}>{viewingShop.stats.rejected}</h2></div>
              <div className="modal-stat-box"><h4>Pending Now</h4><h2 style={{color: '#d97706'}}>{viewingShop.stats.pending}</h2></div>
            </div>
            <h3 className="stats-heading">Financial Ledger</h3>
            <div className="modal-stats-grid">
              <div className="modal-stat-box"><h4>Total Earned</h4><h2 style={{color: '#4318ff'}}>₹{viewingShop.stats.totalEarned}</h2></div>
              <div className="modal-stat-box"><h4>Amount Withdrawn</h4><h2>₹{viewingShop.stats.withdrawn}</h2></div>
              <div className="modal-stat-box" style={{background: '#f0fdf4', borderColor: '#bbf7d0'}}><h4>Wallet Balance</h4><h2 style={{color: '#15803d'}}>₹{viewingShop.stats.walletBal}</h2></div>
            </div>
          </div>
        </div>
      )}

      {viewingRider && (
        <div className="admin-modal-overlay" onClick={() => setViewingRider(null)}>
          <div className="admin-modal-box wide animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h2>Rider Profile: {viewingRider.name}</h2><button className="admin-close-modal-btn" onClick={() => setViewingRider(null)}>✕</button></div>
            <div className="profile-details-section"><p><strong>Phone:</strong> {viewingRider.phone} &nbsp;|&nbsp; <strong>Assigned Zone:</strong> {viewingRider.zone}</p></div>
            <h3 className="stats-heading">Delivery Performance</h3>
            <div className="modal-stats-grid">
              <div className="modal-stat-box"><h4>Total Assigned</h4><h2>{viewingRider.stats.totalDeliveries}</h2></div>
              <div className="modal-stat-box"><h4>Completed</h4><h2 style={{color: '#059669'}}>{viewingRider.stats.accepted}</h2></div>
              <div className="modal-stat-box"><h4>Declined</h4><h2 style={{color: '#dc2626'}}>{viewingRider.stats.rejected}</h2></div>
              <div className="modal-stat-box"><h4>Active Now</h4><h2 style={{color: '#d97706'}}>{viewingRider.stats.pending}</h2></div>
            </div>
            <h3 className="stats-heading">Financial Ledger</h3>
            <div className="modal-stats-grid">
              <div className="modal-stat-box"><h4>Total Earned</h4><h2 style={{color: '#4318ff'}}>₹{viewingRider.stats.totalEarned}</h2></div>
              <div className="modal-stat-box"><h4>Amount Withdrawn</h4><h2>₹{viewingRider.stats.withdrawn}</h2></div>
              <div className="modal-stat-box" style={{background: '#f0fdf4', borderColor: '#bbf7d0'}}><h4>Wallet Balance</h4><h2 style={{color: '#15803d'}}>₹{viewingRider.stats.walletBal}</h2></div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          EDIT MODALS
      ========================================== */}
      {isEditModalOpen && editingUser && (<div className="admin-modal-overlay" onClick={() => setIsEditModalOpen(false)}><div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}><div className="admin-modal-header"><h2>Edit User</h2><button className="admin-close-modal-btn" onClick={() => setIsEditModalOpen(false)}>✕</button></div><form onSubmit={handleEditUser} className="admin-edit-form"><div className="admin-form-group"><label>Name</label><input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} required /></div><div className="admin-form-group"><label>Email</label><input type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} required /></div><div className="admin-form-group"><label>Status</label><select value={editingUser.status} onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}><option value="Active">Active</option><option value="Banned">Banned</option></select></div><div className="admin-modal-actions"><button type="submit" className="admin-save-btn">Save Changes</button></div></form></div></div>)}
      {isShopEditModalOpen && editingShop && (<div className="admin-modal-overlay" onClick={() => setIsShopEditModalOpen(false)}><div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}><div className="admin-modal-header"><h2>Edit Shop</h2><button className="admin-close-modal-btn" onClick={() => setIsShopEditModalOpen(false)}>✕</button></div><form onSubmit={handleEditShop} className="admin-edit-form"><div className="admin-form-group"><label>Shop Name</label><input type="text" value={editingShop.name} onChange={(e) => setEditingShop({...editingShop, name: e.target.value})} required /></div><div className="admin-form-group"><label>Location</label><input type="text" value={editingShop.location} onChange={(e) => setEditingShop({...editingShop, location: e.target.value})} required /></div><div className="admin-form-group"><label>Status</label><select value={editingShop.status} onChange={(e) => setEditingShop({...editingShop, status: e.target.value})}><option value="Active">Active</option><option value="Pending">Pending</option><option value="Suspended">Suspended</option></select></div><div className="admin-modal-actions"><button type="submit" className="admin-save-btn">Save Changes</button></div></form></div></div>)}
      {isRiderEditModalOpen && editingRider && (<div className="admin-modal-overlay" onClick={() => setIsRiderEditModalOpen(false)}><div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}><div className="admin-modal-header"><h2>Edit Rider</h2><button className="admin-close-modal-btn" onClick={() => setIsRiderEditModalOpen(false)}>✕</button></div><form onSubmit={handleEditRider} className="admin-edit-form"><div className="admin-form-group"><label>Rider Name</label><input type="text" value={editingRider.name} onChange={(e) => setEditingRider({...editingRider, name: e.target.value})} required /></div><div className="admin-form-group"><label>Zone</label><input type="text" value={editingRider.zone} onChange={(e) => setEditingRider({...editingRider, zone: e.target.value})} required /></div><div className="admin-form-group"><label>Status</label><select value={editingRider.status} onChange={(e) => setEditingRider({...editingRider, status: e.target.value})}><option value="Active">Active</option><option value="Pending">Pending</option><option value="Suspended">Suspended</option></select></div><div className="admin-modal-actions"><button type="submit" className="admin-save-btn">Save Changes</button></div></form></div></div>)}
    </div>
  );
};

export default AdminDashboard;