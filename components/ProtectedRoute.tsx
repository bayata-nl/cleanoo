'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'customer' | 'staff' | 'admin'; // Optional role check
}

export default function ProtectedRoute({ children, allowedRole = 'customer' }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }

    if (!loading && user && allowedRole) {
      // Check user's actual role from backend
      fetch('/api/auth/check')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.role) {
            if (data.role !== allowedRole) {
              // Wrong role - redirect
              const redirectMap: Record<string, string> = {
                'customer': '/dashboard',
                'staff': '/staff/dashboard',
                'admin': '/admin'
              };
              
              toast({
                title: 'Access Denied',
                description: `This page is only accessible to ${allowedRole}s.`,
                variant: 'destructive',
              });
              
              router.replace(redirectMap[data.role as string] || '/');
            }
          }
        })
        .catch(err => {
          console.error('Role check error:', err);
        })
        .finally(() => {
          setCheckingRole(false);
        });
    } else {
      setCheckingRole(false);
    }
  }, [user, loading, router, allowedRole, toast]);

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{checkingRole ? 'Verifying access...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
