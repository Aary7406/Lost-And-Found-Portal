'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DirectorDashboard.module.css';

export default function DirectorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    }
  };

  // Fetch items
  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/items');
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
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
      } else {
        alert(data.error || 'Failed to save user');
      }
    } catch (error) {
      alert('Error saving user: ' + error.message);
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
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      alert('Error deleting user: ' + error.message);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchItems()]);
      setLoading(false);
    };
    
    loadData();
    
    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle role filter change
  useEffect(() => {
    fetchUsers(filterRole);
  }, [filterRole]);

  const filteredItems = filterStatus === 'all' 
    ? items 
    : items.filter(item => item.status === filterStatus);

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
        <button 
          className={activeTab === 'items' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('items')}
        >
          <span>📦</span>
          <span>Items</span>
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
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📦</div>
                  <div className={styles.statInfo}>
                    <h3>{stats?.items?.total || 0}</h3>
                    <p>Total Items</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>⏳</div>
                  <div className={styles.statInfo}>
                    <h3>{stats?.items?.pending || 0}</h3>
                    <p>Pending</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>✅</div>
                  <div className={styles.statInfo}>
                    <h3>{stats?.items?.approved || 0}</h3>
                    <p>Approved</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🎯</div>
                  <div className={styles.statInfo}>
                    <h3>{stats?.items?.claimed || 0}</h3>
                    <p>Claimed</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className={styles.quickActions}>
              <h2>Quick Actions</h2>
              <div className={styles.actionsGrid}>
                <button 
                  className={styles.actionCard}
                  onClick={() => {
                    setEditingUser(null);
                    setShowModal(true);
                  }}
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
                  onClick={() => setActiveTab('items')}
                >
                  <span className={styles.actionIcon}>📦</span>
                  <span>View Items</span>
                </button>
                <button 
                  className={styles.actionCard}
                  onClick={() => {
                    fetchStats();
                    fetchUsers();
                    fetchItems();
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
                className={styles.addBtn}
                onClick={() => {
                  setEditingUser(null);
                  setShowModal(true);
                }}
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
                          onClick={() => {
                            setEditingUser(user);
                            setShowModal(true);
                          }}
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

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className={styles.itemsTab}>
            <div className={styles.tabHeader}>
              <div className={styles.tabHeaderLeft}>
                <h2>Lost Items</h2>
                <p>{filteredItems.length} items</p>
              </div>
            </div>

            {/* Item Filters */}
            <div className={styles.filters}>
              <button 
                className={filterStatus === 'all' ? styles.filterActive : styles.filter}
                onClick={() => setFilterStatus('all')}
              >
                All Items ({stats?.items?.total || 0})
              </button>
              <button 
                className={filterStatus === 'pending' ? styles.filterActive : styles.filter}
                onClick={() => setFilterStatus('pending')}
              >
                Pending ({stats?.items?.pending || 0})
              </button>
              <button 
                className={filterStatus === 'approved' ? styles.filterActive : styles.filter}
                onClick={() => setFilterStatus('approved')}
              >
                Approved ({stats?.items?.approved || 0})
              </button>
              <button 
                className={filterStatus === 'claimed' ? styles.filterActive : styles.filter}
                onClick={() => setFilterStatus('claimed')}
              >
                Claimed ({stats?.items?.claimed || 0})
              </button>
            </div>

            {/* Items Grid */}
            <div className={styles.itemsGrid}>
              {filteredItems.map(item => (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.itemHeader}>
                    <h3>{item.item_name}</h3>
                    <span className={`${styles.badge} ${styles[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className={styles.itemDesc}>{item.description}</p>
                  <div className={styles.itemMeta}>
                    <span>📍 {item.location_found}</span>
                    <span>📅 {new Date(item.date_found).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.itemMeta}>
                    <span>🏷️ {item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* User Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
                  minLength="8"
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
          </div>
        </div>
      )}
    </div>
  );
}
