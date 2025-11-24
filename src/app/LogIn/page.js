'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './LogIn.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [userType, setUserType] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      if (userType === 'admin') {
        router.push('/AdminDashboard');
      } else {
        router.push('/StudentDashboard');
      }
    }, 1500);
  };

  return (
    <div className={styles.loginPage}>
      {/* Animated Background - Matching Landing Page */}
      <div className={styles.backgroundGradient} />
      
      {/* Floating Orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      {/* Top Navigation Pill */}
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
        {/* Logo Pill */}
        <div className={styles.logoPill}>
          <span className={styles.logoIcon}>🔍</span>
          <span className={styles.logoText}>Lost & Found</span>
        </div>

        <h1 className={styles.mainTitle}>
          Welcome <span className={styles.titleGradient}>Back</span>
        </h1>
        
        <p className={styles.mainSubtitle}>
          Sign in to continue to your dashboard
        </p>

        {/* Login Form */}
        <div className={styles.formCard}>
            {/* User Type Switcher with Smooth Sliding Animation */}
            <div className={styles.switcherWrapper}>
              <div className={styles.switcherContainer}>
                <motion.div 
                  className={styles.switcherPill}
                  animate={{
                    x: userType === 'student' ? '0%' : '100%'
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8
                  }}
                />
                <button
                  type="button"
                  className={`${styles.switcherBtn} ${userType === 'student' ? styles.active : ''}`}
                  onClick={() => setUserType('student')}
                  disabled={isLoading}
                >
                  <span className={styles.switcherIcon}>👨‍🎓</span>
                  <span className={styles.switcherLabel}>Student</span>
                </button>
                <button
                  type="button"
                  className={`${styles.switcherBtn} ${userType === 'admin' ? styles.active : ''}`}
                  onClick={() => setUserType('admin')}
                  disabled={isLoading}
                >
                  <span className={styles.switcherIcon}>👨‍💼</span>
                  <span className={styles.switcherLabel}>Admin</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={userType}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={styles.formContent}
                >
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
                          setErrors({ ...errors, username: '' });
                        }}
                        placeholder={userType === 'admin' ? 'admin_username' : 'your_username'}
                        className={styles.input}
                        disabled={isLoading}
                        autoComplete="username"
                      />
                    </div>
                    <AnimatePresence>
                      {errors.username && (
                        <motion.span
                          className={styles.errorText}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {errors.username}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password Field */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.inputPill}>
                      <span className={styles.inputIcon}>🔒</span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors({ ...errors, password: '' });
                        }}
                        placeholder="Enter your password"
                        className={styles.input}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className={styles.togglePasswordBtn}
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <span>{showPassword ? '👁️' : '👁️‍🗨️'}</span>
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.span
                          className={styles.errorText}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {errors.password}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className={styles.formOptions}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className={styles.checkbox}
                        disabled={isLoading}
                      />
                      <span>Remember me</span>
                    </label>
                    
                    <button
                      type="button"
                      className={styles.forgotBtn}
                      disabled={isLoading}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button Pill */}
                  <motion.button
                    type="submit"
                    className={styles.submitBtnPill}
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
                          <span>Signing in...</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="signin"
                          className={styles.btnContent}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <span>Sign In</span>
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

                  {/* Student Signup Section */}
                  <AnimatePresence>
                    {userType === 'student' && (
                      <motion.div
                        className={styles.signupSection}
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                      >
                        <div className={styles.divider}>
                          <span className={styles.dividerLine} />
                          <span className={styles.dividerText}>or</span>
                          <span className={styles.dividerLine} />
                        </div>
                        
                        <motion.button
                          type="button"
                          className={styles.signupBtnPill}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isLoading}
                        >
                          <span>Create New Account</span>
                          <span>✨</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </form>
          </div>

        {/* Footer Text */}
        <p className={styles.footer}>
          Lost something? Found something? We&apos;ve got you covered. 🎒
        </p>
      </motion.div>
    </div>
  );
}
