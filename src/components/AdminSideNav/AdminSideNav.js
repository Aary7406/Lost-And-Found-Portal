'use client';

import { useState } from 'react';
import styles from './AdminSideNav.module.css';

export default function AdminSideNav({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'reports', label: 'Reports', icon: '📝' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className={styles.sidenav}>
      <div className={styles.logo}>
        <h2>Admin Panel</h2>
      </div>
      
      <ul className={styles.menu}>
        {menuItems.map(item => (
          <li key={item.id}>
            <button
              className={`${styles.menuItem} ${activeTab === item.id ? styles.active : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
