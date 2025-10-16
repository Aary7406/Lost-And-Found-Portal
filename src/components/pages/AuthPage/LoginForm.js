// components/pages/AuthPage/LoginForm.js
import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import styles from './AuthForms.module.css';

const LoginForm = ({ userType }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    // Form entrance animation
    gsap.from(formRef.current.querySelectorAll('.animate-in'), {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Admin-specific validation
    if (userType === 'admin' && formData.email && !formData.email.includes('admin')) {
      newErrors.email = 'Admin email required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Shake animation for errors
      gsap.to(formRef.current, {
        x: [-10, 10, -5, 5, 0],
        duration: 0.5,
        ease: "power2.inOut"
      });
      return;
    }

    setIsLoading(true);
    
    // Loading animation
    const submitBtn = formRef.current.querySelector('.submit-btn');
    gsap.to(submitBtn, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success animation
      gsap.to(formRef.current, {
        y: -20,
        opacity: 0.8,
        duration: 0.5,
        ease: "power2.out"
      });
      
      console.log('Login successful:', { ...formData, userType });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.authForm} ref={formRef} onSubmit={handleSubmit}>
      <div className={`${styles.formHeader} animate-in`}>
        <h2 className={styles.formTitle}>
          {userType === 'admin' ? '🛡️ Admin Login' : '🎓 Student Login'}
        </h2>
        <p className={styles.formSubtitle}>
          {userType === 'admin' 
            ? 'Access admin dashboard' 
            : 'Sign in to your account'
          }
        </p>
      </div>

      <div className={`${styles.inputGroup} animate-in`}>
        <label className={styles.label}>
          {userType === 'admin' ? 'Admin Email' : 'Student Email'}
        </label>
        <div className={styles.inputWrapper}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`${styles.input} ${errors.email ? styles.error : ''}`}
            placeholder={userType === 'admin' ? 'admin@college.edu' : 'student@college.edu'}
          />
          <span className={styles.inputIcon}>📧</span>
        </div>
        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
      </div>

      <div className={`${styles.inputGroup} animate-in`}>
        <label className={styles.label}>Password</label>
        <div className={styles.inputWrapper}>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`${styles.input} ${errors.password ? styles.error : ''}`}
            placeholder="Enter your password"
          />
          <span className={styles.inputIcon}>🔒</span>
        </div>
        {errors.password && <span className={styles.errorText}>{errors.password}</span>}
      </div>

      <div className={`${styles.formOptions} animate-in`}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            className={styles.checkbox}
          />
          <span className={styles.checkboxText}>Remember me</span>
        </label>
        
        <button type="button" className={styles.forgotPassword}>
          Forgot password?
        </button>
      </div>

      <button 
        type="submit" 
        className={`${styles.submitBtn} submit-btn animate-in`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Signing in...
          </>
        ) : (
          <>
            <span className={styles.btnIcon}>🚀</span>
            Sign In {userType === 'admin' ? 'as Admin' : ''}
          </>
        )}
      </button>

      {userType === 'admin' && (
        <div className={`${styles.adminNote} animate-in`}>
          <span className={styles.noteIcon}>ℹ️</span>
          <span>Admin access requires special credentials</span>
        </div>
      )}
    </form>
  );
};

export default LoginForm;   