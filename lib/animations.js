// Animation Constants - Project-wide animation configurations
// Optimized for 120fps performance using GPU-accelerated properties

export const ANIMATIONS = {
  // One UI 8 Style Modal Morph - 120fps optimized (GPU accelerated)
  modalMorph: {
    initial: { 
      scale: 0.85,
      opacity: 0
    },
    animate: { 
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 400,
        mass: 0.8,
        restDelta: 0.001
      }
    },
    exit: { 
      scale: 0.85,
      opacity: 0,
      transition: {
        duration: 0.15,
        ease: [0.4, 0, 1, 1]
      }
    }
  },

  // Modal Overlay Fade - 120fps Optimized (no animated blur)
  overlayFade: {
    initial: { 
      opacity: 0
    },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.15,
        ease: 'easeIn'
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

