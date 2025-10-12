'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Modal from '@/components/admin/shared/Modal';
import { BookingForm } from '@/types';
import { DollarSign, CreditCard, Banknote, Wallet } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingForm | null;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, booking, onSuccess }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking?.id || !paymentAmount) {
      alert('Please fill all fields');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: 'paid',
          payment_method: paymentMethod,
          payment_amount: parseFloat(paymentAmount),
          paid_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to mark as paid');

      onSuccess();
      onClose();
      
      // Reset form
      setPaymentMethod('Cash');
      setPaymentAmount('');
    } catch (error) {
      console.error('Payment update error:', error);
      alert('Failed to update payment status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark as Paid">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Booking:</strong> {booking?.serviceType}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Customer:</strong> {booking?.name}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method *
          </label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">
                <div className="flex items-center">
                  <Wallet className="h-4 w-4 mr-2 text-green-600" />
                  Cash
                </div>
              </SelectItem>
              <SelectItem value="Bank Transfer">
                <div className="flex items-center">
                  <Banknote className="h-4 w-4 mr-2 text-blue-600" />
                  Bank Transfer
                </div>
              </SelectItem>
              <SelectItem value="iDEAL">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-purple-600" />
                  iDEAL
                </div>
              </SelectItem>
              <SelectItem value="Credit Card">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-indigo-600" />
                  Credit Card
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Amount (€) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="number"
              step="0.01"
              min="0"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="0.00"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={submitting}
          >
            {submitting ? 'Processing...' : 'Mark as Paid'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

