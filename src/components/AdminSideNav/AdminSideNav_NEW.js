'use client';

import styles from './AdminSideNav_NEW.module.css';

export default function AdminSideNav_NEW({ activeTab, onTabChange }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'items', label: 'Items', icon: '📦' },
    { id: 'claims', label: 'Claims', icon: '✋' },
    { id: 'reports', label: 'Reports', icon: '📝' },
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className={styles.sideNav}>
      <div className={styles.logo}>
        <h2>Admin Panel</h2>
      </div>

      <ul className={styles.menuList}>
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onTabChange(item.id)}
              className={`${styles.menuItem} ${activeTab === item.id ? styles.active : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        <button className={styles.logoutButton}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}
