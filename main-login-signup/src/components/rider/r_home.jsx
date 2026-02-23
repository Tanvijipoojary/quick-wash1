import React, { useState } from 'react';
import styles from './r_home.css';

const RiderHome = () => {
  const [activeTab, setActiveTab] = useState('New Orders');

  // Dummy array to show multiple cards on the desktop grid side-by-side
  const mockOrders = [1, 2, 3, 4]; 

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.menuBtn}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 className={styles.headerTitle}>Rider Dashboard</h1>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.profileName}>Welcome, Rider</span>
          <div className={styles.profileAvatar}>👤</div>
        </div>
      </header>

      {/* Tabs */}
      <nav className={styles.tabs}>
        {['New Orders', 'Processing', 'Delivered'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Main Content (Responsive Grid) */}
      <main className={styles.orderList}>
        {mockOrders.map((orderNum) => (
          <div key={orderNum} className={styles.orderCard}>
            <div className={styles.cardHeader}>
              <span className={styles.label}>Status</span>
              <span className={styles.statusPill}>Waiting to pickup</span>
            </div>

            <div className={styles.orderIdRow}>
              <span className={styles.label}>Order ID</span>
              <span className={styles.orderId}>#1234UA-{orderNum}</span>
            </div>

            <div className={styles.vendorInfo}>
              <div className={styles.vendorIcon}>🍔</div>
              <span className={styles.vendorName}>Hardees Z-Block</span>
            </div>

            <div className={styles.addressSection}>
              <div className={styles.addressItem}>
                <div className={styles.iconWrapper}>🏢</div>
                <div className={styles.addressDetails}>
                  <span className={styles.addressType}>Pickup order</span>
                  <span className={styles.addressText}>N.38 St. 118</span>
                </div>
              </div>

              <div className={styles.addressItem}>
                <div className={styles.iconWrapper}>🏠</div>
                <div className={styles.addressDetails}>
                  <span className={styles.addressType}>Deliver Order</span>
                  <span className={styles.addressText}>79 Kampuchea Krom Boulevard (128)</span>
                </div>
              </div>
            </div>

            <div className={styles.metadataRow}>
              <div className={styles.metaItem}><span>💰</span> 0.71</div>
              <div className={styles.metaItem}><span>🕒</span> 9:25 PM</div>
              <div className={styles.metaItem}><span>🚲</span> 1.7 Km</div>
            </div>

            <div className={styles.paymentRow}>
              <span className={styles.label}>Payment Method</span>
              <span className={styles.paymentAmount}>
                $10.1 <span className={styles.paymentStatus}>(Not paid yet)</span>
              </span>
            </div>

            <div className={styles.commentSection}>
              <span className={styles.label}>Comment</span>
              <p className={styles.commentText}>Please bring it to my room</p>
            </div>

            <button className={styles.assignBtn}>Assign me</button>
          </div>
        ))}
      </main>

      {/* Bottom Navigation / Web Footer */}
      <footer className={styles.bottomNav}>
        <button className={`${styles.navItem} ${styles.navItemActive}`}>
          <span>🏠</span>
          <small>Home</small>
        </button>
        <button className={styles.navItem}>
          <span>💳</span>
          <small>Wallet</small>
        </button>
        <button className={styles.navItem}>
          <span>💲</span>
          <small>Earnings</small>
        </button>
        <button className={styles.navItem}>
          <span>👤</span>
          <small>Profile</small>
        </button>
      </footer>
    </div>
  );
};

export default RiderHome;