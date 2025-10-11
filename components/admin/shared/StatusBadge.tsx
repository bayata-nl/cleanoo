'use client';

import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'booking' | 'assignment' | 'staff' | 'team';
}

export default function StatusBadge({ status, type = 'booking' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (type) {
      case 'booking':
        switch (status) {
          case 'Pending': return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
          case 'Confirmed': return { color: 'bg-blue-100 text-blue-800', icon: CheckCircle };
          case 'Done': return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
          case 'Cancelled': return { color: 'bg-red-100 text-red-800', icon: XCircle };
          default: return { color: 'bg-gray-100 text-gray-800', icon: Clock };
        }
      case 'assignment':
        switch (status) {
          case 'assigned': return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
          case 'accepted': return { color: 'bg-blue-100 text-blue-800', icon: CheckCircle };
          case 'in_progress': return { color: 'bg-purple-100 text-purple-800', icon: Clock };
          case 'completed': return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
          case 'cancelled': return { color: 'bg-red-100 text-red-800', icon: XCircle };
          default: return { color: 'bg-gray-100 text-gray-800', icon: Clock };
        }
      case 'staff':
        switch (status) {
          case 'active': return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
          case 'inactive': return { color: 'bg-red-100 text-red-800', icon: XCircle };
          case 'on_leave': return { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
          default: return { color: 'bg-gray-100 text-gray-800', icon: Clock };
        }
      case 'team':
        switch (status) {
          case 'active': return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
          case 'inactive': return { color: 'bg-red-100 text-red-800', icon: XCircle };
          default: return { color: 'bg-gray-100 text-gray-800', icon: Clock };
        }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };

  const { color, icon: Icon } = getStatusConfig();

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${color}`}>
      <Icon className="h-3 w-3" />
      <span className="capitalize">{status.replace('_', ' ')}</span>
    </span>
  );
}
