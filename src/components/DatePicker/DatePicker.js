'use client';

import { useState } from 'react';
import styles from './DatePicker.module.css';

export default function DatePicker({ value, onChange, label, minDate, maxDate, required = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (onChange) onChange(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={styles.datePickerContainer}>
      {label && (
        <label className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        <input
          type="date"
          value={value || ''}
          onChange={handleChange}
          min={minDate}
          max={maxDate}
          required={required}
          className={styles.dateInput}
        />
        
        {value && (
          <div className={styles.displayValue}>
            📅 {formatDate(value)}
          </div>
        )}
      </div>
    </div>
  );
}
