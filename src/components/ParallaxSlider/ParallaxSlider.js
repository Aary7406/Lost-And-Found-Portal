'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ParallaxSlider.module.css';

export default function ParallaxSlider({ images = [], autoplay = true, interval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (!autoplay || images.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, interval, images.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sliderRef.current) return;
      
      const rect = sliderRef.current.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const sectionTop = rect.top + scrolled;

      // Parallax effect based on scroll position
      if (scrolled > sectionTop - window.innerHeight && scrolled < sectionTop + rect.height) {
        const parallaxOffset = (scrolled - (sectionTop - window.innerHeight)) * 0.3;
        setOffset(parallaxOffset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.placeholder}>No images to display</div>
      </div>
    );
  }

  return (
    <div ref={sliderRef} className={styles.sliderContainer}>
      <div 
        className={styles.sliderWrapper}
        style={{ transform: `translateY(${-offset}px)` }}
      >
        <div 
          className={styles.slidesTrack}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className={styles.slide}>
              <img 
                src={image.src || image} 
                alt={image.alt || `Slide ${index + 1}`}
                className={styles.slideImage}
              />
              {image.caption && (
                <div className={styles.caption}>
                  {image.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrev} 
            className={`${styles.navButton} ${styles.prevButton}`}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button 
            onClick={handleNext} 
            className={`${styles.navButton} ${styles.nextButton}`}
            aria-label="Next slide"
          >
            ›
          </button>

          <div className={styles.dots}>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
