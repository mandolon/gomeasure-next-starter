
'use client';

import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      background: 'var(--bg)',
      borderBottom: '1px solid var(--line)',
      zIndex: 100,
      padding: '12px 0'
    }}>
      <div className="container">
        <button 
          onClick={handleBackClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'transparent',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'var(--ink-7)'
          }}
          aria-label="Back to main page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
    </header>
  );
}
