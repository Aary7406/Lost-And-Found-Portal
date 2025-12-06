'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './StudentDashboard.module.css';
import CustomDatePicker from '@/components/DatePicker/CustomDatePicker';
import Toast from '@/components/Toast/Toast';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';

export default function StudentDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, itemId: null, itemName: '' });
  const [deleting, setDeleting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    description: '',
    location_lost: '',
    date_lost: ''
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole');
      
      if (!token || role !== 'student') {
        router.push('/LogIn');
        return;
      }

      try {
        // Simple JWT decode without backend verification for faster load
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        const payload = JSON.parse(atob(parts[1]));
        
        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          router.push('/LogIn');
          return;
        }

        // Set user info from token
        setUserInfo({
          id: payload.id,
          username: payload.username,
          email: payload.email,
          first_name: payload.first_name,
          last_name: payload.last_name,
          role: payload.role
        });
        setAuthenticated(true);
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        router.push('/LogIn');
      }
    };

    checkAuth();
  }, [router]);

  // Fetch student's lost item requests
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/student/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    if (authenticated) {
      const loadData = async () => {
        setLoading(true);
        await fetchRequests();
        setLoading(false);
      };
      
      loadData();

      // Poll for updates every 5 seconds for real-time updates
      const interval = setInterval(fetchRequests, 5000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);

  // Submit new request
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.item_name || !formData.category || !formData.description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/student/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (data.success) {
        showToast('Request submitted successfully!', 'success');
        setShowModal(false);
        setFormData({
          item_name: '',
          category: '',
          description: '',
          location_lost: '',
          date_lost: ''
        });
        fetchRequests();
      } else {
        showToast(data.error || 'Failed to submit request', 'error');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      showToast('Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleDelete = (itemId, itemName) => {
    setDeleteConfirm({ show: true, itemId, itemName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.itemId) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/student/requests?id=${deleteConfirm.itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      
      if (data.success) {
        showToast('Report deleted successfully', 'success');
        setDeleteConfirm({ show: false, itemId: null, itemName: '' });
        fetchRequests();
      } else {
        showToast(data.error || 'Failed to delete report', 'error');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      showToast('Failed to delete report', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    router.push('/LogIn');
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'searching') return req.item_type === 'lost';
    if (filterStatus === 'found') return req.item_type === 'found' && req.status === 'unclaimed';
    if (filterStatus === 'claimed') return req.status === 'claimed';
    return true;
  });

  if (loading || !authenticated) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingSpinner}></div>
          <p>Verifying your access...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: requests.length,
    searching: requests.filter(r => r.item_type === 'lost').length,
    found: requests.filter(r => r.item_type === 'found' && r.status === 'unclaimed').length,
    claimed: requests.filter(r => r.status === 'claimed').length
  };

  return (
    <div className={styles.dashboard}>
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerPill}>
          <div className={styles.headerInfo}>
            <div className={styles.welcomeText}>
              <span className={styles.greeting}>Welcome back,</span>
              <h1 className={styles.userName}>{userInfo?.username || 'Student'}</h1>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <span className={styles.logoutIcon}>→</span>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Stats Overview */}
        <section className={styles.statsSection}>
          <motion.div 
            className={styles.statCard}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className={styles.statIconWrapper}>
              <span className={styles.statIcon}>📦</span>
            </div>
            <div className={styles.statContent}>
              <h3>{stats.total}</h3>
              <p>Total Requests</p>
            </div>
          </motion.div>

          <motion.div 
            className={styles.statCard}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className={styles.statIconWrapper}>
              <span className={styles.statIcon}>🔍</span>
            </div>
            <div className={styles.statContent}>
              <h3>{stats.searching}</h3>
              <p>Searching</p>
            </div>
          </motion.div>

          <motion.div 
            className={styles.statCard}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className={styles.statIconWrapper}>
              <span className={styles.statIcon}>✨</span>
            </div>
            <div className={styles.statContent}>
              <h3>{stats.found}</h3>
              <p>Found</p>
            </div>
          </motion.div>

          <motion.div 
            className={styles.statCard}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className={styles.statIconWrapper}>
              <span className={styles.statIcon}>✅</span>
            </div>
            <div className={styles.statContent}>
              <h3>{stats.claimed}</h3>
              <p>Claimed</p>
            </div>
          </motion.div>
        </section>

        {/* Quick Action */}
        <motion.button
          className={styles.reportBtn}
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className={styles.reportIcon}>+</span>
          <span className={styles.reportText}>Report Lost Item</span>
        </motion.button>

        {/* Filters */}
        <div className={styles.filtersWrapper}>
          <h2 className={styles.sectionTitle}>My Requests</h2>
          <div className={styles.filterPills}>
            {[
              { id: 'all', label: 'All', count: stats.total },
              { id: 'searching', label: 'Searching', count: stats.searching },
              { id: 'found', label: 'Found', count: stats.found },
              { id: 'claimed', label: 'Claimed', count: stats.claimed }
            ].map(filter => (
              <button
                key={filter.id}
                className={`${styles.filterPill} ${filterStatus === filter.id ? styles.filterActive : ''}`}
                onClick={() => setFilterStatus(filter.id)}
              >
                {filter.label} <span className={styles.filterCount}>({filter.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h3>No items {filterStatus !== 'all' ? `in "${filterStatus}" status` : 'yet'}</h3>
            <p>Report a lost item to start tracking</p>
          </div>
        ) : (
          <div className={styles.requestsGrid}>
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                className={styles.requestCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                {/* Status Badge */}
                <div className={styles.cardHeader}>
                  <span className={`${styles.statusBadge} ${
                    request.status === 'claimed' ? styles.statusClaimed :
                    request.item_type === 'found' ? styles.statusFound :
                    styles.statusSearching
                  }`}>
                    {request.status === 'claimed' ? '✅ Claimed' :
                     request.item_type === 'found' ? '✨ Found' :
                     '🔍 Searching'}
                  </span>
                </div>

                {/* Item Info */}
                <h3 className={styles.itemName}>{request.item_name}</h3>
                <p className={styles.itemCategory}>
                  <span className={styles.categoryIcon}>🏷️</span>
                  {request.category}
                </p>
                <p className={styles.itemDescription}>{request.description}</p>

                {/* Details */}
                <div className={styles.itemDetails}>
                  {request.location_lost && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailIcon}>📍</span>
                      <span className={styles.detailText}>{request.location_lost}</span>
                    </div>
                  )}
                  {request.date_lost && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailIcon}>📅</span>
                      <span className={styles.detailText}>
                        {new Date(request.date_lost).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className={styles.cardFooter}>
                  <span className={styles.itemId}>{request.unique_item_id}</span>
                  <div className={styles.cardActions}>
                    <span className={styles.itemDate}>
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(request.id, request.item_name)}
                      title="Delete this report"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal - One UI 8 Style */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ 
                type: 'spring', 
                damping: 30, 
                stiffness: 400,
                mass: 0.8
              }}
              onClick={(e) => e.stopPropagation()}
            >
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowModal(false)}
                  aria-label="Close modal"
                >
                  ✕
                </button>
                
                <motion.div 
                  className={styles.modalHeader}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className={styles.modalIcon}>📦</div>
                  <h2>Report Lost Item</h2>
                  <p className={styles.modalSubtitle}>Fill in the details to help us find your item</p>
                </motion.div>

                <motion.form 
                  onSubmit={handleSubmit} 
                  className={styles.form}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="item_name">
                        <span className={styles.labelIcon}>🏷️</span>
                        Item Name <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="item_name"
                        type="text"
                        value={formData.item_name}
                        onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                        placeholder="e.g., AirPods Pro, Water Bottle"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="category">
                        <span className={styles.labelIcon}>📂</span>
                        Category <span className={styles.required}>*</span>
                      </label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      >
                        <option value="">Choose a category</option>
                        <option value="Electronics">📱 Electronics</option>
                        <option value="Accessories">⌚ Accessories</option>
                        <option value="Clothing">👕 Clothing</option>
                        <option value="Books">📚 Books</option>
                        <option value="Keys">🔑 Keys</option>
                        <option value="Bags">🎒 Bags</option>
                        <option value="Sports Equipment">⚽ Sports Equipment</option>
                        <option value="Other">📌 Other</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="description">
                      <span className={styles.labelIcon}>📝</span>
                      Description <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your item's color, brand, distinctive features..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="location_lost">
                        <span className={styles.labelIcon}>📍</span>
                        Last Seen Location
                      </label>
                      <input
                        id="location_lost"
                        type="text"
                        value={formData.location_lost}
                        onChange={(e) => setFormData({ ...formData, location_lost: e.target.value })}
                        placeholder="Building, room, area"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="date_lost">
                        <span className={styles.labelIcon}>📅</span>
                        Date Lost
                      </label>
                      <CustomDatePicker
                        selected={formData.date_lost}
                        onChange={(date) => setFormData({ ...formData, date_lost: date })}
                        placeholderText="Select date"
                      />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button 
                      type="button" 
                      className={styles.cancelBtn}
                      onClick={() => setShowModal(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className={styles.submitBtn}
                      disabled={submitting}
                    >
                      <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
                      {!submitting && <span className={styles.submitIcon}>→</span>}
                    </button>
                  </div>
                </motion.form>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Delete Report?"
        message={`Are you sure you want to delete "${deleteConfirm.itemName}"? This action cannot be undone.`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, itemId: null, itemName: '' })}
        type="danger"
        disabled={deleting}
      />
    </div>
  );
}
