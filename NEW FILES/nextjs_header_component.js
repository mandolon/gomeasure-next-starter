import { useRouter } from 'next/router';
import styles from '../styles/Header.module.css';

export default function Header() {
  const router = useRouter();

  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerContent}>
        <button 
          className={styles.headerBack} 
          onClick={handleBackClick}
          aria-label="Back to main page"
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </header>
  );
}