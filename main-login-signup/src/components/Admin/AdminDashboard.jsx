import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import logo from '../assets/quickwash-logo.png';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- FINANCIAL FILTERS ---
  const [financeFilter, setFinanceFilter] = useState('All'); 
  // We keep timeFilter for the "Reports" tab, but remove it from the main Dashboard!
  const [timeFilter, setTimeFilter] = useState('Overall'); 

  // ==========================================
  // 👥 MOCK DATA
  // ==========================================
  const [usersData, setUsersData] = useState([
    { 
      id: "U-1001", name: "Tanvi G Poojary", email: "tanvijipoojary@gmail.com", phone: "+91 7353863409", status: "Active", joined: "Jan 12, 2026", 
      stats: { totalOrders: 12, completed: 10, cancelled: 1, pending: 1, totalSpent: 4250 },
      orderHistory: [
        { id: "#ORD-9924", date: "Feb 24, 2026", shop: "Elite Dry Cleaners", amount: 890, status: "Completed" },
        { id: "#ORD-9850", date: "Feb 18, 2026", shop: "Sparkle Clean Laundry", amount: 450, status: "Completed" },
        { id: "#ORD-9801", date: "Feb 10, 2026", shop: "Elite Dry Cleaners", amount: 1200, status: "Completed" }
      ]
    },
    { 
      id: "U-1002", name: "Rahul M.", email: "rahul.m@example.com", phone: "+91 9876543211", status: "Active", joined: "Feb 03, 2026", 
      stats: { totalOrders: 5, completed: 5, cancelled: 0, pending: 0, totalSpent: 1800 },
      orderHistory: [
        { id: "#ORD-9921", date: "Feb 26, 2026", shop: "Sparkle Clean Laundry", amount: 340, status: "Pending" },
        { id: "#ORD-9905", date: "Feb 20, 2026", shop: "Quick Wash Hub", amount: 260, status: "Completed" }
      ]
    },
    { 
      id: "U-1003", name: "Sneha Rao", email: "sneha.rao88@gmail.com", phone: "+91 9123456780", status: "Active", joined: "Feb 15, 2026", 
      stats: { totalOrders: 2, completed: 2, cancelled: 0, pending: 0, totalSpent: 650 },
      orderHistory: [
        { id: "#ORD-9888", date: "Feb 16, 2026", shop: "Ocean Fresh Laundry", amount: 650, status: "Completed" }
      ]
    },
    { 
      id: "U-1004", name: "Vikram Singh", email: "vikram.s@outlook.com", phone: "+91 8888899999", status: "Banned", joined: "Dec 05, 2025", 
      stats: { totalOrders: 0, completed: 0, cancelled: 3, pending: 0, totalSpent: 0 },
      orderHistory: [
        { id: "#ORD-9102", date: "Jan 05, 2026", shop: "Sparkle Clean Laundry", amount: 500, status: "Cancelled" },
        { id: "#ORD-9055", date: "Dec 20, 2025", shop: "Elite Dry Cleaners", amount: 800, status: "Cancelled" }
      ]
    },
  ]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null); 

  const [shopsData, setShopsData] = useState([
    { 
      id: "S-2001", name: "Sparkle Clean Laundry", owner: "Ramesh M.", phone: "+91 8888811111", location: "City Centre", rating: 4.8, status: "Active", 
      stats: { totalOrders: 450, accepted: 430, rejected: 10, pending: 10, totalEarned: 125000, withdrawn: 105000, walletBal: 20000 },
      recentOrders: [
        { id: "#ORD-9921", date: "Feb 26, 2026", customer: "Rahul M.", amount: 270, status: "Completed" }
      ],
      documents: null // Already verified
    },
    { 
      id: "S-2002", name: "Ocean Fresh Laundry", owner: "Vikram S.", phone: "+91 8888844444", location: "Surathkal", rating: "N/A", status: "Pending", 
      stats: { totalOrders: 0, accepted: 0, rejected: 0, pending: 0, totalEarned: 0, withdrawn: 0, walletBal: 0 },
      recentOrders: [],
      // MOCK UPLOADED DOCUMENTS
      documents: {
        gst: "GST_Certificate_2002.pdf",
        shopAct: "Shop_Establishment_2002.pdf",
        aadhaar: "Owner_Aadhaar.jpg",
        pan: "Owner_PAN.jpg",
        cheque: "Cancelled_Cheque.jpg"
      }
    }
  ]);

  // NEW: State for the Document Review Modal
  const [reviewingShop, setReviewingShop] = useState(null);
  const [isShopEditModalOpen, setIsShopEditModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [viewingShop, setViewingShop] = useState(null);

  const handleApproveShop = (id) => {
    setShopsData(shopsData.map(s => s.id === id ? { ...s, status: 'Active' } : s));
    setReviewingShop(null);
    alert("✅ Shop approved successfully! They can now receive orders.");
  };

  // --- RIDER KYC HANDLERS ---
  const handleApproveRider = (id) => {
    setRidersData(ridersData.map(r => r.id === id ? { ...r, status: 'Active' } : r));
    setReviewingRider(null);
    alert("✅ Rider approved successfully! They can now accept tasks.");
  };

  const handleRejectRider = (id) => {
    setRidersData(ridersData.map(r => r.id === id ? { ...r, status: 'Suspended' } : r));
    setReviewingRider(null);
    alert("❌ Rider application rejected.");
  };

  const handleRejectShop = (id) => {
    setShopsData(shopsData.map(s => s.id === id ? { ...s, status: 'Suspended' } : s));
    setReviewingShop(null);
    alert("❌ Shop application rejected.");
  };
 

  const [ridersData, setRidersData] = useState([
    { 
      id: "R-3001", name: "Kiran Kumar", phone: "+91 9999911111", zone: "Bejai & Kadri", rating: 4.7, status: "Active", 
      stats: { totalTasks: 140, completed: 135, declined: 3, active: 2, totalEarned: 14000, withdrawn: 12000, walletBal: 2000 },
      recentTasks: [
        { id: "#ORD-9921", date: "Feb 26, 2026", taskType: "📥 Customer Pickup", location: "Rahul M. (Home)", amount: 40, status: "Completed" },
        { id: "#ORD-9921", date: "Feb 26, 2026", taskType: "🏪 Shop Drop-off", location: "Sparkle Clean Laundry", amount: 20, status: "Pending" },
        { id: "#ORD-9850", date: "Feb 18, 2026", taskType: "🚚 Customer Delivery", location: "Tanvi G. (Home)", amount: 45, status: "Completed" }
      ],
      vehicleInfo: { make: "TVS Jupiter", plate: "KA 19 MA 9090" },
      documents: null // Already verified
    },
    { 
      id: "R-3004", name: "Ravi Naik", phone: "+91 9999944444", zone: "Kuloor", rating: "N/A", status: "Pending", 
      stats: { totalTasks: 0, completed: 0, declined: 0, active: 0, totalEarned: 0, withdrawn: 0, walletBal: 0 },
      recentTasks: [],
      // MOCK UPLOADED RIDER DOCUMENTS
      vehicleInfo: { make: "Honda Activa 6G", plate: "KA 19 AB 1234" },
      documents: { dl: "DL_FrontBack.jpg", insurance: "Vehicle_Insurance.pdf", aadhaar: "Rider_Aadhaar.jpg", pan: "Rider_PAN.jpg" }
    },
    { 
      id: "R-3005", name: "Suresh Shetty", phone: "+91 8888855555", zone: "Surathkal", rating: 4.9, status: "Active", 
      stats: { totalTasks: 320, completed: 310, declined: 5, active: 5, totalEarned: 32000, withdrawn: 30000, walletBal: 2000 },
      recentTasks: [
        { id: "#ORD-9888", date: "Feb 16, 2026", taskType: "🛍️ Shop Pickup", location: "Ocean Fresh Laundry", amount: 30, status: "Completed" },
        { id: "#ORD-9888", date: "Feb 16, 2026", taskType: "🚚 Customer Delivery", location: "Sneha Rao (Home)", amount: 50, status: "Completed" }
      ],
      vehicleInfo: { make: "Hero Splendor", plate: "KA 19 CD 5678" },
      documents: null
    }
  ]);

  // Modals specific to Riders
  const [viewingRider, setViewingRider] = useState(null);       // For viewing details/history
  const [editingRider, setEditingRider] = useState(null);       // For editing basic info
  const [isRiderEditModalOpen, setIsRiderEditModalOpen] = useState(false);
  const [reviewingRider, setReviewingRider] = useState(null);   // For KYC approval

  const [transactionsData] = useState([
    { id: "TXN-901", date: "Feb 26, 2026", orderId: "#ORD-9921", customerName: "Rahul M.", shopName: "Sparkle Clean Laundry", total: 340, shopCut: 270, riderCut: 40, profit: 30, status: "Completed" },
    { id: "TXN-902", date: "Feb 25, 2026", orderId: "#ORD-9922", customerName: "Priya S.", shopName: "Quick Wash Hub", total: 120, shopCut: 95, riderCut: 15, profit: 10, status: "Pending Payout" },
    { id: "TXN-903", date: "Feb 25, 2026", orderId: "#ORD-9923", customerName: "Amit K.", shopName: "Ocean Fresh Laundry", total: 450, shopCut: 360, riderCut: 50, profit: 40, status: "Completed" },
    { id: "TXN-904", date: "Feb 24, 2026", orderId: "#ORD-9924", customerName: "Tanvi G.", shopName: "Elite Dry Cleaners", total: 890, shopCut: 710, riderCut: 80, profit: 100, status: "Completed" }
  ]);

  // --- ADMIN PROFILE STATE ---
// --- ADMIN PROFILE & BANKING STATE ---
  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin User',
    email: 'admin@quickwash.com',
    phone: '+91 9988776655',
    role: 'System Owner',
    joined: 'Nov 15, 2025',
    // Array to hold multiple saved accounts
    savedAccounts: [
      { id: 1, bankName: 'HDFC Bank', accountName: 'Quick Wash Corporate', accountNumber: '50100234891234', ifscCode: 'HDFC0001234' }
    ]
  });

  // State for adding a new bank account
  const [newAccount, setNewAccount] = useState({ bankName: '', accountName: '', accountNumber: '', ifscCode: '' });

  const handleAddAccount = (e) => {
    e.preventDefault();
    const newId = Date.now(); // Generate a unique ID
    setAdminProfile(prev => ({
      ...prev,
      savedAccounts: [...prev.savedAccounts, { id: newId, ...newAccount }]
    }));
    setNewAccount({ bankName: '', accountName: '', accountNumber: '', ifscCode: '' }); // Clear the form
    alert('🏦 New bank account saved successfully!');
  };

  const handleDeleteAccount = (id) => {
    if(window.confirm('Are you sure you want to remove this bank account?')) {
      setAdminProfile(prev => ({
        ...prev,
        savedAccounts: prev.savedAccounts.filter(acc => acc.id !== id)
      }));
    }
  };

  // For the Reports Tab
