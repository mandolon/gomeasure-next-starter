'use client';

import { useState } from 'react';
import PropertyDetails from '@/components/order/PropertyDetails';

export default function OrderPage() {
  const [formData, setFormData] = useState({
    address: '',
    propertyType: 'residential',
    captureScope: 'interior',
    areaInt: 0,
    areaExt: 0,
    areaBothInt: 0,
    areaBothExt: 0,
  });
  
  const [currentStep, setCurrentStep] = useState('property');
  
  const handleUpdate = (data: any) => {
    setFormData(data);
  };
  
  const handleNext = () => {
    console.log('Moving to next step with data:', formData);
    // Here you would move to the next step (schedule, contact, review)
    // For now we'll just log the data
  };
  
  return (
    <>
      <header className="site-header">
        <div className="header-content">
          <button 
            className="header-back"
            onClick={() => window.location.href = '/'}
            aria-label="Back to main page"
          >
            <svg viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </div>
      </header>

      <main className="page">
        <div className="container">
          <header className="page-head">
            <div>
              <h1>Complete order details</h1>
              <p>Only a few steps left to complete the capture service order.</p>
            </div>
          </header>

          <div className="grid">
            <section className="card">
              {/* Step navigation */}
              <nav className="seqg-step-nav" aria-label="Progress">
                <ol className="seqg-steps" role="list">
                  <li><a href="#" aria-current="step">Property</a></li>
                  <li><a href="#">Schedule</a></li>
                  <li><a href="#">Contact</a></li>
                  <li><a href="#">Review</a></li>
                </ol>
              </nav>

              {/* Current step content */}
              {currentStep === 'property' && (
                <PropertyDetails 
                  formData={formData}
                  onUpdate={handleUpdate}
                  onNext={handleNext}
                />
              )}
            </section>

            {/* Sidebar */}
            <aside className="sidebar-container">
              <div className="card">
                <h3>What&apos;s Included</h3>
                <ul className="checklist">
                  <li>
                    <span className="check">✓</span>
                    <span>Professional 3D scanning</span>
                  </li>
                  <li>
                    <span className="check">✓</span>
                    <span>Point cloud data</span>
                  </li>
                  <li>
                    <span className="check">✓</span>
                    <span>Floor plans</span>
                  </li>
                  <li>
                    <span className="check">✓</span>
                    <span>Virtual walkthrough</span>
                  </li>
                </ul>
              </div>
              
              <div className="card">
                <h3>Estimated Price</h3>
                <div className="price-row">
                  <span className="price-label">Base price</span>
                  <span className="price-value">$100</span>
                </div>
                <div className="price-row">
                  <span className="price-label">Area cost</span>
                  <span className="price-value">
                    ${(() => {
                      const scope = formData.captureScope;
                      let area = 0;
                      if (scope === 'interior') area = formData.areaInt * 0.10;
                      else if (scope === 'exterior') area = formData.areaExt * 0.05;
                      else if (scope === 'interior-exterior') {
                        area = (formData.areaBothInt * 0.10) + (formData.areaBothExt * 0.05);
                      }
                      return area.toFixed(2);
                    })()}
                  </span>
                </div>
                <div className="price-total">
                  ${(() => {
                    const scope = formData.captureScope;
                    let area = 0;
                    if (scope === 'interior') area = formData.areaInt * 0.10;
                    else if (scope === 'exterior') area = formData.areaExt * 0.05;
                    else if (scope === 'interior-exterior') {
                      area = (formData.areaBothInt * 0.10) + (formData.areaBothExt * 0.05);
                    }
                    return Math.max(100, area + 100).toFixed(2);
                  })()}
                </div>
                <p className="small">Final price may vary based on complexity</p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Mobile sticky footer */}
      <div className="sticky-footer">
        <div className="sticky-content">
          <button className="btn btn-primary" onClick={handleNext}>
            Next: Schedule
          </button>
        </div>
      </div>
    </>
  );
}