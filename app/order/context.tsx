'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  // ✅ safe lazy init, only runs on client
  const [state, setState] = useState<OrderState>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('orderStateDemo');
      if (saved) {
        try {
          return JSON.parse(saved) as OrderState;
        } catch {
          console.error('Failed to parse saved state');
        }
      }
    }
    return initialState;
  });

  // ✅ persist changes
  useEffect(() => {
    sessionStorage.setItem('orderStateDemo', JSON.stringify(state));
  }, [state]);

  const updateState = (updates: Partial<OrderState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(initialState);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('orderStateDemo');
    }
  };

  return (
    <OrderContext.Provider value={{ state, updateState, resetState }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within OrderProvider');
  return context;
}

// Calculate pricing based on state
export function calcPrice(state: OrderState) {
  let interior = 0, exterior = 0;
  
  if (state.capScope === 'interior') {
    interior = state.areaInt * 0.25;
  } else if (state.capScope === 'exterior') {
    exterior = state.areaExt * 0.15;
  } else if (state.capScope === 'interior-exterior') {
    interior = state.areaBothInt * 0.25;
    exterior = state.areaBothExt * 0.15;
  }
  
  let total = interior + exterior;
  if (interior > 0 && exterior > 0) {
    total *= 0.9; // discount for both
  }
  
  return {
    interior: Math.round(interior * 100) / 100,
    exterior: Math.round(exterior * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}