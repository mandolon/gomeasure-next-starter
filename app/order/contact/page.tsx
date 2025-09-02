'use client';
import StepNav from '../components/StepNav';
import { useOrder } from '../context';
import { useState, useEffect } from 'react';

export default function ContactPage() {
  const { state, updateState } = useOrder();
  const [showSecondContact, setShowSecondContact] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShowSecondContact(state.hasSecondContact);
  }, [state.hasSecondContact]);

  const toggleSecondContact = () => {
    const newValue = !showSecondContact;
    setShowSecondContact(newValue);
    updateState({ 
      hasSecondContact: newValue,
      contactName2: newValue ? state.contactName2 : '',
      contactPhone2: newValue ? state.contactPhone2 : ''
    });
  };

  const handlePrepLink = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Demo: open preparation guide for scans.');
  };

  return (
    <section className="card">
      <StepNav />
      
      <h2 tabIndex={-1}>Who is the site contact?</h2>
      <p>We&apos;ll contact this person when arriving on site.</p>

      <div className="row" style={{ marginTop: '8px' }}>
        <div className="field">
          <label className="label" htmlFor="cname">Name</label>
          <input
            className="input"
            id="cname"
            name="contactName"
            value={state.contactName}
            onChange={(e) => updateState({ contactName: e.target.value })}
            placeholder="Enter your full name"
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="cphone">Phone</label>
          <input
            className="input"
            id="cphone"
            name="contactPhone"
            type="tel"
            value={state.contactPhone}
            onChange={(e) => updateState({ contactPhone: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="contact-toggle" onClick={toggleSecondContact}>
        <input
          type="checkbox"
          id="addSecondContact"
          checked={showSecondContact}
          onChange={toggleSecondContact}
        />
        <label htmlFor="addSecondContact">Add a second contact person</label>
      </div>

      <div className={`second-contact ${showSecondContact ? 'show' : ''}`} id="secondContactSection">
        <h3>Second Contact</h3>
        <div className="row">
          <div className="field">
            <label className="label" htmlFor="cname2">Name</label>
            <input
              className="input"
              id="cname2"
              name="contactName2"
              value={state.contactName2}
              onChange={(e) => updateState({ contactName2: e.target.value })}
              placeholder="Enter full name"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="cphone2">Phone</label>
            <input
              className="input"
              id="cphone2"
              name="contactPhone2"
              type="tel"
              value={state.contactPhone2}
              onChange={(e) => updateState({ contactPhone2: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="cemail">Email</label>
        <input
          className="input"
          id="cemail"
          name="contactEmail"
          type="email"
          value={state.contactEmail}
          onChange={(e) => updateState({ contactEmail: e.target.value })}
          placeholder="Enter email address"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="access">Access instructions</label>
        <textarea
          className="textarea"
          id="access"
          name="access"
          rows={3}
          value={state.access}
          onChange={(e) => updateState({ access: e.target.value })}
          placeholder="Enter access instructions (parking, lock box code, gate code, etc.)"
        />
      </div>

      <div className="prep-link">
        <a href="#" id="prepLink" onClick={handlePrepLink}>
          📋 How to prepare for scans
        </a>
      </div>
    </section>
  );
}