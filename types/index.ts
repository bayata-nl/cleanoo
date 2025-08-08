export interface BookingForm {
  id?: string;
  name: string;
  phone: string;
  address: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  createdAt: Date;
  status: 'Pending' | 'Confirmed' | 'Done';
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  price?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
} 