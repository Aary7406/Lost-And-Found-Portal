'use client';

import styles from './StickyFooter.module.css';

export default function StickyFooter() {
  return (
    <div className={styles.stickyFooterWrapper}>
      <div className={styles.stickyFooterFixed}>
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <h3 className={styles.footerLogo}>Lost & Found</h3>
              <p className={styles.footerTagline}>
                Reuniting students with their belongings.
              </p>
            </div>
            
            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4>Platform</h4>
                <a href="/search">Search</a>
                <a href="/LogIn">Report</a>
                <a href="/StudentDashboard">Dashboard</a>
              </div>
              
              <div className={styles.footerColumn}>
                <h4>Support</h4>
                <a href="#">Help</a>
                <a href="#">Contact</a>
                <a href="#">FAQ</a>
              </div>
              
              <div className={styles.footerColumn}>
                <h4>Legal</h4>
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Cookies</a>
              </div>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <p>&copy; 2025 Lost & Found Portal</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
