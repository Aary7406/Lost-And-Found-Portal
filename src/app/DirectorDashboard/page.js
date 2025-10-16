'use client';

import { useState, useEffect } from 'react';
import styles from './DirectorDashboard.module.css';
import UserModal from './UserModal';

export default function DirectorDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch director stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/director/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching director stats:', error);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/director/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading director dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Director Dashboard</h1>
        <button onClick={() => {
          localStorage.removeItem('authToken');
          window.location.href = '/LogIn';
        }} className={styles.logoutBtn}>
          Logout
        </button>
      </header>

      {/* System Stats */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{stats?.users?.total || 0}</h3>
          <p>Total Users</p>
        </div>
        <div className={styles.statCard}>
          <h3>{stats?.users?.students || 0}</h3>
          <p>Students</p>
        </div>
        <div className={styles.statCard}>
          <h3>{stats?.users?.admins || 0}</h3>
          <p>Admins</p>
        </div>
        <div className={styles.statCard}>
          <h3>{stats?.items?.total || 0}</h3>
          <p>Total Items</p>
        </div>
        <div className={styles.statCard}>
          <h3>{stats?.systemHealth?.pendingApprovals || 0}</h3>
          <p>Pending Approvals</p>
        </div>
      </section>

      {/* User Management */}
      <section className={styles.usersSection}>
        <div className={styles.sectionHeader}>
          <h2>User Management ({users.length})</h2>
          <button onClick={() => {
            setSelectedUser(null);
            setShowUserModal(true);
          }} className={styles.addBtn}>
            + Add User
          </button>
        </div>
        
        <div className={styles.usersTable}>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td><span className={styles.roleBadge}>{user.role}</span></td>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>
                    <button onClick={() => {
                      setSelectedUser(user);
                      setShowUserModal(true);
                    }} className={styles.editBtn}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* User Modal */}
      {showUserModal && (
        <UserModal 
          user={selectedUser}
          onClose={() => setShowUserModal(false)}
          onSave={() => {
            setShowUserModal(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
