import styles from '../styles/StickyFooter.module.css';

export default function StickyFooter({ currentStep, onNext, onPrev, canGoNext, canGoBack }) {
  return (
    <div className={styles.stickyFooter} data-step={currentStep}>
      <div className={styles.wrap}>
        <div className={styles.row}>
          {canGoBack && (
            <button className={styles.btnGhost} onClick={onPrev}>
              Back
            </button>
          )}
          <button 
            className={styles.btnPrimary} 
            onClick={onNext}
            disabled={!canGoNext}
          >
            {currentStep === 'review' ? 'Place order' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}