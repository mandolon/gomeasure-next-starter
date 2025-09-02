
'use client';

import { useState } from 'react';

interface ContactProps {
  formData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Contact({ formData, onUpdate, onNext, onBack }: ContactProps) {
  const [data, setData] = useState({
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    email: formData.email || '',
    phone: formData.phone || '',
    secondContact: formData.secondContact || false,
    secondFirstName: formData.secondFirstName || '',
    secondLastName: formData.secondLastName || '',
    secondEmail: formData.secondEmail || '',
    secondPhone: formData.secondPhone || '',
    specialInstructions: formData.specialInstructions || '',
    ...formData
  });

  const handleChange = (field: string, value: string | boolean) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onUpdate(newData);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return /^[\d\s\-\(\)\.]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const isFormValid = () => {
    return data.firstName && 
           data.lastName && 
           data.email && 
           isValidEmail(data.email) && 
           data.phone && 
           isValidPhone(data.phone) &&
           (!data.secondContact || (data.secondFirstName && data.secondLastName && data.secondEmail && isValidEmail(data.secondEmail)));
  };

  return (
    <div className="grid">
      <div className="card">
        <h2>Contact Information</h2>
        <p className="muted">We'll use this to coordinate your appointment</p>

        <h3>Primary Contact</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="field">
            <label className="label">First Name</label>
            <input 
              type="text"
              value={data.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="John"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="field">
            <label className="label">Last Name</label>
            <input 
              type="text"
              value={data.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Doe"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Email Address</label>
          <input 
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john@example.com"
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${data.email && !isValidEmail(data.email) ? '#ef4444' : 'var(--line)'}`,
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          {data.email && !isValidEmail(data.email) && (
            <div className="small" style={{ color: '#ef4444', marginTop: '4px' }}>
              Please enter a valid email address
            </div>
          )}
        </div>

        <div className="field">
          <label className="label">Phone Number</label>
          <input 
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${data.phone && !isValidPhone(data.phone) ? '#ef4444' : 'var(--line)'}`,
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          {data.phone && !isValidPhone(data.phone) && (
            <div className="small" style={{ color: '#ef4444', marginTop: '4px' }}>
              Please enter a valid phone number
            </div>
          )}
        </div>

        <div className="field">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox"
              checked={data.secondContact}
              onChange={(e) => handleChange('secondContact', e.target.checked)}
            />
            Add second contact person
          </label>
        </div>

        {data.secondContact && (
          <>
            <h3>Second Contact</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="field">
                <label className="label">First Name</label>
                <input 
                  type="text"
                  value={data.secondFirstName}
                  onChange={(e) => handleChange('secondFirstName', e.target.value)}
                  placeholder="Jane"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div className="field">
                <label className="label">Last Name</label>
                <input 
                  type="text"
                  value={data.secondLastName}
                  onChange={(e) => handleChange('secondLastName', e.target.value)}
                  placeholder="Doe"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Email Address</label>
              <input 
                type="email"
                value={data.secondEmail}
                onChange={(e) => handleChange('secondEmail', e.target.value)}
                placeholder="jane@example.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${data.secondEmail && !isValidEmail(data.secondEmail) ? '#ef4444' : 'var(--line)'}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div className="field">
              <label className="label">Phone Number (optional)</label>
              <input 
                type="tel"
                value={data.secondPhone}
                onChange={(e) => handleChange('secondPhone', e.target.value)}
                placeholder="(555) 123-4567"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </>
        )}

        <div className="field">
          <label className="label">Special Instructions (optional)</label>
          <textarea 
            value={data.specialInstructions}
            onChange={(e) => handleChange('specialInstructions', e.target.value)}
            placeholder="Any special access instructions, parking info, or other details..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        <div className="action-row" style={{ marginTop: '24px' }}>
          <button className="btn btn-ghost" onClick={onBack}>
            Back
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onNext}
            disabled={!isFormValid()}
          >
            Continue
          </button>
        </div>
      </div>

      <div className="sidebar">
        <div className="card">
          <h3>Contact Info Usage</h3>
          <ul className="checklist">
            <li><span className="check">✓</span> Appointment confirmations</li>
            <li><span className="check">✓</span> Delivery notifications</li>
            <li><span className="check">✓</span> Service updates</li>
            <li><span className="check">✓</span> Technical support</li>
          </ul>
          
          <div className="small" style={{ marginTop: '12px' }}>
            We respect your privacy and will never share your information with third parties.
          </div>
        </div>
      </div>
    </div>
  );
}
