'use client';

import { useState } from 'react';
import { X, CheckCircle, XCircle, User, Mail, Phone, MapPin, Briefcase, Car, Shield, CreditCard, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface StaffDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: any;
  onApprovalChange: () => void;
}

export default function StaffDetailModal({ isOpen, onClose, staff, onApprovalChange }: StaffDetailModalProps) {
  const { toast } = useToast();
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!isOpen || !staff) return null;

  const handleApprove = async () => {
    setApproving(true);
    try {
      const response = await fetch('/api/staff/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: staff.id,
          action: 'approve',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Staff Approved',
          description: 'Approval email sent to staff member.',
        });
        onApprovalChange();
        onClose();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to approve staff',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    setRejecting(true);
    try {
      const response = await fetch('/api/staff/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: staff.id,
          action: 'reject',
          rejectionReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Application Rejected',
          description: 'Rejection email sent to applicant.',
        });
        onApprovalChange();
        onClose();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to reject application',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setRejecting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_info':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending_approval':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{staff.name}</h2>
              <p className="text-purple-100">{staff.role || 'Cleaner'}</p>
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
          {/* Status Badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(staff.approval_status)}`}>
              {staff.approval_status === 'pending_info' && '⏳ Pending Information'}
              {staff.approval_status === 'pending_approval' && '⏰ Pending Approval'}
              {staff.approval_status === 'approved' && '✅ Approved'}
              {staff.approval_status === 'rejected' && '❌ Rejected'}
            </span>
          </div>

          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={<Mail />} label="Email" value={staff.email} />
              <InfoItem icon={<Phone />} label="Phone" value={staff.phone} />
              <InfoItem icon={<MapPin />} label="Address" value={staff.address || 'Not provided'} />
              <InfoItem icon={<Briefcase />} label="Role" value={staff.role} />
              <InfoItem icon={<Calendar />} label="Experience" value={`${staff.experience_years || 0} years`} />
              <InfoItem icon={<User />} label="Status" value={staff.status} />
            </div>
          </div>

          {/* Professional Information */}
          {staff.approval_status !== 'pending_info' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={<FileText />} label="ZZP Number" value={staff.zzp_number || 'Not provided'} />
                <InfoItem icon={<FileText />} label="KVK Number" value={staff.kvk_number || 'Not provided'} />
                <InfoItem icon={<FileText />} label="BSN Number" value={staff.bsn_number || 'Not provided'} />
                <InfoItem icon={<FileText />} label="BRP Number" value={staff.brp_number || 'Not provided'} />
                <InfoItem icon={<Car />} label="Car Type" value={staff.car_type || 'No car'} />
                <InfoItem 
                  icon={<Shield />} 
                  label="BHV Certificate" 
                  value={staff.bhv_certificate ? '✅ Yes' : '❌ No'} 
                />
                <InfoItem icon={<FileText />} label="Identity Document" value={staff.identity_document || 'Not provided'} />
                <InfoItem icon={<FileText />} label="Passport Number" value={staff.passport_number || 'Not provided'} />
                <InfoItem icon={<CreditCard />} label="Bank Account" value={staff.bank_account || 'Not provided'} />
              </div>
            </div>
          )}

          {/* Verification Status */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
            <div className="space-y-2">
              <StatusItem 
                label="Email Verified" 
                status={staff.email_verified} 
                date={staff.verified_at}
              />
              {staff.approved_at && (
                <StatusItem 
                  label="Approved" 
                  status={staff.approval_status === 'approved'} 
                  date={staff.approved_at}
                />
              )}
            </div>
          </div>

          {/* Rejection Reason (if rejected) */}
          {staff.approval_status === 'rejected' && staff.rejection_reason && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Rejection Reason</h3>
              <p className="text-red-700">{staff.rejection_reason}</p>
            </div>
          )}

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={4}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {staff.approval_status === 'pending_approval' && (
          <div className="border-t bg-gray-50 p-6 flex justify-end space-x-3">
            {!showRejectForm ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectForm(true)}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={approving}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {approving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={rejecting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {rejecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Confirm Rejection
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}

        {staff.approval_status === 'approved' && (
          <div className="border-t bg-green-50 p-6">
            <div className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">This staff member has been approved and can now log in.</span>
            </div>
          </div>
        )}

        {staff.approval_status === 'rejected' && (
          <div className="border-t bg-red-50 p-6">
            <div className="flex items-center text-red-800">
              <XCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">This application has been rejected.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-purple-600 mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatusItem({ label, status, date }: { label: string; status: boolean; date?: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center space-x-2">
        {status ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-600" />
            {date && (
              <span className="text-xs text-gray-500">
                {new Date(date).toLocaleDateString()}
              </span>
            )}
          </>
        ) : (
          <XCircle className="h-5 w-5 text-gray-400" />
        )}
      </div>
    </div>
  );
}

