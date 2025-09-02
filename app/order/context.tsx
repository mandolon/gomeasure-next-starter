'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface OrderState {
  // Property details
  address: string;
  propType: 'residential' | 'commercial' | '';
  capScope: 'interior' | 'exterior' | 'interior-exterior' | '';
  areaInt: number;
  areaExt: number;
  areaBothInt: number;
  areaBothExt: number;
  
  // Schedule
  date: string;
  time: string;
  dateInt: string;
  timeInt: string;
  dateExt: string;
  timeExt: string;
  
  // Contact
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  access: string;
  hasSecondContact: boolean;
  contactName2: string;
  contactPhone2: string;
}

interface OrderContextType {
  state: OrderState;
  updateState: (updates: Partial<OrderState>) => void;
  resetState: () => void;
}

const initialState: OrderState = {
  address: '',
  propType: '',
  capScope: '',
  areaInt: 0,
  areaExt: 0,
  areaBothInt: 0,
  areaBothExt: 0,
  date: '',
  time: '',
  dateInt: '',
  timeInt: '',
  dateExt: '',
  timeExt: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  access: '',
  hasSecondContact: false,
  contactName2: '',
  contactPhone2: ''
};

const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OrderState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('orderStateDemo');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved state');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to sessionStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem('orderStateDemo', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const updateState = (updates: Partial<OrderState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(initialState);
    sessionStorage.removeItem('orderStateDemo');
  };

  return (
    <OrderContext.Provider value={{ state, updateState, resetState }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
}

export function calcPrice(state: OrderState) {
  const { capScope, areaInt, areaExt, areaBothInt, areaBothExt } = state;
  let i = 0, e = 0;
  
  if (capScope === 'interior') {
    i = parseFloat(String(areaInt)) || 0;
  } else if (capScope === 'exterior') {
    e = parseFloat(String(areaExt)) || 0;
  } else if (capScope === 'interior-exterior') {
    i = parseFloat(String(areaBothInt)) || 0;
    e = parseFloat(String(areaBothExt)) || 0;
  }
  
  const intPrice = i * 0.25;
  const extPrice = e * 0.15;
  let total = intPrice + extPrice;
  if (i > 0 && e > 0) total *= 0.9; // discount for both
  
  return { 
    interior: intPrice, 
    exterior: extPrice, 
    total: Math.round(total * 100) / 100 
  };
}