'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import styles from './LogIn_NEW.module.css';

const LoginPage = () => {
  const router = useRouter();
  const [userType, setUserType] = useState('student'); // 'student' or 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login:', { username, password, userType, rememberMe });
      // Navigate based on user type
      if (userType === 'admin') {
        router.push('/AdminDashboard');
      } else {
        router.push('/StudentDashboard');
      }
    }, 1500);
  };

  // Handle signup navigation
  const handleSignup = () => {
    console.log('Navigate to signup');
    // You can create a signup page or modal
  };

  return (
    <div className={styles.loginPage}>
      {/* Animated Background */}
      <div className={styles.backgroundWrapper}>
        <motion.div
          className={styles.gradientOrb1}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className={styles.gradientOrb2}
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className={styles.gradientOrb3}
          animate={{
            x: [0, 50, 0],
            y: [0, 100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        className={styles.loginContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      >
        {/* Logo & Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🎓</span>
            <span className={styles.logoText}>Lost & Found</span>
          </div>
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Welcome Back
          </motion.h1>
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Sign in to continue to your account
          </motion.p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className={styles.loginCard}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* User Type Selector with Sliding Indicator */}
          <div className={styles.userTypeSelector}>
            <motion.div
              className={styles.selectorBackground}
              animate={{
                x: userType === 'student' ? '0%' : '100%',
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            />
            
            <button
              type="button"
              className={`${styles.selectorButton} ${userType === 'student' ? styles.active : ''}`}
              onClick={() => setUserType('student')}
            >
              <motion.span
                animate={{
                  scale: userType === 'student' ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                👨‍🎓
              </motion.span>
              <span>Student</span>
            </button>
            
            <button
              type="button"
              className={`${styles.selectorButton} ${userType === 'admin' ? styles.active : ''}`}
              onClick={() => setUserType('admin')}
            >
              <motion.span
                animate={{
                  scale: userType === 'admin' ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                👨‍💼
              </motion.span>
              <span>Admin</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className={styles.form}>
            <AnimatePresence mode="wait">
              <motion.div
                key={userType}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Username Input */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Username</label>
                  <motion.div
                    className={styles.inputWrapper}
                    whileFocus={{ scale: 1.01 }}
                  >
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
                  </motion.div>
                  {errors.username && (
                    <motion.span
                      className={styles.error}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.username}
                    </motion.span>
                  )}
                </div>

                {/* Password Input */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Password</label>
                  <motion.div
                    className={styles.inputWrapper}
                    whileFocus={{ scale: 1.01 }}
                  >
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
                    <motion.button
                      type="button"
                      className={styles.togglePassword}
                      onClick={() => setShowPassword(!showPassword)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </motion.button>
                  </motion.div>
                  {errors.password && (
                    <motion.span
                      className={styles.error}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.password}
                    </motion.span>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className={styles.formOptions}>
                  <label className={styles.checkboxLabel}>
                    <motion.input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className={styles.checkbox}
                      whileTap={{ scale: 0.9 }}
                    />
                    <span>Remember me</span>
                  </label>
                  
                  <motion.button
                    type="button"
                    className={styles.forgotPassword}
                    whileHover={{ x: 2 }}
                  >
                    Forgot password?
                  </motion.button>
                </div>

                {/* Login Button */}
                <motion.button
                  type="submit"
                  className={styles.loginButton}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                        <span>Sign In</span>
                        <motion.span
                          animate={{ x: [0, 3, 0] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          →
                        </motion.span>
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
                transition={{ duration: 0.3 }}
              >
                <div className={styles.divider}>
                  <span>or</span>
                </div>
                
                <motion.button
                  type="button"
                  className={styles.signupButton}
                  onClick={handleSignup}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Create Student Account</span>
                  <motion.span
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    ✨
                  </motion.span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Features Footer */}
        <motion.div
          className={styles.features}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {[
            { icon: '🔒', text: 'Secure Login' },
            { icon: '⚡', text: 'Fast Access' },
            { icon: '📱', text: 'Mobile Friendly' },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className={styles.featureItem}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
            >
              <span className={styles.featureIcon}>{feature.icon}</span>
              <span className={styles.featureText}>{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
