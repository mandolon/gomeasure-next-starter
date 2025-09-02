import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/StepNavigation.module.css';

const STEP_LABELS = {
  details: 'Property',
  schedule: 'Schedule',
  contact: 'Contact',
  review: 'Review'
};

export default function StepNavigation({ routes, currentStep }) {
  const router = useRouter();

  return (
    <nav className={styles.stepNav} aria-label="Progress">
      <ol className={styles.steps} role="list">
        {routes.map((step) => {
          const isCurrent = step === currentStep;
          const href = `/order?step=${step}`;
          
          return (
            <li key={step}>
              <Link 
                href={href}
                className={styles.stepLink}
                aria-current={isCurrent ? 'step' : 'false'}
              >
                {STEP_LABELS[step]}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}