'use client';

import { useState } from 'react';
import { Sparkles, Home, Building2, Car, Clock, Star, Phone, MapPin, Calendar, Clock4 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Service, Testimonial } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function HomePage() {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    serviceType: '',
    preferredDate: '',
    preferredTime: ''
  });

  const services: Service[] = [
    {
      id: '1',
      title: t('services.residential.title'),
      description: t('services.residential.description'),
      icon: 'Home',
      price: t('services.residential.price')
    },
    {
      id: '2',
      title: t('services.office.title'),
      description: t('services.office.description'),
      icon: 'Building2',
      price: t('services.office.price')
    },
    {
      id: '3',
      title: t('services.deep.title'),
      description: t('services.deep.description'),
      icon: 'Sparkles',
      price: t('services.deep.price')
    },
    {
      id: '4',
      title: t('services.carpet.title'),
      description: t('services.carpet.description'),
      icon: 'Home',
      price: t('services.carpet.price')
    },
    {
      id: '5',
      title: t('services.window.title'),
      description: t('services.window.description'),
      icon: 'Home',
      price: t('services.window.price')
    },
    {
      id: '6',
      title: t('services.moveInOut.title'),
      description: t('services.moveInOut.description'),
      icon: 'Home',
      price: t('services.moveInOut.price')
    }
  ];

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    text: 'Sparkle Clean transformed our home! The team was professional, thorough, and left everything spotless. Highly recommend!',
    rating: 5
  },
  {
    id: '2',
    name: 'Mike Chen',
    text: 'Excellent service for our office cleaning needs. Reliable, punctual, and always does an amazing job.',
    rating: 5
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    text: 'The deep cleaning service was incredible. Our home has never looked better. Worth every penny!',
    rating: 5
  }
];

const iconMap: { [key: string]: any } = {
  Home,
  Building2,
  Car,
  Clock,
  Sparkles
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'bookings'), {
        ...formData,
        createdAt: new Date(),
        status: 'Pending'
      });

      toast({
        title: t('booking.success.title'),
        description: t('booking.success.description'),
      });

      setFormData({
        name: '',
        phone: '',
        address: '',
        serviceType: '',
        preferredDate: '',
        preferredTime: ''
      });
    } catch (error) {
      toast({
        title: t('booking.error.title'),
        description: t('booking.error.description'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Language Switcher */}
        <div className="absolute top-6 right-6 z-30">
          <LanguageSwitcher />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center text-white">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full">
              <Sparkles className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold mb-6">
            {t('hero.title')}
            <span className="block text-blue-200">{t('hero.subtitle')}</span>
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 font-semibold"
              onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('hero.bookButton')}
            </Button>
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 bg-blue-500 text-white hover:bg-blue-600 font-semibold border-2 border-blue-500 hover:border-blue-600"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('hero.viewServicesButton')}
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t('services.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('services.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = iconMap[service.icon];
              return (
                <div key={service.id} className="group bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-6 text-center leading-relaxed">
                      {service.description}
                    </p>
                    {service.price && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {service.price}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t('testimonials.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('testimonials.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="group bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl"></div>
                <div className="flex mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic text-lg leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">
                    {testimonial.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="booking-form" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t('booking.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('booking.description')}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('booking.form.fullName')}
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('booking.form.fullNamePlaceholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('booking.form.phoneNumber')}
                </label>
                <Input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={t('booking.form.phoneNumberPlaceholder')}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('booking.form.address')}
                </label>
                <Textarea
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={t('booking.form.addressPlaceholder')}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('booking.form.serviceType')}
                </label>
                <Select value={formData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('booking.form.serviceTypePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.title}>
                        {service.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('booking.form.preferredDate')}
                </label>
                <Input
                  required
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('booking.form.preferredTime')}
                </label>
                <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('booking.form.timePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={t('booking.form.morning')}>{t('booking.form.morning')}</SelectItem>
                    <SelectItem value={t('booking.form.afternoon')}>{t('booking.form.afternoon')}</SelectItem>
                    <SelectItem value={t('booking.form.evening')}>{t('booking.form.evening')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-8">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                                         {t('booking.form.submitting')}
                  </div>
                                 ) : (
                   <div className="flex items-center justify-center">
                     <Sparkles className="h-5 w-5 mr-2" />
                     {t('booking.form.submitButton')}
                   </div>
                 )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Sparkle Clean
          </h3>
                     <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
             {t('footer.description')}
           </p>
           <div className="flex justify-center space-x-8 text-sm text-gray-400">
             <span>{t('footer.copyright')}</span>
           </div>
        </div>
      </footer>
    </div>
  );
} 