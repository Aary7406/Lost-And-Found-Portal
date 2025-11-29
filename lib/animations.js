// Animation Constants - Project-wide animation configurations
// Optimized for 120fps performance using GPU-accelerated properties

export const ANIMATIONS = {
  // One UI 8 Style Modal Morph - True morph from button to modal (120fps optimized)
  modalMorph: {
    initial: { 
      scale: 0.1,
      opacity: 0,
      borderRadius: '50%',
      y: 0,
      x: 0,
      rotate: 0
    },
    animate: { 
      scale: 1,
      opacity: 1,
      borderRadius: '32px',
      y: 0,
      x: 0,
      rotate: 0,
      transition: {
        duration: 0.65,
        ease: [0.25, 0.46, 0.45, 0.94], // Smooth easeOutCubic
        scale: {
          type: 'spring',
          damping: 28,
          stiffness: 200,
          mass: 1.2,
          restDelta: 0.001,
          restSpeed: 0.001
        },
        borderRadius: {
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94]
        },
        opacity: {
          duration: 0.35,
          ease: 'easeOut'
        },
        x: {
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94]
        },
        y: {
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    },
    exit: { 
      scale: 0.1,
      opacity: 0,
      borderRadius: '50%',
      y: 0,
      x: 0,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: [0.55, 0.085, 0.68, 0.53], // Smooth easeInCubic (reverse curve)
        scale: {
          type: 'spring',
          damping: 30,
          stiffness: 250,
          mass: 1,
          restDelta: 0.001,
          restSpeed: 0.001
        },
        borderRadius: {
          duration: 0.45,
          ease: [0.55, 0.085, 0.68, 0.53]
        },
        opacity: {
          duration: 0.3,
          ease: 'easeIn',
          delay: 0.1
        },
        x: {
          duration: 0.5,
          ease: [0.55, 0.085, 0.68, 0.53]
        },
        y: {
          duration: 0.5,
          ease: [0.55, 0.085, 0.68, 0.53]
        }
      }
    }
  },

  // Modal Overlay Fade - 120fps Optimized
  overlayFade: {
    initial: { 
      opacity: 0,
      backdropFilter: 'blur(0px)'
    },
    animate: { 
      opacity: 1,
      backdropFilter: 'blur(20px)',
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        backdropFilter: {
          duration: 0.6
        }
      }
    },
    exit: { 
      opacity: 0,
      backdropFilter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: [0.55, 0.085, 0.68, 0.53],
        backdropFilter: {
          duration: 0.35
        }
      }
    }
  },

  // Smooth Scale Pop
  scalePop: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
        restDelta: 0.001,
        restSpeed: 0.001
      }
    },
    exit: { 
      scale: 0.9, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  },

  // Slide Up Animation
  slideUp: {
    initial: { y: 30, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        restDelta: 0.001,
        restSpeed: 0.001
      }
    },
    exit: { 
      y: 30, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  },

  // Stagger Children Animation
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  staggerItem: {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
        restDelta: 0.001,
        restSpeed: 0.001
      }
    }
  }
};

// Easing curves for consistent motion (optimized for 120fps smoothness)
export const EASING = {
  emphasized: [0.4, 0, 0.2, 1],
  standard: [0.2, 0, 0, 1],
  decelerated: [0, 0, 0.2, 1],
  accelerated: [0.4, 0, 1, 1],
  smooth: [0.25, 0.46, 0.45, 0.94], // easeOutCubic - very smooth
  smoothIn: [0.55, 0.085, 0.68, 0.53], // easeInCubic - very smooth (reverse)
  spring: {
    type: 'spring',
    damping: 28,
    stiffness: 200,
    mass: 1.2,
    restDelta: 0.001,
    restSpeed: 0.001
  }
};

// Duration constants (in seconds)
export const DURATION = {
  fast: 0.2,
  normal: 0.3,
  smooth: 0.5,
  slow: 0.65,
  verySlow: 0.8
};

