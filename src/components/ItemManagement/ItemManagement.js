'use client';

import { useState, useEffect } from 'react';
import styles from './ItemManagement.module.css';

export default function ItemManagement() {
  const [activeTab, setActiveTab] = useState('pending');
  const [items, setItems] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all items
  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Fetch pending reviews (admin_pending + claimed)
  const fetchPendingReviews = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/claims', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Filter for items needing approval
        const needsReview = data.claims.filter(claim => 
          claim.status === 'admin_pending' || claim.status === 'claimed'
        );
        setPendingReviews(needsReview);
      }
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    }
  };

  // Toggle item status between Lost/Found
  const toggleItemStatus = async (itemId, currentStatus) => {
    const action = currentStatus === 'lost' ? 'mark_as_found' : 'mark_as_lost';
    
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      const data = await res.json();
      if (data.success) {
        // Refresh items
        fetchItems();
        fetchPendingReviews();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  // Approve report (admin_pending → lost)
  const approveReport = async (itemId) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'approve_report',
          notes: 'Report approved by admin'
        })
      });

      const data = await res.json();
      if (data.success) {
        fetchPendingReviews();
        fetchItems();
      }
    } catch (error) {
      console.error('Error approving report:', error);
    }
  };

  // Reject report (admin_pending → deleted)
  const rejectReport = async (itemId) => {
    if (!confirm('Are you sure you want to reject this report?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'reject_report',
          notes: 'Report rejected by admin'
        })
      });

      const data = await res.json();
      if (data.success) {
        fetchPendingReviews();
        fetchItems();
      }
    } catch (error) {
      console.error('Error rejecting report:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchItems(), fetchPendingReviews()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const renderPendingApproval = (item) => (
    <div key={item.id} className={styles.itemCard}>
      <div className={styles.itemHeader}>
        <h4>{item.itemName || item.name}</h4>
        <span className={`${styles.statusBadge} ${styles[item.status]}`}>
          {item.status}
        </span>
      </div>
      <p className={styles.itemDescription}>{item.description}</p>
      <div className={styles.itemDetails}>
        <span>📍 {item.lastSeenLocation || item.location}</span>
        <span>📅 {item.lastSeenDate || item.date}</span>
      </div>
      {item.primaryStudent && (
        <div className={styles.studentInfo}>
          <strong>Reported by:</strong> {item.primaryStudent.first_name} {item.primaryStudent.last_name}
        </div>
      )}
      <div className={styles.actionButtons}>
        {item.status === 'admin_pending' && (
          <>
            <button 
              onClick={() => approveReport(item.id)}
              className={styles.approveBtn}
            >
              ✓ Approve
            </button>
            <button 
              onClick={() => rejectReport(item.id)}
              className={styles.rejectBtn}
            >
              ✗ Reject
            </button>
          </>
        )}
        {item.status === 'claimed' && (
          <button className={styles.reviewBtn}>
            Review Claim
          </button>
        )}
      </div>
    </div>
  );

  const renderAllItems = () => (
    <div className={styles.itemsGrid}>
      {items.map(item => (
        <div key={item.id} className={styles.itemCard}>
          <div className={styles.itemHeader}>
            <h4>{item.name}</h4>
            <span className={`${styles.statusBadge} ${styles[item.status]}`}>
              {item.displayStatus}
            </span>
          </div>
          <p className={styles.itemDescription}>{item.description}</p>
          <div className={styles.itemDetails}>
            <span>📂 {item.category}</span>
            {item.locationLost && <span>📍 {item.locationLost}</span>}
            {item.locationFound && <span>✨ {item.locationFound}</span>}
          </div>
          <div className={styles.actionButtons}>
            {item.canMarkAsFound && (
              <button 
                onClick={() => toggleItemStatus(item.id, item.status)}
                className={styles.toggleBtn}
              >
                Mark as Found
              </button>
            )}
            {item.canMarkAsLost && (
              <button 
                onClick={() => toggleItemStatus(item.id, item.status)}
                className={styles.toggleBtn}
              >
                Mark as Lost
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return <div className={styles.loading}>Loading items...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button 
          className={activeTab === 'pending' ? styles.activeTab : ''}
          onClick={() => setActiveTab('pending')}
        >
          Pending Reviews ({pendingReviews.length})
        </button>
        <button 
          className={activeTab === 'all' ? styles.activeTab : ''}
          onClick={() => setActiveTab('all')}
        >
          All Items ({items.length})
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'pending' && (
          <div className={styles.pendingGrid}>
            {pendingReviews.length === 0 ? (
              <p>No pending reviews</p>
            ) : (
              pendingReviews.map(renderPendingApproval)
            )}
          </div>
        )}

        {activeTab === 'all' && renderAllItems()}
      </div>
    </div>
  );
}
