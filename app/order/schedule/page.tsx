'use client';
import StepNav from '../components/StepNav';
import { useOrder } from '../context';
import { useState, useEffect } from 'react';

const TIMES = ["8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM"];

interface ScheduleSection {
  key: string;
  label: string;
  expanded: boolean;
  selectedDate: string | null;
  selectedTime: string | null;
}

export default function SchedulePage() {
  const { state, updateState } = useOrder();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
  // Initialize sections based on capture scope
  const initializeSections = (): ScheduleSection[] => {
    const sections: ScheduleSection[] = [];
    
    if (state.capScope === 'interior') {
      sections.push({
        key: 'int',
        label: 'Interior scan',
        expanded: true,
        selectedDate: state.date || null,
        selectedTime: state.time || null
      });
    } else if (state.capScope === 'exterior') {
      sections.push({
        key: 'ext',
        label: 'Exterior scan',
        expanded: true,
        selectedDate: state.date || null,
        selectedTime: state.time || null
      });
    } else if (state.capScope === 'interior-exterior') {
      sections.push(
        {
          key: 'int',
          label: 'Interior scan',
          expanded: true,
          selectedDate: state.dateInt || null,
          selectedTime: state.timeInt || null
        },
        {
          key: 'ext',
          label: 'Exterior scan',
          expanded: true,
          selectedDate: state.dateExt || null,
          selectedTime: state.timeExt || null
        }
      );
    } else {
      // Fallback: show a generic scheduling section if no scope is selected
      sections.push({
        key: 'default',
        label: 'Property scan',
        expanded: true,
        selectedDate: state.date || null,
        selectedTime: state.time || null
      });
    }
    
    return sections;
  };

  const [sections, setSections] = useState<ScheduleSection[]>(initializeSections);
  const [viewMonths, setViewMonths] = useState<{[key: string]: Date}>({});
  const [onNextFlags, setOnNextFlags] = useState<{[key: string]: boolean}>({});

  // Initialize view months for each section
  useEffect(() => {
    const initialMonths: {[key: string]: Date} = {};
    const initialFlags: {[key: string]: boolean} = {};
    
    sections.forEach(section => {
      initialMonths[section.key] = new Date(currentMonth);
      initialFlags[section.key] = true;
    });
    
    setViewMonths(initialMonths);
    setOnNextFlags(initialFlags);
  }, [sections.length]);

  const fmtMonth = (date: Date) => {
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  const scheduledText = (selectedDate: string | null, selectedTime: string | null) => {
    if (!selectedDate || !selectedTime) return "Select a date and time";
    const datePart = new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    return `Scheduled for ${datePart} at ${selectedTime}`;
  };

  const toggleAccordion = (sectionKey: string) => {
    setSections(prev => prev.map(section => 
      section.key === sectionKey 
        ? { ...section, expanded: !section.expanded }
        : section
    ));
  };

  const handleNavigation = (sectionKey: string) => {
    const isNext = onNextFlags[sectionKey];
    const newMonth = isNext ? nextMonth : currentMonth;
    
    setViewMonths(prev => ({ ...prev, [sectionKey]: new Date(newMonth) }));
    setOnNextFlags(prev => ({ ...prev, [sectionKey]: !isNext }));
  };

  const selectDate = (sectionKey: string, date: Date) => {
    const dateISO = date.toISOString().slice(0, 10);
    
    setSections(prev => prev.map(section =>
      section.key === sectionKey
        ? { ...section, selectedDate: dateISO }
        : section
    ));

    // Update global state based on section
    if (state.capScope === 'interior-exterior') {
      if (sectionKey === 'int') {
        updateState({ dateInt: dateISO });
      } else if (sectionKey === 'ext') {
        updateState({ dateExt: dateISO });
      }
    } else {
      updateState({ date: dateISO });
    }
  };

  const selectTime = (sectionKey: string, time: string) => {
    const section = sections.find(s => s.key === sectionKey);
    if (!section?.selectedDate) {
      alert('Please pick a date first.');
      return;
    }

    setSections(prev => prev.map(s =>
      s.key === sectionKey
        ? { ...s, selectedTime: time, expanded: false } // Auto-collapse after time selection
        : s
    ));

    // Update global state based on section
    if (state.capScope === 'interior-exterior') {
      if (sectionKey === 'int') {
        updateState({ timeInt: time });
      } else if (sectionKey === 'ext') {
        updateState({ timeExt: time });
      }
    } else {
      updateState({ time });
    }
  };

  const buildCalendarDays = (sectionKey: string) => {
    const viewMonth = viewMonths[sectionKey];
    if (!viewMonth) return [];

    const section = sections.find(s => s.key === sectionKey);
    const days = [];
    
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const last = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
    const startOffset = first.getDay();

    // Empty cells for days before month starts
    for (let i = 0; i < startOffset; i++) {
      days.push({ type: 'empty' });
    }

    // Days of the month
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d);
      const isPast = date < today;
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isSelected = section?.selectedDate === date.toISOString().slice(0, 10);

      days.push({
        type: 'day',
        date,
        day: d,
        isAvailable: !isPast && !isWeekend,
        isSelected
      });
    }

    return days;
  };

  return (
    <section className="card">
      <StepNav />
      
      <h2 tabIndex={-1}>Choose a time</h2>
      <p className="muted">Choose a start time. The site visit takes about 4 hours 30 minutes.</p>

      {sections.map(section => (
        <div key={section.key}>
          <button 
            className="accordion" 
            data-acc={section.key}
            aria-expanded={section.expanded}
            type="button"
            onClick={() => toggleAccordion(section.key)}
          >
            <div className="summary-stack">
              <div className="scope-label">{section.label}</div>
              <div className="scheduled-line">
                {scheduledText(section.selectedDate, section.selectedTime)}
              </div>
            </div>
            <svg className="caret" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          
          <div 
            className={`collapse ${section.expanded ? 'open' : ''}`}
            aria-hidden={!section.expanded}
          >
            <div className="calendar-container">
              <div className="calendar-header">
                <div className="calendar-month">
                  {viewMonths[section.key] ? fmtMonth(viewMonths[section.key]) : '—'}
                </div>
                <div className="nav-single">
                  <button 
                    className="nav-btn" 
                    onClick={() => handleNavigation(section.key)}
                  >
                    {onNextFlags[section.key] ? 'Next ›' : '‹ Back'}
                  </button>
                </div>
              </div>
              
              <div className="calendar-grid">
                {/* Day headers */}
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
                  <div key={day} className="calendar-day-header">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {buildCalendarDays(section.key).map((item, index) => {
                  if (item.type === 'empty') {
                    return <div key={`empty-${index}`}></div>;
                  }
                  
                  return (
                    <div
                      key={index}
                      className={`calendar-day ${
                        item.isAvailable ? 'available' : 'disabled'
                      } ${item.isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (item.isAvailable && item.date) {
                          selectDate(section.key, item.date);
                        }
                      }}
                    >
                      <span className="day-num">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="field">
              <div className="label">Available times</div>
              <div className="times">
                {TIMES.map(time => (
                  <button
                    key={time}
                    className="time"
                    data-selected={section.selectedTime === time}
                    onClick={() => selectTime(section.key, time)}
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
        </div>
      ))}

      <div className="actions">
        <button className="btn btn-ghost">Back</button>
        <button className="btn btn-primary">Next</button>
      </div>
    </section>
  );
}