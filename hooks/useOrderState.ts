'use client';

import { useState, useCallback, useEffect } from 'react';
import type { OrderFormData, OrderStep } from '@/lib/types';

const STORAGE_KEY = 'orderFormData';

const initialFormData: OrderFormData = {
  address: '',
  propertyType: '',
  captureScope: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  hasSecondContact: false,
  agreedToTerms: false,
  agreedToPayment: false,
};

const stepOrder: OrderStep[] = ['property', 'schedule', 'contact', 'review'];

export function useOrderState() {
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState<OrderStep>('property');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setFormData(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored form data');
        }
      }
    }
  }, []);

  // Save to localStorage whenever formData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  const updateFormData = useCallback((updates: Partial<OrderFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFormData = useCallback(() => {
    setFormData(initialFormData);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const goToStep = useCallback((step: OrderStep) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep]);

  const validateStep = useCallback((step: OrderStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'property':
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
        if (!formData.captureScope) newErrors.captureScope = 'Capture scope is required';
        break;

      case 'schedule':
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.time) newErrors.time = 'Time is required';
        break;

      case 'contact':
        if (!formData.contactName) newErrors.contactName = 'Name is required';
        if (!formData.contactPhone) newErrors.contactPhone = 'Phone is required';
        if (!formData.contactEmail) newErrors.contactEmail = 'Email is required';
        break;

      case 'review':
        if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must agree to terms';
        if (!formData.agreedToPayment) newErrors.agreedToPayment = 'You must agree to payment';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const calculatePrice = useCallback(() => {
    let basePrice = 0;
    
    if (formData.captureScope === 'interior') {
      basePrice = (formData.areaInt || 0) * 0.10;
    } else if (formData.captureScope === 'exterior') {
      basePrice = (formData.areaExt || 0) * 0.05;
    } else if (formData.captureScope === 'interior-exterior') {
      basePrice = ((formData.areaBothInt || 0) * 0.10) + ((formData.areaBothExt || 0) * 0.05);
    }

    return Math.max(basePrice, 100); // Minimum $100
  }, [formData]);

  return {
    formData,
    updateFormData,
    clearFormData,
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    validateStep,
    calculatePrice,
    errors,
  };
}