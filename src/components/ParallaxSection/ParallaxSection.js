'use client';

import { useEffect, useRef } from 'react';
import styles from './ParallaxSection.module.css';

export default function ParallaxSection({ children, speed = 0.5, className = '' }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + scrolled;
      const sectionHeight = rect.height;

      // Only apply parallax when section is in viewport
      if (scrolled + window.innerHeight > sectionTop && scrolled < sectionTop + sectionHeight) {
        const offset = (scrolled - sectionTop) * speed;
        section.style.transform = `translateY(${offset}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  return (
    <div ref={sectionRef} className={`${styles.parallaxSection} ${className}`}>
      {children}
    </div>
  );
}
