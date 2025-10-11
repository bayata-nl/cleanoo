'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, Clock, Eye, RefreshCw, Users, User, 
  Calendar, MapPin, ChevronLeft, ChevronRight,
  Search, X, Phone, Mail, AlertCircle, UserPlus, Settings, Edit
} from 'lucide-react';
import Modal from '@/components/admin/shared/Modal';
import FormField from '@/components/admin/shared/FormField';
import { BookingForm, Team, Personnel } from '@/types';

interface OperationsTabProps {
  bookings: BookingForm[];
  teams: Team[];
  staff: Personnel[];
  loading: boolean;
  fetchBookings: () => Promise<void>;
}

export default function OperationsTab({
  bookings,
  teams,
  staff,
  loading,
  fetchBookings
}: OperationsTabProps) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingForm | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);
  const itemsPerPage = 6;

  const [assignmentForm, setAssignmentForm] = useState({
    booking_id: '',
    assignment_type: 'individual',
    staff_id: '',
    team_id: '',
    notes: ''
  });

  // Get all operations (bookings) with all statuses
  const getOperations = () => {
    return bookings
      .map(booking => ({
        ...booking,
        status: booking.status?.toLowerCase() || 'pending',
        created_at: (booking as any).created_at || new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const handleAssignOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentForm),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Operation Assigned",
          description: "Operation has been assigned successfully.",
        });
        setShowAssignModal(false);
        setAssignmentForm({
          booking_id: '',
          assignment_type: 'individual',
          staff_id: '',
          team_id: '',
          notes: ''
        });
        fetchBookings();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to assign operation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error assigning operation:', error);
      toast({
        title: "Error",
        description: "An error occurred while assigning the operation.",
        variant: "destructive",
      });
    }
  };

  const handleReassignOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First delete the current assignment
      const deleteResponse = await fetch(`/api/assignments/${currentAssignment.id}`, {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete current assignment');
      }

      // Then create a new assignment
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentForm),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Operation Reassigned",
          description: "Operation has been reassigned successfully.",
        });
        setShowReassignModal(false);
        setCurrentAssignment(null);
        setAssignmentForm({
          booking_id: '',
          assignment_type: 'individual',
          staff_id: '',
          team_id: '',
          notes: ''
        });
        fetchBookings();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reassign operation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error reassigning operation:', error);
      toast({
        title: "Error",
        description: "An error occurred while reassigning the operation.",
        variant: "destructive",
      });
    }
  };



  const handleViewDetails = (booking: BookingForm) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };


  const handleEdit = async (booking: BookingForm) => {
    setSelectedBooking(booking);
    
    // Check if booking already has an assignment
    try {
      const response = await fetch(`/api/assignments?booking_id=${booking.id}`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        // Booking already has an assignment, show reassign modal
        setCurrentAssignment(result.data[0]);
        setAssignmentForm({
          booking_id: booking.id!,
          assignment_type: result.data[0].assignment_type,
          staff_id: result.data[0].staff_id || '',
          team_id: result.data[0].team_id || '',
          notes: result.data[0].notes || ''
        });
        setShowReassignModal(true);
      } else {
        // No assignment, show new assignment modal
        setAssignmentForm({
          booking_id: booking.id!,
          assignment_type: 'individual',
          staff_id: '',
          team_id: '',
          notes: ''
        });
        setShowAssignModal(true);
      }
    } catch (error) {
      console.error('Error checking assignment:', error);
      // Fallback to new assignment modal
      setAssignmentForm({
        booking_id: booking.id!,
        assignment_type: 'individual',
        staff_id: '',
        team_id: '',
        notes: ''
      });
      setShowAssignModal(true);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: status,
          preferredDate: new Date().toISOString().split('T')[0],
          preferredTime: 'Updated'
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Status Updated",
          description: "Operation status has been updated successfully.",
        });
        fetchBookings();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating the status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOperation = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this operation?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Operation Deleted",
          description: "Operation has been deleted successfully.",
        });
        fetchBookings();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete operation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting operation:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the operation.",
        variant: "destructive",
      });
    }
  };

  // Filter operations based on search
  const getFilteredOperations = () => {
    let filtered = getOperations();

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(operation => 
        operation.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredOperations = getFilteredOperations();
  const totalPages = Math.ceil(filteredOperations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOperations = filteredOperations.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Operations Management</h2>
          <p className="text-gray-600">Manage incoming customer requests and assignments</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => fetchBookings()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search operations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setSearchTerm('')}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Operations Cards */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading operations...</span>
            </div>
          ) : paginatedOperations.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No operations found</h3>
              <p className="text-gray-500">No operations match your current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedOperations.map((operation) => (
                <div key={operation.id} className="bg-gray-50 rounded-lg border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        operation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        operation.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        operation.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                        operation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {operation.status.charAt(0).toUpperCase() + operation.status.slice(1)}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        #{operation.id}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(operation as any)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleEdit(operation as any)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {operation.serviceType || 'Service Request'}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>{operation.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{operation.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{operation.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{operation.preferredDate || (operation as any).preferred_date || 'Not set'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{operation.preferredTime || (operation as any).preferred_time || 'Not set'}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{operation.address || 'N/A'}</span>
                    </div>
                  </div>

                  {operation.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                        <p className="text-sm text-yellow-800">New customer request - needs assignment</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex space-x-2">
                    <select
                      value={operation.status}
                      onChange={(e) => handleUpdateStatus(operation.id!, e.target.value)}
                      className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteOperation(operation.id!)}
                    >
                      Delete
                    </Button>
                  </div>

                  {operation.notes && (
                    <div className="mt-4 p-3 bg-white rounded-lg border">
                      <p className="text-sm text-gray-700">{operation.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOperations.length)} of {filteredOperations.length} operations
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Operation #${selectedBooking?.id} Details`}
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900">Customer Information</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><strong>Name:</strong> {selectedBooking.name}</p>
                  <p><strong>Email:</strong> {selectedBooking.email}</p>
                  <p><strong>Phone:</strong> {selectedBooking.phone}</p>
                  <p><strong>Address:</strong> {selectedBooking.address}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Service Information</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><strong>Service:</strong> {selectedBooking.serviceType}</p>
                  <p><strong>Date:</strong> {selectedBooking.preferredDate || (selectedBooking as any).preferred_date || 'Not set'}</p>
                  <p><strong>Time:</strong> {selectedBooking.preferredTime || (selectedBooking as any).preferred_time || 'Not set'}</p>
                  <p><strong>Status:</strong> <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span></p>
                </div>
              </div>
            </div>
            
            {selectedBooking.notes && (
              <div>
                <h4 className="font-semibold text-gray-900">Customer Notes</h4>
                <p className="mt-1 text-sm text-gray-600">{selectedBooking.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Assignment Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Operation"
      >
        <form onSubmit={handleAssignOperation} className="space-y-4">
          <FormField label="Assignment Type">
            <select
              value={assignmentForm.assignment_type}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, assignment_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="individual">Individual Assignment</option>
              <option value="team">Team Assignment</option>
            </select>
          </FormField>

          {assignmentForm.assignment_type === 'individual' && (
            <FormField label="Assign to Staff">
              <select
                value={assignmentForm.staff_id}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, staff_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={assignmentForm.assignment_type === 'individual'}
              >
                <option value="">Select staff member</option>
                {staff?.filter(p => p.status === 'active').map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} ({person.role})
                  </option>
                ))}
              </select>
            </FormField>
          )}

          {assignmentForm.assignment_type === 'team' && (
            <FormField label="Assign to Team">
              <select
                value={assignmentForm.team_id}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, team_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={assignmentForm.assignment_type === 'team'}
              >
                <option value="">Select team</option>
                {teams.filter(team => team.status === 'active').map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.members?.length || 0} members)
                  </option>
                ))}
              </select>
            </FormField>
          )}

          <FormField label="Assignment Notes">
            <textarea
              value={assignmentForm.notes}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes or instructions for the staff..."
            />
          </FormField>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAssignModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Assign Operation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reassign Modal */}
      <Modal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        title="Reassign Operation"
      >
        {currentAssignment && (
          <div className="space-y-4">
            {/* Current Assignment Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Current Assignment</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Type:</strong> {currentAssignment.assignment_type === 'individual' ? 'Individual' : 'Team'}</p>
                {currentAssignment.assignment_type === 'individual' && currentAssignment.staff_name && (
                  <p><strong>Assigned to:</strong> {currentAssignment.staff_name}</p>
                )}
                {currentAssignment.assignment_type === 'team' && currentAssignment.team_name && (
                  <p><strong>Assigned to Team:</strong> {currentAssignment.team_name}</p>
                )}
                <p><strong>Status:</strong> <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {currentAssignment.status}
                </span></p>
                <p><strong>Assigned by:</strong> {currentAssignment.assigned_by_name}</p>
                {currentAssignment.notes && (
                  <p><strong>Notes:</strong> {currentAssignment.notes}</p>
                )}
              </div>
            </div>

            <form onSubmit={handleReassignOperation} className="space-y-4">
              <FormField label="Assignment Type">
                <select
                  value={assignmentForm.assignment_type}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, assignment_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="individual">Individual Assignment</option>
                  <option value="team">Team Assignment</option>
                </select>
              </FormField>

              {assignmentForm.assignment_type === 'individual' && (
                <FormField label="Assign to Staff">
                  <select
                    value={assignmentForm.staff_id}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, staff_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={assignmentForm.assignment_type === 'individual'}
                  >
                    <option value="">Select staff member</option>
                    {staff?.filter(p => p.status === 'active').map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name} ({person.role})
                      </option>
                    ))}
                  </select>
                </FormField>
              )}

              {assignmentForm.assignment_type === 'team' && (
                <FormField label="Assign to Team">
                  <select
                    value={assignmentForm.team_id}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, team_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={assignmentForm.assignment_type === 'team'}
                  >
                    <option value="">Select team</option>
                    {teams.filter(team => team.status === 'active').map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.members?.length || 0} members)
                      </option>
                    ))}
                  </select>
                </FormField>
              )}

              <FormField label="Assignment Notes">
                <textarea
                  value={assignmentForm.notes}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Additional notes or instructions for the staff..."
                />
              </FormField>

              <div className="flex space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowReassignModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Reassign Operation
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
