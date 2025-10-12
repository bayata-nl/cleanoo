'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, X } from 'lucide-react';
import { BookingForm } from '@/types';

interface RateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingForm | null;
  onSuccess: () => void;
}

export default function RateServiceModal({ isOpen, onClose, booking, onSuccess }: RateServiceModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking?.id || rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          review_text: reviewText,
          reviewed_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      onSuccess();
      onClose();
      setRating(0);
      setReviewText('');
    } catch (error) {
      console.error('Review error:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Rate Your Service</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>Service:</strong> {booking?.serviceType}
            </p>
            <p className="text-sm text-green-800">
              <strong>Date:</strong> {booking?.preferredDate}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How was your experience? *
            </label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      (hoverRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              {rating === 0 ? 'Select your rating' : `${rating} star${rating > 1 ? 's' : ''}`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review (Optional)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about your experience..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1" disabled={submitting || rating === 0}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Skip
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