// --- PLATFORM FINANCE STATE ---
  const [financialStats, setFinancialStats] = useState({
    Overall: { total: 1800, shop: 1435, rider: 185, profit: 180, withdrawn: 0 },
    Yearly: { total: 24500, shop: 19600, rider: 2450, profit: 2450, withdrawn: 1000 },
    Monthly: { total: 3200, shop: 2560, rider: 320, profit: 320, withdrawn: 0 }
  });
  const currentStats = financialStats[timeFilter];

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Get Today's Date formatted nicely
  const todayDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  // --- HANDLERS ---
  const handleLogout = () => { navigate('/'); };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    
    if (amount <= 0 || isNaN(amount)) {
      alert("Please enter a valid amount.");
      return;
    }
    if (amount > currentStats.profit) {
      alert("Insufficient funds. You cannot withdraw more than the available profit.");
      return;
    }

    // Deduct from profit and add to withdrawn
    setFinancialStats(prev => ({
      ...prev,
      [timeFilter]: {
        ...prev[timeFilter],
        profit: prev[timeFilter].profit - amount,
        withdrawn: prev[timeFilter].withdrawn + amount
      }
    }));

    alert(`✅ Successfully transferred ₹${amount.toLocaleString()} to Corporate Bank Account.`);
    setIsWithdrawModalOpen(false);
    setWithdrawAmount('');
  };
  
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
          {/* NEW: Admin Profile Tab */}
          <li className={activeMenu === 'profile' ? 'active' : ''} onClick={() => handleMenuClick('profile')}>⚙️ My Profile</li>
        </ul>
        <div className="admin-logout-box"><button className="admin-logout-btn" onClick={handleLogout}>🚪 Log Out</button></div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeMenu === 'profile' ? 'My Profile' : activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1) + ' Management'}</h1>
          
          {/* Made this clickable to go to the profile tab! */}
          <div className="admin-profile" style={{ cursor: 'pointer' }} onClick={() => handleMenuClick('profile')}>
            <span className="admin-avatar">{adminProfile.name.charAt(0)}</span>
            <div className="admin-info">
              <strong>{adminProfile.name}</strong>
              <small>{adminProfile.role}</small>
            </div>
          </div>
        </header>

        {/* ==========================================
            ADMIN PROFILE TAB
        ========================================== */}
        {activeMenu === 'profile' && (
          <div className="admin-dashboard-content animate-fade">
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '25px' }}>
              
              {/* LEFT COLUMN: Profile Display Card */}
              <div style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', alignSelf: 'start' }}>
                 <div style={{ 
                   width: '100px', height: '100px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', 
                   fontSize: '3.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                   margin: '0 auto 15px auto', border: '4px solid #bfdbfe' 
                 }}>
                   {adminProfile.name.charAt(0)}
                 </div>
                 <h2 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{adminProfile.name}</h2>
                 <p style={{ margin: '0 0 15px 0', color: '#2563eb', fontWeight: 'bold', background: '#eff6ff', display: 'inline-block', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>
                   {adminProfile.role}
                 </p>
                 
                 <div style={{ textAlign: 'left', marginTop: '20px', fontSize: '0.9rem', color: '#475569', lineHeight: '2' }}>
                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}><strong>📧 Email:</strong><br/>{adminProfile.email}</div>
                    <div style={{ borderBottom: '1px solid #f1f5f9', padding: '8px 0' }}><strong>📞 Phone:</strong><br/>{adminProfile.phone}</div>
                    <div style={{ paddingTop: '8px' }}><strong>📅 Joined:</strong><br/>{adminProfile.joined}</div>
                 </div>
              </div>

              {/* RIGHT COLUMN: Edit Forms */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                
                {/* Update Details Form */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', fontSize: '1.2rem' }}>Personal Information</h3>
                  
                  <form onSubmit={(e) => { e.preventDefault(); alert('✅ Profile details updated successfully!'); }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Full Name</label>
                      <input type="text" value={adminProfile.name} onChange={e => setAdminProfile({...adminProfile, name: e.target.value})} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}/>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Phone Number</label>
                      <input type="tel" value={adminProfile.phone} onChange={e => setAdminProfile({...adminProfile, phone: e.target.value})} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}/>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Email Address</label>
                      <input type="email" value={adminProfile.email} onChange={e => setAdminProfile({...adminProfile, email: e.target.value})} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}/>
                    </div>
                    
                    <div style={{ gridColumn: 'span 2', textAlign: 'right', marginTop: '10px' }}>
                      <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' }}>
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>

                {/* Change Password Form */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', fontSize: '1.2rem' }}>Security & Password</h3>
                  
                  <form onSubmit={(e) => { e.preventDefault(); alert('🔒 Password changed successfully!'); e.target.reset(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Current Password</label>
                      <input type="password" required placeholder="Enter current password" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}/>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>New Password</label>
                        <input type="password" required placeholder="Min 8 characters" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}/>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Confirm New Password</label>
                        <input type="password" required placeholder="Repeat new password" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}/>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right', marginTop: '10px' }}>
                      <button type="submit" style={{ background: '#0f172a', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' }}>
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>

                {/* --- SAVED ACCOUNTS WALLET --- */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', fontSize: '1.2rem' }}>Saved Corporate Accounts</h3>
                  
                  {/* Display Saved Accounts */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                    {adminProfile.savedAccounts.length > 0 ? (
                      adminProfile.savedAccounts.map(acc => (
                        <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                          <div>
                            <strong style={{ color: '#0f172a', display: 'block', fontSize: '1rem' }}>{acc.bankName}</strong>
                            <span style={{ color: '#475569', fontSize: '0.85rem' }}>{acc.accountName} •••• {acc.accountNumber.slice(-4)}</span>
                          </div>
                          <button onClick={() => handleDeleteAccount(acc.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
                            Remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '15px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        No saved accounts. Please add one below to enable withdrawals.
                      </div>
                    )}
                  </div>

                  <h4 style={{ margin: '0 0 15px 0', color: '#475569', fontSize: '1rem' }}>+ Add New Bank Account</h4>
                  <form onSubmit={handleAddAccount} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Bank Name</label>
                      <input type="text" value={newAccount.bankName} onChange={e => setNewAccount({...newAccount, bankName: e.target.value})} required placeholder="e.g., SBI Bank" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}/>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Account Holder</label>
                      <input type="text" value={newAccount.accountName} onChange={e => setNewAccount({...newAccount, accountName: e.target.value})} required placeholder="Quick Wash LLC" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}/>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Account Number</label>
                      <input type="password" value={newAccount.accountNumber} onChange={e => setNewAccount({...newAccount, accountNumber: e.target.value})} required placeholder="Enter A/C Number" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}/>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>IFSC Code</label>
                      <input type="text" value={newAccount.ifscCode} onChange={e => setNewAccount({...newAccount, ifscCode: e.target.value.toUpperCase()})} required placeholder="e.g., SBIN0001234" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', textTransform: 'uppercase' }}/>
                    </div>
                    
                    <div style={{ gridColumn: 'span 2', textAlign: 'right', marginTop: '10px' }}>
                      <button type="submit" style={{ background: '#16a34a', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' }}>
                        Save Account
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
            
          </div>
        )}

        {/* ==========================================
            DASHBOARD TAB (Strictly Daily Report)
        ========================================== */}
        {activeMenu === 'dashboard' && (
          <div className="admin-dashboard-content animate-fade">
            
            <div className="financial-stats-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Daily Report</h2>
              <div style={{ background: '#e2e8f0', color: '#334155', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                📅 {todayDate}
              </div>
            </div>

            <div className="admin-stats-grid grid-2x2">
              <div className="stat-card blue-gradient"><h3>Today's Revenue</h3><h2>₹3,240</h2><p>+5% from yesterday</p></div>
              <div className="stat-card orange-gradient"><h3>Today's Orders</h3><h2>48</h2><p>12 pending right now</p></div>
              <div className="stat-card green-gradient"><h3>Shops Online</h3><h2>22</h2><p>2 currently offline</p></div>
              <div className="stat-card purple-gradient"><h3>Riders Online</h3><h2>18</h2><p>Out of 42 total riders</p></div>
            </div>

            {/* LOWER SECTION: Today's Ledger */}
            <div className="admin-header-actions" style={{ marginTop: '40px' }}>
              <div className="admin-actions-left" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: '#2b3674', fontSize: '1.3rem', marginRight: '10px' }}>Today's Ledger</h2>
                <div className="admin-search-bar">
                  <span className="search-icon">🔍</span>
                  <input type="text" placeholder="Search Order ID or Shop..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="admin-filter-dropdown" value={financeFilter} onChange={(e) => setFinanceFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending Payout">Pending Payout</option>
                </select>
              </div>
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

        {/* --- USERS TAB --- */}
        {activeMenu === 'users' && (
          <div className="admin-dashboard-content animate-fade">
            
            {/* Quick User Stats (Professional Touch) */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
              <div style={{ background: 'white', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Customers</h3>
                <h2 style={{ margin: '5px 0 0 0', color: '#0f172a', fontSize: '1.8rem' }}>{usersData.length}</h2>
              </div>
              <div style={{ background: 'white', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Active Accounts</h3>
                <h2 style={{ margin: '5px 0 0 0', color: '#16a34a', fontSize: '1.8rem' }}>{usersData.filter(u => u.status === 'Active').length}</h2>
              </div>
              <div style={{ background: 'white', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Banned Users</h3>
                <h2 style={{ margin: '5px 0 0 0', color: '#dc2626', fontSize: '1.8rem' }}>{usersData.filter(u => u.status === 'Banned').length}</h2>
              </div>
            </div>

            <div className="admin-header-actions">
              <div className="admin-search-bar" style={{ flex: '1', maxWidth: '400px' }}>
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search by name, email, or phone..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <button className="export-btn" onClick={handleExportCSV}>📥 Export CSV</button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer Profile</th>
                    <th>Contact Information</th>
                    <th>Engagement Metrics</th>
                    <th>Joined Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      
                      {/* Avatar & Name Column */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '40px', height: '40px', borderRadius: '50%', background: '#eff6ff', 
                            color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontWeight: 'bold', fontSize: '1.1rem', border: '1px solid #bfdbfe' 
                          }}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.95rem' }}>{u.name}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info Column */}
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                          <div><strong style={{ color: '#94a3b8' }}>✉</strong> {u.email}</div>
                          <div><strong style={{ color: '#94a3b8' }}>📞</strong> {u.phone}</div>
                        </div>
                      </td>

                      {/* Lifetime Value Column */}
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                          <div><strong>Orders:</strong> {u.stats.totalOrders}</div>
                          <div><strong>Lifetime Spend:</strong> <span style={{ color: '#059669', fontWeight: 'bold' }}>₹{u.stats.totalSpent.toLocaleString()}</span></div>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td><span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>{u.joined}</span></td>
                      
                      {/* Status */}
                      <td><span className={`status-badge ${u.status === 'Active' ? 'green' : 'red'}`}>{u.status}</span></td>
                      
                      {/* Actions */}
                      <td>
                        <div className="action-buttons">
                          <button className="view-btn" onClick={() => setViewingUser(u)} title="Full Analytics">👁️</button>
                          <button className="edit-btn" onClick={() => { setEditingUser(u); setIsEditModalOpen(true); }} title="Edit Profile">✏️</button>
                          <button className="ban-btn" onClick={() => toggleUserStatus(u.id, u.status)} title={u.status === 'Banned' ? 'Unban Account' : 'Ban Account'}>
                            {u.status === 'Banned' ? '🔓' : '🚫'}
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="no-results" style={{ padding: '40px', color: '#64748b' }}>No customers found matching "{searchTerm}"</div>}
            </div>
          </div>
        )}

        {/* --- VENDORS TAB --- */}
        {activeMenu === 'vendors' && (
          <div className="admin-dashboard-content animate-fade">
            
            {/* Quick Shop Stats */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
              <div style={{ background: 'white', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Partner Shops</h3>
                <h2 style={{ margin: '5px 0 0 0', color: '#0f172a', fontSize: '1.8rem' }}>{shopsData.length}</h2>
              </div>
              <div style={{ background: 'white', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Active Shops</h3>
                <h2 style={{ margin: '5px 0 0 0', color: '#16a34a', fontSize: '1.8rem' }}>{shopsData.filter(s => s.status === 'Active').length}</h2>
              </div>
              <div style={{ background: 'white', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Pending Approvals</h3>
                <h2 style={{ margin: '5px 0 0 0', color: '#d97706', fontSize: '1.8rem' }}>{shopsData.filter(s => s.status === 'Pending').length}</h2>
              </div>
            </div>

            <div className="admin-header-actions">
              <div className="admin-search-bar" style={{ flex: '1', maxWidth: '400px' }}>
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search shops by name or location..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <button className="export-btn" onClick={handleExportCSV}>📥 Export CSV</button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Shop Profile</th>
                    <th>Owner Details</th>
                    <th>Performance</th>
                    <th>Wallet Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShops.map(shop => (
                    <tr key={shop.id}>
                      
                      {/* Avatar & Name Column (Styled in Vendor Green) */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '40px', height: '40px', borderRadius: '8px', background: '#f0fdf4', 
                            color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontWeight: 'bold', fontSize: '1.1rem', border: '1px solid #bbf7d0' 
                          }}>
                            {shop.name.charAt(0)}
                          </div>
                          <div>
                            <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.95rem' }}>{shop.name}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>📍 {shop.location}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info Column */}
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                          <div><strong style={{ color: '#94a3b8' }}>👤</strong> {shop.owner}</div>
                          <div><strong style={{ color: '#94a3b8' }}>📞</strong> {shop.phone}</div>
                        </div>
                      </td>

                      {/* Performance Column */}
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                          <div><strong>Orders:</strong> {shop.stats.totalOrders}</div>
                          <div><strong>Rating:</strong> <span style={{ color: '#d97706', fontWeight: 'bold' }}>⭐ {shop.rating}</span></div>
                        </div>
                      </td>

                      {/* Financials */}
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                          <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: '1rem' }}>₹{shop.stats.walletBal.toLocaleString()}</span>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lifetime: ₹{shop.stats.totalEarned.toLocaleString()}</div>
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td><span className={`status-badge ${shop.status === 'Active' ? 'green' : shop.status === 'Suspended' ? 'red' : 'blue'}`}>{shop.status}</span></td>
                      
                      {/* Actions */}
                      <td>
                        <div className="action-buttons">
                          <button className="view-btn" onClick={() => setViewingShop(shop)} title="View Analytics & Orders">👁️</button>
                          <button className="edit-btn" onClick={() => { setEditingShop(shop); setIsShopEditModalOpen(true); }} title="Edit Details">✏️</button>
                          
                          {/* NEW: Verification Logic */}
                          {shop.status === 'Pending' ? (
                            <button 
                              style={{ background: '#d97706', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} 
                              onClick={() => setReviewingShop(shop)} 
                              title="Review KYC Documents"
                            >
                              📋 Review KYC
                            </button>
                          ) : (
                            <button className="ban-btn" onClick={() => toggleShopStatus(shop.id, shop.status)} title="Suspend Shop">
                              {shop.status === 'Suspended' ? '🔓 Unsuspend' : '🛑 Suspend'}
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredShops.length === 0 && <div className="no-results" style={{ padding: '40px', color: '#64748b' }}>No shops found matching "{searchTerm}"</div>}
            </div>
          </div>
        )}

        {/* --- RIDERS TAB --- */}
        {activeMenu === 'riders' && (
          <div className="admin-dashboard-content animate-fade">
            
            {/* Quick Rider Stats */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
              <div style={{ background: 'white', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Fleet</h3>
                <h2 style={{ margin: '5px 0 0 0', color: '#0f172a', fontSize: '1.8rem' }}>{ridersData.length}</h2>
              </div>
              <div style={{ background: 'white', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Active Riders</h3>
                <h2 style={{ margin: '5px 0 0 0', color: '#16a34a', fontSize: '1.8rem' }}>{ridersData.filter(r => r.status === 'Active').length}</h2>
              </div>
              <div style={{ background: 'white', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Pending Approvals</h3>
                <h2 style={{ margin: '5px 0 0 0', color: '#d97706', fontSize: '1.8rem' }}>{ridersData.filter(r => r.status === 'Pending').length}</h2>
              </div>
            </div>

            <div className="admin-header-actions">
              <div className="admin-search-bar" style={{ flex: '1', maxWidth: '400px' }}>
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search riders by name, phone, or zone..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <button className="export-btn" onClick={handleExportCSV}>📥 Export CSV</button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Rider Profile</th>
                    <th>Contact & Zone</th>
                    <th>Task Performance</th>
                    <th>Wallet Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRiders.map(rider => (
                    <tr key={rider.id}>
                      
                      {/* Avatar & Name */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', border: '1px solid #fed7aa' }}>
                            {rider.name.charAt(0)}
                          </div>
                          <div>
                            <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.95rem' }}>{rider.name}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{rider.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Zone */}
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                          <div><strong style={{ color: '#94a3b8' }}>📞</strong> {rider.phone}</div>
                          <div><strong style={{ color: '#94a3b8' }}>📍</strong> {rider.zone}</div>
                        </div>
                      </td>

                      {/* Performance */}
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                          <div><strong>Tasks:</strong> {rider.stats.totalTasks}</div>
                          <div><strong>Rating:</strong> <span style={{ color: '#d97706', fontWeight: 'bold' }}>⭐ {rider.rating}</span></div>
                        </div>
                      </td>

                      {/* Financials */}
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                          <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: '1rem' }}>₹{rider.stats.walletBal.toLocaleString()}</span>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lifetime: ₹{rider.stats.totalEarned.toLocaleString()}</div>
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td><span className={`status-badge ${rider.status === 'Active' ? 'green' : rider.status === 'Suspended' ? 'red' : 'blue'}`}>{rider.status}</span></td>
                      
                      {/* Actions */}
                      <td>
                        <div className="action-buttons">
                          <button className="view-btn" onClick={() => setViewingRider(rider)} title="View Analytics & Tasks">👁️</button>
                          <button className="edit-btn" onClick={() => { setEditingRider(rider); setIsRiderEditModalOpen(true); }} title="Edit Details">✏️</button>
                          
                          {/* KYC Verification Button */}
                          {rider.status === 'Pending' ? (
                            <button style={{ background: '#d97706', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setReviewingRider(rider)} title="Review KYC Documents">
                              📋 Review KYC
                            </button>
                          ) : (
                            <button className="ban-btn" onClick={() => toggleRiderStatus(rider.id, rider.status)} title="Suspend Rider">
                              {rider.status === 'Suspended' ? '🔓 Unsuspend' : '🛑 Suspend'}
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRiders.length === 0 && <div className="no-results" style={{ padding: '40px', color: '#64748b' }}>No riders found matching "{searchTerm}"</div>}
            </div>
          </div>
        )}

        {/* --- REPORTS TAB --- */}
        {activeMenu === 'reports' && (
          <div className="admin-dashboard-content animate-fade">
            
            <div className="financial-stats-header">
              <h2>Deep Financial Overview</h2>
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
                <h3 style={{color: '#64748b'}}>Customer Total Payments</h3><h2 style={{color: '#0f172a'}}>₹{currentStats.total.toLocaleString()}</h2><p style={{background: '#e2e8f0', color: '#475569'}}>Gross Volume Received</p>
              </div>
              <div className="stat-card" style={{background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa'}}>
                <h3 style={{color: '#ea580c'}}>Total Shop Payments</h3><h2 style={{color: '#c2410c'}}>₹{currentStats.shop.toLocaleString()}</h2><p style={{background: '#ffedd5', color: '#9a3412'}}>Owed to Vendors</p>
              </div>
              <div className="stat-card" style={{background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0'}}>
                <h3 style={{color: '#16a34a'}}>Total Rider Payments</h3><h2 style={{color: '#15803d'}}>₹{currentStats.rider.toLocaleString()}</h2><p style={{background: '#dcfce7', color: '#166534'}}>Owed to Drivers</p>
              </div>
              <div className="stat-card" style={{background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <div>
                  <h3 style={{color: '#2563eb'}}>Quick Wash Profit (Available)</h3>
                  <h2 style={{color: '#1d4ed8', fontSize: '2.2rem'}}>₹{currentStats.profit.toLocaleString()}</h2>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 'bold' }}>Withdrawn: ₹{currentStats.withdrawn.toLocaleString()}</span>
                  <button 
                    onClick={() => setIsWithdrawModalOpen(true)}
                    style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                  >
                    💸 Withdraw
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-header-actions">
              <div className="admin-actions-left" style={{ display: 'flex', gap: '15px' }}>
                <div className="admin-search-bar"><span className="search-icon">🔍</span><input type="text" placeholder="Search Order ID or Shop..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                
                <select className="admin-filter-dropdown" value={financeFilter} onChange={(e) => setFinanceFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending Payout">Pending Payout</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="export-btn" onClick={handleExportCSV}>📥 Export Finance CSV</button>
              </div>
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
              {filteredTransactions.length === 0 && <div className="no-results">No transactions found matching "{searchTerm}"</div>}
            </div>
          </div>
        )}

      </main>

      {/* ==========================================
          DETAILED VIEW MODALS 
      ========================================== */}
      {viewingUser && (
        <div className="admin-modal-overlay" onClick={() => setViewingUser(null)}>
          {/* Added max-height and overflow-y to make the modal scrollable if they have lots of orders */}
          <div className="admin-modal-box wide animate-scale-up" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Customer Profile: {viewingUser.name}</h2>
              <button className="admin-close-modal-btn" onClick={() => setViewingUser(null)}>✕</button>
            </div>
            
            <div className="profile-details-section">
              <p><strong>ID:</strong> {viewingUser.id} &nbsp;|&nbsp; <strong>Phone:</strong> {viewingUser.phone} &nbsp;|&nbsp; <strong>Email:</strong> {viewingUser.email}</p>
            </div>
            
            <h3 className="stats-heading">Lifetime Stats</h3>
            <div className="modal-stats-grid">
              <div className="modal-stat-box"><h4>Total Orders</h4><h2>{viewingUser.stats.totalOrders}</h2></div>
              <div className="modal-stat-box"><h4>Completed</h4><h2 style={{color: '#059669'}}>{viewingUser.stats.completed}</h2></div>
              <div className="modal-stat-box"><h4>Cancelled</h4><h2 style={{color: '#dc2626'}}>{viewingUser.stats.cancelled}</h2></div>
              <div className="modal-stat-box"><h4>Total Spent</h4><h2 style={{color: '#2563eb'}}>₹{viewingUser.stats.totalSpent}</h2></div>
            </div>

            {/* --- NEW: ORDER HISTORY SECTION --- */}
            <h3 className="stats-heading" style={{ marginTop: '25px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>Recent Order History</h3>
            <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 15px' }}>Order ID</th>
                    <th style={{ padding: '12px 15px' }}>Date</th>
                    <th style={{ padding: '12px 15px' }}>Shop</th>
                    <th style={{ padding: '12px 15px' }}>Amount</th>
                    <th style={{ padding: '12px 15px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingUser.orderHistory && viewingUser.orderHistory.length > 0 ? (
                    viewingUser.orderHistory.map((order, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                        <td style={{ padding: '12px 15px', color: '#2563eb', fontWeight: 'bold' }}>{order.id}</td>
                        <td style={{ padding: '12px 15px', color: '#475569' }}>{order.date}</td>
                        <td style={{ padding: '12px 15px', color: '#0f172a', fontWeight: '500' }}>{order.shop}</td>
                        <td style={{ padding: '12px 15px', color: '#0f172a', fontWeight: 'bold' }}>₹{order.amount}</td>
                        <td style={{ padding: '12px 15px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
                            background: order.status === 'Completed' ? '#dcfce7' : order.status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                            color: order.status === 'Completed' ? '#166534' : order.status === 'Cancelled' ? '#991b1b' : '#92400e'
                          }}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No orders found for this user.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
      )}

      {viewingShop && (
        <div className="admin-modal-overlay" onClick={() => setViewingShop(null)}>
          <div className="admin-modal-box wide animate-scale-up" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Shop Profile: {viewingShop.name}</h2>
              <button className="admin-close-modal-btn" onClick={() => setViewingShop(null)}>✕</button>
            </div>
            
            <div className="profile-details-section">
              <p><strong>Owner:</strong> {viewingShop.owner} &nbsp;|&nbsp; <strong>Phone:</strong> {viewingShop.phone} &nbsp;|&nbsp; <strong>Location:</strong> {viewingShop.location}</p>
            </div>
            
            <h3 className="stats-heading">Order Performance</h3>
            <div className="modal-stats-grid">
              <div className="modal-stat-box"><h4>Total Requests</h4><h2>{viewingShop.stats.totalOrders}</h2></div>
              <div className="modal-stat-box"><h4>Accepted</h4><h2 style={{color: '#059669'}}>{viewingShop.stats.accepted}</h2></div>
              <div className="modal-stat-box"><h4>Rejected</h4><h2 style={{color: '#dc2626'}}>{viewingShop.stats.rejected}</h2></div>
              <div className="modal-stat-box"><h4>Pending Now</h4><h2 style={{color: '#d97706'}}>{viewingShop.stats.pending}</h2></div>
            </div>
            
            <h3 className="stats-heading">Financial Ledger</h3>
            <div className="modal-stats-grid">
              <div className="modal-stat-box"><h4>Total Earned</h4><h2 style={{color: '#4318ff'}}>₹{viewingShop.stats.totalEarned.toLocaleString()}</h2></div>
              <div className="modal-stat-box"><h4>Amount Withdrawn</h4><h2>₹{viewingShop.stats.withdrawn.toLocaleString()}</h2></div>
              <div className="modal-stat-box" style={{background: '#f0fdf4', borderColor: '#bbf7d0'}}>
                <h4>Wallet Balance</h4><h2 style={{color: '#15803d'}}>₹{viewingShop.stats.walletBal.toLocaleString()}</h2>
              </div>
            </div>

            {/* --- NEW: SHOP ORDER HISTORY SECTION --- */}
            <h3 className="stats-heading" style={{ marginTop: '25px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>Recent Processed Orders</h3>
            <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 15px' }}>Order ID</th>
                    <th style={{ padding: '12px 15px' }}>Date</th>
                    <th style={{ padding: '12px 15px' }}>Customer</th>
                    <th style={{ padding: '12px 15px' }}>Shop Cut (₹)</th>
                    <th style={{ padding: '12px 15px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingShop.recentOrders && viewingShop.recentOrders.length > 0 ? (
                    viewingShop.recentOrders.map((order, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                        <td style={{ padding: '12px 15px', color: '#16a34a', fontWeight: 'bold' }}>{order.id}</td>
                        <td style={{ padding: '12px 15px', color: '#475569' }}>{order.date}</td>
                        <td style={{ padding: '12px 15px', color: '#0f172a', fontWeight: '500' }}>{order.customer}</td>
                        <td style={{ padding: '12px 15px', color: '#0f172a', fontWeight: 'bold' }}>₹{order.amount}</td>
                        <td style={{ padding: '12px 15px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
                            background: order.status === 'Completed' ? '#dcfce7' : order.status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                            color: order.status === 'Completed' ? '#166534' : order.status === 'Cancelled' ? '#991b1b' : '#92400e'
                          }}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No recent orders found for this shop.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          1. RIDER DETAILED VIEW MODAL (History & Tasks)
      ========================================== */}
      {viewingRider && (
        <div className="admin-modal-overlay" onClick={() => setViewingRider(null)}>
          <div className="admin-modal-box wide animate-scale-up" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Rider Profile: {viewingRider.name}</h2>
              <button className="admin-close-modal-btn" onClick={() => setViewingRider(null)}>✕</button>
            </div>
            
            <div className="profile-details-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p><strong>Phone:</strong> {viewingRider.phone} &nbsp;|&nbsp; <strong>Zone:</strong> {viewingRider.zone}</p>
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', padding: '5px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                🛵 {viewingRider.vehicleInfo?.make || 'Unknown'} - {viewingRider.vehicleInfo?.plate || 'Unknown'}
              </div>
            </div>
            
            <h3 className="stats-heading">Task Performance</h3>
            <div className="modal-stats-grid">
              <div className="modal-stat-box"><h4>Total Assigned</h4><h2>{viewingRider.stats.totalTasks}</h2></div>
              <div className="modal-stat-box"><h4>Completed</h4><h2 style={{color: '#059669'}}>{viewingRider.stats.completed}</h2></div>
              <div className="modal-stat-box"><h4>Declined</h4><h2 style={{color: '#dc2626'}}>{viewingRider.stats.declined}</h2></div>
              <div className="modal-stat-box"><h4>Active Now</h4><h2 style={{color: '#d97706'}}>{viewingRider.stats.active}</h2></div>
            </div>
            
            <h3 className="stats-heading">Financial Ledger</h3>
            <div className="modal-stats-grid">
              <div className="modal-stat-box"><h4>Total Earned</h4><h2 style={{color: '#4318ff'}}>₹{viewingRider.stats.totalEarned.toLocaleString()}</h2></div>
              <div className="modal-stat-box"><h4>Amount Withdrawn</h4><h2>₹{viewingRider.stats.withdrawn.toLocaleString()}</h2></div>
              <div className="modal-stat-box" style={{background: '#f0fdf4', borderColor: '#bbf7d0'}}>
                <h4>Wallet Balance</h4><h2 style={{color: '#15803d'}}>₹{viewingRider.stats.walletBal.toLocaleString()}</h2>
              </div>
            </div>

            {/* Task Ledger */}
            <h3 className="stats-heading" style={{ marginTop: '25px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>Recent Task Ledger</h3>
            <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 15px' }}>Order ID</th>
                    <th style={{ padding: '12px 15px' }}>Task Type</th>
                    <th style={{ padding: '12px 15px' }}>Location</th>
                    <th style={{ padding: '12px 15px' }}>Rider Cut (₹)</th>
                    <th style={{ padding: '12px 15px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingRider.recentTasks && viewingRider.recentTasks.length > 0 ? (
                    viewingRider.recentTasks.map((task, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                        <td style={{ padding: '12px 15px', color: '#ea580c', fontWeight: 'bold' }}>{task.id}</td>
                        <td style={{ padding: '12px 15px', color: '#475569', fontWeight: '500' }}>{task.taskType}</td>
                        <td style={{ padding: '12px 15px', color: '#0f172a' }}>{task.location}</td>
                        <td style={{ padding: '12px 15px', color: '#0f172a', fontWeight: 'bold' }}>₹{task.amount}</td>
                        <td style={{ padding: '12px 15px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
                            background: task.status === 'Completed' ? '#dcfce7' : task.status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                            color: task.status === 'Completed' ? '#166534' : task.status === 'Cancelled' ? '#991b1b' : '#92400e'
                          }}>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No recent tasks found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          2. RIDER KYC REVIEW MODAL (Document Checking)
      ========================================== */}
      {reviewingRider && (
        <div className="admin-modal-overlay" onClick={() => setReviewingRider(null)}>
          <div className="admin-modal-box wide animate-scale-up" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            
            <div className="admin-modal-header" style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
              <div>
                <h2 style={{ color: '#0f172a', margin: '0' }}>Rider KYC Verification</h2>
                <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Reviewing documents for: <strong>{reviewingRider.name}</strong></p>
              </div>
              <button className="admin-close-modal-btn" onClick={() => setReviewingRider(null)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              
              {/* Left Column: Details */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#334155', fontSize: '1rem', textTransform: 'uppercase' }}>Rider Details</h3>
                <p style={{ margin: '8px 0', color: '#475569' }}><strong>Phone:</strong> {reviewingRider.phone}</p>
                <p style={{ margin: '8px 0', color: '#475569' }}><strong>Assigned Zone:</strong> {reviewingRider.zone}</p>
                <hr style={{ border: 'none', borderTop: '1px solid #cbd5e1', margin: '15px 0' }} />
                <h3 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '0.95rem', textTransform: 'uppercase' }}>Vehicle Information</h3>
                <p style={{ margin: '8px 0', color: '#ea580c', fontWeight: 'bold' }}>{reviewingRider.vehicleInfo?.make || 'N/A'}</p>
                <p style={{ margin: '8px 0', color: '#0f172a', background: '#e2e8f0', display: 'inline-block', padding: '4px 8px', borderRadius: '4px', letterSpacing: '1px' }}>
                  {reviewingRider.vehicleInfo?.plate || 'N/A'}
                </p>
              </div>

              {/* Right Column: Uploaded Documents */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#334155', fontSize: '1rem', textTransform: 'uppercase' }}>Uploaded Documents</h3>
                
                {reviewingRider.documents ? (
                  <>
                    {[
                      { label: "Driving License (DL)", file: reviewingRider.documents.dl },
                      { label: "Vehicle Insurance", file: reviewingRider.documents.insurance },
                      { label: "Aadhaar Card", file: reviewingRider.documents.aadhaar },
                      { label: "PAN Card", file: reviewingRider.documents.pan }
                    ].map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <span style={{ color: '#0f172a', fontWeight: '500', fontSize: '0.9rem' }}>📄 {doc.label}</span>
                        <button type="button" onClick={() => alert(`Opening ${doc.file} in new tab...`)} style={{ background: 'none', border: 'none', color: '#ea580c', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                          View File ↗
                        </button>
                      </div>
                    ))}
                  </>
                ) : (
                  <p style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ No documents found.</p>
                )}
              </div>
            </div>

            {/* Admin Actions */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button onClick={() => handleApproveRider(reviewingRider.id)} style={{ flex: 1, background: '#ea580c', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                ✅ Approve & Activate Rider
              </button>
              <button onClick={() => handleRejectRider(reviewingRider.id)} style={{ flex: 1, background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '15px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                ❌ Reject Application
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          WITHDRAW FUNDS MODAL
      ========================================== */}
      {isWithdrawModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsWithdrawModalOpen(false)}>
          <div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Withdraw Platform Profits</h2>
              <button className="admin-close-modal-btn" onClick={() => setIsWithdrawModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleWithdrawSubmit} className="admin-edit-form">
              <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
                <p style={{ margin: 0, color: '#1e40af', fontSize: '0.9rem' }}>Available Balance</p>
                <h2 style={{ margin: '5px 0 0 0', color: '#1d4ed8', fontSize: '1.8rem' }}>₹{currentStats.profit.toLocaleString()}</h2>
              </div>
              
              <div className="admin-form-group">
                <label>Withdrawal Amount (₹)</label>
                <input 
                  type="number" 
                  min="1" 
                  max={currentStats.profit}
                  value={withdrawAmount} 
                  onChange={(e) => setWithdrawAmount(e.target.value)} 
                  placeholder={`Max: ${currentStats.profit}`}
                  required 
                  style={{ fontSize: '1.2rem', padding: '12px' }}
                />
              </div>

              <div className="admin-form-group">
                <label>Destination Account</label>
                <select required style={{ padding: '12px', fontSize: '1rem', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%' }}>
                  
                  {/* Default disabled option if they have no accounts */}
                  {adminProfile.savedAccounts.length === 0 && (
                     <option value="" disabled selected>No saved accounts found. Please add one in Profile.</option>
                  )}

                  {/* Dynamically map through all saved accounts! */}
                  {adminProfile.savedAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName} - {acc.accountName} (Ending in ****{acc.accountNumber.slice(-4)})
                    </option>
                  ))}
                  
                  <option disabled>──────────────────────────</option>
                  <option value="reserve">Tax Reserve Account (Ending in ****8822)</option>
                </select>
              </div>

              <div className="admin-modal-actions" style={{ marginTop: '25px' }}>
                <button type="submit" className="admin-save-btn" style={{ background: '#2563eb', width: '100%', padding: '12px', fontSize: '1.1rem' }}>
                  Confirm Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          VENDOR KYC REVIEW MODAL
      ========================================== */}
      {reviewingShop && (
        <div className="admin-modal-overlay" onClick={() => setReviewingShop(null)}>
          <div className="admin-modal-box wide animate-scale-up" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            
            <div className="admin-modal-header" style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
              <div>
                <h2 style={{ color: '#0f172a', margin: '0' }}>KYC Verification Review</h2>
                <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Reviewing documents for: <strong>{reviewingShop.name}</strong></p>
              </div>
              <button className="admin-close-modal-btn" onClick={() => setReviewingShop(null)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              
              {/* Left Column: Details */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#334155', fontSize: '1rem', textTransform: 'uppercase' }}>Owner Details</h3>
                <p style={{ margin: '8px 0', color: '#475569' }}><strong>Name:</strong> {reviewingShop.owner}</p>
                <p style={{ margin: '8px 0', color: '#475569' }}><strong>Phone:</strong> {reviewingShop.phone}</p>
                <p style={{ margin: '8px 0', color: '#475569' }}><strong>Location:</strong> {reviewingShop.location}</p>
                <p style={{ margin: '8px 0', color: '#475569' }}><strong>Shop ID:</strong> {reviewingShop.id}</p>
              </div>

              {/* Right Column: Uploaded Documents */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#334155', fontSize: '1rem', textTransform: 'uppercase' }}>Uploaded Documents</h3>
                
                {reviewingShop.documents ? (
                  <>
                    {[
                      { label: "GST Registration", file: reviewingShop.documents.gst },
                      { label: "Shop & Establishment", file: reviewingShop.documents.shopAct },
                      { label: "Owner Aadhaar Card", file: reviewingShop.documents.aadhaar },
                      { label: "Owner PAN Card", file: reviewingShop.documents.pan },
                      { label: "Cancelled Cheque", file: reviewingShop.documents.cheque }
                    ].map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <span style={{ color: '#0f172a', fontWeight: '500', fontSize: '0.9rem' }}>📄 {doc.label}</span>
                        {/* Changed from <a> to <button> to fix the ESLint warning! */}
                        <button 
                          type="button"
                          onClick={() => alert(`Opening ${doc.file} in new tab...`)} 
                          style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                        >
                          View File ↗
                        </button>
                      </div>
                    ))}
                  </>
                ) : (
                  <p style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ No documents found.</p>
                )}
              </div>
            </div>

            {/* Admin Actions */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button 
                onClick={() => handleApproveShop(reviewingShop.id)}
                style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ✅ Approve & Activate Shop
              </button>
              <button 
                onClick={() => handleRejectShop(reviewingShop.id)}
                style={{ flex: 1, background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '15px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ❌ Reject Application
              </button>
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