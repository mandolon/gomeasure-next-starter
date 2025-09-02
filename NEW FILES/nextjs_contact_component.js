import { useState } from 'react';
import StepNavigation from './StepNavigation';
import styles from '../styles/Contact.module.css';

export default function Contact({ state, updateState, routes, currentStep }) {
  const handleInputChange = (field, value) => {
    updateState({ [field]: value });
  };

  const toggleSecondContact = () => {
    const newValue = !state.hasSecondContact;
    updateState({ 
      hasSecondContact: newValue,
      contactName2: newValue ? state.contactName2 : '',
      contactPhone2: newValue ? state.contactPhone2 : ''
    });
  };

  const handlePrepLinkClick = (e) => {
    e.preventDefault();
    alert('Demo: open preparation guide for scans.');
  };

  return (
    <section className={styles.card}>
      <StepNavigation routes={routes} currentStep={currentStep} />
      
      <h2>Who is the site contact?</h2>
      <p>We'll contact this person when arriving on site.</p>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cname">Name</label>
          <input 
            className={styles.input} 
            id="cname" 
            type="text"
            placeholder="Enter your full name"
            value={state.contactName}
            onChange={(e) => handleInputChange('contactName', e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cphone">Phone</label>
          <input 
            className={styles.input} 
            id="cphone" 
            type="tel"
            placeholder="Enter phone number"
            value={state.contactPhone}
            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.contactToggle} onClick={toggleSecondContact}>
        <input 
          type="checkbox" 
          id="addSecondContact"
          checked={state.hasSecondContact}
          onChange={toggleSecondContact}
        />
        <label htmlFor="addSecondContact">Add a second contact person</label>
      </div>

      {state.hasSecondContact && (
        <div className={styles.secondContact}>
          <h3>Second Contact</h3>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="cname2">Name</label>
              <input 
                className={styles.input} 
                id="cname2" 
                type="text"
                placeholder="Enter full name"
                value={state.contactName2}
                onChange={(e) => handleInputChange('contactName2', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="cphone2">Phone</label>
              <input 
                className={styles.input} 
                id="cphone2" 
                type="tel"
                placeholder="Enter phone number"
                value={state.contactPhone2}
                onChange={(e) => handleInputChange('contactPhone2', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cemail">Email</label>
        <input 
          className={styles.input} 
          id="cemail" 
          type="email"
          placeholder="Enter email address"
          value={state.contactEmail}
          onChange={(e) => handleInputChange('contactEmail', e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="access">Access instructions</label>
        <textarea 
          className={styles.textarea} 
          id="access" 
          rows="3"
          placeholder="Enter access instructions (parking, lock box code, gate code, etc.)"
          value={state.access}
          onChange={(e) => handleInputChange('access', e.target.value)}
        />
      </div>

      <div className={styles.prepLink}>
        <a href="#" onClick={handlePrepLinkClick}>
          📋 How to prepare for scans
        </a>
      </div>
    </section>
  );
}