'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function StaffVerifyEmailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [staffId, setStaffId] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('Invalid verification link');
      setVerifying(false);
      return;
    }

    // Verify email
    fetch('/api/staff/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSuccess(true);
          setStaffId(data.staffId);
        } else {
          setError(data.error || 'Verification failed');
        }
      })
      .catch(err => {
        console.error('Verification error:', err);
        setError('An error occurred during verification');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [searchParams]);

  const handleContinue = () => {
    if (staffId) {
      router.push(`/staff/complete-profile?id=${staffId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {verifying && (
          <>
            <Loader2 className="h-16 w-16 text-purple-600 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email...</h1>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </>
        )}

        {!verifying && success && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-8">
              Your email has been successfully verified. Please complete your profile to continue with your application.
            </p>
            <Button 
              onClick={handleContinue}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              Complete Profile
            </Button>
          </>
        )}

        {!verifying && error && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button 
              onClick={() => router.push('/staff/register')}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Back to Registration
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function StaffVerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <StaffVerifyEmailPageContent />
    </Suspense>
  );
}

