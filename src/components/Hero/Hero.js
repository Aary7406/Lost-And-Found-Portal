'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Hero_REDESIGN.module.css';

const Hero = () => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className={styles.hero}>
      {/* MD3 Expressive Pill Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          {/* Logo Pill */}
          <Link href="/" className={styles.logoPill}>
            <span className={styles.logoIcon}>🎓</span>
            <span className={styles.logoText}>Lost & Found</span>
          </Link>
          
          {/* Nav Pills */}
          <div className={styles.navPills}>
            <button 
              onClick={() => document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={styles.navPill}
            >
              <span>Impact</span>
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={styles.navPill}
            >
              <span>Features</span>
            </button>
          </div>
          
          {/* Login Pill Button */}
          <motion.div
            className={styles.loginPillWrapper}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/LogIn" className={styles.loginPill}>
              {/* Animated fill background - slides left to right */}
              <motion.div
                className={styles.fillBackground}
                initial={false}
                animate={{
                  width: isHovered ? '100%' : '0%'
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.19, 1, 0.22, 1]
                }}
              />
              
              {/* Subtle shimmer overlay */}
              {isHovered && (
                <motion.div
                  className={styles.shimmerOverlay}
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ 
                    x: '200%',
                    opacity: [0, 0.6, 0]
                  }}
                  transition={{
                    duration: 1.2,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    repeatDelay: 0.3
                  }}
                />
              )}
              
              {/* Content wrapper */}
              <span className={styles.loginContent}>
                <motion.span
                  animate={{
                    color: isHovered ? '#1e1e2e' : '#cba6f7'
                  }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                >
                  Login
                </motion.span>
                <motion.span
                  className={styles.arrow}
                  animate={{
                    x: isHovered ? 4 : 0,
                    color: isHovered ? '#1e1e2e' : '#cba6f7',
                    rotate: isHovered ? -10 : 0,
                    scale: isHovered ? 1.1 : 1
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.34, 1.56, 0.64, 1]
                  }}
                >
                  →
                </motion.span>
              </span>
            </Link>
          </motion.div>
        </div>
      </nav>

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
            <Link href="/LogIn" className={styles.actionPill}>
              <span>📱</span>
              <span>Report Lost Item</span>
            </Link>
            <Link href="/search" className={styles.actionPill}>
              <span>🔍</span>
              <span>Browse Found Items</span>
            </Link>
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
