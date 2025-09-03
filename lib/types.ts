export interface OrderFormData {
  // Property Details
  address: string;
  propertyType: 'residential' | 'commercial' | '';
  captureScope: 'interior' | 'exterior' | 'interior-exterior' | '';
  areaInt?: number;
  areaExt?: number;
  areaBothInt?: number;
  areaBothExt?: number;
  
  // Schedule
  date?: string;
  time?: string;
  
  // Contact
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactName2?: string;
  contactPhone2?: string;
  hasSecondContact: boolean;
  accessInstructions?: string;
  
  // Review
  agreedToTerms: boolean;
  agreedToPayment: boolean;
}

export type OrderStep = 'property' | 'schedule' | 'contact' | 'review';

export interface ValidationErrors {
  [key: string]: string;
}