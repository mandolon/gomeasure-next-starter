'use client';
import { useOrder } from '../context';
import { usePathname, useRouter } from 'next/navigation';

export default function StickyFooter() {
  const { state } = useOrder();
  const pathname = usePathname();
  const router = useRouter();
  const currentStep = pathname.split('/').pop() || 'property';

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
      // Validate scheduling based on capture scope
      if (state.capScope === 'interior') {
        if (!state.dateInt || !state.timeInt) {
          alert('Please choose a date and time for the interior scan.');
          return;
        }
      } else if (state.capScope === 'exterior') {
        if (!state.dateExt || !state.timeExt) {
          alert('Please choose a date and time for the exterior scan.');
          return;
        }
      } else if (state.capScope === 'interior-exterior') {
        if (!state.dateInt || !state.timeInt || !state.dateExt || !state.timeExt) {
          alert('Please choose dates and times for both interior and exterior scans.');
          return;
        }
      } else {
        // Fallback for single scope
        if (!state.date || !state.time) {
          alert('Please choose a date and time.');
          return;
        }
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
    <div className="sticky-footer" data-step={currentStep} role="region" aria-label="Step actions">
      <div className="wrap">
        <div className="row">
          {currentStep !== 'property' && (
            <button className="btn btn-ghost" onClick={handleBack}>
              Back
            </button>
          )}
          <button className="btn btn-primary" onClick={handleNext}>
            {currentStep === 'review' ? 'Place order' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}