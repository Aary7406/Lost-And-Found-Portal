// pages/index.js or app/page.js (depending on your Next.js version)
'use client'
import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from '../components/Hero/Hero';
import Features from '../components/Features/Features';
import Stats from '../components/Stats/Stats';
import CTA from '../components/CTA/CTA';
import styles from './styles/LandingPage.module.css';

// Register GSAP ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  // Framer Motion useScroll for smooth parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth spring physics for parallax
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Transform scroll progress into parallax values
  const backgroundY = useTransform(smoothProgress, [0, 1], ['0%', '50%']);
  const heroY = useTransform(smoothProgress, [0, 0.5], ['0%', '30%']);
  const featuresY = useTransform(smoothProgress, [0.2, 0.6], ['10%', '-10%']);
  const statsScale = useTransform(smoothProgress, [0.4, 0.7], [0.8, 1]);
  const ctaOpacity = useTransform(smoothProgress, [0.7, 0.9], [0, 1]);

  useEffect(() => {
    // GSAP ScrollTrigger animations for more complex effects
    const ctx = gsap.context(() => {
      // Hero section - fade and scale on scroll
      if (heroRef.current) {
        gsap.to(heroRef.current, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
            markers: false
          },
          opacity: 0.3,
          scale: 0.9,
          ease: "none"
        });
      }

      // Features section - stagger animation on scroll into view
      if (featuresRef.current) {
        const featureCards = featuresRef.current.querySelectorAll('[data-feature-card]');
        gsap.from(featureCards, {
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            end: "top 20%",
            toggleActions: "play none none reverse"
          },
          y: 100,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out"
        });
      }

      // Stats section - counter animation
      if (statsRef.current) {
        const statNumbers = statsRef.current.querySelectorAll('[data-stat-number]');
        statNumbers.forEach((stat) => {
          const target = parseInt(stat.getAttribute('data-target') || '0');
          gsap.from(stat, {
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 70%",
              toggleActions: "play none none none"
            },
            textContent: 0,
            duration: 2,
            ease: "power1.inOut",
            snap: { textContent: 1 },
            onUpdate: function() {
              stat.textContent = Math.ceil(this.targets()[0].textContent);
            }
          });
        });
      }

      // CTA section - fade and slide up
      if (ctaRef.current) {
        gsap.from(ctaRef.current, {
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 90%",
            end: "top 60%",
            scrub: 1
          },
          y: 100,
          opacity: 0,
          ease: "power2.out"
        });
      }

      // Parallax background layers
      const backgroundLayers = containerRef.current?.querySelectorAll('[data-parallax-layer]');
      backgroundLayers?.forEach((layer, index) => {
        const speed = parseFloat(layer.getAttribute('data-speed') || '1');
        gsap.to(layer, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true
          },
          y: `${speed * 100}%`,
          ease: "none"
        });
      });
    }, containerRef);

    return () => {
      ctx.revert(); // Cleanup GSAP animations
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Parallax Background Layers */}
      <motion.div 
        className={styles.backgroundOverlay}
        style={{ y: backgroundY }}
        data-parallax-layer
        data-speed="0.5"
      />
      
      <div 
        className={styles.backgroundLayer1}
        data-parallax-layer
        data-speed="0.3"
      />
      
      <div 
        className={styles.backgroundLayer2}
        data-parallax-layer
        data-speed="0.7"
      />
      
      <motion.main 
        className={styles.main}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          ref={heroRef}
          style={{ y: heroY }}
        >
          <Hero />
        </motion.div>

        <motion.div 
          ref={featuresRef}
          style={{ y: featuresY }}
        >
          <Features />
        </motion.div>

        <motion.div 
          ref={statsRef}
          style={{ scale: statsScale }}
        >
          <Stats />
        </motion.div>

        <motion.div 
          ref={ctaRef}
          style={{ opacity: ctaOpacity }}
        >
          <CTA />
        </motion.div>
      </motion.main>
    </div>
  );
}