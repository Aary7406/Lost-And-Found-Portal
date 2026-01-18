'use client';

import TransitionLink from '@/components/TransitionLink/TransitionLink';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                {/* Logo Pill */}
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className={styles.logoPill}
                >
                    <span className={styles.logoIcon}>🎓</span>
                    <span className={styles.logoText}>Lost & Found</span>
                </button>

                {/* Nav Pills */}
                <div className={styles.navPills}>
                    <button
                        onClick={() => document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className={styles.navPill}
                    >
                        <span>Impact</span>
                    </button>
                    <button
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className={styles.navPill}
                    >
                        <span>Features</span>
                    </button>
                </div>

                {/* Login Pill Button */}
                <TransitionLink href="/LogIn" className={styles.loginPill}>
                    <span>Login</span>
                    <span className={styles.loginArrow}>→</span>
                </TransitionLink>
            </div>
        </nav>
    );
}
