'use client';
import StepNav from '../components/StepNav';
import { useOrder } from '../context';
import { useState, useEffect } from 'react';

const TIMES = ["8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM"];

export default function SchedulePage() {
  const { state, updateState } = useOrder();
  const [viewMonth, setViewMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Array<{
    date: Date;
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isAvailable: boolean;
    isSelected: boolean;
  }>>([]);

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  const generateCalendar = (month: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);
    
    // Start from Sunday of the week containing the first day
    startDate.setDate(startDate.getDate() - startDate.getDay());
    // End at Saturday of the week containing the last day
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const isCurrentMonth = currentDate.getMonth() === month.getMonth();
      const isToday = currentDate.getTime() === today.getTime();
      const isAvailable = currentDate >= today && isCurrentMonth;
      const isSelected = state.date === currentDate.toISOString().split('T')[0];
      
      days.push({
        date: new Date(currentDate),
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isAvailable,
        isSelected
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  useEffect(() => {
    setCalendarDays(generateCalendar(viewMonth));
  }, [viewMonth, state.date]);

  const nextMonth = () => {
    setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const selectDate = (date: Date) => {
    if (date < new Date()) return;
    const dateString = date.toISOString().split('T')[0];
    updateState({ date: dateString });
  };

  const selectTime = (time: string) => {
    updateState({ time });
  };

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <section className="card">
      <StepNav />
      
      <h2 tabIndex={-1}>Choose a time</h2>
      <p className="muted">Choose a start time. The site visit takes about 4 hours 30 minutes.</p>

      <button className="accordion" type="button">
        <div className="summary-stack">
          <div className="scope-label">
            {state.capScope === 'interior' ? 'Interior scan' : 
             state.capScope === 'exterior' ? 'Exterior scan' : 
             'Interior & Exterior scan'}
          </div>
          <div className="scheduled-line">
            {state.date && state.time ? 
              `${new Date(state.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} at ${state.time}` :
              'Select a date and time'
            }
          </div>
        </div>
        <svg className="caret" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>
      
      <div className="collapse open">
        <div className="calendar-container">
          <div className="calendar-header">
            <div className="calendar-month">{formatMonth(viewMonth)}</div>
            <div className="nav-single">
              <button className="nav-btn" onClick={nextMonth}>
                Next ›
              </button>
            </div>
          </div>
          
          <div className="calendar-grid">
            {dayHeaders.map(header => (
              <div key={header} className="calendar-day-header">
                {header}
              </div>
            ))}
            
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`calendar-day 
                  ${day.isAvailable ? 'available' : 'disabled'}
                  ${day.isToday ? 'today' : ''}
                  ${day.isSelected ? 'selected' : ''}
                  ${!day.isCurrentMonth ? 'disabled' : ''}
                `}
                onClick={() => day.isAvailable && selectDate(day.date)}
              >
                <span className="day-num">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="field">
          <div className="label">Available times</div>
          <div className="times">
            {TIMES.map(time => (
              <button
                key={time}
                className="time"
                data-selected={state.time === time}
                onClick={() => selectTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
        
        <div className="disclaimer">
          <strong>Booking Policy:</strong> Appointments can be rescheduled up to 24 hours before the scheduled time. Same-day cancellations may incur a fee. We&apos;ll confirm your appointment 24 hours in advance.
        </div>
      </div>
    </section>
  );
}