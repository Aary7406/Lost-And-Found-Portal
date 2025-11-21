// components/Hero/Hero.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchIcon from '../Icons/SearchIcon';
import styles from './Hero.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category && category !== 'all') params.set('category', category);
    router.push(`/search?${params.toString()}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className={styles.hero}>
      {/* Navigation Bar */}
      <motion.nav 
        className={styles.navbar}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🎓</span>
            <span className={styles.logoText}>Lost & Found</span>
          </div>
          
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#stats" className={styles.navLink}>Impact</a>
            <a href="#contact" className={styles.navLink}>Contact</a>
          </div>
          
          <Link href="/LogIn">
            <motion.button 
              className={styles.loginBtn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Login</span>
              <span className={styles.loginIcon}>→</span>
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      <div 
        className={styles.glowEffect}
        style={{
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
        }}
      />
      
      <motion.div 
        className={styles.content}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className={styles.badge}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
        >
          <span className={styles.badgeText}>🎓 College Portal</span>
        </motion.div>

        <motion.h1 
          className={styles.title}
          variants={itemVariants}
        >
          Lost & Found
          <span className={styles.titleGradient}> Portal</span>
        </motion.h1>

        <motion.p 
          className={styles.subtitle}
          variants={itemVariants}
        >
          Reconnecting you with your lost belongings through our smart,
          efficient tracking system
        </motion.p>

        <motion.form
          className={styles.searchBar}
          onSubmit={handleSearch}
          variants={itemVariants}
        >
          <div className={styles.searchInputGroup}>
            <label htmlFor="search" className="sr-only">Search items</label>
            <motion.input
              id="search"
              type="search"
              placeholder="Search lost items, locations or keywords..."
              className={styles.searchInput}
              value={query}
              onChange={e => setQuery(e.target.value)}
              whileFocus={{ scale: 1.01 }}
            />
            <select
              aria-label="Category"
              className={styles.searchSelect}
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
              <option value="accessories">Accessories</option>
              <option value="other">Other</option>
            </select>
          </div>

          <motion.button
            type="submit"
            className={styles.searchBtn}
            whileHover={{ scale: 1.03 }}
            aria-label="Find items"
          >
            <SearchIcon />
            <span>Find</span>
          </motion.button>
        </motion.form>
      </motion.div>

      <motion.div 
        className={styles.heroImage}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className={styles.imageContainer}>
          <div className={styles.floatingCard1}>
            <div className={styles.cardContent}>📱 Phone Found</div>
          </div>
          <div className={styles.floatingCard2}>
            <div className={styles.cardContent}>🎒 Backpack Lost</div>
          </div>
          <div className={styles.floatingCard3}>
            <div className={styles.cardContent}>🔑 Keys Found</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;