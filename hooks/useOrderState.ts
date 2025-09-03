'use client';

import { useState, useCallback } from 'react';
import type { OrderData } from '@/lib/types';

export function useOrderState() {
  const [orderData, setOrderData] = useState<OrderData>({});
  const [currentStep, setCurrentStep] = useState(1);

  const updateOrderData = useCallback((data: Partial<OrderData>) => {
    setOrderData(prev => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  }, []);

  return {
    orderData,
    currentStep,
    updateOrderData,
    nextStep,
    prevStep,
    goToStep,
  };
}