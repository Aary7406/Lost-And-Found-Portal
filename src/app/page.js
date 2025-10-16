// pages/index.js or app/page.js (depending on your Next.js version)
'use client'
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero/Hero';
import Features from '../components/Features/Features';
import Stats from '../components/Stats/Stats';
import CTA from '../components/CTA/CTA';
import styles from './styles/LandingPage.module.css';

export default function LandingPage() {
  const containerRef = useRef(null);

  // useEffect(() => {
  //   // Add any global animations or effects here
  //   const handleScroll = () => {
  //     const scrolled = window.pageYOffset;
  //     const parallax = containerRef.current?.querySelector(`.${styles.backgroundOverlay}`);
  //     if (parallax) {
  //       parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
  //     }
  //   };

  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.backgroundOverlay} />
      
      <motion.main 
        className={styles.main}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Hero />
        <Features />
        <Stats />
        <CTA />
      </motion.main>
    </div>
  );
}