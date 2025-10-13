'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, CheckCircle, Clock, Eye, RefreshCw, Users, User, 
  Calendar, MapPin, ChevronLeft, ChevronRight, Filter,
  Search, X
} from 'lucide-react';
import Modal from '@/components/admin/shared/Modal';
import FormField from '@/components/admin/shared/FormField';
import StatusBadge from '@/components/admin/shared/StatusBadge';
import { Assignment, BookingForm, Team, Personnel } from '@/types';

interface AssignmentsTabProps {
  assignments: Assignment[];
  bookings: BookingForm[];
  teams: Team[];
  staff: Personnel[];
  loading: boolean;
  fetchAssignments: () => Promise<void>;
  fetchBookings: () => Promise<void>;
  showAssignmentForm: boolean;
  setShowAssignmentForm: (show: boolean) => void;
}

export default function AssignmentsTab({
  assignments,
  bookings,
  teams,
  staff,
  loading,
  fetchAssignments,
  fetchBookings,
  showAssignmentForm,
  setShowAssignmentForm
}: AssignmentsTabProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const itemsPerPage = 6;

  const [assignmentForm, setAssignmentForm] = useState({
    booking_id: '',
    assignment_type: 'individual',
    staff_id: '',
    team_id: '',
    priority: 'medium',
    notes: '',
    estimated_duration: '',
    deadline: ''
  });

  const handleCreateAssignment = async (e: React.FormEvent) => {
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
          title: "Assignment Created",
          description: "New assignment has been created successfully.",
        });
        setShowAssignmentForm(false);
        setAssignmentForm({
          booking_id: '',
          assignment_type: 'individual',
          staff_id: '',
          team_id: '',
          priority: 'medium',
          notes: '',
          estimated_duration: '',
          deadline: ''
        });
        fetchAssignments();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create assignment.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "An error occurred while creating the assignment.",
        variant: "destructive",
      });
    }
  };

  const updateAssignmentStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Status Updated",
          description: "Assignment status has been updated successfully.",
        });
        fetchAssignments();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update assignment status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating assignment status:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating the assignment.",
        variant: "destructive",
      });
    }
  };

  // Filter assignments based on active tab and filters
  const getFilteredAssignments = () => {
    let filtered = assignments;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(assignment => 
        assignment.booking?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.booking?.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.staff?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.team?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.assignment_type === typeFilter);
    }

    return filtered;
  };

  const filteredAssignments = getFilteredAssignments();
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIndex, startIndex + itemsPerPage);

  const getStatusCounts = () => {
    return {
      all: assignments.length,
      assigned: assignments.filter(a => a.status === 'assigned').length,
      accepted: assignments.filter(a => a.status === 'accepted').length,
      in_progress: assignments.filter(a => a.status === 'in_progress').length,
      completed: assignments.filter(a => a.status === 'completed').length,
      cancelled: assignments.filter(a => a.status === 'cancelled').length
    };
  };

  const statusCounts = getStatusCounts();

  const tabs = [
    { id: 'all', label: 'All', count: statusCounts.all },
    { id: 'assigned', label: 'Assigned', count: statusCounts.assigned },
    { id: 'accepted', label: 'Accepted', count: statusCounts.accepted },
    { id: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
    { id: 'completed', label: 'Completed', count: statusCounts.completed },
    { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Operation Management</h2>
          <p className="text-gray-600">Manage task assignments and track progress</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => fetchAssignments()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAssignmentForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="individual">Individual</option>
            <option value="team">Team</option>
          </select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setTypeFilter('all');
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Assignment Cards */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading assignments...</span>
            </div>
          ) : paginatedAssignments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-500">No assignments match your current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedAssignments.map((assignment) => (
                <div key={assignment.id} className="bg-gray-50 rounded-lg border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <StatusBadge status={assignment.status} type="assignment" />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {/* View details */}}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <select
                        value={assignment.status}
                        onChange={(e) => updateAssignmentStatus(parseInt(assignment.id), e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="assigned">Assigned</option>
                        <option value="accepted">Accepted</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {assignment.booking?.serviceType || 'Service Assignment'}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>{assignment.booking?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{assignment.booking?.preferredDate || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{assignment.booking?.preferredTime || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{assignment.booking?.address || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      assignment.assignment_type === 'team' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {assignment.assignment_type === 'team' ? 'Team Assignment' : 'Individual Assignment'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      (assignment as any).priority === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : (assignment as any).priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {(assignment as any).priority} priority
                    </span>
                  </div>

                  {assignment.team && (
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm text-gray-600">Team: {assignment.team.name}</span>
                    </div>
                  )}
                  
                  {assignment.staff && (
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-sm text-gray-600">Assigned to: {assignment.staff.name}</span>
                    </div>
                  )}
                  
                  {assignment.notes && (
                    <div className="mt-4 p-3 bg-white rounded-lg border">
                      <p className="text-sm text-gray-700">{assignment.notes}</p>
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAssignments.length)} of {filteredAssignments.length} assignments
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

      {/* New Assignment Modal */}
      <Modal
        isOpen={showAssignmentForm}
        onClose={() => setShowAssignmentForm(false)}
        title="Create New Assignment"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <FormField label="Booking">
            <select
              value={assignmentForm.booking_id}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, booking_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a booking</option>
              {bookings.filter(booking => booking.status === 'confirmed').map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.name} - {booking.serviceType} ({booking.preferredDate})
                </option>
              ))}
            </select>
          </FormField>

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

          <FormField label="Priority">
            <select
              value={assignmentForm.priority}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </FormField>

          <FormField label="Estimated Duration (hours)">
            <input
              type="number"
              value={assignmentForm.estimated_duration}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, estimated_duration: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0.5"
              step="0.5"
            />
          </FormField>

          <FormField label="Deadline">
            <input
              type="datetime-local"
              value={assignmentForm.deadline}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Notes">
            <textarea
              value={assignmentForm.notes}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes or instructions..."
            />
          </FormField>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAssignmentForm(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}