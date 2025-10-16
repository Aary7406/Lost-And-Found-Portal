'use client';

import { useState, useEffect } from 'react';
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
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setSelectedDate(value || '');
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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

      <div className={styles.inputWrapper}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={styles.dateButton}
        >
          <span className={selectedDate ? styles.selected : styles.placeholder}>
            {formatDisplayDate(selectedDate)}
          </span>
          <span className={styles.icon}>📅</span>
        </button>

        {isOpen && (
          <div className={styles.calendar}>
            <div className={styles.calendarHeader}>
              <button type="button" onClick={handlePrevMonth} className={styles.navButton}>
                ‹
              </button>
              <span className={styles.monthYear}>
                {monthNames[month]} {year}
              </span>
              <button type="button" onClick={handleNextMonth} className={styles.navButton}>
                ›
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

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={`${styles.day} ${isSelected ? styles.selectedDay : ''} ${isToday ? styles.today : ''}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hidden native input for form submission */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          if (onChange) onChange(e.target.value);
        }}
        required={required}
        className={styles.hiddenInput}
      />
    </div>
  );
}
