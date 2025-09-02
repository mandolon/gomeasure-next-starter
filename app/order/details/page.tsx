
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PropertyDetails from '@/components/PropertyDetails';
import Schedule from '@/components/Schedule';
import Contact from '@/components/Contact';

export default function OrderDetails() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const steps = ['property', 'schedule', 'contact', 'review'];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/order/success');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/');
    }
  };

  const handleUpdate = (stepData: any) => {
    setFormData({ ...formData, ...stepData });
  };

  const calculatePrice = () => {
    const basePrice = formData.propertyType === 'commercial' ? 800 : 400;
    const sqftPrice = (parseFloat(formData.squareFootage) || 0) * 0.15;
    const floorMultiplier = formData.floors === '1' ? 1 : formData.floors === '2' ? 1.5 : 2;
    return Math.round((basePrice + sqftPrice) * floorMultiplier);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PropertyDetails 
            formData={formData}
            onUpdate={handleUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 1:
        return (
          <Schedule 
            formData={formData}
            onUpdate={handleUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Contact 
            formData={formData}
            onUpdate={handleUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <div className="grid">
            <div className="card">
              <h2>Review & Submit</h2>
              <p className="muted">Please review your order details</p>

              <h3>Property Details</h3>
              <p><strong>Address:</strong> {formData.address}</p>
              <p><strong>Type:</strong> {formData.propertyType}</p>
              <p><strong>Square Footage:</strong> {formData.squareFootage} sq ft</p>
              <p><strong>Floors:</strong> {formData.floors}</p>

              <h3>Schedule</h3>
              <p><strong>Service Type:</strong> {formData.serviceType}</p>
              {formData.interiorDate && (
                <p><strong>Interior:</strong> {new Date(formData.interiorDate).toLocaleDateString()} at {formData.interiorTime}</p>
              )}
              {formData.exteriorDate && (
                <p><strong>Exterior:</strong> {new Date(formData.exteriorDate).toLocaleDateString()} at {formData.exteriorTime}</p>
              )}

              <h3>Contact</h3>
              <p><strong>Primary:</strong> {formData.firstName} {formData.lastName}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Phone:</strong> {formData.phone}</p>

              <div className="action-row" style={{ marginTop: '24px' }}>
                <button className="btn btn-ghost" onClick={handleBack}>
                  Back
                </button>
                <button className="btn btn-primary" onClick={handleNext}>
                  Submit Order
                </button>
              </div>
            </div>

            <div className="sidebar">
              <div className="card">
                <h3>Order Summary</h3>
                <div className="price-row">
                  <span className="price-label">Base Service</span>
                  <span className="price-value">${formData.propertyType === 'commercial' ? '800' : '400'}</span>
                </div>
                <div className="price-row">
                  <span className="price-label">Square Footage</span>
                  <span className="price-value">${Math.round((parseFloat(formData.squareFootage) || 0) * 0.15)}</span>
                </div>
                <div className="price-row price-total">
                  <span>Total</span>
                  <span>${calculatePrice()}</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {renderStep()}
    </div>
  );
}
