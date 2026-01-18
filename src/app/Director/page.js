'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Director.module.css';

export default function DirectorLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/director/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe: false })
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/DirectorDashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.directorPage}>
      {/* Animated Background */}
      <div className={styles.backgroundGradient} />

      {/* Floating Orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      {/* Back Navigation */}
      <motion.nav
        className={styles.topNav}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/" className={styles.backPill}>
          <span>←</span>
          <span>Back to Home</span>
        </Link>
      </motion.nav>

      {/* Main Container */}
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      >
        {/* Director Badge */}
        <motion.div
          className={styles.directorBadge}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className={styles.badgeIcon}>👑</span>
          <span className={styles.badgeText}>Director Access</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Secure Portal
        </motion.h1>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Administrative access for system management
        </motion.p>

        {/* Login Card */}
        <motion.div
          className={styles.loginCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
        >
          <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
            {/* Hidden inputs to prevent browser autofill issues */}
            <input style={{ display: 'none' }} type="text" name="fakeusernameremembered" />
            <input style={{ display: 'none' }} type="password" name="fakepasswordremembered" />

            {/* Username Field */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Username</label>
              <div className={styles.inputPill}>
                <span className={styles.inputIcon}>👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="director_username"
                  className={styles.input}
                  disabled={isLoading}
                  autoComplete="off"
                  name="director-user"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputPill}>
                <span className={styles.inputIcon}>🔐</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter password"
                  className={styles.input}
                  disabled={isLoading}
                  autoComplete="new-password"
                  name="director-pass"
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span>{showPassword ? '👁️' : '👁️‍🗨️'}</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className={styles.errorMessage}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <span>⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    className={styles.btnContent}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.span
                      className={styles.spinner}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    >
                      ⭐
                    </motion.span>
                    <span>Authenticating...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signin"
                    className={styles.btnContent}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span>Access Portal</span>
                    <motion.span
                      className={styles.arrow}
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      →
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          className={styles.securityNotice}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span className={styles.lockIcon}>🔒</span>
          <p>This is a secure area. All access attempts are logged and monitored.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}