'use client';

import { useEffect, useRef } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from '@/components/Hero/Hero';
import Features from '@/components/Features/Features';
import Stats from '@/components/Stats/Stats';
import CTA from '@/components/CTA/CTA';
import styles from './styles/LandingPage.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const backgroundY = useTransform(smoothProgress, [0, 1], ['0%', '100%']);
  const backgroundOpacity = useTransform(smoothProgress, [0, 0.5, 1], [1, 0.6, 0.3]);
  
  useEffect(() => {
    // GSAP ScrollTrigger animations
    const featureCards = document.querySelectorAll('[data-feature-card]');
    const statNumbers = document.querySelectorAll('[data-stat-number]');
    
    // Animate feature cards
    featureCards.forEach((card, index) => {
      gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 80,
          rotateX: -15,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 65%',
            toggleActions: 'play none none reverse',
          },
          delay: index * 0.15
        }
      );
    });

    // Animate stat numbers with counter
    statNumbers.forEach((stat) => {
      const target = parseInt(stat.dataset.target);
      gsap.from(stat, {
        textContent: 0,
        duration: 2.5,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: stat,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        onUpdate: function() {
          stat.textContent = Math.ceil(stat.textContent);
        }
      });
    });

    // Parallax sections
    gsap.utils.toArray('[data-speed]').forEach((section) => {
      const speed = parseFloat(section.dataset.speed);
      gsap.to(section, {
        y: (i, target) => -ScrollTrigger.maxScroll(window) * speed * target.dataset.direction,
        ease: 'none',
        scrollTrigger: {
          start: 0,
          end: 'max',
          invalidateOnRefresh: true,
          scrub: 0
        }
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <main className={styles.main}>
      {/* Animated Background Layers */}
      <motion.div 
        className={styles.backgroundLayer1}
        style={{ 
          y: backgroundY,
          opacity: backgroundOpacity 
        }}
      />
      <motion.div 
        className={styles.backgroundLayer2}
        style={{ 
          y: useTransform(smoothProgress, [0, 1], ['0%', '50%']),
          opacity: backgroundOpacity 
        }}
      />
      
      {/* Gradient Orbs */}
      <div className={styles.gradientOrb1} data-speed="0.15" data-direction="1" />
      <div className={styles.gradientOrb2} data-speed="0.25" data-direction="-1" />
      <div className={styles.gradientOrb3} data-speed="0.2" data-direction="1" />
      
      {/* Content Sections */}
      <div className={styles.content}>
        <Hero />
        <div className={styles.divider} />
        <Features />
        <div className={styles.divider} />
        <Stats />
        <div className={styles.divider} />
        <CTA />
        
        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <h3 className={styles.footerLogo}>Lost & Found</h3>
              <p className={styles.footerTagline}>
                Reuniting students with their belongings, one item at a time.
              </p>
            </div>
            
            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4>Platform</h4>
                <a href="/search">Search Items</a>
                <a href="/LogIn">Report Item</a>
                <a href="/StudentDashboard">Dashboard</a>
              </div>
              
              <div className={styles.footerColumn}>
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact Us</a>
                <a href="#">FAQ</a>
              </div>
              
              <div className={styles.footerColumn}>
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <p>&copy; 2025 Lost & Found Portal. All rights reserved.</p>
            <div className={styles.footerSocials}>
              <a href="#" aria-label="Twitter">𝕏</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="LinkedIn">💼</a>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Scroll Progress Indicator */}
      <motion.div 
        className={styles.scrollProgress}
        style={{ scaleX: scrollYProgress }}
      />
    </main>
  );
}
