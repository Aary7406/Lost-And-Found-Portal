'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from './PageLoader.module.css';

const PageLoader = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const controls = useAnimation();

  // Advanced mathematical easing functions
  const easeOutExpo = [0.19, 1, 0.22, 1];
  const easeInOutQuint = [0.83, 0, 0.17, 1];
  const easeOutBack = [0.34, 1.56, 0.64, 1];
  const customBounce = [0.68, -0.55, 0.265, 1.55];

  useEffect(() => {
    const sequence = async () => {
      // Stage 1: Initial reveal - faster
      await controls.start({
        opacity: 1,
        transition: { duration: 0.2, ease: easeOutExpo }
      });

      // Stage 2: Particle expansion - reduced time
      setStage(1);
      await new Promise(resolve => setTimeout(resolve, 400));

      // Stage 3: Convergence phase - reduced time
      setStage(2);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Stage 4: Final transition - faster
      setStage(3);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Complete and notify parent
      if (onComplete) onComplete();
    };

    sequence();
  }, [controls, onComplete]);

  // Generate particle positions using golden ratio spiral (Fibonacci) - reduced count
  const generateParticles = (count) => {
    const particles = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // 137.5 degrees in radians

    for (let i = 0; i < count; i++) {
      const angle = i * goldenAngle;
      const radius = Math.sqrt(i) * 15;
      particles.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        delay: i * 0.008,
        scale: 1 - (i / count) * 0.5
      });
    }
    return particles;
  };

  const particles = generateParticles(24);

  // SVG path for advanced morphing animation
  const morphPaths = {
    circle: "M 50 50 m -40, 0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0",
    square: "M 20 20 L 80 20 L 80 80 L 20 80 Z",
    star: "M 50 10 L 61 35 L 88 35 L 67 52 L 77 78 L 50 60 L 23 78 L 33 52 L 12 35 L 39 35 Z",
    infinity: "M 30 50 Q 20 30, 35 30 Q 50 30, 50 50 Q 50 70, 35 70 Q 20 70, 30 50 M 70 50 Q 80 30, 65 30 Q 50 30, 50 50 Q 50 70, 65 70 Q 80 70, 70 50"
  };

  return (
    <motion.div
      className={styles.loaderContainer}
      initial={{ opacity: 0 }}
      animate={controls}
      exit={{
        opacity: 0,
        scale: 1.2,
        filter: 'blur(10px)',
        transition: {
          duration: 0.4,
          ease: easeInOutQuint
        }
      }}
    >
      {/* Animated gradient background with radial expansion */}
      <motion.div
        className={styles.gradientBg}
        animate={{
          background: [
            'radial-gradient(circle at 50% 50%, rgba(203, 166, 247, 0.12) 0%, transparent 70%)',
            'radial-gradient(circle at 50% 50%, rgba(137, 180, 250, 0.12) 0%, transparent 70%)',
            'radial-gradient(circle at 50% 50%, rgba(245, 194, 231, 0.12) 0%, transparent 70%)',
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* Central logo animation with spring physics */}
      <motion.div
        className={styles.logoContainer}
        initial={{ scale: 0, rotate: -90 }}
        animate={stage >= 1 ? {
          scale: [0, 1.1, 1],
          rotate: [0, 360],
        } : {}}
        transition={{
          duration: 0.6,
          ease: customBounce,
          times: [0, 0.6, 1]
        }}
      >
        <motion.div
          className={styles.logoRing}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          {/* SVG morphing shape */}
          <svg viewBox="0 0 100 100" className={styles.morphSvg}>
            <motion.path
              d={morphPaths.circle}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              animate={{
                d: [
                  morphPaths.circle,
                  morphPaths.star,
                  morphPaths.circle
                ],
              }}
              transition={{
                duration: 2,
                ease: easeInOutQuint,
                times: [0, 0.5, 1],
                repeat: Infinity
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--ctp-mauve)" />
                <stop offset="50%" stopColor="var(--ctp-blue)" />
                <stop offset="100%" stopColor="var(--ctp-pink)" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <motion.span
          className={styles.logoEmoji}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          🎓
        </motion.span>
      </motion.div>

      {/* Fibonacci spiral particles */}
      <div className={styles.particleField}>
        {particles.map((particle, index) => (
          <motion.div
            key={index}
            className={styles.particle}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 0
            }}
            animate={stage >= 1 ? {
              x: particle.x,
              y: particle.y,
              scale: particle.scale,
              opacity: [0, 1, 0],
            } : {}}
            transition={{
              delay: particle.delay,
              duration: 1,
              ease: easeOutBack,
              opacity: {
                duration: 1,
                times: [0, 0.5, 1]
              }
            }}
          />
        ))}
      </div>

      {/* Loading text with wave animation */}
      <motion.div
        className={styles.textContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: easeOutExpo }}
      >
        <div className={styles.loadingText}>
          {['L', 'o', 'a', 'd', 'i', 'n', 'g'].map((letter, index) => (
            <motion.span
              key={index}
              animate={{
                y: [0, -8, 0],
                color: [
                  'var(--ctp-text)',
                  'var(--ctp-mauve)',
                  'var(--ctp-blue)',
                  'var(--ctp-text)'
                ]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.08,
                ease: 'easeInOut'
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Progress bar with spring animation */}
        <div className={styles.progressBar}>
          <motion.div
            className={styles.progressFill}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 1.1,
              ease: easeInOutQuint
            }}
          />
        </div>
      </motion.div>

      {/* Orbital rings with mathematical precision */}
      {[1, 2].map((ring) => (
        <motion.div
          key={ring}
          className={styles.orbitalRing}
          style={{
            width: `${ring * 150}px`,
            height: `${ring * 150}px`,
          }}
          animate={{
            rotate: ring % 2 === 0 ? 360 : -360,
            opacity: [0.08, 0.2, 0.08]
          }}
          transition={{
            rotate: {
              duration: 8 / ring,
              repeat: Infinity,
              ease: 'linear'
            },
            opacity: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
        />
      ))}
    </motion.div>
  );
};

export default PageLoader;
