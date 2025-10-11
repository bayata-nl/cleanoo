'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Modal from '@/components/admin/shared/Modal';
import FormField from '@/components/admin/shared/FormField';
import StatusBadge from '@/components/admin/shared/StatusBadge';
import { Personnel, Team } from '@/types';

interface StaffTabProps {
  staff: Personnel[];
  teams: Team[];
  loading: boolean;
  fetchStaff: () => Promise<void>;
  showStaffForm: boolean;
  setShowStaffForm: (show: boolean) => void;
}

export default function StaffTab({ 
  staff, 
  teams,
  loading, 
  fetchStaff, 
  showStaffForm, 
  setShowStaffForm 
}: StaffTabProps) {
  const { toast } = useToast();
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    confirm_email: '',
    phone: '',
    address: '',
    role: 'cleaner',
    status: 'active',
    specialization: '',
    experience_years: 0,
    hourly_rate: 0,
    password: ''
  });
  const [editingPersonnel, setEditingPersonnel] = useState<any>(null);

  const resetForm = () => {
    setStaffForm({
      name: '',
      email: '',
      confirm_email: '',
      phone: '',
      address: '',
      role: 'cleaner',
      status: 'active',
      specialization: '',
      experience_years: 0,
      hourly_rate: 0,
      password: ''
    });
    setEditingPersonnel(null);
  };

  const handleEdit = (person: Personnel) => {
    setEditingPersonnel(person);
    setStaffForm({
      name: person.name,
      email: person.email,
      confirm_email: person.email,
      phone: person.phone,
      address: (person as any).address || '',
      role: person.role,
      status: person.status,
      specialization: person.specialization || '',
      experience_years: person.experience_years,
      hourly_rate: person.hourly_rate || 0,
      password: ''
    });
    setShowStaffForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!staffForm.name || !staffForm.email || !staffForm.phone || !staffForm.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (staffForm.email.trim().toLowerCase() !== staffForm.confirm_email.trim().toLowerCase()) {
      toast({
        title: "Error",
        description: "Emails do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = editingPersonnel ? `/api/staff/${editingPersonnel.id}` : '/api/staff';
      const method = editingPersonnel ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: staffForm.name,
          email: staffForm.email,
          phone: staffForm.phone,
          address: staffForm.address,
          role: staffForm.role,
          status: staffForm.status,
          specialization: staffForm.specialization,
          experience_years: staffForm.experience_years,
          hourly_rate: staffForm.hourly_rate,
          password: staffForm.password
        }),
      });

      if (!response.ok) throw new Error('Failed to save staff member');

      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to save staff member');

      toast({
        title: "Success",
        description: editingPersonnel ? "Staff member updated successfully" : "Staff member added successfully",
      });

      setShowStaffForm(false);
      resetForm();
      fetchStaff();
    } catch (error: any) {
      console.error('Error saving staff member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save staff member.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (personnelId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      const response = await fetch(`/api/staff/${personnelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete staff member');

      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      });

      fetchStaff();
    } catch (error: any) {
      console.error('Error deleting staff member:', error);
      toast({
        title: "Error",
        description: "Failed to delete staff member.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading staff...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
        <Button onClick={() => setShowStaffForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {staff.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No staff members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((person) => (
            <div key={person.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(person)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(person.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{person.name}</h3>
              <p className="text-gray-600 capitalize mb-2">{person.role}</p>
              <div className="space-y-1 text-sm text-gray-500">
                <p>{person.email}</p>
                <p>{person.phone}</p>
                {person.specialization && (
                  <p className="capitalize">Specialization: {person.specialization}</p>
                )}
                <p>Experience: {person.experience_years} years</p>
                {person.hourly_rate && (
                  <p>Rate: €{person.hourly_rate}/hour</p>
                )}
                <div className="mt-2">
                  <p className="font-medium text-gray-700">Teams:</p>
                  {teams.filter(team => 
                    team.members?.some((member: any) => member.staff_id === person.id)
                  ).length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teams.filter(team => 
                        team.members?.some((member: any) => member.staff_id === person.id)
                      ).map(team => (
                        <span key={team.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {team.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No teams assigned</span>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <StatusBadge status={person.status} type="staff" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Form Modal */}
      <Modal
        isOpen={showStaffForm}
        onClose={() => {
          setShowStaffForm(false);
          resetForm();
        }}
        title={editingPersonnel ? "Edit Staff Member" : "Add New Staff Member"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <input
                type="text"
                value={staffForm.name}
                onChange={(e) => setStaffForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
            </FormField>

            <FormField label="Email" required>
              <input
                type="email"
                value={staffForm.email}
                onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email"
              />
            </FormField>

            <FormField label="Confirm Email" required>
              <input
                type="email"
                value={staffForm.confirm_email}
                onChange={(e) => setStaffForm(prev => ({ ...prev, confirm_email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Re-enter email"
              />
            </FormField>

            <FormField label="Phone" required>
              <input
                type="tel"
                value={staffForm.phone}
                onChange={(e) => setStaffForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </FormField>

            <FormField label="Address" required>
              <input
                type="text"
                value={staffForm.address}
                onChange={(e) => setStaffForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter address"
              />
            </FormField>

            <FormField label="Role" required>
              <select
                value={staffForm.role}
                onChange={(e) => setStaffForm(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cleaner">Cleaner</option>
                <option value="supervisor">Supervisor</option>
                <option value="manager">Manager</option>
              </select>
            </FormField>

            <FormField label="Status" required>
              <select
                value={staffForm.status}
                onChange={(e) => setStaffForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </FormField>

            <FormField label="Specialization">
              <input
                type="text"
                value={staffForm.specialization}
                onChange={(e) => setStaffForm(prev => ({ ...prev, specialization: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Deep Cleaning, Window Cleaning"
              />
            </FormField>

            <FormField label="Experience (Years)" required>
              <input
                type="number"
                value={staffForm.experience_years}
                onChange={(e) => setStaffForm(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </FormField>

            <FormField label="Hourly Rate (€)">
              <input
                type="number"
                value={staffForm.hourly_rate}
                onChange={(e) => setStaffForm(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </FormField>
          </div>

          {!editingPersonnel && (
            <FormField label="Initial Password">
              <input
                type="password"
                value={staffForm.password}
                onChange={(e) => setStaffForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty for default 'welcome'"
              />
            </FormField>
          )}

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingPersonnel ? "Update Staff Member" : "Add Staff Member"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowStaffForm(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
