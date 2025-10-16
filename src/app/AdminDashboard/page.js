'use client';

import { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';
import ItemManagement from '../../components/ItemManagement/ItemManagement';
import AdminSideNav from '../../components/AdminSideNav/AdminSideNav';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Fetch admin stats with 30-second cache
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };
    
    loadData();

    // Poll every 30 seconds for real-time updates (matches 30s cache TTL)
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading admin dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      <AdminSideNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Admin Dashboard</h1>
          <button onClick={() => {
            localStorage.removeItem('authToken');
            window.location.href = '/LogIn';
          }} className={styles.logoutBtn}>
            Logout
          </button>
        </header>

        {activeTab === 'overview' && (
          <>
            {/* Premium Stats Cards with 24px radius and shadows */}
            <section className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>👥</div>
                <div className={styles.statInfo}>
                  <h3>{stats?.totalStudents || 0}</h3>
                  <p>Total Students</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📦</div>
                <div className={styles.statInfo}>
                  <h3>{stats?.totalLostItems || 0}</h3>
                  <p>Lost Items</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>✨</div>
                <div className={styles.statInfo}>
                  <h3>{stats?.totalFoundItems || 0}</h3>
                  <p>Found Items</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>✅</div>
                <div className={styles.statInfo}>
                  <h3>{stats?.totalReturned || 0}</h3>
                  <p>Returned</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>⚠️</div>
                <div className={styles.statInfo}>
                  <h3>{stats?.pendingApprovals || 0}</h3>
                  <p>Pending Approvals</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>👨‍💼</div>
                <div className={styles.statInfo}>
                  <h3>{stats?.activeAdmins || 0}</h3>
                  <p>Active Admins</p>
                </div>
              </div>
            </section>

            {/* Item Management with Pending Reviews */}
            <section className={styles.itemsSection}>
              <ItemManagement />
            </section>
          </>
        )}

        {activeTab === 'students' && (
          <section className={styles.studentsSection}>
            <h2>Student Management</h2>
            <p>Student management coming soon...</p>
          </section>
        )}

        {activeTab === 'reports' && (
          <section className={styles.reportsSection}>
            <h2>Reports & Analytics</h2>
            <p>Reports coming soon...</p>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className={styles.settingsSection}>
            <h2>Settings</h2>
            <p>Settings coming soon...</p>
          </section>
        )}
      </main>
    </div>
  );
}
