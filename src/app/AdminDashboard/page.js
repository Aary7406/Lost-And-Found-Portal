'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATIONS } from '../../../lib/animations';
import Toast from '../../components/Toast/Toast';
import CustomDatePicker from '../../components/CustomDatePicker/CustomDatePicker';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterItemType, setFilterItemType] = useState('all');
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [modalOrigin, setModalOrigin] = useState({ x: 0, y: 0 });
  const [itemDate, setItemDate] = useState('');
  const buttonRefs = useRef({});
  
  // Toast notification state
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

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
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      showToast('Failed to load statistics', 'error');
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      showToast('Failed to load students', 'error');
    }
    await fetchStats();
  };

  // Fetch items
  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/items-new');
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      showToast('Failed to load items', 'error');
    }
    await fetchStats();
  };

  // Create/Update student
  const saveStudent = async (studentData) => {
    try {
      const method = editingStudent ? 'PUT' : 'POST';
      const url = editingStudent 
        ? `/api/admin/students/${editingStudent.id}` 
        : '/api/admin/students';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        setEditingStudent(null);
        fetchStudents();
        showToast(
          editingStudent ? 'Student updated successfully!' : 'Student created successfully!',
          'success'
        );
      } else {
        const errorMsg = data.error || data.message || 'Failed to save student';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      showToast('Network error: ' + error.message, 'error');
    }
  };

  // Delete student
  const deleteStudent = async (studentId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Student',
      message: 'Are you sure you want to delete this student? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/students/${studentId}`, {
            method: 'DELETE'
          });
          
          const data = await res.json();
          
          if (data.success) {
            fetchStudents();
            showToast('Student deleted successfully', 'success');
          } else {
            showToast(data.error || 'Failed to delete student', 'error');
          }
        } catch (error) {
          showToast('Error: ' + error.message, 'error');
        }
      }
    });
  };

  // Create item
  const saveItem = async (itemData) => {
    try {
      const res = await fetch('/api/admin/items-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowItemModal(false);
        setEditingItem(null);
        fetchItems();
        showToast('Item created successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to save item', 'error');
      }
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    }
  };

  // Delete item
  const deleteItem = async (uniqueId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Item Permanently',
      message: 'This will permanently remove the item from the database. This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/items-new/${uniqueId}`, {
            method: 'DELETE'
          });
          
          const data = await res.json();
          
          if (data.success) {
            fetchItems();
            showToast('Item permanently deleted!', 'success');
          } else {
            showToast(data.error || 'Failed to delete item', 'error');
          }
        } catch (error) {
          showToast('Error: ' + error.message, 'error');
        }
      }
    });
  };

  // Toggle item status
  const toggleItemStatus = async (item) => {
    const newStatus = item.status === 'unclaimed' ? 'claimed' : 'unclaimed';
    
    try {
      const res = await fetch(`/api/admin/items-new/${item.unique_item_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      
      if (data.success) {
        fetchItems();
        showToast(`Item marked as ${newStatus}!`, 'success');
      } else {
        showToast(data.error || 'Failed to update status', 'error');
      }
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    }
  };

  // Open modal with morph animation
  const openModal = (buttonKey, data = null) => {
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
    
    if (buttonKey === 'createItem') {
      setEditingItem(null);
      setItemDate('');
      setShowItemModal(true);
    } else {
      setEditingStudent(data);
      setShowModal(true);
    }
  };

  // Load initial data and setup real-time updates
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchStudents(), fetchItems()]);
      setLoading(false);
    };
    
    loadData();
    
    // Refresh data every 5 seconds for real-time updates
    const interval = setInterval(() => {
      fetchStats();
      if (activeTab === 'students') fetchStudents();
      if (activeTab === 'items') fetchItems();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  const filteredItems = filterItemType === 'all' 
    ? items 
    : (filterItemType === 'unclaimed' || filterItemType === 'claimed')
    ? items.filter(item => item.status === filterItemType)
    : items.filter(item => item.item_type === filterItemType);

  // Remove full-page loading - only show on first mount
  if (loading && !stats && students.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}>⭐</div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1>🛡️ Admin Dashboard</h1>
            <p className={styles.subtitle}>Student & Item Management</p>
          </div>
          <button 
            onClick={() => {
              document.cookie = 'auth_token=; Max-Age=0; path=/;';
              router.push('/LogIn');
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
          className={activeTab === 'students' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('students')}
        >
          <span>👥</span>
          <span>Students</span>
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
                    <h3>{stats?.students?.total || 0}</h3>
                    <p>Total Students</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📦</div>
                  <div className={styles.statInfo}>
                    <h3>{stats?.items?.lost || 0}</h3>
                    <p>Lost Items</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>✨</div>
                  <div className={styles.statInfo}>
                    <h3>{stats?.items?.found || 0}</h3>
                    <p>Found Items</p>
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
                  ref={(el) => buttonRefs.current['createStudent'] = el}
                  className={styles.actionCard}
                  onClick={() => openModal('createStudent', null)}
                >
                  <span className={styles.actionIcon}>➕</span>
                  <span>Create Student</span>
                </button>
                <button 
                  className={styles.actionCard}
                  onClick={() => setActiveTab('students')}
                >
                  <span className={styles.actionIcon}>👥</span>
                  <span>Manage Students</span>
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
                    fetchStudents();
                    fetchItems();
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

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className={styles.studentsTab}>
            <div className={styles.tabHeader}>
              <div className={styles.tabHeaderLeft}>
                <h2>Student Management</h2>
                <p>{students.length} students</p>
              </div>
              <button 
                ref={(el) => buttonRefs.current['addStudent'] = el}
                className={styles.addBtn}
                onClick={() => openModal('addStudent', null)}
              >
                <span>+</span>
                <span>Add Student</span>
              </button>
            </div>

            {/* Students Table */}
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td className={styles.username}>
                        <span className={styles.userIcon}>🎓</span>
                        {student.username}
                      </td>
                      <td>{student.email || 'N/A'}</td>
                      <td>{student.first_name} {student.last_name}</td>
                      <td>{new Date(student.created_at).toLocaleDateString()}</td>
                      <td className={styles.actions}>
                        <button 
                          className={styles.editBtn}
                          onClick={() => openModal('editStudent', student)}
                        >
                          Edit
                        </button>
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => deleteStudent(student.id)}
                        >
                          Delete
                        </button>
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
                <h2>Items Overview</h2>
                <p>{filteredItems.length} items</p>
              </div>
              <button 
                ref={(el) => buttonRefs.current['createItem'] = el}
                className={styles.addButton}
                onClick={() => openModal('createItem', null)}
              >
                <span>+</span>
                <span>Add Item</span>
              </button>
            </div>

            {/* Item Filters */}
            <div className={styles.filters}>
              <button 
                className={filterItemType === 'all' ? styles.filterActive : styles.filter}
                onClick={() => setFilterItemType('all')}
              >
                All Items ({items.length})
              </button>
              <button 
                className={filterItemType === 'lost' ? styles.filterActive : styles.filter}
                onClick={() => setFilterItemType('lost')}
              >
                Lost ({items.filter(i => i.item_type === 'lost').length})
              </button>
              <button 
                className={filterItemType === 'found' ? styles.filterActive : styles.filter}
                onClick={() => setFilterItemType('found')}
              >
                Found ({items.filter(i => i.item_type === 'found').length})
              </button>
              <button 
                className={filterItemType === 'unclaimed' ? styles.filterActive : styles.filter}
                onClick={() => setFilterItemType('unclaimed')}
              >
                Unclaimed ({items.filter(i => i.status === 'unclaimed').length})
              </button>
              <button 
                className={filterItemType === 'claimed' ? styles.filterActive : styles.filter}
                onClick={() => setFilterItemType('claimed')}
              >
                Claimed ({items.filter(i => i.status === 'claimed').length})
              </button>
              <button 
                className={filterItemType === 'unclaimed' ? styles.filterActive : styles.filter}
                onClick={() => setFilterItemType('unclaimed')}
              >
                Unclaimed ({items.filter(i => i.status === 'unclaimed').length})
              </button>
              <button 
                className={filterItemType === 'claimed' ? styles.filterActive : styles.filter}
                onClick={() => setFilterItemType('claimed')}
              >
                Claimed ({items.filter(i => i.status === 'claimed').length})
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
                    <span>📍 {item.location_found || item.location_lost}</span>
                    <span>📅 {new Date(item.date_found || item.date_lost).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.itemMeta}>
                    <span>🏷️ {item.category}</span>
                    <span className={styles.itemType}>
                      {item.item_type === 'lost' ? '📦 Lost' : '✨ Found'}
                    </span>
                  </div>
                  <div className={styles.itemMeta}>
                    <span className={styles.uniqueId}>🔖 {item.unique_item_id}</span>
                  </div>
                  <div className={styles.itemActions}>
                    <button 
                      className={styles.statusBtn}
                      onClick={() => toggleItemStatus(item)}
                    >
                      {item.status === 'unclaimed' ? '✓ Mark Claimed' : '↻ Mark Unclaimed'}
                    </button>
                    <button 
                      className={styles.deleteItemBtn}
                      onClick={() => deleteItem(item.unique_item_id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Student Modal */}
      <AnimatePresence mode="wait">
        {showModal && (
          <>
            {/* Overlay */}
            <motion.div 
              className={styles.modalOverlay} 
              onClick={() => setShowModal(false)}
              {...ANIMATIONS.overlayFade}
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
                  transition: ANIMATIONS.modalMorph.animate.transition
                }}
                exit={{
                  scale: 0.1,
                  opacity: 0,
                  borderRadius: '50%',
                  x: modalOrigin.x,
                  y: modalOrigin.y,
                  rotate: 0,
                  transition: ANIMATIONS.modalMorph.exit.transition
                }}
                style={{
                  willChange: 'transform, opacity, border-radius'
                }}
              >
                <div className={styles.modalHeader}>
                  <h2>{editingStudent ? 'Edit Student' : 'Create New Student'}</h2>
                  <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
                </div>
                <form 
                  className={styles.modalForm}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const studentData = {
                      username: formData.get('username'),
                      password: formData.get('password'),
                      email: formData.get('email'),
                      first_name: formData.get('first_name'),
                      last_name: formData.get('last_name')
                    };
                    
                    // Remove password if empty (for edits)
                    if (editingStudent && !studentData.password) {
                      delete studentData.password;
                    }
                    
                    saveStudent(studentData);
                  }}
                >
                  <div className={styles.formGroup}>
                    <label>Username</label>
                    <input 
                      type="text" 
                      name="username" 
                      defaultValue={editingStudent?.username}
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      defaultValue={editingStudent?.email}
                      placeholder="student@example.com"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>First Name</label>
                      <input 
                        type="text" 
                        name="first_name" 
                        defaultValue={editingStudent?.first_name}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Last Name</label>
                      <input 
                        type="text" 
                        name="last_name" 
                        defaultValue={editingStudent?.last_name}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Password {editingStudent && '(leave blank to keep current)'}</label>
                    <input 
                      type="password" 
                      name="password" 
                      required={!editingStudent}
                    />
                  </div>
                  <div className={styles.modalActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.saveBtn}>
                      {editingStudent ? 'Update Student' : 'Create Student'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Item Modal */}
      <AnimatePresence mode="wait">
        {showItemModal && (
          <>
            <motion.div 
              className={styles.modalOverlay} 
              onClick={() => setShowItemModal(false)}
              {...ANIMATIONS.overlayFade}
            >
              <motion.div 
                className={styles.modal} 
                onClick={(e) => e.stopPropagation()}
                initial={{
                  scale: 0.1,
                  opacity: 0,
                  borderRadius: '50%',
                  x: modalOrigin.x,
                  y: modalOrigin.y
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  borderRadius: '32px',
                  x: 0,
                  y: 0,
                  transition: ANIMATIONS.modalMorph.animate.transition
                }}
                exit={{
                  scale: 0.1,
                  opacity: 0,
                  borderRadius: '50%',
                  x: modalOrigin.x,
                  y: modalOrigin.y,
                  transition: ANIMATIONS.modalMorph.exit.transition
                }}
              >
                <div className={styles.modalHeader}>
                  <h2>Add New Item</h2>
                  <button className={styles.closeBtn} onClick={() => setShowItemModal(false)}>×</button>
                </div>
                <form 
                  className={styles.modalForm}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const itemData = {
                      item_name: formData.get('item_name'),
                      category: formData.get('category'),
                      description: formData.get('description'),
                      item_type: formData.get('item_type')
                    };
                    
                    if (itemData.item_type === 'found') {
                      itemData.location_found = formData.get('location');
                      itemData.date_found = formData.get('date');
                    } else {
                      itemData.location_lost = formData.get('location');
                      itemData.date_lost = formData.get('date');
                    }
                    
                    saveItem(itemData);
                  }}
                >
                  <div className={styles.formGroup}>
                    <label>Item Type</label>
                    <select name="item_type" required defaultValue="lost">
                      <option value="lost">Lost</option>
                      <option value="found">Found</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Item Name</label>
                    <input type="text" name="item_name" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Category</label>
                    <input type="text" name="category" required placeholder="e.g., Electronics, Clothing" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea name="description" required rows="3"></textarea>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Location</label>
                      <input type="text" name="location" required />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Date</label>
                      <CustomDatePicker
                        value={itemDate}
                        onChange={setItemDate}
                        name="date"
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.modalActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setShowItemModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.saveBtn}>
                      Add Item
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
