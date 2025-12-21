'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../../components/Toast/Toast';
import styles from './DirectorDashboard.module.css';

export default function DirectorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterRole, setFilterRole] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });
  const buttonRefs = useRef({});
  
  // Toast notification state
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 5000);
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/director/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      showToast('Failed to load statistics', 'error');
    }
  };

  // Fetch users
  const fetchUsers = async (role = 'all') => {
    try {
      const url = role === 'all' ? '/api/director/users' : `/api/director/users?role=${role}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to load users', 'error');
    }
    // Refresh stats to update counts
    await fetchStats();
  };

  // Create/Update user
  const saveUser = async (userData) => {
    try {
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser 
        ? `/api/director/users/${editingUser.id}` 
        : '/api/director/users';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        setEditingUser(null);
        fetchUsers(filterRole);
        fetchStats();
        showToast(
          editingUser ? 'User updated successfully!' : 'User created successfully!',
          'success'
        );
      } else {
        const errorMsg = data.error || data.message || 'Failed to save user';
        console.error('Failed to save user:', data);
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showToast('Network error: ' + error.message, 'error');
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const res = await fetch(`/api/director/users/${userId}`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      
      if (data.success) {
        fetchUsers(filterRole);
        fetchStats();
        showToast('User deleted successfully', 'success');
      } else {
        showToast(data.error || 'Failed to delete user', 'error');
      }
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers()]);
      setLoading(false);
    };
    
    loadData();
    
    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Open modal with morph animation from button position
  const openModal = (buttonKey, user = null) => {
    const button = buttonRefs.current[buttonKey];
    if (button) {
      const rect = button.getBoundingClientRect();
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;
      
      setModalOrigin({
        x: rect.left + rect.width / 2 - viewportCenterX,
        y: rect.top + rect.height / 2 - viewportCenterY
      });
    }
    setEditingUser(user);
    setShowModal(true);
  };

  // Handle role filter change
  useEffect(() => {
    fetchUsers(filterRole);
  }, [filterRole]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}>⭐</div>
        <p>Loading Director Dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1>👑 Director Dashboard</h1>
            <p className={styles.subtitle}>System Management & Oversight</p>
          </div>
          <button 
            onClick={() => {
              document.cookie = 'auth_token=; Max-Age=0; path=/;';
              router.push('/Director');
            }} 
            className={styles.logoutBtn}
          >
            <span>Logout</span>
            <span>→</span>
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className={styles.tabs}>
        <button 
          className={activeTab === 'overview' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('overview')}
        >
          <span>📊</span>
          <span>Overview</span>
        </button>
        <button 
          className={activeTab === 'users' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('users')}
        >
          <span>👥</span>
          <span>Users</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className={styles.content}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            {/* Stats Grid */}
            <section className={styles.statsSection}>
              <h2>System Statistics</h2>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>👥</div>
                  <div className={styles.statInfo}>
                    <h3>{stats?.users?.total || 0}</h3>
                    <p>Total Users</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🎓</div>
                  <div className={styles.statInfo}>
                    <h3>{stats?.users?.students || 0}</h3>
                    <p>Students</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🛡️</div>
                  <div className={styles.statInfo}>
                    <h3>{stats?.users?.admins || 0}</h3>
                    <p>Admins</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>👑</div>
                  <div className={styles.statInfo}>
                    <h3>{stats?.users?.directors || 0}</h3>
                    <p>Directors</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className={styles.quickActions}>
              <h2>Quick Actions</h2>
              <div className={styles.actionsGrid}>
                <button 
                  ref={(el) => buttonRefs.current['createUser'] = el}
                  className={styles.actionCard}
                  onClick={() => openModal('createUser', null)}
                >
                  <span className={styles.actionIcon}>➕</span>
                  <span>Create User</span>
                </button>
                <button 
                  className={styles.actionCard}
                  onClick={() => setActiveTab('users')}
                >
                  <span className={styles.actionIcon}>👥</span>
                  <span>Manage Users</span>
                </button>
                <button 
                  className={styles.actionCard}
                  onClick={() => {
                    fetchStats();
                    fetchUsers();
                    showToast('Data refreshed successfully', 'success');
                  }}
                >
                  <span className={styles.actionIcon}>🔄</span>
                  <span>Refresh Data</span>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className={styles.usersTab}>
            <div className={styles.tabHeader}>
              <div className={styles.tabHeaderLeft}>
                <h2>User Management</h2>
                <p>{users.length} users</p>
              </div>
              <button 
                ref={(el) => buttonRefs.current['addUser'] = el}
                className={styles.addBtn}
                onClick={() => openModal('addUser', null)}
              >
                <span>+</span>
                <span>Add User</span>
              </button>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
              <button 
                className={filterRole === 'all' ? styles.filterActive : styles.filter}
                onClick={() => setFilterRole('all')}
              >
                All Users ({stats?.users?.total || 0})
              </button>
              <button 
                className={filterRole === 'director' ? styles.filterActive : styles.filter}
                onClick={() => setFilterRole('director')}
              >
                Directors ({stats?.users?.directors || 0})
              </button>
              <button 
                className={filterRole === 'admin' ? styles.filterActive : styles.filter}
                onClick={() => setFilterRole('admin')}
              >
                Admins ({stats?.users?.admins || 0})
              </button>
              <button 
                className={filterRole === 'student' ? styles.filterActive : styles.filter}
                onClick={() => setFilterRole('student')}
              >
                Students ({stats?.users?.students || 0})
              </button>
            </div>

            {/* Users Table */}
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className={styles.username}>
                        <span className={styles.userIcon}>
                          {user.role === 'director' ? '👑' : user.role === 'admin' ? '🛡️' : '🎓'}
                        </span>
                        {user.username}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className={styles.actions}>
                        <button 
                          className={styles.editBtn}
                          onClick={() => openModal('editUser', user)}
                        >
                          Edit
                        </button>
                        {user.role !== 'director' && (
                          <button 
                            className={styles.deleteBtn}
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* User Modal with One UI 8 Morph Animation */}
      <AnimatePresence mode="wait">
        {showModal && (
          <>
            {/* Overlay */}
            <motion.div 
              className={styles.modalOverlay} 
              onClick={() => setShowModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } }}
              exit={{ opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
            >
              {/* Modal */}
              <motion.div 
                className={styles.modal} 
                onClick={(e) => e.stopPropagation()}
                initial={{
                  scale: 0.1,
                  opacity: 0,
                  borderRadius: '50%',
                  x: modalOrigin.x,
                  y: modalOrigin.y,
                  rotate: 0
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  borderRadius: '32px',
                  x: 0,
                  y: 0,
                  rotate: 0,
                  transition: {
                    type: 'spring',
                    damping: 30,
                    stiffness: 400,
                    mass: 0.8,
                    restDelta: 0.001
                  }
                }}
                exit={{
                  scale: 0.1,
                  opacity: 0,
                  borderRadius: '50%',
                  x: modalOrigin.x,
                  y: modalOrigin.y,
                  rotate: 0,
                  transition: {
                    duration: 0.15,
                    ease: [0.4, 0, 1, 1]
                  }
                }}
                style={{
                  willChange: 'transform, opacity, border-radius'
                }}
              >
                <div className={styles.modalHeader}>
                  <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
                  <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
                </div>
            <form 
              className={styles.modalForm}
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const userData = {
                  username: formData.get('username'),
                  password: formData.get('password'),
                  role: formData.get('role')
                };
                
                // Remove password if empty (for edits)
                if (editingUser && !userData.password) {
                  delete userData.password;
                }
                
                saveUser(userData);
              }}
            >
              <div className={styles.formGroup}>
                <label>Username</label>
                <input 
                  type="text" 
                  name="username" 
                  defaultValue={editingUser?.username}
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Password {editingUser && '(leave blank to keep current)'}</label>
                <input 
                  type="password" 
                  name="password" 
                  required={!editingUser}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select name="role" defaultValue={editingUser?.role || 'student'} required>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                  <option value="director">Director</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
        </>
      )}
    </AnimatePresence>

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}