'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Users, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Modal from '@/components/admin/shared/Modal';
import FormField from '@/components/admin/shared/FormField';
import StatusBadge from '@/components/admin/shared/StatusBadge';
import { Team, Personnel } from '@/types';

interface TeamsTabProps {
  teams: Team[];
  staff: Personnel[];
  loading: boolean;
  fetchTeams: () => Promise<void>;
  fetchStaff: () => Promise<void>;
  showTeamForm: boolean;
  setShowTeamForm: (show: boolean) => void;
  showMemberForm: boolean;
  setShowMemberForm: (show: boolean) => void;
}

export default function TeamsTab({ 
  teams, 
  staff, 
  loading, 
  fetchTeams, 
  fetchStaff,
  showTeamForm, 
  setShowTeamForm,
  showMemberForm,
  setShowMemberForm
}: TeamsTabProps) {
  const { toast } = useToast();
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    team_leader_id: ''
  });
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [availablePersonnel, setAvailablePersonnel] = useState<Personnel[]>([]);

  const resetForm = () => {
    setTeamForm({ name: '', description: '', team_leader_id: '' });
    setEditingTeam(null);
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      description: team.description || '',
      team_leader_id: team.team_leader_id || ''
    });
    setShowTeamForm(true);
  };

  const handleManageMembers = async (team: Team) => {
    setSelectedTeam(team);
    
    // Get available personnel (not already in this team)
    const teamMemberIds = team.members?.map(m => m.staff_id) || [];
    const available = staff?.filter(p => 
      p.status === 'active' && !teamMemberIds.includes(p.id)
    );
    setAvailablePersonnel(available);
    
    setShowMemberForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamForm.name) {
      toast({
        title: "Error",
        description: "Please fill in team name",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = editingTeam ? `/api/teams/${editingTeam.id}` : '/api/teams';
      const method = editingTeam ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm),
      });

      if (!response.ok) throw new Error('Failed to save team');

      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to save team');

      toast({
        title: "Success",
        description: editingTeam ? "Team updated successfully" : "Team created successfully",
      });

      setShowTeamForm(false);
      resetForm();
      fetchTeams();
    } catch (error: any) {
      console.error('Error saving team:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save team.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete team');

      toast({
        title: "Success",
        description: "Team deleted successfully",
      });

      fetchTeams();
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team.",
        variant: "destructive",
      });
    }
  };

  const addTeamMember = async (staffId: string, role: string) => {
    if (!selectedTeam) return;

    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staffId,
          role_in_team: role
        }),
      });

      if (!response.ok) throw new Error('Failed to add team member');

      toast({
        title: "Success",
        description: "Team member added successfully",
      });

      fetchTeams();
      handleManageMembers(selectedTeam); // Refresh available staff
    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error",
        description: "Failed to add team member.",
        variant: "destructive",
      });
    }
  };

  const removeTeamMember = async (memberId: string) => {
    if (!selectedTeam) return;

    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove team member');

      toast({
        title: "Success",
        description: "Team member removed successfully",
      });

      fetchTeams();
      handleManageMembers(selectedTeam); // Refresh available staff
    } catch (error: any) {
      console.error('Error removing team member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Teams Management</h2>
        <Button onClick={() => setShowTeamForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No teams found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleManageMembers(team)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(team)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(team.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{team.name}</h3>
              {team.description && (
                <p className="text-gray-600 mb-4">{team.description}</p>
              )}
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Members: {team.members?.length || 0}
                </p>
                {team.team_leader && (
                  <p className="text-sm text-gray-500">
                    Leader: {team.team_leader.name}
                  </p>
                )}
              </div>
              <div className="mt-4">
                <StatusBadge status={team.status} type="team" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Form Modal */}
      <Modal
        isOpen={showTeamForm}
        onClose={() => {
          setShowTeamForm(false);
          resetForm();
        }}
        title={editingTeam ? "Edit Team" : "Create New Team"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Team Name" required>
            <input
              type="text"
              value={teamForm.name}
              onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter team name"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={teamForm.description}
              onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter team description"
            />
          </FormField>

          <FormField label="Team Leader">
            <select
              value={teamForm.team_leader_id}
              onChange={(e) => setTeamForm(prev => ({ ...prev, team_leader_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select team leader</option>
              {staff?.filter(p => p.status === 'active' && ['supervisor', 'manager'].includes(p.role)).map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} ({person.role})
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingTeam ? "Update Team" : "Create Team"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowTeamForm(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Team Member Management Modal */}
      <Modal
        isOpen={showMemberForm}
        onClose={() => {
          setShowMemberForm(false);
          setSelectedTeam(null);
          setAvailablePersonnel([]);
        }}
        title={`Manage Team Members - ${selectedTeam?.name || ''}`}
        size="lg"
      >
        {selectedTeam && (
          <div className="space-y-6">
            {/* Current Members */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Current Members</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedTeam.members && selectedTeam.members.length > 0 ? (
                  selectedTeam.members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{member.staff?.name}</span>
                        <span className="ml-2 text-sm text-gray-600 capitalize">({member.role_in_team})</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeTeamMember(member.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No members in this team</p>
                )}
              </div>
            </div>

            {/* Add New Member */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Add New Member</h4>
              <div className="space-y-3">
                {availablePersonnel.length > 0 ? (
                  availablePersonnel.map((person) => (
                    <div key={person.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{person.name}</span>
                        <span className="ml-2 text-sm text-gray-600 capitalize">({person.role})</span>
                        {person.specialization && (
                          <span className="ml-2 text-xs text-blue-600">- {person.specialization}</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => addTeamMember(person.id, 'member')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Add as Member
                        </Button>
                        {person.role !== 'cleaner' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addTeamMember(person.id, 'specialist')}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            Add as Specialist
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No available staff to add</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
