'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, X } from 'lucide-react';
import { BookingForm } from '@/types';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingForm | null;
  onSuccess: () => void;
}

export default function RescheduleModal({ isOpen, onClose, booking, onSuccess }: RescheduleModalProps) {
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking?.id) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredDate, preferredTime }),
      });

      if (!response.ok) throw new Error('Failed to reschedule');

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Reschedule error:', error);
      alert('Failed to reschedule booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Reschedule Booking</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Service:</strong> {booking?.serviceType}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Current Date:</strong> {booking?.preferredDate}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={today}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Time *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
              <Select value={preferredTime} onValueChange={setPreferredTime} required>
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

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Rescheduling...' : 'Reschedule'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

