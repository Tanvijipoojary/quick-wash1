import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import logo from '../assets/quickwash-logo.png';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [financeFilter, setFinanceFilter] = useState('All'); 
  const [timeFilter, setTimeFilter] = useState('Overall'); 

  const [usersData, setUsersData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  const [shopsData, setShopsData] = useState([]); 
  const [ridersData, setRidersData] = useState([]); 

  const [dashboardStats, setDashboardStats] = useState({
    revenue: 0, totalOrders: 0, pendingOrders: 0, 
    shopsOnline: 0, shopsTotal: 0, ridersOnline: 0, ridersTotal: 0
  });

  const [financialStats, setFinancialStats] = useState({
    Overall: { total: 0, shop: 0, rider: 0, profit: 0, withdrawn: 0 },
    Yearly: { total: 0, shop: 0, rider: 0, profit: 0, withdrawn: 0 },
    Monthly: { total: 0, shop: 0, rider: 0, profit: 0, withdrawn: 0 }
  });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/vendors');
        const formattedVendors = response.data.map(v => ({
          id: v._id, 
          name: v.hubName || "Unnamed Hub",      
          owner: v.name || "Unknown Owner",      
          phone: v.phone || "N/A",                
          location: v.address || "No Address",   
          rating: v.rating || "New!",
          status: v.status || "Pending",
          documents: v.documents || {},
          stats: {
            totalOrders: v.total_orders || 0,
            accepted: v.accepted_orders || 0,
            rejected: v.rejected_orders || 0,
            pending: v.pending_orders || 0,
            walletBal: v.wallet_balance || 0,
            totalEarned: v.total_earnings || 0,
            withdrawn: v.total_withdrawn || 0 
          },
          recentOrders: v.recentOrders || [] 
        }));
        setShopsData(formattedVendors);
      } catch (error) { console.error(error); }
    };
    
    const fetchRiders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/riders');
        const formattedRiders = response.data.map(r => {
          
          // 👇 NEW: Force the math to strictly use ₹20 per task! (Ignores old DB errors)
          const actualTasks = r.total_tasks || 0;
          const fixedTotalEarned = actualTasks * 20;
          const fixedWalletBalance = fixedTotalEarned - (r.total_withdrawn || 0);

          return {
            id: r._id, 
            name: r.name, 
            phone: r.phone, 
            email: r.email, 
            zone: r.zone || "Mangaluru", 
            status: r.status,
            vehicleInfo: { make: r.vehicle_type, plate: r.vehicle_number },
            stats: { 
              totalTasks: actualTasks, 
              completed: r.completed_tasks || 0, 
              walletBal: fixedWalletBalance,   // 👈 Using our fixed math
              totalEarned: fixedTotalEarned,   // 👈 Using our fixed math
              withdrawn: r.total_withdrawn || 0 
            },
            documents: r.documents || {} 
          };
        });
        setRidersData(formattedRiders);
      } catch (error) { console.error(error); }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/users');
        const formattedUsers = response.data.map(u => ({
            id: u._id, name: u.name || "Unnamed User", email: u.email, phone: u.phone || "N/A", status: u.status || "Active", 
            joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : "Unknown", 
            stats: { totalOrders: u.totalOrders || 0, completed: u.completedOrders || 0, cancelled: u.cancelledOrders || 0, pending: u.pendingOrders || 0, totalSpent: u.totalSpent || 0 },
            orderHistory: u.orderHistory || []
        }));
        setUsersData(formattedUsers);
      } catch (error) { console.error(error); }
    };

    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/transactions');
        const txns = response.data;

        console.log("RAW TRANSACTIONS FROM DB:", txns);
        
        let overall = { total: 0, shop: 0, rider: 0, profit: 0, withdrawn: financialStats.Overall.withdrawn };
        let yearly = { total: 0, shop: 0, rider: 0, profit: 0, withdrawn: financialStats.Yearly.withdrawn };
        let monthly = { total: 0, shop: 0, rider: 0, profit: 0, withdrawn: financialStats.Monthly.withdrawn };
        
        // 👇 NEW: Dedicated tracker for Today's Profit!
        let todayProfit = 0; 
        
        const now = new Date();

        const formattedTxns = txns.map(t => {
          const actualTotal = t.totalAmountPaid || 0;
          const actualShopCut = t.vendorEarnings || 0;
          const actualRiderCut = (t.riderEarnings || 0) + (t.pickupRiderEarnings || 0) + (t.deliveryRiderEarnings || 0);
          const actualProfit = t.platformFee || 0;

          const txDate = new Date(t.createdAt);
          const isThisYear = txDate.getFullYear() === now.getFullYear();
          const isThisMonth = isThisYear && txDate.getMonth() === now.getMonth();
          
          // 👇 NEW: Check if the transaction happened exactly today
          const isToday = txDate.toDateString() === now.toDateString(); 

          overall.total += actualTotal; overall.shop += actualShopCut; overall.rider += actualRiderCut; overall.profit += actualProfit;
          if (isThisYear) { yearly.total += actualTotal; yearly.shop += actualShopCut; yearly.rider += actualRiderCut; yearly.profit += actualProfit; }
          if (isThisMonth) { monthly.total += actualTotal; monthly.shop += actualShopCut; monthly.rider += actualRiderCut; monthly.profit += actualProfit; }
          
          // 👇 NEW: Add to today's pile if it matches
          if (isToday) { todayProfit += actualProfit; } 

          return {
            id: `#${t._id.slice(-6).toUpperCase()}`,
            orderId: `#${(t.orderId || 'UNKNOWN').slice(-6).toUpperCase()}`,
            customerName: t.customerName, shopName: t.shopName,
            total: actualTotal.toFixed(2), 
            shopCut: actualShopCut.toFixed(2), 
            riderCut: actualRiderCut.toFixed(2), 
            profit: actualProfit.toFixed(2),
            status: t.paymentStatus === 'Success' ? 'Completed' : 'Pending'
          };
        });

        setTransactionsData(formattedTxns);
        // 👇 FIX: Now we pass todayProfit exactly to the blue card!
        setDashboardStats(prev => ({ ...prev, revenue: todayProfit.toFixed(2) })); 
        setFinancialStats({ Overall: overall, Yearly: yearly, Monthly: monthly });

      } catch (error) { console.error(error); }
    };

    fetchVendors();
    fetchRiders();
    fetchUsers(); 
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // --- MODAL STATES ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null); 
  
  const [reviewingShop, setReviewingShop] = useState(null);
  const [isShopEditModalOpen, setIsShopEditModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [viewingShop, setViewingShop] = useState(null);

  const [viewingRider, setViewingRider] = useState(null);       
  const [editingRider, setEditingRider] = useState(null);       
  const [isRiderEditModalOpen, setIsRiderEditModalOpen] = useState(false);
  const [reviewingRider, setReviewingRider] = useState(null);   

  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin User', email: 'admin@quickwash.com', phone: '+91 9988776655', role: 'System Owner', joined: 'Nov 15, 2025',
    savedAccounts: [ { id: 1, bankName: 'HDFC Bank', accountName: 'Quick Wash Corporate', accountNumber: '50100234891234', ifscCode: 'HDFC0001234' } ]
  });

  const currentStats = financialStats[timeFilter];
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const todayDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  const handleLogout = () => { navigate('/'); };

  const handleApproveShop = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/vendor-status/${id}`, { status: 'Active' });
      setShopsData(shopsData.map(s => s.id === id ? { ...s, status: 'Active' } : s));
      setReviewingShop(null);
    } catch (error) { alert("Error approving shop."); }
  };

  const handleRejectShop = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/vendor-status/${id}`, { status: 'Suspended' });
      setShopsData(shopsData.map(s => s.id === id ? { ...s, status: 'Suspended' } : s));
      setReviewingShop(null);
    } catch (error) { alert("Error rejecting shop."); }
  };

  const handleApproveRider = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/rider-status/${id}`, { status: 'Active' });
      setRidersData(ridersData.map(r => r.id === id ? { ...r, status: 'Active' } : r));
      setReviewingRider(null); 
    } catch (error) { alert("Error approving rider."); }
  };

  const handleRejectRider = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/rider-status/${id}`, { status: 'Suspended' });
      setRidersData(ridersData.map(r => r.id === id ? { ...r, status: 'Suspended' } : r));
      setReviewingRider(null);
    } catch (error) { alert("Error rejecting rider."); }
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (amount <= 0 || isNaN(amount)) return alert("Please enter a valid amount.");
    if (amount > currentStats.profit) return alert("Insufficient funds.");
    setFinancialStats(prev => ({
      ...prev,
      [timeFilter]: { ...prev[timeFilter], profit: prev[timeFilter].profit - amount, withdrawn: prev[timeFilter].withdrawn + amount }
    }));
    alert(`✅ Successfully transferred ₹${amount.toLocaleString()} to Corporate Bank Account.`);
    setIsWithdrawModalOpen(false);
    setWithdrawAmount('');
  };
  
  const handleMenuClick = (menu) => { 
    setActiveMenu(menu); setSearchTerm(''); setFinanceFilter('All'); 
  };
  
  const handleExportCSV = () => { alert("CSV Downloaded successfully!"); };

  const toggleUserStatus = (id, currentStatus) => setUsersData(usersData.map(u => u.id === id ? { ...u, status: currentStatus === 'Active' ? 'Banned' : 'Active' } : u));
  const handleEditUser = (e) => { e.preventDefault(); setUsersData(usersData.map(u => u.id === editingUser.id ? editingUser : u)); setIsEditModalOpen(false); };
  const toggleShopStatus = (id, currentStatus) => setShopsData(shopsData.map(s => s.id === id ? { ...s, status: currentStatus === 'Active' ? 'Suspended' : 'Active' } : s));
  const handleEditShop = (e) => { e.preventDefault(); setShopsData(shopsData.map(s => s.id === editingShop.id ? editingShop : s)); setIsShopEditModalOpen(false); };
  const toggleRiderStatus = (id, currentStatus) => setRidersData(ridersData.map(r => r.id === id ? { ...r, status: currentStatus === 'Active' ? 'Suspended' : 'Active' } : r));
  const handleEditRider = (e) => { e.preventDefault(); setRidersData(ridersData.map(r => r.id === editingRider.id ? editingRider : r)); setIsRiderEditModalOpen(false); };

  const filteredUsers = usersData.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );  
  const filteredShops = shopsData.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.location.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredRiders = ridersData.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.zone.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const filteredTransactions = transactionsData.filter(t => {
    const safeOrderId = t.orderId || "";
    const safeCustomer = t.customerName || "";
    const safeShop = t.shopName || "";
    
    const matchesSearch = safeOrderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          safeCustomer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          safeShop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = financeFilter === 'All' || t.status === financeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleViewUser = async (user) => { 
    setViewingUser(user); 
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/user/${user.email}`);
      const userOrders = response.data;
      const totalOrders = userOrders.length;
      const completed = userOrders.filter(o => ['Completed', 'Dropped at Hub'].includes(o.status)).length;
      const cancelled = userOrders.filter(o => o.status === 'Cancelled').length;
      const totalSpent = userOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const formattedHistory = userOrders.map(o => ({
        id: `#${o._id.substring(o._id.length - 6).toUpperCase()}`,
        date: new Date(o.createdAt || o.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        shop: o.shopId || "Quick Wash Hub", 
        amount: o.totalAmount || 0,
        status: o.status
      }));
      setViewingUser({ ...user, stats: { totalOrders, completed, cancelled, totalSpent }, orderHistory: formattedHistory });
    } catch (error) { console.error(error); }
  };

  const handleViewShop = async (shop) => { 
    setViewingShop(shop); 
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/vendor/${shop.id}`);
      const shopOrders = response.data;
      
      const totalOrders = shopOrders.length;
      const accepted = shopOrders.filter(o => ['At Shop', 'Ready', 'Picked Up', 'Out for Delivery', 'Completed'].includes(o.status)).length;
      const pending = shopOrders.filter(o => ['Pending Pickup', 'Searching Rider', 'Pending'].includes(o.status)).length;
      const rejected = shopOrders.filter(o => ['Cancelled', 'Rejected'].includes(o.status)).length;
      
      const completedOrders = shopOrders.filter(o => o.paymentStatus === 'Paid' || o.status === 'Completed');
      const totalEarned = completedOrders.reduce((sum, order) => {
          const laundrySubtotal = order.totalAmount || 0;
          return sum + (laundrySubtotal * 0.9);
      }, 0);
      
      const formattedHistory = shopOrders.map(o => {
        const laundrySubtotal = o.totalAmount || 0;
        return {
          id: `#${o._id.substring(o._id.length - 6).toUpperCase()}`,
          date: new Date(o.createdAt || o.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
          customer: o.customerEmail ? o.customerEmail.split('@')[0] : "Guest",
          amount: (laundrySubtotal * 0.9).toFixed(2), 
          status: o.status
        }
      });

      // 👇 DYNAMIC WALLET CALCULATION 👇
      const withdrawnAmount = shop.stats.withdrawn || 0;
      const currentWalletBal = totalEarned - withdrawnAmount;

      setViewingShop({ 
        ...shop, 
        stats: { totalOrders, accepted, rejected, pending, totalEarned, walletBal: currentWalletBal, withdrawn: withdrawnAmount }, 
        recentOrders: formattedHistory 
      });
    } catch (error) { console.error(error); }
  };

  const handleViewRider = async (rider) => { 
    setViewingRider(rider); 
    try {
      // 👇 FIX 1: Point to the correct Rider Earnings route so it finds all 6 tasks (₹240)!
      const response = await axios.get(`http://localhost:5000/api/rider/earnings/${rider.email}`);
      const riderOrders = response.data;
      
      let totalTasks = 0;
      let completed = 0;
      let active = 0;
      let totalEarned = 0;
      const formattedHistory = [];

      riderOrders.forEach(t => {
        const isPickup = t.pickupRiderEmail && t.pickupRiderEmail.toLowerCase() === rider.email.toLowerCase();
        const isDelivery = t.deliveryRiderEmail && t.deliveryRiderEmail.toLowerCase() === rider.email.toLowerCase();

        // 👇 FIX 2: Correctly label Collection Runs vs Delivery Runs! 👇
        
        // Process Collection Run
        if (isPickup) {
          totalTasks++;
          totalEarned += 20;
          const isDone = ['Dropped at Hub', 'At Shop', 'Processing', 'Ready', 'Out for Delivery', 'Completed'].includes(t.status);
          if (isDone) completed++; else active++;

          formattedHistory.push({
            id: `#${t._id.substring(t._id.length - 6).toUpperCase()}-C`,
            taskType: isDone ? '✅ Collection Run' : '🛵 Active Collection',
            location: t.customerEmail ? t.customerEmail.split('@')[0] : "Customer",
            amount: 20,
            status: isDone ? 'Completed' : t.status
          });
        }

        // Process Delivery Run
        if (isDelivery) {
          totalTasks++;
          totalEarned += 20;
          const isDone = t.status === 'Completed';
          if (isDone) completed++; else active++;

          formattedHistory.push({
            id: `#${t._id.substring(t._id.length - 6).toUpperCase()}-D`,
            taskType: isDone ? '✅ Delivery Run' : '🛵 Active Delivery',
            location: t.customerEmail ? t.customerEmail.split('@')[0] : "Customer",
            amount: 20,
            status: isDone ? 'Completed' : t.status
          });
        }
      });

      setViewingRider({ 
        ...rider, 
        stats: { 
          totalTasks, 
          completed, 
          declined: 0, 
          active, 
          totalEarned, 
          walletBal: rider.stats.walletBal, // Uses the true Database math!
          withdrawn: rider.stats.withdrawn  // Uses the true Database math!
        }, 
        recentTasks: formattedHistory 
      });
    } catch (error) { 
      console.error("Failed to load rider details:", error); 
    }
  };


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
          <li className={activeMenu === 'profile' ? 'active' : ''} onClick={() => handleMenuClick('profile')}>⚙️ My Profile</li>
        </ul>
        <div className="admin-logout-box"><button className="admin-logout-btn" onClick={handleLogout}>🚪 Log Out</button></div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeMenu === 'profile' ? 'My Profile' : activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1) + ' Management'}</h1>
          
          <div className="admin-profile" style={{ cursor: 'pointer' }} onClick={() => handleMenuClick('profile')}>
            <span className="admin-avatar">{adminProfile.name.charAt(0)}</span>
            <div className="admin-info">
              <strong>{adminProfile.name}</strong>
              <small>{adminProfile.role}</small>
            </div>
          </div>
        </header>

        {activeMenu === 'profile' && (
          <div className="admin-dashboard-content animate-fade">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '25px' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', alignSelf: 'start' }}>
                 <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', fontSize: '3.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', border: '4px solid #bfdbfe' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
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
                      <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: '0.2s' }}>Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'dashboard' && (
          <div className="admin-dashboard-content animate-fade">
            <div className="financial-stats-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Daily Report</h2>
              <div style={{ background: '#e2e8f0', color: '#334155', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>📅 {todayDate}</div>
            </div>
            <div className="admin-stats-grid grid-2x2">
              <div className="stat-card blue-gradient">
                <h3>Today's Platform Profit</h3>
                <h2>₹{dashboardStats.revenue}</h2>
                <p>Calculated at 10% commission</p>
              </div>
              <div className="stat-card orange-gradient">
                <h3>Total Customers</h3>
                <h2>{usersData.length}</h2>
                <p>Registered on platform</p>
              </div>
              <div className="stat-card green-gradient">
                <h3>Shops Online</h3>
                <h2>{shopsData.filter(s => s.status === 'Active').length}</h2>
                <p>Ready to wash</p>
              </div>
              <div className="stat-card purple-gradient">
                <h3>Riders Online</h3>
                <h2>{ridersData.filter(r => r.status === 'Active').length}</h2>
                <p>Ready to deliver</p>
              </div>
            </div>
            <div className="admin-header-actions" style={{ marginTop: '40px' }}>
              <div className="admin-actions-left" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <h2 style={{ margin: 0, color: '#2b3674', fontSize: '1.3rem', marginRight: '10px' }}>All Transactions</h2>
                <div className="admin-search-bar">
                  <span className="search-icon">🔍</span>
                  <input type="text" placeholder="Search Order ID or Shop..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
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

        {activeMenu === 'users' && (
          <div className="admin-dashboard-content animate-fade">
            <div className="admin-header-actions">
              <div className="admin-search-bar" style={{ flex: '1', maxWidth: '400px' }}>
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Search by name, email, or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ display: 'block', color: '#0f172a' }}>{u.name}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.id.substring(u.id.length - 6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td><div><strong style={{ color: '#94a3b8' }}>✉</strong> {u.email}</div><div><strong style={{ color: '#94a3b8' }}>📞</strong> {u.phone}</div></td>
                      <td><div><strong>Orders:</strong> {u.stats.totalOrders}</div><div><strong>Lifetime Spend:</strong> <span style={{ color: '#059669', fontWeight: 'bold' }}>₹{u.stats.totalSpent.toLocaleString()}</span></div></td>
                      <td><span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>{u.joined}</span></td>
                      <td><span className={`status-badge ${u.status === 'Active' ? 'green' : 'red'}`}>{u.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="view-btn" onClick={() => handleViewUser(u)}>👁️</button>
                          <button className="edit-btn" onClick={() => { setEditingUser(u); setIsEditModalOpen(true); }}>✏️</button>
                          <button className="ban-btn" onClick={() => toggleUserStatus(u.id, u.status)}>{u.status === 'Banned' ? '🔓' : '🚫'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'vendors' && (
          <div className="admin-dashboard-content animate-fade">
            <div className="admin-header-actions">
              <div className="admin-search-bar" style={{ flex: '1', maxWidth: '400px' }}>
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Search shops by name or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button className="export-btn" onClick={handleExportCSV}>📥 Export CSV</button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr><th>Shop Profile</th><th>Owner Details</th><th>Performance</th><th>Wallet Balance</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredShops.map(shop => (
                    <tr key={shop.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {shop.name.charAt(0).toUpperCase()}
                          </div>
                          <div><strong style={{ display: 'block', color: '#0f172a' }}>{shop.name}</strong><span style={{ fontSize: '0.8rem', color: '#64748b' }}>📍 {shop.location}</span></div>
                        </div>
                      </td>
                      <td><div><strong style={{ color: '#94a3b8' }}>👤</strong> {shop.owner}</div><div><strong style={{ color: '#94a3b8' }}>📞</strong> {shop.phone}</div></td>
                      <td><div><strong>Orders:</strong> {shop.stats.totalOrders}</div><div><strong>Rating:</strong> <span style={{ color: '#d97706', fontWeight: 'bold' }}>⭐ {shop.rating}</span></div></td>
                      <td><span style={{ color: '#15803d', fontWeight: 'bold', fontSize: '1rem' }}>₹{shop.stats.walletBal.toFixed(2)}</span><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lifetime: ₹{shop.stats.totalEarned.toFixed(2)}</div></td>
                      <td><span className={`status-badge ${shop.status === 'Active' ? 'green' : shop.status === 'Suspended' ? 'red' : 'blue'}`}>{shop.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="view-btn" onClick={() => handleViewShop(shop)}>👁️</button>
                          <button className="edit-btn" onClick={() => { setEditingShop(shop); setIsShopEditModalOpen(true); }}>✏️</button>
                          {shop.status === 'Pending' ? (
                            <button style={{ background: '#d97706', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setReviewingShop(shop)}>📋 Review KYC</button>
                          ) : (
                            <button className="ban-btn" onClick={() => toggleShopStatus(shop.id, shop.status)}>{shop.status === 'Suspended' ? '🔓 Unsuspend' : '🛑 Suspend'}</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'riders' && (
          <div className="admin-dashboard-content animate-fade">
            <div className="admin-header-actions">
              <div className="admin-search-bar" style={{ flex: '1', maxWidth: '400px' }}>
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Search riders by name, phone, or zone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button className="export-btn" onClick={handleExportCSV}>📥 Export CSV</button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Rider Profile</th><th>Contact & Zone</th><th>Task Performance</th><th>Wallet Balance</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredRiders.map(rider => (
                    <tr key={rider.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {rider.name.charAt(0).toUpperCase()}
                          </div>
                          <div><strong style={{ display: 'block', color: '#0f172a' }}>{rider.name}</strong><span style={{ fontSize: '0.8rem', color: '#64748b' }}>{rider.id.substring(rider.id.length - 6).toUpperCase()}</span></div>
                        </div>
                      </td>
                      <td><div><strong style={{ color: '#94a3b8' }}>📞</strong> {rider.phone}</div><div><strong style={{ color: '#94a3b8' }}>📍</strong> {rider.zone}</div></td>
                      <td><div style={{ fontSize: '1rem', color: '#0f172a' }}><strong>Total Tasks:</strong> {rider.stats.totalTasks}</div></td>
                      <td><span style={{ color: '#15803d', fontWeight: 'bold', fontSize: '1rem' }}>₹{rider.stats.walletBal.toFixed(2)}</span><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lifetime: ₹{rider.stats.totalEarned.toFixed(2)}</div></td>
                      <td><span className={`status-badge ${rider.status === 'Active' ? 'green' : rider.status === 'Suspended' ? 'red' : 'blue'}`}>{rider.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="view-btn" onClick={() => handleViewRider(rider)}>👁️</button>
                          <button className="edit-btn" onClick={() => { setEditingRider(rider); setIsRiderEditModalOpen(true); }}>✏️</button>
                          {rider.status === 'Pending' ? (
                            <button style={{ background: '#d97706', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setReviewingRider(rider)}>📋 Review KYC</button>
                          ) : (
                            <button className="ban-btn" onClick={() => toggleRiderStatus(rider.id, rider.status)}>{rider.status === 'Suspended' ? '🔓 Unsuspend' : '🛑 Suspend'}</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'reports' && (
          <div className="admin-dashboard-content animate-fade">
            <div className="financial-stats-header">
              <h2>Deep Financial Overview</h2>
              <select className="admin-filter-dropdown" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                <option value="Overall">Overall / All Time</option>
                <option value="Yearly">This Year</option>
                <option value="Monthly">This Month</option>
              </select>
            </div>
            <div className="admin-stats-grid grid-2x2">
              <div className="stat-card" style={{background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0'}}>
                <h3 style={{color: '#64748b'}}>Customer Total Payments</h3><h2 style={{color: '#0f172a'}}>₹{currentStats.total.toFixed(2)}</h2><p style={{background: '#e2e8f0', color: '#475569'}}>Gross Volume Received</p>
              </div>
              <div className="stat-card" style={{background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa'}}>
                <h3 style={{color: '#ea580c'}}>Total Shop Payments</h3><h2 style={{color: '#c2410c'}}>₹{currentStats.shop.toFixed(2)}</h2><p style={{background: '#ffedd5', color: '#9a3412'}}>Owed to Vendors</p>
              </div>
              <div className="stat-card" style={{background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0'}}>
                <h3 style={{color: '#16a34a'}}>Total Rider Payments</h3><h2 style={{color: '#15803d'}}>₹{currentStats.rider.toFixed(2)}</h2><p style={{background: '#dcfce7', color: '#166534'}}>Owed to Drivers</p>
              </div>
              <div className="stat-card" style={{background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe'}}>
                <h3 style={{color: '#2563eb'}}>Quick Wash Profit</h3>
                <h2 style={{color: '#1d4ed8'}}>₹{currentStats.profit.toFixed(2)}</h2>
                <p style={{background: '#bfdbfe', color: '#1e3a8a'}}>Net Platform Earnings</p>
              </div>
            </div>

            <div className="admin-header-actions">
              <div className="admin-actions-left" style={{ display: 'flex', gap: '15px' }}>
                <div className="admin-search-bar"><span className="search-icon">🔍</span><input type="text" placeholder="Search Order ID or Shop..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                <select className="admin-filter-dropdown" value={financeFilter} onChange={(e) => setFinanceFilter(e.target.value)}><option value="All">All Statuses</option><option value="Completed">Completed</option></select>
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
            </div>
          </div>
        )}
      </main>

      {/* ==========================================
          DETAILED VIEW MODALS (ALL RESTORED)
      ========================================== */}
      {viewingUser && (
        <div className="admin-modal-overlay" onClick={() => setViewingUser(null)}>
          <div className="admin-modal-box wide animate-scale-up" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h2>Customer Profile: {viewingUser.name}</h2><button className="admin-close-modal-btn" onClick={() => setViewingUser(null)}>✕</button></div>
            <div className="profile-details-section"><p><strong>ID:</strong> {viewingUser.id} &nbsp;|&nbsp; <strong>Phone:</strong> {viewingUser.phone} &nbsp;|&nbsp; <strong>Email:</strong> {viewingUser.email}</p></div>
            <h3 className="stats-heading">Lifetime Stats</h3>
            <div className="modal-stats-grid">
              <div className="modal-stat-box"><h4>Total Orders</h4><h2>{viewingUser.stats.totalOrders}</h2></div>
              <div className="modal-stat-box"><h4>Completed</h4><h2 style={{color: '#059669'}}>{viewingUser.stats.completed}</h2></div>
              <div className="modal-stat-box"><h4>Cancelled</h4><h2 style={{color: '#dc2626'}}>{viewingUser.stats.cancelled}</h2></div>
              <div className="modal-stat-box"><h4>Total Spent</h4><h2 style={{color: '#2563eb'}}>₹{viewingUser.stats.totalSpent.toFixed(2)}</h2></div>
            </div>
            <h3 className="stats-heading" style={{ marginTop: '25px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>Recent Order History</h3>
            <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                  <tr><th style={{ padding: '12px 15px' }}>Order ID</th><th style={{ padding: '12px 15px' }}>Date</th><th style={{ padding: '12px 15px' }}>Shop</th><th style={{ padding: '12px 15px' }}>Amount</th><th style={{ padding: '12px 15px' }}>Status</th></tr>
                </thead>
                <tbody>
                  {viewingUser.orderHistory && viewingUser.orderHistory.length > 0 ? (
                    viewingUser.orderHistory.map((order, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                        <td style={{ padding: '12px 15px', color: '#2563eb', fontWeight: 'bold' }}>{order.id}</td><td style={{ padding: '12px 15px', color: '#475569' }}>{order.date}</td><td style={{ padding: '12px 15px', color: '#0f172a', fontWeight: '500' }}>{order.shop}</td><td style={{ padding: '12px 15px', color: '#0f172a', fontWeight: 'bold' }}>₹{order.amount}</td>
                        <td style={{ padding: '12px 15px' }}><span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', background: order.status === 'Completed' ? '#dcfce7' : order.status === 'Cancelled' ? '#fee2e2' : '#fef3c7', color: order.status === 'Completed' ? '#166534' : order.status === 'Cancelled' ? '#991b1b' : '#92400e' }}>{order.status}</span></td>
                      </tr>
                    ))
                  ) : (<tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No orders found for this user.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewingShop && (
        <div className="admin-modal-overlay" onClick={() => setViewingShop(null)}>
          <div className="admin-modal-box wide animate-scale-up" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
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
              <div className="modal-stat-box"><h4>Total Earned</h4><h2 style={{color: '#4318ff'}}>₹{viewingShop.stats.totalEarned.toFixed(2)}</h2></div>
              <div className="modal-stat-box"><h4>Amount Withdrawn</h4><h2>₹{viewingShop.stats.withdrawn || 0}</h2></div>
              <div className="modal-stat-box" style={{background: '#f0fdf4', borderColor: '#bbf7d0'}}><h4>Wallet Balance</h4><h2 style={{color: '#15803d'}}>₹{viewingShop.stats.walletBal.toFixed(2)}</h2></div>
            </div>
            <h3 className="stats-heading" style={{ marginTop: '25px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>Recent Processed Orders</h3>
            <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                  <tr><th style={{ padding: '12px 15px' }}>Order ID</th><th style={{ padding: '12px 15px' }}>Date</th><th style={{ padding: '12px 15px' }}>Customer</th><th style={{ padding: '12px 15px' }}>Shop Cut (₹)</th><th style={{ padding: '12px 15px' }}>Status</th></tr>
                </thead>
                <tbody>
                  {viewingShop.recentOrders && viewingShop.recentOrders.length > 0 ? (
                    viewingShop.recentOrders.map((order, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                        <td style={{ padding: '12px 15px', color: '#16a34a', fontWeight: 'bold' }}>{order.id}</td><td style={{ padding: '12px 15px', color: '#475569' }}>{order.date}</td><td style={{ padding: '12px 15px', color: '#0f172a', fontWeight: '500' }}>{order.customer}</td><td style={{ padding: '12px 15px', color: '#0f172a', fontWeight: 'bold' }}>₹{order.amount}</td>
                        <td style={{ padding: '12px 15px' }}><span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', background: order.status === 'Completed' ? '#dcfce7' : order.status === 'Cancelled' ? '#fee2e2' : '#fef3c7', color: order.status === 'Completed' ? '#166534' : order.status === 'Cancelled' ? '#991b1b' : '#92400e' }}>{order.status}</span></td>
                      </tr>
                    ))
                  ) : (<tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No recent orders found for this shop.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewingRider && (
        <div className="admin-modal-overlay" onClick={() => setViewingRider(null)}>
          <div className="admin-modal-box wide animate-scale-up" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h2>Rider Profile: {viewingRider.name}</h2><button className="admin-close-modal-btn" onClick={() => setViewingRider(null)}>✕</button></div>
            <div className="profile-details-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p><strong>Phone:</strong> {viewingRider.phone} &nbsp;|&nbsp; <strong>Zone:</strong> {viewingRider.zone}</p>
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', padding: '5px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>🛵 {viewingRider.vehicleInfo?.make || 'Unknown'} - {viewingRider.vehicleInfo?.plate || 'Unknown'}</div>
            </div>
            <h3 className="stats-heading">Task Performance</h3>
            <div className="modal-stats-grid">
              <div className="modal-stat-box"><h4>Total Assigned</h4><h2>{viewingRider.stats.totalTasks}</h2></div><div className="modal-stat-box"><h4>Completed</h4><h2 style={{color: '#059669'}}>{viewingRider.stats.completed}</h2></div><div className="modal-stat-box"><h4>Declined</h4><h2 style={{color: '#dc2626'}}>{viewingRider.stats.declined || 0}</h2></div><div className="modal-stat-box"><h4>Active Now</h4><h2 style={{color: '#d97706'}}>{viewingRider.stats.active || 0}</h2></div>
            </div>
            <h3 className="stats-heading">Financial Ledger</h3>
            <div className="modal-stats-grid">
              <div className="modal-stat-box"><h4>Total Earned</h4><h2 style={{color: '#4318ff'}}>₹{viewingRider.stats.totalEarned.toFixed(2)}</h2></div><div className="modal-stat-box"><h4>Amount Withdrawn</h4><h2>₹{viewingRider.stats.withdrawn || 0}</h2></div><div className="modal-stat-box" style={{background: '#f0fdf4', borderColor: '#bbf7d0'}}><h4>Wallet Balance</h4><h2 style={{color: '#15803d'}}>₹{viewingRider.stats.walletBal.toFixed(2)}</h2></div>
            </div>
            <h3 className="stats-heading" style={{ marginTop: '25px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>Recent Task Ledger</h3>
            <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                  <tr><th style={{ padding: '12px 15px' }}>Order ID</th><th style={{ padding: '12px 15px' }}>Task Type</th><th style={{ padding: '12px 15px' }}>Location</th><th style={{ padding: '12px 15px' }}>Rider Cut (₹)</th><th style={{ padding: '12px 15px' }}>Status</th></tr>
                </thead>
                <tbody>
                  {viewingRider.recentTasks && viewingRider.recentTasks.length > 0 ? (
                    viewingRider.recentTasks.map((task, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                        <td style={{ padding: '12px 15px', color: '#ea580c', fontWeight: 'bold' }}>{task.id}</td><td style={{ padding: '12px 15px', color: '#475569', fontWeight: '500' }}>{task.taskType}</td><td style={{ padding: '12px 15px', color: '#0f172a' }}>{task.location}</td><td style={{ padding: '12px 15px', color: '#0f172a', fontWeight: 'bold' }}>₹{task.amount}</td>
                        <td style={{ padding: '12px 15px' }}><span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', background: task.status === 'Completed' ? '#dcfce7' : task.status === 'Cancelled' ? '#fee2e2' : '#fef3c7', color: task.status === 'Completed' ? '#166534' : task.status === 'Cancelled' ? '#991b1b' : '#92400e' }}>{task.status}</span></td>
                      </tr>
                    ))
                  ) : (<tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No recent tasks found.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reviewingRider && (
        <div className="admin-modal-overlay" onClick={() => setReviewingRider(null)}>
          <div className="admin-modal-box wide animate-scale-up" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
              <div><h2 style={{ color: '#0f172a', margin: '0' }}>Rider KYC Verification</h2><p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Reviewing documents for: <strong>{reviewingRider.name}</strong></p></div>
              <button className="admin-close-modal-btn" onClick={() => setReviewingRider(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#334155', fontSize: '1rem', textTransform: 'uppercase' }}>Uploaded Documents</h3>
              {reviewingRider.documents ? (
                <>
                  {[{ label: "Driving License", file: reviewingRider.documents?.dl }, { label: "Vehicle RC", file: reviewingRider.documents?.rc }, { label: "Vehicle Insurance", file: reviewingRider.documents?.insurance }, { label: "Aadhaar Card", file: reviewingRider.documents?.aadhaar }, { label: "PAN Card", file: reviewingRider.documents?.pan }].map((doc, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <span style={{ color: '#0f172a', fontWeight: '500', fontSize: '0.9rem' }}>📄 {doc.label}</span>
                      {doc.file ? (<button type="button" onClick={() => window.open(`http://localhost:5000/uploads/${doc.file}`, '_blank')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>View File ↗</button>) : (<span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>Not Uploaded</span>)}
                    </div>
                  ))}
                </>
              ) : (<p style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ No documents found.</p>)}
            </div>
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button onClick={() => handleApproveRider(reviewingRider.id)} style={{ flex: 1, background: '#ea580c', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>✅ Approve & Activate Rider</button>
              <button onClick={() => handleRejectRider(reviewingRider.id)} style={{ flex: 1, background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '15px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>❌ Reject Application</button>
            </div>
          </div>
        </div>
      )}

      {isWithdrawModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsWithdrawModalOpen(false)}>
          <div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h2>Withdraw Platform Profits</h2><button className="admin-close-modal-btn" onClick={() => setIsWithdrawModalOpen(false)}>✕</button></div>
            <form onSubmit={handleWithdrawSubmit} className="admin-edit-form">
              <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
                <p style={{ margin: 0, color: '#1e40af', fontSize: '0.9rem' }}>Available Balance</p><h2 style={{ margin: '5px 0 0 0', color: '#1d4ed8', fontSize: '1.8rem' }}>₹{currentStats.profit.toFixed(2)}</h2>
              </div>
              <div className="admin-form-group">
                <label>Withdrawal Amount (₹)</label><input type="number" min="1" max={currentStats.profit} value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder={`Max: ${currentStats.profit}`} required style={{ fontSize: '1.2rem', padding: '12px' }} />
              </div>
              <div className="admin-form-group">
                <label>Destination Account</label>
                <select required style={{ padding: '12px', fontSize: '1rem', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%' }}>
                  {adminProfile.savedAccounts.length === 0 && (<option value="" disabled selected>No saved accounts found. Please add one in Profile.</option>)}
                  {adminProfile.savedAccounts.map(acc => (<option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountName} (Ending in ****{acc.accountNumber.slice(-4)})</option>))}
                  <option disabled>──────────────────────────</option><option value="reserve">Tax Reserve Account (Ending in ****8822)</option>
                </select>
              </div>
              <div className="admin-modal-actions" style={{ marginTop: '25px' }}>
                <button type="submit" className="admin-save-btn" style={{ background: '#2563eb', width: '100%', padding: '12px', fontSize: '1.1rem' }}>Confirm Withdrawal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviewingShop && (
        <div className="admin-modal-overlay" onClick={() => setReviewingShop(null)}>
          <div className="admin-modal-box wide animate-scale-up" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
              <div><h2 style={{ color: '#0f172a', margin: '0' }}>KYC Verification Review</h2><p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Reviewing documents for: <strong>{reviewingShop.name}</strong></p></div>
              <button className="admin-close-modal-btn" onClick={() => setReviewingShop(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#334155', fontSize: '1rem', textTransform: 'uppercase' }}>Owner Details</h3>
                <p style={{ margin: '8px 0', color: '#475569' }}><strong>Name:</strong> {reviewingShop.owner}</p><p style={{ margin: '8px 0', color: '#475569' }}><strong>Phone:</strong> {reviewingShop.phone}</p><p style={{ margin: '5px 0', color: '#475569', fontSize: '0.95rem' }}><strong>Address:</strong> {reviewingShop.location}</p><p style={{ margin: '8px 0', color: '#475569' }}><strong>Shop ID:</strong> {reviewingShop.id}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#334155', fontSize: '1rem', textTransform: 'uppercase' }}>Uploaded Documents</h3>
                {reviewingShop.documents ? (
                  <>
                    {[{ label: "GST Registration", file: reviewingShop.documents.gst }, { label: "Shop & Establishment", file: reviewingShop.documents.shopAct }, { label: "Owner Aadhaar Card", file: reviewingShop.documents.aadhaar }, { label: "Owner PAN Card", file: reviewingShop.documents.pan }, { label: "Cancelled Cheque", file: reviewingShop.documents.cheque }].map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <span style={{ color: '#0f172a', fontWeight: '500', fontSize: '0.9rem' }}>📄 {doc.label}</span>
                        {doc.file ? (<button type="button" onClick={() => window.open(`http://localhost:5000/uploads/${doc.file}`, '_blank')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>View File ↗</button>) : (<span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>Missing / Mock Data</span>)}
                      </div>
                    ))}
                  </>
                ) : (<p style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ No documents found.</p>)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <button onClick={() => handleApproveShop(reviewingShop.id)} style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>✅ Approve & Activate Shop</button>
              <button onClick={() => handleRejectShop(reviewingShop.id)} style={{ flex: 1, background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '15px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>❌ Reject Application</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingUser && (<div className="admin-modal-overlay" onClick={() => setIsEditModalOpen(false)}><div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}><div className="admin-modal-header"><h2>Edit User</h2><button className="admin-close-modal-btn" onClick={() => setIsEditModalOpen(false)}>✕</button></div><form onSubmit={handleEditUser} className="admin-edit-form"><div className="admin-form-group"><label>Name</label><input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} required /></div><div className="admin-form-group"><label>Email</label><input type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} required /></div><div className="admin-form-group"><label>Status</label><select value={editingUser.status} onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}><option value="Active">Active</option><option value="Banned">Banned</option></select></div><div className="admin-modal-actions"><button type="submit" className="admin-save-btn">Save Changes</button></div></form></div></div>)}
      {isShopEditModalOpen && editingShop && (<div className="admin-modal-overlay" onClick={() => setIsShopEditModalOpen(false)}><div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}><div className="admin-modal-header"><h2>Edit Shop</h2><button className="admin-close-modal-btn" onClick={() => setIsShopEditModalOpen(false)}>✕</button></div><form onSubmit={handleEditShop} className="admin-edit-form"><div className="admin-form-group"><label>Shop Name</label><input type="text" value={editingShop.name} onChange={(e) => setEditingShop({...editingShop, name: e.target.value})} required /></div><div className="admin-form-group"><label>Location</label><input type="text" value={editingShop.location} onChange={(e) => setEditingShop({...editingShop, location: e.target.value})} required /></div><div className="admin-form-group"><label>Status</label><select value={editingShop.status} onChange={(e) => setEditingShop({...editingShop, status: e.target.value})}><option value="Active">Active</option><option value="Pending">Pending</option><option value="Suspended">Suspended</option></select></div><div className="admin-modal-actions"><button type="submit" className="admin-save-btn">Save Changes</button></div></form></div></div>)}
      {isRiderEditModalOpen && editingRider && (<div className="admin-modal-overlay" onClick={() => setIsRiderEditModalOpen(false)}><div className="admin-modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}><div className="admin-modal-header"><h2>Edit Rider</h2><button className="admin-close-modal-btn" onClick={() => setIsRiderEditModalOpen(false)}>✕</button></div><form onSubmit={handleEditRider} className="admin-edit-form"><div className="admin-form-group"><label>Rider Name</label><input type="text" value={editingRider.name} onChange={(e) => setEditingRider({...editingRider, name: e.target.value})} required /></div><div className="admin-form-group"><label>Zone</label><input type="text" value={editingRider.zone} onChange={(e) => setEditingRider({...editingRider, zone: e.target.value})} required /></div><div className="admin-form-group"><label>Status</label><select value={editingRider.status} onChange={(e) => setEditingRider({...editingRider, status: e.target.value})}><option value="Active">Active</option><option value="Pending">Pending</option><option value="Suspended">Suspended</option></select></div><div className="admin-modal-actions"><button type="submit" className="admin-save-btn">Save Changes</button></div></form></div></div>)}
    </div>
  );
};

export default AdminDashboard;