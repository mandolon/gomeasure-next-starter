import { useState, useEffect } from 'react';
import StepNavigation from './StepNavigation';
import styles from '../styles/Schedule.module.css';

const TIMES = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Schedule({ state, updateState, routes, currentStep }) {
  const [interiorExpanded, setInteriorExpanded] = useState(true);
  const [exteriorExpanded, setExteriorExpanded] = useState(true);
  
  // Calendar state for interior
  const [interiorViewMonth, setInteriorViewMonth] = useState(new Date());
  const [interiorOnNext, setInteriorOnNext] = useState(true);
  
  // Calendar state for exterior  
  const [exteriorViewMonth, setExteriorViewMonth] = useState(new Date());
  const [exteriorOnNext, setExteriorOnNext] = useState(true);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  useEffect(() => {
    setInteriorViewMonth(currentMonth);
    setExteriorViewMonth(currentMonth);
  }, []);

  const formatMonth = (date) => {
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  const getScheduledText = (dateISO, time, type) => {
    if (!dateISO && !time) return "Select a date and time";
    if (dateISO && time) {
      const date = new Date(dateISO);
      const pretty = date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long', 
        day: 'numeric'
      });
      return `Scheduled for ${pretty} at ${time}`;
    }
    return "Select a date and time";
  };

  const buildCalendar = (viewMonth, type, selectedISO, onDateSelect) => {
    const grid = [];
    
    // Day headers
    WEEKDAYS.forEach(day => {
      grid.push(
        <div key={`header-${day}`} className={styles.calendarDayHeader}>
          {day}
        </div>
      );
    });

    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const last = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
    const startOffset = first.getDay();

    // Empty cells for offset
    for (let i = 0; i < startOffset; i++) {
      grid.push(<div key={`empty-${i}`}></div>);
    }

    // Calendar days
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d);
      const dateISO = date.toISOString().slice(0, 10);
      const isPast = date < today;
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isSelected = selectedISO === dateISO;

      let className = styles.calendarDay;
      if (isPast || isWeekend) className += ` ${styles.disabled}`;
      else className += ` ${styles.available}`;
      if (isSelected) className += ` ${styles.selected}`;

      grid.push(
        <div 
          key={`day-${d}`}
          className={className}
          onClick={() => !isPast && !isWeekend && onDateSelect(dateISO)}
        >
          <span className={styles.dayNum}>{d}</span>
        </div>
      );
    }

    return grid;
  };

  const handleInteriorDateSelect = (dateISO) => {
    updateState({ interiorDate: dateISO });
  };

  const handleExteriorDateSelect = (dateISO) => {
    updateState({ exteriorDate: dateISO });
  };

  const handleInteriorTimeSelect = (time) => {
    if (!state.interiorDate) {
      alert('Please pick a date first.');
      return;
    }
    updateState({ interiorTime: time });
    setInteriorExpanded(false); // Collapse after selection
  };

  const handleExteriorTimeSelect = (time) => {
    if (!state.exteriorDate) {
      alert('Please pick a date first.');
      return;
    }
    updateState({ exteriorTime: time });
    setExteriorExpanded(false); // Collapse after selection
  };

  const handleInteriorNavClick = () => {
    const newMonth = interiorOnNext ? nextMonth : currentMonth;
    setInteriorViewMonth(newMonth);
    setInteriorOnNext(!interiorOnNext);
  };

  const handleExteriorNavClick = () => {
    const newMonth = exteriorOnNext ? nextMonth : currentMonth;
    setExteriorViewMonth(newMonth);
    setExteriorOnNext(!exteriorOnNext);
  };

  const renderTimeSlots = (selectedTime, onTimeSelect) => {
    return TIMES.map(time => (
      <button
        key={time}
        type="button"
        className={`${styles.time} ${selectedTime === time ? styles.timeSelected : ''}`}
        onClick={() => onTimeSelect(time)}
      >
        {time}
      </button>
    ));
  };

  const shouldShowInterior = state.capScope === 'interior' || state.capScope === 'interior-exterior';
  const shouldShowExterior = state.capScope === 'exterior' || state.capScope === 'interior-exterior';

  return (
    <section className={styles.card}>
      <StepNavigation routes={routes} currentStep={currentStep} />
      
      <h2>Choose a time</h2>
      <p className={styles.muted}>Choose a start time. The site visit takes about 4 hours 30 minutes.</p>

      {shouldShowInterior && (
        <>
          <button 
            className={styles.accordion}
            onClick={() => setInteriorExpanded(!interiorExpanded)}
            aria-expanded={interiorExpanded}
            type="button"
          >
            <div className={styles.summaryStack}>
              <div className={styles.scopeLabel}>Interior scan</div>
              <div className={styles.scheduledLine}>
                {getScheduledText(state.interiorDate, state.interiorTime, 'interior')}
              </div>
            </div>
            <svg className={`${styles.caret} ${interiorExpanded ? styles.caretExpanded : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          
          <div className={`${styles.collapse} ${interiorExpanded ? styles.open : ''}`}>
            <div className={styles.calendarContainer}>
              <div className={styles.calendarHeader}>
                <div className={styles.calendarMonth}>{formatMonth(interiorViewMonth)}</div>
                <div className={styles.navSingle}>
                  <button className={styles.navBtn} onClick={handleInteriorNavClick}>
                    {interiorOnNext ? 'Next ›' : '‹ Back'}
                  </button>
                </div>
              </div>
              <div className={styles.calendarGrid}>
                {buildCalendar(interiorViewMonth, 'interior', state.interiorDate, handleInteriorDateSelect)}
              </div>
            </div>
            
            <div className={styles.field}>
              <div className={styles.label}>Available times</div>
              <div className={styles.times}>
                {renderTimeSlots(state.interiorTime, handleInteriorTimeSelect)}
              </div>
            </div>
            
            <div className={styles.disclaimer}>
              <strong>Booking Policy:</strong> Appointments can be rescheduled up to 24 hours before the scheduled time. Same-day cancellations may incur a fee. We'll confirm your appointment 24 hours in advance.
            </div>
          </div>
        </>
      )}

      {shouldShowExterior && (
        <>
          <button 
            className={styles.accordion}
            onClick={() => setExteriorExpanded(!exteriorExpanded)}
            aria-expanded={exteriorExpanded}
            type="button"
          >
            <div className={styles.summaryStack}>
              <div className={styles.scopeLabel}>Exterior scan</div>
              <div className={styles.scheduledLine}>
                {getScheduledText(state.exteriorDate, state.exteriorTime, 'exterior')}
              </div>
            </div>
            <svg className={`${styles.caret} ${exteriorExpanded ? styles.caretExpanded : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          
          <div className={`${styles.collapse} ${exteriorExpanded ? styles.open : ''}`}>
            <div className={styles.calendarContainer}>
              <div className={styles.calendarHeader}>
                <div className={styles.calendarMonth}>{formatMonth(exteriorViewMonth)}</div>
                <div className={styles.navSingle}>
                  <button className={styles.navBtn} onClick={handleExteriorNavClick}>
                    {exteriorOnNext ? 'Next ›' : '‹ Back'}
                  </button>
                </div>
              </div>
              <div className={styles.calendarGrid}>
                {buildCalendar(exteriorViewMonth, 'exterior', state.exteriorDate, handleExteriorDateSelect)}
              </div>
            </div>
            
            <div className={styles.field}>
              <div className={styles.label}>Available times</div>
              <div className={styles.times}>
                {renderTimeSlots(state.exteriorTime, handleExteriorTimeSelect)}
              </div>
            </div>
            
            <div className={styles.disclaimer}>
              <strong>Booking Policy:</strong> Appointments can be rescheduled up to 24 hours before the scheduled time. Same-day cancellations may incur a fee. We'll confirm your appointment 24 hours in advance.
            </div>
          </div>
        </>
      )}
    </section>
  );
}