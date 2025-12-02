'use client';

import { motion, AnimatePresence } from 'framer-motion';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' // 'danger', 'warning', 'info'
}) {
  
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={styles.dialog}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ 
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
          >
            {/* Icon */}
            <div className={`${styles.icon} ${styles[type]}`}>
              {type === 'danger' && '⚠️'}
              {type === 'warning' && '⚡'}
              {type === 'info' && 'ℹ️'}
            </div>

            {/* Content */}
            <div className={styles.content}>
              <h2 className={styles.title}>{title}</h2>
              <p className={styles.message}>{message}</p>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <motion.button
                className={styles.cancelBtn}
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {cancelText}
              </motion.button>
              <motion.button
                className={`${styles.confirmBtn} ${styles[`${type}Btn`]}`}
                onClick={handleConfirm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
