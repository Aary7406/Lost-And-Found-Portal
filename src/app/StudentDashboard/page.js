'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './StudentDashboard.module.css';
import CustomDatePicker from '@/components/DatePicker/CustomDatePicker';
import Toast from '@/components/Toast/Toast';

export default function StudentDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    description: '',
    location_lost: '',
    date_lost: ''
  });

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

  // Submit new request
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.item_name || !formData.category || !formData.description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

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
        showToast('Lost item request submitted successfully!', 'success');
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
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'found') return styles.badgeFound;
    if (status === 'claimed') return styles.badgeClaimed;
    return styles.badgePending;
  };

  const getStatusText = (item) => {
    if (item.status === 'claimed') return 'Claimed';
    if (item.item_type === 'found') return 'Found by Admin';
    return 'Searching';
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchRequests();
      setLoading(false);
    };
    
    loadData();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Toast Notification */}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1>My Lost Items</h1>
            <p className={styles.subtitle}>Track and report your lost items</p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('authToken');
              window.location.href = '/LogIn';
            }} 
            className={styles.logoutBtn}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <motion.div 
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className={styles.statIcon}>📋</div>
            <h3>{requests.length}</h3>
            <p>Total Requests</p>
          </motion.div>
          
          <motion.div 
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.statIcon}>🔍</div>
            <h3>{requests.filter(r => r.item_type === 'lost').length}</h3>
            <p>Searching</p>
          </motion.div>
          
          <motion.div 
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className={styles.statIcon}>✨</div>
            <h3>{requests.filter(r => r.item_type === 'found').length}</h3>
            <p>Found</p>
          </motion.div>
          
          <motion.div 
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className={styles.statIcon}>✅</div>
            <h3>{requests.filter(r => r.status === 'claimed').length}</h3>
            <p>Claimed</p>
          </motion.div>
        </div>

        {/* Action Button */}
        <motion.button
          className={styles.createBtn}
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className={styles.createIcon}>+</span>
          Report Lost Item
        </motion.button>

        {/* Requests List */}
        <div className={styles.requestsSection}>
          <h2>My Requests</h2>
          {requests.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <h3>No requests yet</h3>
              <p>Report a lost item to get started</p>
            </div>
          ) : (
            <div className={styles.requestsGrid}>
              {requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  className={styles.requestCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={styles.requestHeader}>
                    <h3>{request.item_name}</h3>
                    <span className={getStatusBadgeClass(request.item_type === 'found' ? 'found' : request.status)}>
                      {getStatusText(request)}
                    </span>
                  </div>
                  
                  <p className={styles.category}>
                    <span className={styles.categoryIcon}>🏷️</span>
                    {request.category}
                  </p>
                  
                  <p className={styles.description}>{request.description}</p>
                  
                  {request.location_lost && (
                    <p className={styles.location}>
                      <span className={styles.locationIcon}>📍</span>
                      Last seen: {request.location_lost}
                    </p>
                  )}
                  
                  {request.date_lost && (
                    <p className={styles.date}>
                      <span className={styles.dateIcon}>📅</span>
                      {new Date(request.date_lost).toLocaleDateString()}
                    </p>
                  )}
                  
                  <div className={styles.requestFooter}>
                    <span className={styles.uniqueId}>ID: {request.unique_item_id}</span>
                    <span className={styles.timestamp}>
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Request Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className={styles.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className={styles.modalHeader}>
                <h2>Report Lost Item</h2>
                <button 
                  className={styles.closeBtn}
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Item Name *</label>
                  <input
                    type="text"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    placeholder="e.g., Blue Backpack"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Books">Books</option>
                    <option value="Keys">Keys</option>
                    <option value="Bags">Bags</option>
                    <option value="Sports Equipment">Sports Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your lost item in detail..."
                    rows={4}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Last Seen Location</label>
                    <input
                      type="text"
                      value={formData.location_lost}
                      onChange={(e) => setFormData({ ...formData, location_lost: e.target.value })}
                      placeholder="e.g., Library 3rd Floor"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Date Lost</label>
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
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
