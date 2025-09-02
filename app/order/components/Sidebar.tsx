'use client';
import { useOrder, calcPrice } from '../context';
import { usePathname, useRouter } from 'next/navigation';

const residentialList = [
  'Professional 3D scanning technician',
  'High-precision LiDAR capture', 
  'Point cloud data processing',
  'BIM-ready deliverables',
  '2D floor plans & elevations',
  '3D model in multiple formats',
  'Virtual walkthrough access',
  'Measurement accuracy ±1/8"'
];

const commercialList = [
  'Certified scanning professionals',
  'Industrial-grade LiDAR equipment',
  'MEP system documentation', 
  'Revit-ready BIM models',
  'Clash detection support',
  'As-built documentation',
  'COBie data extraction',
  'Professional liability insurance'
];

export default function Sidebar() {
  const { state } = useOrder();
  const pathname = usePathname();
  const router = useRouter();
  const currentStep = pathname.split('/').pop() || 'property';
  const prices = calcPrice(state);

  const steps = ['property', 'schedule', 'contact', 'review'];
  const currentIndex = steps.indexOf(currentStep);
  const nextStep = steps[Math.min(steps.length - 1, currentIndex + 1)];
  const prevStep = steps[Math.max(0, currentIndex - 1)];

  const handleNext = () => {
    if (currentStep === 'property') {
      // Validate property step
      if (!state.address.trim()) return;
      const hasArea = (state.capScope === 'interior' && state.areaInt > 0) ||
                     (state.capScope === 'exterior' && state.areaExt > 0) ||
                     (state.capScope === 'interior-exterior' && state.areaBothInt > 0 && state.areaBothExt > 0);
      if (!hasArea) return;
    }
    
    if (currentStep === 'schedule') {
      if (!state.date || !state.time) {
        alert('Please choose a date and time.');
        return;
      }
    }
    
    if (currentStep === 'review') {
      const terms = document.getElementById('agree-terms') as HTMLInputElement;
      const payment = document.getElementById('agree-payment') as HTMLInputElement;
      if (!terms?.checked || !payment?.checked) {
        alert('Please agree to the terms and payment authorization.');
        return;
      }
      alert('Demo: order placed ✔');
      return;
    }
    
    router.push(`/order/${nextStep}`);
  };

  const handleBack = () => {
    router.push(`/order/${prevStep}`);
  };

  return (
    <aside className="sidebar-container">
      {/* What's Included Card (only for Property step) */}
      {currentStep === 'property' && (
        <div className="card" aria-label="What's Included">
          <h2 style={{ fontSize: '18px' }}>What's included</h2>
          <ul className="checklist">
            {(state.propType === 'commercial' ? commercialList : residentialList).map((item, index) => (
              <li key={index}>
                <span className="check">✓</span> {item}
              </li>
            ))}
          </ul>
          <p className="small" style={{ marginTop: '12px' }}>
            All data delivered within 48 hours
          </p>
        </div>
      )}

      {/* Schedule Checklist */}
      {currentStep === 'schedule' && (
        <div className="card" aria-label="Schedule Items">
          <h2 style={{ fontSize: '18px' }}>Schedule checklist</h2>
          <ul className="checklist">
            <li><span className="check">✓</span> Date and time selected</li>
            <li><span className="check">✓</span> Site accessibility confirmed</li>
            <li><span className="check">✓</span> Weather backup plan in place</li>
            <li><span className="check">✓</span> Equipment requirements verified</li>
          </ul>
        </div>
      )}

      {/* Contact Checklist */}
      {currentStep === 'contact' && (
        <div className="card" aria-label="Contact Items">
          <h2 style={{ fontSize: '18px' }}>Contact checklist</h2>
          <ul className="checklist">
            <li><span className="check">✓</span> Primary contact information</li>
            <li><span className="check">✓</span> Site access instructions</li>
            <li><span className="check">✓</span> Communication preferences set</li>
            <li><span className="check">✓</span> Emergency contact available</li>
          </ul>
        </div>
      )}

      {/* Review Checklist */}
      {currentStep === 'review' && (
        <div className="card" aria-label="Review Items">
          <h2 style={{ fontSize: '18px' }}>Final checklist</h2>
          <ul className="checklist">
            <li><span className="check">✓</span> Property details verified</li>
            <li><span className="check">✓</span> Schedule confirmed</li>
            <li><span className="check">✓</span> Contact information complete</li>
            <li><span className="check">✓</span> Terms and conditions accepted</li>
          </ul>
        </div>
      )}

      {/* Summary Card */}
      <div className="card" aria-label="Summary">
        <h2 style={{ fontSize: '18px' }}>Estimate</h2>
        <div style={{ marginTop: '8px' }}>
          {state.capScope === 'interior' && prices.interior > 0 && (
            <div className="price-row">
              <span className="price-label">Interior</span>
              <span className="price-value">${prices.interior.toFixed(2)}</span>
            </div>
          )}
          {state.capScope === 'exterior' && prices.exterior > 0 && (
            <div className="price-row">
              <span className="price-label">Exterior</span>
              <span className="price-value">${prices.exterior.toFixed(2)}</span>
            </div>
          )}
          {state.capScope === 'interior-exterior' && (
            <>
              {prices.interior > 0 && (
                <div className="price-row">
                  <span className="price-label">Interior</span>
                  <span className="price-value">${prices.interior.toFixed(2)}</span>
                </div>
              )}
              {prices.exterior > 0 && (
                <div className="price-row">
                  <span className="price-label">Exterior</span>
                  <span className="price-value">${prices.exterior.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
          <div className="price-row price-total">
            <span>Total</span>
            <span>
              {prices.total > 0 ? `$${prices.total.toFixed(2)}` : '$—'}
            </span>
          </div>
          <p className="small" style={{ marginTop: '6px' }}>*Tax not included</p>
        </div>
      </div>

      {/* Desktop action buttons */}
      <div className="desktop-actions">
        {currentStep !== 'property' && (
          <button className="btn btn-ghost" onClick={handleBack}>
            Back
          </button>
        )}
        <button className="btn btn-primary" onClick={handleNext}>
          {currentStep === 'review' ? 'Place order' : 'Next'}
        </button>
      </div>
    </aside>
  );
}