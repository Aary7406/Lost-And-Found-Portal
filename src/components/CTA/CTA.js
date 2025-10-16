// components/CTA/CTA.js
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import SearchIcon from '../Icons/SearchIcon';
import styles from './CTA.module.css';

const CTA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.3 });

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
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
    <section className={styles.cta} ref={ref}>
      <div className={styles.container}>
        <motion.div 
          className={styles.ctaCard}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className={styles.backgroundPattern} />
          <div className={styles.glowEffect} />
          
          <motion.div 
            className={styles.content}
            variants={itemVariants}
          >
            <span className={styles.badge}>Get Started</span>
            <h2 className={styles.title}>
              Ready to find your <span className={styles.highlight}>lost items</span>?
            </h2>
            <p className={styles.subtitle}>
              Join hundreds of students who have successfully recovered their belongings through our platform
            </p>
            
            <motion.div 
              className={styles.buttonGroup}
              variants={itemVariants}
            >
              <motion.button 
                className={styles.primaryBtn}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <SearchIcon size={20} />
                Start Searching
              </motion.button>
              
              <motion.button 
                className={styles.secondaryBtn}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Report an Item
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div 
            className={styles.illustration}
            variants={itemVariants}
          >
            <div className={styles.floatingElements}>
              <div className={styles.element1}>📱</div>
              <div className={styles.element2}>🎒</div>
              <div className={styles.element3}>🔑</div>
              <div className={styles.element4}>📖</div>
              <div className={styles.element5}>💻</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;