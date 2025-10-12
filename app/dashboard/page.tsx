'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import ProtectedRoute from '@/components/ProtectedRoute';

import { BookingForm, Service, User } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  LogOut, 
  User as UserIcon,
  ArrowLeft,
  CheckCircle,
  Eye,
  Clock as ClockIcon,
  Edit,
  X,
  Plus,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingForm[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingTab, setBookingTab] = useState<'upcoming' | 'past'>('upcoming');
  const [editForm, setEditForm] = useState({
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    address: '',
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });

  const fetchUserBookings = useCallback(async () => {
    try {
      // Kullanıcının email adresiyle eşleşen booking'leri getir
      if (!user?.email) {
        throw new Error('User email not available');
      }

      const response = await fetch(`/api/bookings?email=${encodeURIComponent(user.email)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch bookings');
      }

      const bookingsData: BookingForm[] = result.data?.map((booking: {
        id?: number | string
        name: string
        email: string
        phone: string
        address: string
        service_type: string
        preferred_date: string
        preferred_time: string
        created_at: string
        updated_at?: string | null
        status?: string
        notes?: string | null
        cancellation_reason?: string | null
      }) => ({
        id: booking.id?.toString(),
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        address: booking.address,
        serviceType: booking.service_type,
        preferredDate: booking.preferred_date,
        preferredTime: booking.preferred_time,
        createdAt: new Date(booking.created_at),
        updatedAt: booking.updated_at ? new Date(booking.updated_at) : undefined,
        status: booking.status || 'pending',
        notes: booking.notes,
        cancellationReason: booking.cancellation_reason
      })) || [];

      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setServices(result.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
      fetchServices();
      // Pre-fill form with user data
      setBookingForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || ''
      }));
    }
  }, [user, fetchUserBookings, fetchServices]);

  const updateBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferredDate: editForm.preferredDate,
          preferredTime: editForm.preferredTime,
          notes: editForm.notes,
          status: 'pending'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      setEditingBooking(null);
      setEditForm({ preferredDate: '', preferredTime: '', notes: '' });
      fetchUserBookings(); // Refresh the list
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const cancelBooking = async (bookingId: string, reason: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      fetchUserBookings(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!bookingForm.name || !bookingForm.phone || !bookingForm.address || !bookingForm.serviceType || !bookingForm.preferredDate || !bookingForm.preferredTime) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const bookingData = {
        name: bookingForm.name,
        email: user?.email,
        phone: bookingForm.phone,
        address: bookingForm.address,
        serviceType: bookingForm.serviceType,
        preferredDate: bookingForm.preferredDate,
        preferredTime: bookingForm.preferredTime,
        notes: bookingForm.notes,
        userId: user?.id || null,
        status: 'pending'
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit booking');
      }

      toast({
        title: "Booking Created",
        description: "Your cleaning service has been booked successfully!",
      });

      setBookingForm({
        name: user?.name || '',
        phone: user?.phone || '',
        address: '',
        serviceType: '',
        preferredDate: '',
        preferredTime: '',
        notes: ''
      });
      setShowBookingForm(false);
      fetchUserBookings(); // Refresh the list
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'assigned':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')}
                  className="flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Website
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* User Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Welcome back!
                </h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  My Bookings ({bookings.length})
                </h2>
                <Button
                  onClick={() => router.push('/#services')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Booking
                </Button>
              </div>

              {/* Tabs */}
              {bookings.length > 0 && (
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setBookingTab('upcoming')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      bookingTab === 'upcoming'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Upcoming ({bookings.filter(b => new Date(b.preferredDate) >= new Date() && !['completed', 'cancelled'].includes(b.status)).length})
                  </button>
                  <button
                    onClick={() => setBookingTab('past')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      bookingTab === 'past'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Past ({bookings.filter(b => new Date(b.preferredDate) < new Date() || ['completed', 'cancelled'].includes(b.status)).length})
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading your bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-8 text-center">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-6">You haven't made any bookings yet.</p>
                <Button 
                  onClick={() => router.push('/')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Book Your First Cleaning
                </Button>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {bookings
                    .filter(b => {
                      const isPast = new Date(b.preferredDate) < new Date() || ['completed', 'cancelled'].includes(b.status);
                      return bookingTab === 'past' ? isPast : !isPast;
                    })
                    .map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1">{booking.status}</span>
                            </span>
                            <span className="text-sm font-medium text-gray-900">{booking.serviceType}</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Date:</span> {new Date(booking.preferredDate).toLocaleDateString()} at {booking.preferredTime}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Address:</span> {booking.address}
                          </div>
                          {booking.notes && (
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Notes:</span> {booking.notes}
                            </div>
                          )}
                          {booking.status === 'assigned' && (
                            <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
                              <strong>Booking Assigned:</strong> Your cleaning service has been assigned to our team. You can no longer edit the details.
                            </div>
                          )}
                          {booking.status === 'in_progress' && (
                            <div className="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-md">
                              <strong>In Progress:</strong> Our team is currently working on your cleaning service.
                            </div>
                          )}
                          {booking.status === 'completed' && (
                            <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
                              <strong>Completed:</strong> Your cleaning service has been completed successfully.
                            </div>
                          )}
                          {booking.status === 'cancelled' && (
                            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                              <strong>Cancelled:</strong> This booking has been cancelled.
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingBooking(booking.id!);
                                  setEditForm({
                                    preferredDate: booking.preferredDate,
                                    preferredTime: booking.preferredTime,
                                    notes: booking.notes || ''
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => cancelBooking(booking.id!, 'cancelled')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {booking.status === 'assigned' && (
                            <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                              <Eye className="h-4 w-4 inline mr-1" />
                              Assigned to Team
                            </div>
                          )}
                          {booking.status === 'in_progress' && (
                            <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                              <ClockIcon className="h-4 w-4 inline mr-1" />
                              In Progress
                            </div>
                          )}
                          {booking.status === 'completed' && (
                            <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                              Completed
                            </div>
                          )}
                          {booking.status === 'cancelled' && (
                            <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                              <X className="h-4 w-4 inline mr-1" />
                              Cancelled
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Booking Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Book New Cleaning Service</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBookingForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={bookingForm.name}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your full name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Your phone number"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Textarea
                      value={bookingForm.address}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Full address where cleaning will take place"
                      className="pl-10"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Type *
                    </label>
                    <Select value={bookingForm.serviceType} onValueChange={(value) => setBookingForm(prev => ({ ...prev, serviceType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        value={bookingForm.preferredDate}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                        className="pl-10"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time *
                  </label>
                  <Select value={bookingForm.preferredTime} onValueChange={(value) => setBookingForm(prev => ({ ...prev, preferredTime: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning (8AM-12PM)">Morning (8AM-12PM)</SelectItem>
                      <SelectItem value="Afternoon (12PM-5PM)">Afternoon (12PM-5PM)</SelectItem>
                      <SelectItem value="Evening (5PM-8PM)">Evening (5PM-8PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Notes
                  </label>
                  <Textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Booking
                      </div>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Booking</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={editForm.preferredDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time
                  </label>
                  <select
                    value={editForm.preferredTime}
                    onChange={(e) => setEditForm(prev => ({ ...prev, preferredTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select time</option>
                    <option value="Morning (8AM-12PM)">Morning (8AM-12PM)</option>
                    <option value="Afternoon (12PM-5PM)">Afternoon (12PM-5PM)</option>
                    <option value="Evening (5PM-8PM)">Evening (5PM-8PM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special requests or notes..."
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => updateBooking(editingBooking)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingBooking(null);
                      setEditForm({ preferredDate: '', preferredTime: '', notes: '' });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
