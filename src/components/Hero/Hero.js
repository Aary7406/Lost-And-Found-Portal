// components/Hero/Hero.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchIcon from '../Icons/SearchIcon';
import styles from './Hero.module.css';
import Link from 'next/link';

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

        <motion.div 
          className={styles.ctaGroup}
          variants={itemVariants}
        ><Link href={'/LogIn'}>
          <motion.button 
            className={styles.primaryBtn}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            >
            <SearchIcon />
            Find Items
          </motion.button>
          </Link>
          
          <Link href={'/LogIn'}>
          <motion.button 
            className={styles.secondaryBtn}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Report Lost Item
          </motion.button>
          </Link>
        </motion.div>
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