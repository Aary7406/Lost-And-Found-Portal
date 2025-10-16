'use client';

import { useState, useEffect } from 'react';
import styles from './StudentDashboard.module.css';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/student/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/student/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch my claims
  const fetchMyClaims = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/student/claims', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMyClaims(data.claims);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    }
  };

  // Mark notifications as read
  const markAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch('/api/student/notifications/mark-read', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchNotifications(), fetchMyClaims()]);
      setLoading(false);
    };
    
    loadData();

    // Poll for updates every 2 minutes (120000ms) - OPTIMIZED from 30s
    const interval = setInterval(() => {
      fetchNotifications();
      fetchStats();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading your dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Student Dashboard</h1>
        <button onClick={() => {
          localStorage.removeItem('authToken');
          window.location.href = '/LogIn';
        }} className={styles.logoutBtn}>
          Logout
        </button>
      </header>

      {/* Stats Section */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{stats?.totalLostItems || 0}</h3>
          <p>Lost Items</p>
        </div>
        <div className={styles.statCard}>
          <h3>{stats?.totalFoundItems || 0}</h3>
          <p>Found Items</p>
        </div>
        <div className={styles.statCard}>
          <h3>{stats?.myReports || 0}</h3>
          <p>My Reports</p>
        </div>
        <div className={styles.statCard}>
          <h3>{stats?.myClaims || 0}</h3>
          <p>My Claims</p>
        </div>
      </section>

      {/* Notifications */}
      <section className={styles.notifications}>
        <div className={styles.sectionHeader}>
          <h2>Notifications ({notifications.length})</h2>
          {notifications.length > 0 && (
            <button onClick={markAsRead} className={styles.markReadBtn}>
              Mark All as Read
            </button>
          )}
        </div>
        <div className={styles.notificationList}>
          {notifications.length === 0 ? (
            <p>No new notifications</p>
          ) : (
            notifications.map(notif => (
              <div key={notif.id} className={styles.notificationItem}>
                <span className={styles.notifIcon}>{notif.type === 'match_found' ? '🔔' : '📢'}</span>
                <div>
                  <strong>{notif.title}</strong>
                  <p>{notif.message}</p>
                  <small>{notif.time}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* My Claims */}
      <section className={styles.claims}>
        <h2>My Claims ({myClaims.length})</h2>
        <div className={styles.claimsList}>
          {myClaims.length === 0 ? (
            <p>No claims yet</p>
          ) : (
            myClaims.map(claim => (
              <div key={claim.id} className={styles.claimCard}>
                <h4>{claim.name}</h4>
                <p>{claim.description}</p>
                <span className={styles.status}>{claim.status}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
