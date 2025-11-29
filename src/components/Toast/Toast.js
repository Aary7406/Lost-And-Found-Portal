'use client';

import { motion, AnimatePresence } from 'framer-motion';
import styles from './Toast.module.css';

export default function Toast({ message, type = 'info', isVisible, onClose }) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`${styles.toast} ${styles[type]}`}
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300,
            mass: 0.8
          }}
        >
          <span className={styles.icon}>{icons[type]}</span>
          <span className={styles.message}>{message}</span>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
