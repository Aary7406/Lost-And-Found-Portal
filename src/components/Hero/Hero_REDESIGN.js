'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchIcon from '../Icons/SearchIcon';
import styles from './Hero_REDESIGN.module.css';

const Hero = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category && category !== 'all') params.set('category', category);
    router.push(`/search?${params.toString()}`);
  };

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
            <a href="#features" className={styles.navPill}>
              <span>Features</span>
            </a>
            <a href="#impact" className={styles.navPill}>
              <span>Impact</span>
            </a>
            <a href="#contact" className={styles.navPill}>
              <span>Contact</span>
            </a>
          </div>
          
          {/* Login Pill Button */}
          <Link href="/LogIn" className={styles.loginPill}>
            <span>Login</span>
            <span className={styles.loginArrow}>→</span>
          </Link>
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

          {/* Search Bar */}
          <form className={styles.searchContainer} onSubmit={handleSearch}>
            <div className={styles.searchPill}>
              <div className={styles.searchIcon}>
                <SearchIcon size={20} />
              </div>
              <input
                type="search"
                placeholder="Search for lost items..."
                className={styles.searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className={styles.categorySelect}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="accessories">Accessories</option>
              </select>
              <button type="submit" className={styles.searchButton}>
                Search
              </button>
            </div>
          </form>

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
