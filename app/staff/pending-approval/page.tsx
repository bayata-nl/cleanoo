'use client';

import { Clock, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function PendingApprovalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-12 w-12 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Pending Approval</h1>
          <p className="text-lg text-gray-600">
            Thank you for completing your profile!
          </p>
        </div>

        {/* Status Info */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-8">
          <h3 className="font-semibold text-yellow-900 mb-2">⏳ What happens next?</h3>
          <ul className="space-y-2 text-yellow-800">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>Our team will review your application and documents</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>You will receive an email notification once your account is approved</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>After approval, you can log in and start working</span>
            </li>
          </ul>
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Application Process:</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Email Verified ✅</h4>
                <p className="text-sm text-gray-600">Your email has been successfully verified</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Profile Completed ✅</h4>
                <p className="text-sm text-gray-600">All required information has been submitted</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mr-4 animate-pulse">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Admin Approval ⏳</h4>
                <p className="text-sm text-gray-600">Waiting for admin review and approval</p>
              </div>
            </div>

            <div className="flex items-start opacity-50">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                <Mail className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Approval Email</h4>
                <p className="text-sm text-gray-600">You'll receive an email when approved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about your application, please contact us:
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            <p>📧 Email: <a href="mailto:admin@cleanoo.nl" className="text-purple-600 hover:underline">admin@cleanoo.nl</a></p>
            <p>📞 Phone: +31 12 345 6789</p>
          </div>
        </div>

        {/* Action */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="mx-auto"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

