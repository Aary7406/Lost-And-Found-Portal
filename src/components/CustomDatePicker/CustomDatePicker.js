'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CustomDatePicker.module.css';

export default function CustomDatePicker({ value, onChange, name, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [openUpward, setOpenUpward] = useState(false);
  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    if (onChange) {
      onChange(formatDate(newDate));
    }
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
    if (onChange) {
      onChange(formatDate(today));
    }
    setIsOpen(false);
  };

  // Check if picker should open upward
  const checkPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const calendarHeight = 400; // Approximate height of calendar

      // Open upward if not enough space below but enough space above
      setOpenUpward(spaceBelow < calendarHeight && spaceAbove > calendarHeight);
    }
  };

  // Check position when opening
  useEffect(() => {
    if (isOpen) {
      checkPosition();
      window.addEventListener('scroll', checkPosition);
      window.addEventListener('resize', checkPosition);
    }

    return () => {
      window.removeEventListener('scroll', checkPosition);
      window.removeEventListener('resize', checkPosition);
    };
  }, [isOpen]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth, currentYear);
    const firstDay = firstDayOfMonth(currentMonth, currentYear);
    const today = new Date();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const isSelected = selectedDate && 
        day === selectedDate.getDate() && 
        currentMonth === selectedDate.getMonth() && 
        currentYear === selectedDate.getFullYear();
      
      const isToday = isCurrentMonth && day === today.getDate();

      days.push(
        <motion.button
          key={day}
          type="button"
          className={`${styles.day} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''}`}
          onClick={() => handleDateClick(day)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {day}
        </motion.button>
      );
    }

    return days;
  };

  return (
    <div className={styles.datePicker} ref={pickerRef}>
      <input
        type="hidden"
        name={name}
        value={formatDate(selectedDate)}
        required={required}
      />
      <button
        ref={inputRef}
        type="button"
        className={styles.input}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.dateText}>{formatDisplayDate(selectedDate)}</span>
        <span className={styles.icon}>📅</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`${styles.calendar} ${openUpward ? styles.calendarUpward : ''}`}
            initial={{ opacity: 0, scale: 0.9, y: openUpward ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: openUpward ? 10 : -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Calendar Header */}
            <div className={styles.calendarHeader}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={handlePrevMonth}
              >
                ←
              </button>
              <div className={styles.monthYear}>
                <span className={styles.month}>{monthNames[currentMonth]}</span>
                <span className={styles.year}>{currentYear}</span>
              </div>
              <button
                type="button"
                className={styles.navBtn}
                onClick={handleNextMonth}
              >
                →
              </button>
            </div>

            {/* Weekday Headers */}
            <div className={styles.weekdays}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className={styles.weekday}>{day}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className={styles.days}>
              {renderCalendar()}
            </div>

            {/* Footer with Today button */}
            <div className={styles.calendarFooter}>
              <button
                type="button"
                className={styles.todayBtn}
                onClick={handleToday}
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
