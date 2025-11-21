// app/LogIn/page.js - Simplified and Clean
'use client'
import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ClientOnly from '../../components/ClientOnly';
import PageTransition from '../../components/PageTransition/PageTransition';

// Dynamic imports for better performance
const LoginForm = dynamic(() => 
  import('./../../components/pages/AuthPage/LoginForm'), {
  ssr: false,
  loading: () => <div className="loading-spinner">Loading...</div>
});

const SignupForm = dynamic(() => 
  import('./../../components/pages/AuthPage/SignupForm'), {
  ssr: false,
  loading: () => <div className="loading-spinner">Loading...</div>
});

const BlobBackground = dynamic(() => 
  import('../../components/pages/AuthPage/BlobBackground'), {
  ssr: false,
  loading: () => null
});

import styles from './LogIn.module.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('user');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Memoized functions to prevent unnecessary re-renders
  const switchUserType = useCallback((type) => {
    setUserType(type);
    if (type === 'admin') {
      setIsLogin(true); // Admin can only login
    }
  }, []);

  const switchAuthMode = useCallback(() => {
    if (userType === 'admin') {
      setUserType('user'); // Switch to student when clicking auth switch from admin
      setIsLogin(true);
    } else {
      setIsLogin(!isLogin);
    }
  }, [userType, isLogin]);

  // Memoized welcome text
  const welcomeText = useMemo(() => {
    if (userType === 'admin') return 'Admin Portal';
    return isLogin ? 'Welcome back!' : 'Join our community';
  }, [userType, isLogin]);

  // Memoized auth switch content
  const authSwitchContent = useMemo(() => {
    if (userType === 'admin') {
      return { text: "Need student access?", buttonText: 'Student Portal' };
    }
    return {
      text: isLogin ? "Don't have an account?" : "Already have an account?",
      buttonText: isLogin ? 'Sign Up' : 'Login'
    };
  }, [userType, isLogin]);

  if (!isLoaded) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <ClientOnly fallback={
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    }>
      <PageTransition>
        <div className={styles.authPage}>
          <BlobBackground />
          
          <div className={styles.container}>
          {/* Logo Section */}
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🎓</span>
              <span className={styles.logoText}>Lost & Found</span>
            </div>
            <p className={styles.welcomeText}>{welcomeText}</p>
          </div>

          {/* Main Form Container */}
          <div className={styles.formContainer}>
            {/* User Type Selector */}
            <div className={styles.userTypeSelector}>
              <div 
                className={`${styles.selectorIndicator} ${userType === 'admin' ? styles.admin : ''}`}
              />
              
              <button 
                className={`${styles.typeBtn} ${userType === 'user' ? styles.active : ''}`}
                onClick={() => switchUserType('user')}
                type="button"
              >
                <span className={styles.typeIcon}>👨‍🎓</span>
                <span>Student</span>
              </button>
              <button 
                className={`${styles.typeBtn} ${userType === 'admin' ? styles.active : ''}`}
                onClick={() => switchUserType('admin')}
                type="button"
              >
                <span className={styles.typeIcon}>👨‍💼</span>
                <span>Admin</span>
              </button>
            </div>

            {/* Auth Forms */}
            <div className={styles.formWrapper}>
              {userType === 'admin' ? (
                <LoginForm userType={userType} />
              ) : (
                isLogin ? (
                  <LoginForm userType={userType} />
                ) : (
                  <SignupForm userType={userType} />
                )
              )}
            </div>

            {/* Switch Auth Mode */}
            <div className={styles.authSwitch}>
              <p className={styles.switchText}>
                {authSwitchContent.text}
              </p>
              <button 
                className={styles.switchBtn}
                onClick={switchAuthMode}
                type="button"
              >
                {authSwitchContent.buttonText}
              </button>
            </div>

            {/* Social Login Options - Only for students */}
            {userType !== 'admin' && (
              <div className={styles.socialSection}>
                <div className={styles.divider}>
                  <span>or continue with</span>
                </div>
                <div className={styles.socialButtons}>
                  <button className={styles.socialBtn} type="button">
                    <span className={styles.socialIcon}>🎓</span>
                    College ID
                  </button>
                  <button className={styles.socialBtn} type="button">
                    <span className={styles.socialIcon}>📧</span>
                    Google
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Features Preview */}
          <div className={styles.featuresPreview}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🔍</span>
              <span>Smart Search</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>📱</span>
              <span>Real-time Alerts</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✅</span>
              <span>Quick Reporting</span>
            </div>
          </div>
        </div>
      </div>
      </PageTransition>
    </ClientOnly>
  );
};

export default AuthPage;