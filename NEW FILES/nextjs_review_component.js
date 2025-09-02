import StepNavigation from './StepNavigation';
import styles from '../styles/Review.module.css';

export default function Review({ state, updateState, routes, currentStep }) {
  const handleCheckboxChange = (field, value) => {
    updateState({ [field]: value });
  };

  const formatScopeName = (scope) => {
    switch (scope) {
      case 'interior':
        return 'Interior Only';
      case 'exterior':
        return 'Exterior Only';
      case 'interior-exterior':
        return 'Interior & Exterior';
      default:
        return scope;
    }
  };

  const getAreaDisplay = () => {
    const scope = state.capScope;
    if (scope === 'interior') {
      return state.areaInt ? `${state.areaInt} sq ft` : '—';
    } else if (scope === 'exterior') {
      return state.areaExt ? `${state.areaExt} sq ft` : '—';
    } else if (scope === 'interior-exterior') {
      return `${state.areaBothInt || '—'} / ${state.areaBothExt || '—'} sq ft`;
    }
    return '—';
  };

  const getScheduleDisplay = () => {
    const scope = state.capScope;
    const schedules = [];

    if (scope === 'interior' || scope === 'interior-exterior') {
      if (state.interiorDate && state.interiorTime) {
        const date = new Date(state.interiorDate);
        const dateStr = date.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
        schedules.push(`Interior: ${dateStr} at ${state.interiorTime}`);
      }
    }

    if (scope === 'exterior' || scope === 'interior-exterior') {
      if (state.exteriorDate && state.exteriorTime) {
        const date = new Date(state.exteriorDate);
        const dateStr = date.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
        schedules.push(`Exterior: ${dateStr} at ${state.exteriorTime}`);
      }
    }

    return schedules.length > 0 ? schedules.join(', ') : '—';
  };

  return (
    <section className={styles.card}>
      <StepNavigation routes={routes} currentStep={currentStep} />
      
      <h2>Review &amp; confirm</h2>
      
      <div className={styles.reviewGrid}>
        <div className={styles.reviewSection}>
          <h3>Property Details</h3>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Address</span>
            <span className={styles.reviewValue}>{state.address || '—'}</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Type</span>
            <span className={styles.reviewValue}>
              {state.propType ? state.propType.charAt(0).toUpperCase() + state.propType.slice(1) : '—'}
            </span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Scope</span>
            <span className={styles.reviewValue}>{formatScopeName(state.capScope)}</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Area</span>
            <span className={styles.reviewValue}>{getAreaDisplay()}</span>
          </div>
        </div>

        <div className={styles.reviewSection}>
          <h3>Schedule</h3>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Appointments</span>
            <span className={styles.reviewValue}>{getScheduleDisplay()}</span>
          </div>
        </div>

        <div className={styles.reviewSection}>
          <h3>Contact</h3>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Primary Contact</span>
            <span className={styles.reviewValue}>{state.contactName || '—'}</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Phone</span>
            <span className={styles.reviewValue}>{state.contactPhone || '—'}</span>
          </div>
          {state.hasSecondContact && (state.contactName2 || state.contactPhone2) && (
            <>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Second Contact</span>
                <span className={styles.reviewValue}>{state.contactName2 || '—'}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Second Phone</span>
                <span className={styles.reviewValue}>{state.contactPhone2 || '—'}</span>
              </div>
            </>
          )}
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Email</span>
            <span className={styles.reviewValue}>{state.contactEmail || '—'}</span>
          </div>
        </div>
      </div>

      <div className={styles.checkboxGroup}>
        <div className={styles.checkboxWrap}>
          <input 
            type="checkbox" 
            id="agree-terms"
            checked={state.agreeTerms}
            onChange={(e) => handleCheckboxChange('agreeTerms', e.target.checked)}
          />
          <label htmlFor="agree-terms">
            I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </label>
        </div>
        <div className={styles.checkboxWrap}>
          <input 
            type="checkbox" 
            id="agree-payment"
            checked={state.agreePayment}
            onChange={(e) => handleCheckboxChange('agreePayment', e.target.checked)}
          />
          <label htmlFor="agree-payment">
            I authorize the payment and understand the cancellation policy
          </label>
        </div>
      </div>
    </section>
  );
}