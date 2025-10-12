'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function VerifyBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const token = searchParams?.get('token');
  
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'Invalid verification link',
        variant: 'destructive',
      });
      router.push('/');
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`/api/auth/verify-booking?token=${token}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid verification token');
      }

      setBookingData(data.data);
    } catch (error: any) {
      console.error('Token verification error:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid or expired verification link',
        variant: 'destructive',
      });
      setTimeout(() => router.push('/'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    setVerifying(true);

    try {
      const response = await fetch('/api/auth/verify-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete registration');
      }

      toast({
        title: 'Success! 🎉',
        description: 'Your account has been created and your booking is confirmed!',
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete registration',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-4">Invalid or expired verification link</p>
          <Button onClick={() => router.push('/')}>
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Success Badge */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Verified! ✅</h1>
          <p className="text-gray-600">Complete your account to finish booking</p>
        </div>

        {/* Booking Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Your Booking</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service:</span>
              <span className="font-semibold text-gray-900">{bookingData.serviceType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold text-gray-900">{bookingData.preferredDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time:</span>
              <span className="font-semibold text-gray-900">{bookingData.preferredTime}</span>
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold text-gray-900">{bookingData.email}</span>
            </div>
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your Password</h3>
            <p className="text-sm text-gray-600">Set a secure password for your account</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="pl-10 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="pl-10 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 text-lg"
            disabled={verifying}
          >
            {verifying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Completing...
              </>
            ) : (
              'Complete Booking'
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            By completing this form, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </div>
    </div>
  );
}

export default function VerifyBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    }>
      <VerifyBookingContent />
    </Suspense>
  );
}

