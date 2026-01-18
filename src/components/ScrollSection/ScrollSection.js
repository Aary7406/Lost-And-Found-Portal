'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './ScrollSection.module.css';

/**
 * Inner component that handles scroll tracking - only rendered after mount
 */
function ScrollSectionInner({ children, index, id, className }) {
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end start']
    });

    // Scale down from 1 to 0.9 as we scroll through
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

    // Fade out slightly
    const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0.6]);

    // Add border radius as it scales down
    const borderRadius = useTransform(scrollYProgress, [0, 1], [0, 24]);

    return (
        <section
            ref={sectionRef}
            id={id}
            className={`${styles.scrollSection} ${className}`}
            style={{ zIndex: 10 - index }}
        >
            <motion.div
                className={styles.stickyContent}
                style={{
                    scale,
                    opacity,
                    borderRadius
                }}
            >
                {children}
            </motion.div>
        </section>
    );
}

/**
 * ScrollSection - A wrapper component for scroll-triggered stacking card effect.
 * As the user scrolls past this section, it becomes sticky, scales down, and fades.
 */
export default function ScrollSection({ children, index = 0, isLast = false, id, className = '' }) {
    const [isMounted, setIsMounted] = useState(false);

    // Wait for hydration before enabling scroll tracking
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (isLast) {
        // Last section doesn't need sticky behavior - flows into footer
        return (
            <section id={id} className={`${styles.scrollSection} ${styles.lastSection} ${className}`}>
                {children}
            </section>
        );
    }

    // Before mount, render without scroll tracking
    if (!isMounted) {
        return (
            <section
                id={id}
                className={`${styles.scrollSection} ${className}`}
                style={{ zIndex: 10 - index }}
            >
                <div className={styles.stickyContent}>
                    {children}
                </div>
            </section>
        );
    }

    // After mount, render with scroll tracking
    return (
        <ScrollSectionInner index={index} id={id} className={className}>
            {children}
        </ScrollSectionInner>
    );
}
