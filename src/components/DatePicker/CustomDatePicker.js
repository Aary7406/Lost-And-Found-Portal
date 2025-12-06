'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './CustomDatePicker.module.css';

export default function CustomDatePicker({ 
  value, 
  onChange, 
  label, 
  minDate, 
  maxDate, 
  placeholder = 'Select a date',
  required = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || '');
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const date = new Date(value + 'T00:00:00');
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });
  const [calendarPosition, setCalendarPosition] = useState('bottom');
  const calendarRef = useRef(null);
  const buttonRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Smart positioning: check available space and position calendar accordingly
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const calendarHeight = 400; // Approximate calendar height
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // If not enough space below but enough above, show calendar above
      if (spaceBelow < calendarHeight && spaceAbove > calendarHeight) {
        setCalendarPosition('top');
      } else {
        setCalendarPosition('bottom');
      }
    }
  }, [isOpen]);

  // Update state when value prop changes
  useEffect(() => {
    if (value !== selectedDate) {
      setSelectedDate(value || '');
      if (value) {
        const date = new Date(value + 'T00:00:00');
        if (!isNaN(date.getTime())) {
          setCurrentMonth(date);
        }
      }
    }
  }, [value]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const handleDateSelect = (day) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Check min/max constraints
    if (minDate && dateString < minDate) return;
    if (maxDate && dateString > maxDate) return;
    
    setSelectedDate(dateString);
    if (onChange) onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return placeholder;
    try {
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) return placeholder;
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return placeholder;
    }
  };

  const isDateDisabled = (dateString) => {
    if (minDate && dateString < minDate) return true;
    if (maxDate && dateString > maxDate) return true;
    return false;
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={styles.customDatePicker}>
      {label && (
        <label className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.inputWrapper} ref={calendarRef}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={styles.dateButton}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className={selectedDate ? styles.selected : styles.placeholder}>
            {formatDisplayDate(selectedDate)}
          </span>
          <span className={styles.icon}>📅</span>
        </button>

        {isOpen && (
          <div className={`${styles.calendar} ${calendarPosition === 'top' ? styles.calendarTop : styles.calendarBottom}`}>
            <div className={styles.calendarHeader}>
              <button 
                type="button" 
                onClick={handlePrevMonth} 
                className={styles.navButton}
                aria-label="Previous month"
              >
                ←
              </button>
              <span className={styles.monthYear}>
                {monthNames[month]} {year}
              </span>
              <button 
                type="button" 
                onClick={handleNextMonth} 
                className={styles.navButton}
                aria-label="Next month"
              >
                →
              </button>
            </div>

            <div className={styles.calendarGrid}>
              {dayNames.map(day => (
                <div key={day} className={styles.dayName}>
                  {day}
                </div>
              ))}

              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className={styles.emptyDay}></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = dateString === selectedDate;
                const isToday = dateString === new Date().toISOString().split('T')[0];
                const disabled = isDateDisabled(dateString);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => !disabled && handleDateSelect(day)}
                    disabled={disabled}
                    className={`${styles.day} ${isSelected ? styles.selectedDay : ''} ${isToday ? styles.today : ''} ${disabled ? styles.disabledDay : ''}`}
                    aria-label={`${day} ${monthNames[month]} ${year}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hidden input for form validation only */}
      {required && (
        <input
          type="text"
          value={selectedDate}
          required={required}
          className={styles.hiddenInput}
          tabIndex={-1}
          aria-hidden="true"
          readOnly
        />
      )}
    </div>
  );
}
