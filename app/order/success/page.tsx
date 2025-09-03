
'use client';
import { useEffect, useState } from 'react';

export default function Success() {
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Get order details from sessionStorage (if available)
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('orderStateDemo');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          setOrderDetails(state);
        } catch (e) {
          console.error('Error parsing order state:', e);
        }
      }
    }
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatScope = (scope: string) => {
    if (!scope) return '—';
    return scope
      .replace('interior-exterior', 'Interior & Exterior')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatArea = (details: any) => {
    if (!details) return '—';
    const scope = details.capScope;
    if (scope === 'interior') {
      return `${details.areaInt || '—'} sq ft`;
    } else if (scope === 'exterior') {
      return `${details.areaExt || '—'} sq ft`;
    } else if (scope === 'interior-exterior') {
      return `${details.areaBothInt || '—'} / ${details.areaBothExt || '—'} sq ft`;
    }
    return '—';
  };

  return (
    <>
      {/* Site Header with back button */}
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
          <div className="grid">
            <section className="card">
              <h1 style={{ color: 'var(--accent)', marginBottom: '16px' }}>Order Submitted!</h1>
              
              <p style={{ fontSize: '18px', marginBottom: '24px', color: 'var(--ink-7)' }}>
                Thank you for your order. We'll contact you within 24 hours to confirm your appointment details.
              </p>
              
              <p className="muted">
                You'll receive a confirmation email shortly with your order details and next steps.
              </p>

              {orderDetails && (
                <div className="review-grid" style={{ marginTop: '32px' }}>
                  <div className="review-section">
                    <h3>Property Details</h3>
                    <div className="review-item">
                      <span className="review-label">Address</span>
                      <span className="review-value">{orderDetails.address || '—'}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Type</span>
                      <span className="review-value">
                        {orderDetails.propType ? 
                          orderDetails.propType.charAt(0).toUpperCase() + orderDetails.propType.slice(1) 
                          : '—'}
                      </span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Scope</span>
                      <span className="review-value">{formatScope(orderDetails.capScope)}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Area</span>
                      <span className="review-value">{formatArea(orderDetails)}</span>
                    </div>
                  </div>

                  <div className="review-section">
                    <h3>Schedule</h3>
                    <div className="review-item">
                      <span className="review-label">Date</span>
                      <span className="review-value">{formatDate(orderDetails.date)}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Time</span>
                      <span className="review-value">{orderDetails.time || '—'}</span>
                    </div>
                  </div>

                  <div className="review-section">
                    <h3>Contact</h3>
                    <div className="review-item">
                      <span className="review-label">Primary Contact</span>
                      <span className="review-value">{orderDetails.contactName || '—'}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Phone</span>
                      <span className="review-value">{orderDetails.contactPhone || '—'}</span>
                    </div>
                    {orderDetails.hasSecondContact && orderDetails.contactName2 && (
                      <>
                        <div className="review-item">
                          <span className="review-label">Second Contact</span>
                          <span className="review-value">{orderDetails.contactName2 || '—'}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-label">Second Phone</span>
                          <span className="review-value">{orderDetails.contactPhone2 || '—'}</span>
                        </div>
                      </>
                    )}
                    <div className="review-item">
                      <span className="review-label">Email</span>
                      <span className="review-value">{orderDetails.contactEmail || '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="actions" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '32px' }}>
                <a href="/" className="btn btn-primary">Return Home</a>
                <button 
                  className="btn btn-ghost"
                  onClick={() => window.location.href = '/order'}
                >
                  Place Another Order
                </button>
              </div>
            </section>

            {/* Sidebar */}
            <aside className="sidebar-container">
              {/* Success checklist */}
              <div className="card">
                <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>What happens next</h2>
                <ul className="checklist">
                  <li><span className="check">✓</span> Order confirmation email sent</li>
                  <li><span className="check">✓</span> Technician assignment in progress</li>
                  <li><span className="check">✓</span> Site visit scheduled</li>
                  <li><span className="check">✓</span> 3D scanning will be completed</li>
                  <li><span className="check">✓</span> Data delivered within 48 hours</li>
                </ul>
                <p className="small" style={{ marginTop: '12px' }}>
                  Need to make changes? Contact us at support@gomeasure.com
                </p>
              </div>

              {/* Order summary card */}
              {orderDetails && (
                <div className="card" aria-label="Order Summary">
                  <h2 style={{ fontSize: '18px' }}>Order Summary</h2>
                  <div style={{ marginTop: '8px' }}>
                    {(() => {
                      // Calculate pricing
                      const scope = orderDetails.capScope;
                      let intPrice = 0, extPrice = 0;
                      
                      if (scope === 'interior') {
                        intPrice = (parseFloat(orderDetails.areaInt) || 0) * 0.25;
                      } else if (scope === 'exterior') {
                        extPrice = (parseFloat(orderDetails.areaExt) || 0) * 0.15;
                      } else if (scope === 'interior-exterior') {
                        intPrice = (parseFloat(orderDetails.areaBothInt) || 0) * 0.25;
                        extPrice = (parseFloat(orderDetails.areaBothExt) || 0) * 0.15;
                      }
                      
                      let total = intPrice + extPrice;
                      if (intPrice > 0 && extPrice > 0) total *= 0.9; // discount for both
                      
                      return (
                        <>
                          {intPrice > 0 && (
                            <div className="price-row">
                              <span className="price-label">Interior</span>
                              <span className="price-value">${intPrice.toFixed(2)}</span>
                            </div>
                          )}
                          {extPrice > 0 && (
                            <div className="price-row">
                              <span className="price-label">Exterior</span>
                              <span className="price-value">${extPrice.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="price-row price-total">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                          </div>
                        </>
                      );
                    })()}
                    <p className="small" style={{ marginTop: '6px' }}>*Tax not included</p>
                    <p className="small" style={{ marginTop: '6px', color: 'var(--accent)' }}>
                      Payment will be processed after service completion
                    </p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
