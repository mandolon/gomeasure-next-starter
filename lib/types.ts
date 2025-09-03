export interface OrderData {
  propertyDetails?: PropertyDetails;
  schedule?: Schedule;
  contact?: Contact;
  review?: Review;
}

export interface PropertyDetails {
  address: string;
  propertyType: string;
  squareFootage: number;
}

export interface Schedule {
  date: Date;
  time: string;
  duration: number;
}

export interface Contact {
  name: string;
  email: string;
  phone: string;
}

export interface Review {
  confirmed: boolean;
  notes?: string;
}