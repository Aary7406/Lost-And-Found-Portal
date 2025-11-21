'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import styles from './LogIn.module.css';

const LoginPage = () => {
  const router = useRouter();
  const [userType, setUserType] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login:', { username, password, userType, rememberMe });
      if (userType === 'admin') {
        router.push('/AdminDashboard');
      } else {
        router.push('/StudentDashboard');
      }
    }, 1500);
  };

  const handleSignup = () => {
    console.log('Navigate to signup');
  };

  return (
    <div className={styles.loginPage}>
      {/* Optimized Static Background */}
      <div className={styles.backgroundWrapper}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gradientOrb3} />
      </div>

      {/* Main Content */}
      <div className={styles.contentWrapper}>
        <motion.div
          className={styles.loginContainer}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* Logo & Title - Compact */}
          <div className={styles.header}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🎓</span>
              <span className={styles.logoText}>Lost & Found</span>
              {/* Features moved here as badges */}
              <div className={styles.featureBadges}>
                <span className={styles.badge} title="Secure Login">🔒</span>
                <span className={styles.badge} title="Fast Access">⚡</span>
                <span className={styles.badge} title="Mobile Friendly">📱</span>
              </div>
            </div>
            <h1 className={styles.title}>Welcome Back</h1>
          </div>

          {/* Login Card */}
          <div className={styles.loginCard}>
            {/* User Type Selector */}
            <div className={styles.userTypeSelector}>
              <motion.div
                className={styles.selectorBackground}
                animate={{
                  x: userType === 'student' ? '0%' : '100%',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 250,
                  damping: 25,
                }}
              />
              
              <button
                type="button"
                className={`${styles.selectorButton} ${userType === 'student' ? styles.active : ''}`}
                onClick={() => setUserType('student')}
              >
                <span className={styles.selectorIcon}>👨‍🎓</span>
                <span>Student</span>
              </button>
              
              <button
                type="button"
                className={`${styles.selectorButton} ${userType === 'admin' ? styles.active : ''}`}
                onClick={() => setUserType('admin')}
              >
                <span className={styles.selectorIcon}>👨‍💼</span>
                <span>Admin</span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className={styles.form}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={userType}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Username Input */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Username</label>
                    <div className={styles.inputWrapper}>
                      <span className={styles.inputIcon}>👤</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setErrors({ ...errors, username: '' });
                        }}
                        placeholder={userType === 'admin' ? 'admin_username' : 'student_username'}
                        className={styles.input}
                      />
                    </div>
                    {errors.username && (
                      <motion.span
                        className={styles.error}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {errors.username}
                      </motion.span>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.inputWrapper}>
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
                      />
                      <button
                        type="button"
                        className={styles.togglePassword}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.span
                        className={styles.error}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {errors.password}
                      </motion.span>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className={styles.formOptions}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span>Remember me</span>
                    </label>
                    
                    <button
                      type="button"
                      className={styles.forgotPassword}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <motion.button
                    type="submit"
                    className={styles.loginButton}
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <motion.div
                      className={styles.buttonFill}
                      initial={false}
                      animate={{
                        width: isLoading ? '100%' : '0%',
                      }}
                      transition={{ duration: 1.5, ease: 'linear' }}
                    />
                    <span className={styles.buttonContent}>
                      {isLoading ? (
                        <>
                          <motion.span
                            className={styles.spinner}
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          >
                            ⭐
                          </motion.span>
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In
                          <span>→</span>
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            </form>

            {/* Sign Up Section - Only for Students */}
            <AnimatePresence>
              {userType === 'student' && (
                <motion.div
                  className={styles.signupSection}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className={styles.divider}>
                    <span>or</span>
                  </div>
                  
                  <motion.button
                    type="button"
                    className={styles.signupButton}
                    onClick={handleSignup}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span>Create Student Account</span>
                    <span>✨</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
