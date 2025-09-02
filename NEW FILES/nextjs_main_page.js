import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import PropertyDetails from '../../components/PropertyDetails';
import Schedule from '../../components/Schedule';
import Contact from '../../components/Contact';
import Review from '../../components/Review';
import Sidebar from '../../components/Sidebar';
import StickyFooter from '../../components/StickyFooter';
import styles from '../../styles/Order.module.css';

const ROUTES = ['details', 'schedule', 'contact', 'review'];

export default function OrderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState('details');
  const [orderState, setOrderState] = useState({
    // Property details
    address: '',
    propType: 'residential',
    capScope: 'interior',
    areaInt: '',
    areaExt: '',
    areaBothInt: '',
    areaBothExt: '',
    
    // Schedule
    interiorDate: null,
    interiorTime: null,
    exteriorDate: null,
    exteriorTime: null,
    
    // Contact
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactName2: '',
    contactPhone2: '',
    hasSecondContact: false,
    access: '',
    
    // Review
    agreeTerms: false,
    agreePayment: false
  });

  // Handle route changes
  useEffect(() => {
    const route = router.query.step || 'details';
    if (ROUTES.includes(route)) {
      setCurrentStep(route);
    }
  }, [router.query.step]);

  const updateState = (updates) => {
    setOrderState(prev => ({ ...prev, ...updates }));
  };

  const navigateTo = (step) => {
    router.push(`/order?step=${step}`, undefined, { shallow: true });
  };

  const nextStep = () => {
    const currentIndex = ROUTES.indexOf(currentStep);
    if (currentIndex < ROUTES.length - 1) {
      navigateTo(ROUTES[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = ROUTES.indexOf(currentStep);
    if (currentIndex > 0) {
      navigateTo(ROUTES[currentIndex - 1]);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 'details':
        if (!orderState.address) return false;
        const scope = orderState.capScope;
        if (scope === 'interior' && !orderState.areaInt) return false;
        if (scope === 'exterior' && !orderState.areaExt) return false;
        if (scope === 'interior-exterior' && (!orderState.areaBothInt || !orderState.areaBothExt)) return false;
        return true;
      case 'schedule':
        if (orderState.capScope === 'interior') {
          return orderState.interiorDate && orderState.interiorTime;
        }
        if (orderState.capScope === 'exterior') {
          return orderState.exteriorDate && orderState.exteriorTime;
        }
        if (orderState.capScope === 'interior-exterior') {
          return orderState.interiorDate && orderState.interiorTime && 
                 orderState.exteriorDate && orderState.exteriorTime;
        }
        return false;
      case 'contact':
        return orderState.contactName && orderState.contactPhone && orderState.contactEmail;
      case 'review':
        return orderState.agreeTerms && orderState.agreePayment;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      alert('Please complete all required fields');
      return;
    }
    
    if (currentStep === 'review') {
      // Place order
      alert('Demo: Order placed successfully!');
      return;
    }
    
    nextStep();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'details':
        return (
          <PropertyDetails 
            state={orderState} 
            updateState={updateState}
            routes={ROUTES}
            currentStep={currentStep}
          />
        );
      case 'schedule':
        return (
          <Schedule 
            state={orderState} 
            updateState={updateState}
            routes={ROUTES}
            currentStep={currentStep}
          />
        );
      case 'contact':
        return (
          <Contact 
            state={orderState} 
            updateState={updateState}
            routes={ROUTES}
            currentStep={currentStep}
          />
        );
      case 'review':
        return (
          <Review 
            state={orderState} 
            updateState={updateState}
            routes={ROUTES}
            currentStep={currentStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>GoMeasure — Order</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" />
      </Head>

      <Header />
      
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.pageHead}>
            <div>
              <h1>Complete order details</h1>
              <p>Only a few steps left to complete the capture service order.</p>
            </div>
          </header>

          <div className={styles.grid}>
            {renderCurrentStep()}
            
            <Sidebar 
              currentStep={currentStep}
              state={orderState}
              onNext={handleNext}
              onPrev={prevStep}
              canGoNext={validateCurrentStep()}
              canGoBack={currentStep !== 'details'}
            />
          </div>
        </div>

        <StickyFooter 
          currentStep={currentStep}
          onNext={handleNext}
          onPrev={prevStep}
          canGoNext={validateCurrentStep()}
          canGoBack={currentStep !== 'details'}
        />
      </main>
    </>
  );
}