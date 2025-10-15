'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Car, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [staffId, setStaffId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    zzp_number: '',
    kvk_number: '',
    bsn_number: '',
    brp_number: '',
    car_type: '',
    bhv_certificate: false,
    identity_document: '',
    passport_number: '',
    bank_account: '',
  });

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) {
      toast({
        title: 'Error',
        description: 'Invalid access. Please verify your email first.',
        variant: 'destructive',
      });
      router.push('/staff/register');
    } else {
      setStaffId(id);
    }
  }, [searchParams, router, toast]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staffId) {
      toast({
        title: 'Error',
        description: 'Staff ID not found',
        variant: 'destructive',
      });
      return;
    }

    // Basic validation
    if (!formData.bsn_number || !formData.bank_account) {
      toast({
        title: 'Required Fields',
        description: 'BSN Number and Bank Account are required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/staff/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success!',
          description: 'Your profile has been submitted for approval.',
        });
        router.push('/staff/pending-approval');
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to submit profile',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">
              Please provide the following information to complete your application.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Professional Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZZP Number
                  </label>
                  <Input
                    value={formData.zzp_number}
                    onChange={(e) => handleInputChange('zzp_number', e.target.value)}
                    placeholder="Enter your ZZP number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KVK Number
                  </label>
                  <Input
                    value={formData.kvk_number}
                    onChange={(e) => handleInputChange('kvk_number', e.target.value)}
                    placeholder="Enter your KVK number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BSN Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.bsn_number}
                    onChange={(e) => handleInputChange('bsn_number', e.target.value)}
                    placeholder="Enter your BSN number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BRP Number
                  </label>
                  <Input
                    value={formData.brp_number}
                    onChange={(e) => handleInputChange('brp_number', e.target.value)}
                    placeholder="Enter your BRP number (if applicable)"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle & Certification */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Car className="h-5 w-5 mr-2 text-purple-600" />
                Vehicle & Certification
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Type
                  </label>
                  <Select
                    value={formData.car_type}
                    onValueChange={(value) => handleInputChange('car_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select car type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="no_car">No Car</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BHV Certificate
                  </label>
                  <Select
                    value={formData.bhv_certificate ? 'yes' : 'no'}
                    onValueChange={(value) => handleInputChange('bhv_certificate', value === 'yes')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Do you have BHV?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Identification Documents */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-purple-600" />
                Identification Documents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identity Document Number
                  </label>
                  <Input
                    value={formData.identity_document}
                    onChange={(e) => handleInputChange('identity_document', e.target.value)}
                    placeholder="ID card number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passport Number
                  </label>
                  <Input
                    value={formData.passport_number}
                    onChange={(e) => handleInputChange('passport_number', e.target.value)}
                    placeholder="Passport number (if applicable)"
                  />
                </div>
              </div>
            </div>

            {/* Banking Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                Banking Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account (IBAN) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.bank_account}
                  onChange={(e) => handleInputChange('bank_account', e.target.value)}
                  placeholder="NL00 BANK 0000 0000 00"
                  required
                />
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Your application will be reviewed by our team. You will receive an email once your account is approved.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/staff/register')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {submitting ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit for Approval
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

