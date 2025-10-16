// components/pages/AuthPage/SignupForm.js
import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import styles from './AuthForms.module.css';

const SignupForm = ({ userType }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    department: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef(null);

  const departments = [
    'Computer Science', 'Engineering', 'Business', 'Arts', 'Science', 
    'Medicine', 'Law', 'Education', 'Other'
  ];

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
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (userType === 'user') {
      if (!formData.studentId) {
        newErrors.studentId = 'Student ID is required';
      } else if (!/^\d{8,12}$/.test(formData.studentId)) {
        newErrors.studentId = 'Invalid student ID format';
      }
      
      if (!formData.department) {
        newErrors.department = 'Department is required';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms';
    }

    // Admin-specific validation
    if (userType === 'admin') {
      if (!formData.email.includes('admin')) {
        newErrors.email = 'Admin email required';
      }
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
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Success animation
      gsap.to(formRef.current, {
        scale: 1.02,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
      
      console.log('Signup successful:', { ...formData, userType });
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.authForm} ref={formRef} onSubmit={handleSubmit}>
      <div className={`${styles.formHeader} animate-in`}>
        <h2 className={styles.formTitle}>
          {userType === 'admin' ? '🛡️ Admin Registration' : '🎓 Student Registration'}
        </h2>
        <p className={styles.formSubtitle}>
          {userType === 'admin' 
            ? 'Create admin account' 
            : 'Create your student account'
          }
        </p>
      </div>

      <div className={styles.formGrid}>
        <div className={`${styles.inputGroup} animate-in`}>
          <label className={styles.label}>First Name</label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.firstName ? styles.error : ''}`}
              placeholder="John"
            />
            <span className={styles.inputIcon}>👤</span>
          </div>
          {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
        </div>

        <div className={`${styles.inputGroup} animate-in`}>
          <label className={styles.label}>Last Name</label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.lastName ? styles.error : ''}`}
              placeholder="Doe"
            />
            <span className={styles.inputIcon}>👤</span>
          </div>
          {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
        </div>
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

      {userType === 'user' && (
        <>
          <div className={`${styles.inputGroup} animate-in`}>
            <label className={styles.label}>Student ID</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.studentId ? styles.error : ''}`}
                placeholder="202312345"
              />
              <span className={styles.inputIcon}>🆔</span>
            </div>
            {errors.studentId && <span className={styles.errorText}>{errors.studentId}</span>}
          </div>

          <div className={`${styles.inputGroup} animate-in`}>
            <label className={styles.label}>Department</label>
            <div className={styles.inputWrapper}>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`${styles.input} ${styles.select} ${errors.department ? styles.error : ''}`}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <span className={styles.inputIcon}>🏢</span>
            </div>
            {errors.department && <span className={styles.errorText}>{errors.department}</span>}
          </div>
        </>
      )}

      <div className={styles.formGrid}>
        <div className={`${styles.inputGroup} animate-in`}>
          <label className={styles.label}>Password</label>
          <div className={styles.inputWrapper}>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.password ? styles.error : ''}`}
              placeholder="••••••••"
            />
            <span className={styles.inputIcon}>🔒</span>
          </div>
          {errors.password && <span className={styles.errorText}>{errors.password}</span>}
        </div>

        <div className={`${styles.inputGroup} animate-in`}>
          <label className={styles.label}>Confirm Password</label>
          <div className={styles.inputWrapper}>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
              placeholder="••••••••"
            />
            <span className={styles.inputIcon}>🔒</span>
          </div>
          {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
        </div>
      </div>

      <div className={`${styles.formOptions} animate-in`}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleInputChange}
            className={styles.checkbox}
          />
          <span className={styles.checkboxText}>
            I agree to the <button type="button" className={styles.linkButton}>Terms & Conditions</button>
          </span>
        </label>
        {errors.agreeTerms && <span className={styles.errorText}>{errors.agreeTerms}</span>}
      </div>

      <button 
        type="submit" 
        className={`${styles.submitBtn} submit-btn animate-in`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Creating Account...
          </>
        ) : (
          <>
            <span className={styles.btnIcon}>✨</span>
            Create {userType === 'admin' ? 'Admin ' : ''}Account
          </>
        )}
      </button>
    </form>
  );
};

export default SignupForm;