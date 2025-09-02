'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const steps = [
  { id: 'property', label: 'Property', index: '1' },
  { id: 'schedule', label: 'Schedule', index: '2' },
  { id: 'contact', label: 'Contact', index: '3' },
  { id: 'review', label: 'Review', index: '4' }
];

export default function StepNav() {
  const pathname = usePathname();
  const currentStep = pathname.split('/').pop() || 'property';

  return (
    <nav className="seqg-step-nav" aria-label="Progress">
      <ol className="seqg-steps" role="list">
        {steps.map(step => (
          <li key={step.id}>
            <Link 
              href={`/order/${step.id}`}
              aria-current={currentStep === step.id ? 'step' : 'false'}
            >
              <span className="step-index">{step.index}</span>
              {step.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}