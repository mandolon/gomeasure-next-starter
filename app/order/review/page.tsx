'use client';
import StepNav from '../components/StepNav';
import { useOrder } from '../context';
import { useState } from 'react';

export default function ReviewPage() {
  const { state } = useOrder();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePayment, setAgreePayment] = useState(false);

  const formatScope = (scope: string) => {
    return scope === 'interior-exterior' ? 'Interior & Exterior' : 
           scope.charAt(0).toUpperCase() + scope.slice(1);
  };

  const formatArea = () => {
    const { capScope, areaInt, areaExt, areaBothInt, areaBothExt } = state;
    if (capScope === 'interior') {
      return areaInt ? `${areaInt} sq ft` : '—';
    } else if (capScope === 'exterior') {
      return areaExt ? `${areaExt} sq ft` : '—';
    } else if (capScope === 'interior-exterior') {
      const intPart = areaBothInt || '—';
      const extPart = areaBothExt || '—';
      return `${intPart} / ${extPart} sq ft`;
    }
    return '—';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatSchedule = () => {
    const { capScope, dateInt, timeInt, dateExt, timeExt, date, time } = state;
    
    if (capScope === 'interior') {
      return {
        date: formatDate(dateInt || date),
        time: timeInt || time || '—'
      };
    } else if (capScope === 'exterior') {
      return {
        date: formatDate(dateExt || date),
        time: timeExt || time || '—'
      };
    } else if (capScope === 'interior-exterior') {
      // For combined scope, show both if different, otherwise show one
      const intDate = formatDate(dateInt);
      const extDate = formatDate(dateExt);
      const intTime = timeInt || '—';
      const extTime = timeExt || '—';
      
      if (intDate === extDate && intTime === extTime) {
        return { date: intDate, time: intTime };
      } else {
        return {
          date: `Interior: ${intDate}, Exterior: ${extDate}`,
          time: `Interior: ${intTime}, Exterior: ${extTime}`
        };
      }
    }
    
    return { date: formatDate(date), time: time || '—' };
  };

  const scheduleInfo = formatSchedule();

  const handlePlaceOrder = () => {
    if (!agreeTerms || !agreePayment) {
      alert('Please agree to the terms and payment authorization.');
      return;
    }
    alert('Demo: order placed ✔');
  };

  return (
    <section className="card">
      <StepNav />
      
      <h2 tabIndex={-1}>Review &amp; confirm</h2>
      
      <div className="review-grid">
        <div className="review-section">
          <h3>Property Details</h3>
          <div className="review-item">
            <span className="review-label">Address</span>
            <span className="review-value" id="rev-address">{state.address || '—'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Type</span>
            <span className="review-value" id="rev-type">
              {state.propType ? state.propType.charAt(0).toUpperCase() + state.propType.slice(1) : '—'}
            </span>
          </div>
          <div className="review-item">
            <span className="review-label">Scope</span>
            <span className="review-value" id="rev-scope">
              {state.capScope ? formatScope(state.capScope) : '—'}
            </span>
          </div>
          <div className="review-item">
            <span className="review-label">Area</span>
            <span className="review-value" id="rev-area">{formatArea()}</span>
          </div>
        </div>

        <div className="review-section">
          <h3>Schedule</h3>
          <div className="review-item">
            <span className="review-label">Date</span>
            <span className="review-value" id="rev-date">{scheduleInfo.date}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Time</span>
            <span className="review-value" id="rev-time">{scheduleInfo.time}</span>
          </div>
        </div>

        <div className="review-section">
          <h3>Contact</h3>
          <div className="review-item">
            <span className="review-label">Primary Contact</span>
            <span className="review-value" id="rev-contact">{state.contactName || '—'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Phone</span>
            <span className="review-value" id="rev-phone">{state.contactPhone || '—'}</span>
          </div>
          <div 
            className="review-item" 
            id="rev-contact2-row" 
            style={{ display: state.hasSecondContact && state.contactName2 ? 'flex' : 'none' }}
          >
            <span className="review-label">Second Contact</span>
            <span className="review-value" id="rev-contact2">{state.contactName2 || '—'}</span>
          </div>
          <div 
            className="review-item" 
            id="rev-phone2-row" 
            style={{ display: state.hasSecondContact && state.contactPhone2 ? 'flex' : 'none' }}
          >
            <span className="review-label">Second Phone</span>
            <span className="review-value" id="rev-phone2">{state.contactPhone2 || '—'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Email</span>
            <span className="review-value" id="rev-email">{state.contactEmail || '—'}</span>
          </div>
        </div>
      </div>

      <div className="checkbox-group">
        <div className="checkbox-wrap">
          <input 
            type="checkbox" 
            id="agree-terms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          <label htmlFor="agree-terms">
            I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </label>
        </div>
        <div className="checkbox-wrap">
          <input 
            type="checkbox" 
            id="agree-payment"
            checked={agreePayment}
            onChange={(e) => setAgreePayment(e.target.checked)}
          />
          <label htmlFor="agree-payment">
            I authorize the payment and understand the cancellation policy
          </label>
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-ghost" data-prev="contact">Back</button>
        <div style={{ flex: 1 }}></div>
        <button className="btn btn-primary" id="placeOrderBtn" onClick={handlePlaceOrder}>
          Place order
        </button>
      </div>
    </section>
  );
}