'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import Hero from '@/components/Hero/Hero';
import Features from '@/components/Features/Features';
import Stats from '@/components/Stats/Stats';
import CTA from '@/components/CTA/CTA';
import PageLoader from '@/components/PageLoader/PageLoader';
import styles from './styles/LandingPage.module.css';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const lenisRef = useRef(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    // Initialize Lenis with optimized settings
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: true,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handleLoadingComplete = () => {
    setLoading(false);
    setTimeout(() => setContentVisible(true), 50);
  };

  return (
    <>
      {/* Advanced Page Loader with Mathematical Animations */}
      <AnimatePresence mode="wait">
        {loading && <PageLoader onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      {/* Main Content with Staggered Entrance */}
      <AnimatePresence>
        {contentVisible && (
          <motion.main 
            className={styles.main}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
          >
            {/* Simple static background - no heavy animations */}
            <div className={styles.backgroundGradient} />
            
            {/* Content with optimized animations */}
            <motion.div 
              className={styles.content}
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.19, 1, 0.22, 1],
                delay: 0.1 
              }}
            >
              <Hero />
              
              <section id="impact" className={styles.section}>
                <Stats />
              </section>
              
              <section id="features" className={styles.section}>
                <Features />
              </section>
              
              <section className={styles.section}>
                <CTA />
              </section>
              
              {/* Simple Footer */}
              <footer className={styles.footer}>
                <div className={styles.footerContent}>
                  <div className={styles.footerBrand}>
                    <h3 className={styles.footerLogo}>Lost & Found</h3>
                    <p className={styles.footerTagline}>
                      Reuniting students with their belongings.
                    </p>
                  </div>
                  
                  <div className={styles.footerLinks}>
                    <div className={styles.footerColumn}>
                      <h4>Platform</h4>
                      <a href="/search">Search</a>
                      <a href="/LogIn">Report</a>
                      <a href="/StudentDashboard">Dashboard</a>
                    </div>
                    
                    <div className={styles.footerColumn}>
                      <h4>Support</h4>
                      <a href="#">Help</a>
                      <a href="#">Contact</a>
                      <a href="#">FAQ</a>
                    </div>
                    
                    <div className={styles.footerColumn}>
                      <h4>Legal</h4>
                      <a href="#">Privacy</a>
                      <a href="#">Terms</a>
                      <a href="#">Cookies</a>
                    </div>
                  </div>
                </div>
                
                <div className={styles.footerBottom}>
                  <p>&copy; 2025 Lost & Found Portal</p>
                </div>
              </footer>
            </motion.div>
            
            {/* Lightweight scroll indicator */}
            <motion.div 
              className={styles.scrollIndicator}
              style={{ scaleX: scrollYProgress }}
            />
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
}
