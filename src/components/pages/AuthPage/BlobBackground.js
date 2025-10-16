import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './BlobBackground.module.css';

const BlobBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const blobs = containerRef.current.querySelectorAll('.blob');
    
    // Initial setup
    gsap.set(blobs, {
      transformOrigin: "center center"
    });

    // Continuous floating animation for each blob
    blobs.forEach((blob, index) => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      
      tl.to(blob, {
        duration: gsap.utils.random(8, 12),
        rotation: gsap.utils.random(-15, 15),
        x: gsap.utils.random(-30, 30),
        y: gsap.utils.random(-40, 40),
        scale: gsap.utils.random(0.8, 1.2),
        ease: "sine.inOut"
      })
      .to(blob, {
        duration: gsap.utils.random(6, 10),
        rotation: gsap.utils.random(-10, 10),
        x: gsap.utils.random(-20, 20),
        y: gsap.utils.random(-30, 30),
        scale: gsap.utils.random(0.9, 1.1),
        ease: "sine.inOut"
      });

      // Stagger the start times
      tl.delay(index * 2);
    });

    // Mouse interaction
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const deltaX = (clientX - centerX) / centerX;
      const deltaY = (clientY - centerY) / centerY;

      blobs.forEach((blob, index) => {
        const speed = (index + 1) * 0.5;
        gsap.to(blob, {
          x: deltaX * 20 * speed,
          y: deltaY * 15 * speed,
          duration: 2,
          ease: "power2.out"
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={styles.blobContainer} ref={containerRef}>
      {/* Primary Blobs */}
      <div className={`${styles.blob} ${styles.blob1} blob`}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path 
            fill="url(#gradient1)" 
            d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,89.5,-0.5C89,15.3,85.4,30.6,78.1,43.8C70.8,57,59.8,68.1,46.3,75.7C32.8,83.3,16.4,87.4,0.6,86.4C-15.2,85.4,-30.4,79.3,-43.8,71.1C-57.2,62.9,-68.8,52.6,-76.3,39.4C-83.8,26.2,-87.2,10.1,-86.9,-6.2C-86.6,-22.5,-82.6,-45,-74.4,-63.2C-66.2,-81.4,-53.8,-95.3,-39.1,-102.1C-24.4,-108.9,-7.4,-108.6,6.8,-119.4C21,-130.2,42,-152.1,56.7,-145.4Z" 
            transform="translate(100 100)" 
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(203, 166, 247, 0.3)" />
              <stop offset="100%" stopColor="rgba(137, 180, 250, 0.2)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className={`${styles.blob} ${styles.blob2} blob`}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path 
            fill="url(#gradient2)" 
            d="M37.8,-62.9C47.8,-56.2,53.4,-42.5,58.1,-29.4C62.8,-16.3,66.6,-3.8,66.3,8.9C66,21.6,61.6,34.5,54.2,45.8C46.8,57.1,36.4,66.8,24.6,72.4C12.8,78,0.6,79.5,-12.1,77.2C-24.8,74.9,-38,68.8,-48.7,59.9C-59.4,51,-67.6,39.3,-71.3,26.4C-75,13.5,-74.2,-0.6,-70.8,-13.9C-67.4,-27.2,-61.4,-39.7,-52.4,-47C-43.4,-54.3,-31.4,-55.4,-20.2,-59.7C-9,-64,-8.6,-71.5,3.2,-76.8C15,-82.1,27.8,-69.6,37.8,-62.9Z" 
            transform="translate(100 100)" 
          />
          <defs>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(245, 194, 231, 0.25)" />
              <stop offset="100%" stopColor="rgba(203, 166, 247, 0.2)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default BlobBackground;
