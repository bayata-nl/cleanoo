'use client';

import { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, User, Mail, Phone, MapPin, Calendar, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Service } from '@/types';

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService: Service | null;
}

export default function BookingWizard({ isOpen, onClose, preSelectedService }: BookingWizardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
  });

  // Auto-fill form if user is logged in
  useEffect(() => {
    if (user && isOpen) {
      // Auto-fill user data
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      }));
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Please enter your name', variant: 'destructive' });
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({ title: 'Error', description: 'Please enter a valid email', variant: 'destructive' });
      return false;
    }
    if (!formData.phone.trim()) {
      toast({ title: 'Error', description: 'Please enter your phone number', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.address.trim()) {
      toast({ title: 'Error', description: 'Please enter your address', variant: 'destructive' });
      return false;
    }
    if (!formData.preferredDate) {
      toast({ title: 'Error', description: 'Please select a date', variant: 'destructive' });
      return false;
    }
    if (!formData.preferredTime) {
      toast({ title: 'Error', description: 'Please select a time', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // If user is logged in, create confirmed booking directly
      // If not logged in, create with email verification
      const endpoint = user ? '/api/bookings' : '/api/bookings/create-with-verification';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          serviceType: preSelectedService?.title || 'General Cleaning',
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create booking');
      }

      if (user) {
        // Logged-in user: booking confirmed, redirect to dashboard
        toast({
          title: 'Booking Created!',
          description: 'Your booking has been confirmed. Check your dashboard.',
        });
        onClose();
        router.push('/dashboard');
      } else {
        // Guest user: move to step 3 (email sent confirmation)
        setStep(3);
      }
    } catch (error: any) {
      console.error('Booking creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      preferredDate: '',
      preferredTime: '',
      notes: '',
    });
    onClose();
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Book: {preSelectedService?.title}</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={submitting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          {step < 3 && (
            <div className="mt-4 w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-blue-700">
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">Selected: {preSelectedService?.title}</p>
                </div>
                <p className="text-sm text-blue-600 mt-1">{preSelectedService?.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+31 6 12345678"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">Contact info saved!</p>
                </div>
                <p className="text-sm text-green-600 mt-1">Now let's schedule your cleaning</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Street, number, city, postal code"
                    className="pl-10 min-h-[80px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                      min={today}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                    <Select
                      value={formData.preferredTime}
                      onValueChange={(value) => handleInputChange('preferredTime', value)}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning (8AM-12PM)">Morning (8AM-12PM)</SelectItem>
                        <SelectItem value="Afternoon (12PM-4PM)">Afternoon (12PM-4PM)</SelectItem>
                        <SelectItem value="Evening (4PM-8PM)">Evening (4PM-8PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special requirements or instructions..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Mail className="h-10 w-10 text-blue-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">📧 Check Your Email!</h3>
              <p className="text-gray-600 mb-2">
                We've sent a verification link to:
              </p>
              <p className="text-lg font-semibold text-blue-600 mb-6">
                {formData.email}
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
                <h4 className="font-semibold text-gray-900 mb-3">Next Steps:</h4>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">1.</span>
                    <span>Check your inbox (and spam folder)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">2.</span>
                    <span>Click the verification link in the email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">3.</span>
                    <span>Create your password to complete the booking</span>
                  </li>
                </ol>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                ⏱️ The link expires in 24 hours
              </p>

              <Button
                onClick={handleClose}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Close
              </Button>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        {(step === 1 || step === 2) && (
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex justify-between">
            <Button
              variant="ghost"
              onClick={step === 1 ? handleClose : handleBack}
              disabled={submitting}
            >
              {step === 1 ? (
                'Cancel'
              ) : (
                <>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </>
              )}
            </Button>
            <Button
              onClick={handleNext}
              disabled={submitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {step === 2 ? 'Complete Booking' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

