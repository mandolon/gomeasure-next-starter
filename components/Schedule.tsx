
'use client';

import { useState } from 'react';

interface ScheduleProps {
  formData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Schedule({ formData, onUpdate, onNext, onBack }: ScheduleProps) {
  const [data, setData] = useState({
    serviceType: formData.serviceType || 'combined',
    interiorDate: formData.interiorDate || '',
    interiorTime: formData.interiorTime || '',
    exteriorDate: formData.exteriorDate || '',
    exteriorTime: formData.exteriorTime || '',
    ...formData
  });

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleChange = (field: string, value: string) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onUpdate(newData);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const availableTimes = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const renderCalendar = (type: 'interior' | 'exterior') => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || days.length % 7 !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const isSelected = (date: Date) => {
      const selectedDate = type === 'interior' ? data.interiorDate : data.exteriorDate;
      return selectedDate === date.toISOString().split('T')[0];
    };

    const isAvailable = (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today && date.getMonth() === month;
    };

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <span className="calendar-month">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <div className="nav-single">
            <button 
              className="nav-btn"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              ← Prev
            </button>
            <button 
              className="nav-btn"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              Next →
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          {days.map((date, index) => (
            <div
              key={index}
              className={`calendar-day ${isAvailable(date) ? 'available' : 'disabled'} ${isSelected(date) ? 'selected' : ''}`}
              onClick={() => {
                if (isAvailable(date)) {
                  handleChange(
                    type === 'interior' ? 'interiorDate' : 'exteriorDate',
                    date.toISOString().split('T')[0]
                  );
                }
              }}
            >
              <span className="day-num">{date.getDate()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid">
      <div className="card">
        <h2>Schedule Service</h2>
        <p className="muted">Choose your preferred appointment times</p>

        <div className="field">
          <label className="label">Service Type</label>
          <select 
            value={data.serviceType}
            onChange={(e) => handleChange('serviceType', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            <option value="combined">Combined (Interior + Exterior)</option>
            <option value="separate">Separate Appointments</option>
            <option value="interior-only">Interior Only</option>
            <option value="exterior-only">Exterior Only</option>
          </select>
        </div>

        {(data.serviceType === 'combined' || data.serviceType === 'separate' || data.serviceType === 'interior-only') && (
          <div>
            <div 
              className={`accordion ${expandedSection === 'interior' ? '[data-open="true"]' : ''}`}
              onClick={() => toggleSection('interior')}
            >
              <div className="summary-stack">
                <div className="scope-label">Interior Scan</div>
                <div className="scheduled-line">
                  {data.interiorDate && data.interiorTime 
                    ? `Scheduled for ${new Date(data.interiorDate).toLocaleDateString()} at ${data.interiorTime}`
                    : 'Not scheduled'
                  }
                </div>
              </div>
              <div className="caret">→</div>
            </div>
            
            <div className={`collapse ${expandedSection === 'interior' ? 'open' : ''}`}>
              {renderCalendar('interior')}
              
              {data.interiorDate && (
                <div className="field">
                  <label className="label">Select Time</label>
                  <div className="times">
                    {availableTimes.map(time => (
                      <button
                        key={time}
                        className="time"
                        data-selected={data.interiorTime === time}
                        onClick={() => handleChange('interiorTime', time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {(data.serviceType === 'separate' || data.serviceType === 'exterior-only') && (
          <div>
            <div 
              className={`accordion ${expandedSection === 'exterior' ? '[data-open="true"]' : ''}`}
              onClick={() => toggleSection('exterior')}
            >
              <div className="summary-stack">
                <div className="scope-label">Exterior Scan</div>
                <div className="scheduled-line">
                  {data.exteriorDate && data.exteriorTime 
                    ? `Scheduled for ${new Date(data.exteriorDate).toLocaleDateString()} at ${data.exteriorTime}`
                    : 'Not scheduled'
                  }
                </div>
              </div>
              <div className="caret">→</div>
            </div>
            
            <div className={`collapse ${expandedSection === 'exterior' ? 'open' : ''}`}>
              {renderCalendar('exterior')}
              
              {data.exteriorDate && (
                <div className="field">
                  <label className="label">Select Time</label>
                  <div className="times">
                    {availableTimes.map(time => (
                      <button
                        key={time}
                        className="time"
                        data-selected={data.exteriorTime === time}
                        onClick={() => handleChange('exteriorTime', time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="disclaimer">
          Our technician will arrive at the scheduled time. Please ensure property access is available.
        </div>

        <div className="action-row" style={{ marginTop: '24px' }}>
          <button className="btn btn-ghost" onClick={onBack}>
            Back
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onNext}
            disabled={
              (data.serviceType === 'combined' && (!data.interiorDate || !data.interiorTime)) ||
              (data.serviceType === 'separate' && (!data.interiorDate || !data.interiorTime || !data.exteriorDate || !data.exteriorTime)) ||
              (data.serviceType === 'interior-only' && (!data.interiorDate || !data.interiorTime)) ||
              (data.serviceType === 'exterior-only' && (!data.exteriorDate || !data.exteriorTime))
            }
          >
            Continue
          </button>
        </div>
      </div>

      <div className="sidebar">
        <div className="card">
          <h3>Scheduling Notes</h3>
          <ul className="checklist">
            <li><span className="check">✓</span> 2-4 hour scanning window</li>
            <li><span className="check">✓</span> Professional equipment setup</li>
            <li><span className="check">✓</span> Minimal disruption to daily activities</li>
            <li><span className="check">✓</span> Same-day completion typical</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
