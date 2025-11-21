'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Hero from '@/components/Hero/Hero';
import Features from '@/components/Features/Features';
import Stats from '@/components/Stats/Stats';
import CTA from '@/components/CTA/CTA';
import styles from './styles/LandingPage.module.css';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Optimized transforms with reduced calculations
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.5]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className={styles.main}>
      {/* Simple static background - no heavy animations */}
      <div className={styles.backgroundGradient} />
      
      {/* Content with optimized animations */}
      <div className={styles.content}>
        <Hero />
        
        <section className={styles.section}>
          <Features />
        </section>
        
        <section className={styles.section}>
          <Stats />
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
      </div>
      
      {/* Lightweight scroll indicator */}
      <motion.div 
        className={styles.scrollIndicator}
        style={{ scaleX: scrollYProgress }}
      />
    </main>
  );
}
