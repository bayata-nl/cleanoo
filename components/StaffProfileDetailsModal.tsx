'use client';

import { X, User, Mail, Phone, MapPin, Briefcase, Car, Shield, CreditCard, FileText, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StaffProfileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffDetails: any;
}

export default function StaffProfileDetailsModal({ isOpen, onClose, staffDetails }: StaffProfileDetailsModalProps) {
  if (!isOpen || !staffDetails) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">My Profile</h2>
              <p className="text-blue-100">{staffDetails.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={<Mail />} label="Email" value={staffDetails.email} />
              <InfoItem icon={<Phone />} label="Phone" value={staffDetails.phone} />
              <InfoItem icon={<MapPin />} label="Address" value={staffDetails.address || 'Not provided'} />
              <InfoItem icon={<Briefcase />} label="Role" value={staffDetails.role} />
              <InfoItem icon={<Calendar />} label="Experience" value={`${staffDetails.experience_years || 0} years`} />
              <InfoItem icon={<Briefcase />} label="Specialization" value={staffDetails.specialization || 'Not specified'} />
              {staffDetails.hourly_rate && (
                <InfoItem icon={<CreditCard />} label="Hourly Rate" value={`€${staffDetails.hourly_rate}/hour`} />
              )}
            </div>
          </div>

          {/* Professional Information */}
          {(staffDetails.zzp_number || staffDetails.kvk_number || staffDetails.bsn_number || 
            staffDetails.brp_number || staffDetails.car_type || staffDetails.bank_account) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staffDetails.zzp_number && (
                  <InfoItem icon={<FileText />} label="ZZP Number" value={staffDetails.zzp_number} />
                )}
                {staffDetails.kvk_number && (
                  <InfoItem icon={<FileText />} label="KVK Number" value={staffDetails.kvk_number} />
                )}
                {staffDetails.bsn_number && (
                  <InfoItem icon={<FileText />} label="BSN Number" value={staffDetails.bsn_number} />
                )}
                {staffDetails.brp_number && (
                  <InfoItem icon={<FileText />} label="BRP Number" value={staffDetails.brp_number} />
                )}
                {staffDetails.car_type && (
                  <InfoItem icon={<Car />} label="Car Type" value={staffDetails.car_type} />
                )}
                {staffDetails.bhv_certificate !== null && (
                  <InfoItem 
                    icon={<Shield />} 
                    label="BHV Certificate" 
                    value={staffDetails.bhv_certificate ? '✅ Yes' : '❌ No'} 
                  />
                )}
                {staffDetails.identity_document && (
                  <InfoItem icon={<FileText />} label="Identity Document" value={staffDetails.identity_document} />
                )}
                {staffDetails.passport_number && (
                  <InfoItem icon={<FileText />} label="Passport Number" value={staffDetails.passport_number} />
                )}
                {staffDetails.bank_account && (
                  <InfoItem icon={<CreditCard />} label="Bank Account" value={staffDetails.bank_account} />
                )}
              </div>
            </div>
          )}

          {/* Account Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
            <div className="space-y-2">
              <StatusItem 
                label="Email Verified" 
                status={staffDetails.email_verified} 
              />
              <StatusItem 
                label="Account Status" 
                status={staffDetails.status === 'active'}
                customText={staffDetails.status}
              />
              <StatusItem 
                label="Approval Status" 
                status={staffDetails.approval_status === 'approved'}
                customText={staffDetails.approval_status}
              />
            </div>
          </div>

          {/* Member Since */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Member Since:</strong> {new Date(staffDetails.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex justify-end">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-blue-600 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatusItem({ label, status, customText }: { label: string; status: boolean; customText?: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center space-x-2">
        {status ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-600">{customText || 'Yes'}</span>
          </>
        ) : (
          <span className="text-sm text-gray-500">{customText || 'No'}</span>
        )}
      </div>
    </div>
  );
}

