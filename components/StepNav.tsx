
'use client';

import { usePathname } from 'next/navigation';

const steps = [
  { id: 'details', label: 'Details', path: '/order/details' },
  { id: 'property', label: 'Property', path: '/order/property' },
  { id: 'schedule', label: 'Schedule', path: '/order/schedule' },
  { id: 'contact', label: 'Contact', path: '/order/contact' },
  { id: 'review', label: 'Review', path: '/order/review' }
];

export default function StepNav() {
  const pathname = usePathname();
  
  return (
    <div className="progress">
      {steps.map((step) => (
        <div 
          key={step.id}
          className={`step ${pathname === step.path ? 'active' : ''}`}
        >
          {step.label}
        </div>
      ))}
    </div>
  );
}
