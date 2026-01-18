'use client';

import { motion } from 'framer-motion';
import TransitionLink from '@/components/TransitionLink/TransitionLink';
import styles from './Hero.module.css';

const Hero = () => {

  return (
    <section className={styles.hero}>
      {/* Hero Content */}
      <div className={styles.heroContent}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge Pill */}
          <div className={styles.badgePill}>
            <span className={styles.badgeIcon}>✨</span>
            <span>College Portal</span>
          </div>

          <h1 className={styles.title}>
            Find What You've
            <span className={styles.titleGradient}> Lost</span>
          </h1>

          <p className={styles.subtitle}>
            Smart tracking system to reunite students with their belongings instantly
          </p>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <TransitionLink href="/LogIn" className={styles.actionPill}>
              <span>📱</span>
              <span>Report Lost Item</span>
            </TransitionLink>
            <TransitionLink href="/search" className={styles.actionPill}>
              <span>🔍</span>
              <span>Browse Found Items</span>
            </TransitionLink>
          </div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          className={styles.heroVisual}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className={styles.visualGrid}>
            <div className={styles.visualCard}>
              <span className={styles.visualEmoji}>📱</span>
              <span className={styles.visualText}>Phone</span>
            </div>
            <div className={styles.visualCard}>
              <span className={styles.visualEmoji}>🎒</span>
              <span className={styles.visualText}>Backpack</span>
            </div>
            <div className={styles.visualCard}>
              <span className={styles.visualEmoji}>🔑</span>
              <span className={styles.visualText}>Keys</span>
            </div>
            <div className={styles.visualCard}>
              <span className={styles.visualEmoji}>💻</span>
              <span className={styles.visualText}>Laptop</span>
            </div>
            <div className={styles.visualCard}>
              <span className={styles.visualEmoji}>📚</span>
              <span className={styles.visualText}>Books</span>
            </div>
            <div className={styles.visualCard}>
              <span className={styles.visualEmoji}>⌚</span>
              <span className={styles.visualText}>Watch</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
