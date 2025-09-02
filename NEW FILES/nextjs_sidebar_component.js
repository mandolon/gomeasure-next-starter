import { useMemo } from 'react';
import styles from '../styles/Sidebar.module.css';

const RESIDENTIAL_LIST = [
  'Professional 3D scanning technician',
  'High-precision LiDAR capture',
  'Point cloud data processing',
  'BIM-ready deliverables',
  '2D floor plans & elevations',
  '3D model in multiple formats',
  'Virtual walkthrough access',
  'Measurement accuracy ±1/8"'
];

const COMMERCIAL_LIST = [
  'Certified scanning professionals',
  'Industrial-grade LiDAR equipment',
  'MEP system documentation',
  'Revit-ready BIM models',
  'Clash detection support',
  'As-built documentation',
  'COBie data extraction',
  'Professional liability insurance'
];

const STEP_CHECKLISTS = {
  details: {
    title: "What's included",
    items: null // Dynamic based on property type
  },
  schedule: {
    title: "Schedule checklist",
    items: [
      'Date and time selected',
      'Site accessibility confirmed',
      'Weather backup plan in place',
      'Equipment requirements verified'
    ]
  },
  contact: {
    title: "Contact checklist",
    items: [
      'Primary contact information',
      'Site access instructions',
      'Communication preferences set',
      'Emergency contact available'
    ]
  },
  review: {
    title: "Final checklist",
    items: [
      'Property details verified',
      'Schedule confirmed',
      'Contact information complete',
      'Terms and conditions accepted'
    ]
  }
};

export default function Sidebar({ currentStep, state, onNext, onPrev, canGoNext, canGoBack }) {
  const pricing = useMemo(() => {
    const scope = state.capScope;
    let interior = 0, exterior = 0;
    
    if (scope === 'interior') {
      interior = parseFloat(state.areaInt || 0) || 0;
    } else if (scope === 'exterior') {
      exterior = parseFloat(state.areaExt || 0) || 0;
    } else if (scope === 'interior-exterior') {
      interior = parseFloat(state.areaBothInt || 0) || 0;
      exterior = parseFloat(state.areaBothExt || 0) || 0;
    }
    
    const intPrice = interior * 0.25;
    const extPrice = exterior * 0.15;
    let total = intPrice + extPrice;
    
    // Discount for both interior and exterior
    if (interior > 0 && exterior > 0) {
      total *= 0.9;
    }
    
    return {
      interior: intPrice,
      exterior: extPrice,
      total: Math.round(total * 100) / 100
    };
  }, [state.capScope, state.areaInt, state.areaExt, state.areaBothInt, state.areaBothExt]);

  const checklist = STEP_CHECKLISTS[currentStep];
  const isDetailsStep = currentStep === 'details';
  const checklistItems = isDetailsStep 
    ? (state.propType === 'commercial' ? COMMERCIAL_LIST : RESIDENTIAL_LIST)
    : checklist.items;

  return (
    <aside className={styles.sidebarContainer}>
      {/* Context-specific card */}
      <div className={styles.card}>
        <h2>{checklist.title}</h2>
        
        {isDetailsStep ? (
          <>
            <ul className={styles.includedList}>
              {checklistItems.map((item, index) => (
                <li key={index}>
                  <span className={styles.check}>✓</span> {item}
                </li>
              ))}
            </ul>
            <p className={styles.small}>All data delivered within 48 hours</p>
          </>
        ) : (
          <ul className={styles.checklist}>
            {checklistItems.map((item, index) => (
              <li key={index}>
                <span className={styles.check}>✓</span> {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Estimate Card */}
      <div className={styles.card}>
        <h2>Estimate</h2>
        <div className={styles.priceContainer}>
          {state.capScope === 'interior' && pricing.interior > 0 && (
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Interior</span>
              <span className={styles.priceValue}>${pricing.interior.toFixed(2)}</span>
            </div>
          )}
          
          {state.capScope === 'exterior' && pricing.exterior > 0 && (
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Exterior</span>
              <span className={styles.priceValue}>${pricing.exterior.toFixed(2)}</span>
            </div>
          )}
          
          {state.capScope === 'interior-exterior' && (
            <>
              {pricing.interior > 0 && (
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Interior</span>
                  <span className={styles.priceValue}>${pricing.interior.toFixed(2)}</span>
                </div>
              )}
              {pricing.exterior > 0 && (
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Exterior</span>
                  <span className={styles.priceValue}>${pricing.exterior.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
          
          <div className={styles.priceTotal}>
            <span>Total</span>
            <span>${pricing.total > 0 ? pricing.total.toFixed(2) : '—'}</span>
          </div>
          <p className={styles.small}>*Tax not included</p>
        </div>
      </div>

      {/* Desktop action buttons */}
      <div className={styles.desktopActions}>
        {canGoBack && (
          <button className={styles.btnGhost} onClick={onPrev}>
            Back
          </button>
        )}
        <button 
          className={styles.btnPrimary} 
          onClick={onNext}
          disabled={!canGoNext}
        >
          {currentStep === 'review' ? 'Place order' : 'Next'}
        </button>
      </div>
    </aside>
  );
}