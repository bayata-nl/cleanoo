'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useStaffAuth } from '@/contexts/StaffAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import ProtectedStaffRoute from '@/components/ProtectedStaffRoute';
import { 
  Sparkles, 
  User, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  LogOut, 
  CheckCircle, 
  AlertCircle,
  Users,
  Building,
  CalendarDays,
  List,
  ChevronDown,
  Settings,
  Play,
  Pause,
  Square,
  Eye,
  Bell,
  TrendingUp,
  Star,
  Target,
  Zap,
  FileText
} from 'lucide-react';
import Calendar from '@/components/ui/calendar';
import StaffProfileDetailsModal from '@/components/StaffProfileDetailsModal';

interface Assignment {
  id: string;
  booking_id: string;
  team_id?: string;
  staff_id: string;
  assigned_by: string;
  assignment_type: 'team' | 'individual';
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  assigned_at: string;
  accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  team?: {
    id: string;
    name: string;
    description?: string;
    team_leader_id: string;
    status: string;
  };
  booking?: {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    service_type: string;
    preferred_date: string;
    preferred_time: string;
    address: string;
    notes?: string;
    status: string;
  };
}

export default function StaffDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { staff, logout, changePassword, isLoading } = useStaffAuth();
  const { t } = useLanguage();
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [staffDetails, setStaffDetails] = useState<any>(null);
  const [showProfileDetailsModal, setShowProfileDetailsModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    completedToday: 0,
    pendingAssignments: 0,
    thisWeekCompleted: 0
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [activeView, setActiveView] = useState<'assignments' | 'performance'>('assignments');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    specialization: '',
    experience_years: 0 as number,
    hourly_rate: '' as any
  });

  useEffect(() => {
    // Don't redirect if still loading
    if (isLoading) {
      return;
    }
    
    if (!staff) {
      router.push('/staff/login');
      return;
    }
    
    // Check if this is first login (password is still 'welcome')
    if (staff.password === 'welcome') {
      setIsFirstLogin(true);
      setShowPasswordModal(true);
    }
    
    fetchAssignments();
    fetchNotifications();
    fetchPerformanceData();
    fetchStaffDetails();
  }, [staff, router, isLoading]);

  const fetchStaffDetails = async () => {
    if (!staff?.id) return;
    
    try {
      const response = await fetch(`/api/staff/${staff.id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStaffDetails(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching staff details:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?staff_id=${staff?.id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNotifications(result.data);
          setUnreadCount(result.data.filter((n: any) => !n.is_read).length);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationsAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_ids: notificationIds,
          is_read: true
        }),
      });

      if (response.ok) {
        fetchNotifications(); // Refresh notifications
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const fetchPerformanceData = async () => {
    if (!staff?.id) return;
    
    try {
      const response = await fetch(`/api/staff/performance?staff_id=${staff.id}&period=week`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPerformanceData(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu) {
        const target = event.target as Element;
        if (!target.closest('.profile-menu-container')) {
          setShowProfileMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const fetchAssignments = async () => {
    try {
      // First get team memberships for this staff
      const teamResponse = await fetch(`/api/teams?staff_id=${staff?.id}`);
      let teamIds: string[] = [];
      
      if (teamResponse.ok) {
        const teamResult = await teamResponse.json();
        if (teamResult.success) {
          teamIds = teamResult.data.map((team: any) => team.id.toString());
        }
      }

      // Then get assignments (both individual and team)
      const response = await fetch('/api/assignments');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Filter assignments for current staff member and map to proper structure
          const staffAssignments = result.data
            .filter((assignment: any) => {
              // Individual assignments
              if (assignment.staff_id === staff?.id) {
                return true;
              }
              // Team assignments - check if staff is member of the assigned team
              if (assignment.team_id && teamIds.includes(assignment.team_id.toString())) {
                return true;
              }
              return false;
            })
            .map((assignment: any) => ({
              ...assignment,
              booking: {
                id: assignment.booking_id,
                customer_name: assignment.customer_name,
                customer_email: assignment.customer_email,
                customer_phone: assignment.customer_phone,
                service_type: assignment.service_type,
                preferred_date: assignment.preferred_date,
                preferred_time: assignment.preferred_time,
                address: assignment.customer_address,
                notes: assignment.booking_notes,
                status: assignment.status,
              }
            }));
          setAssignments(staffAssignments);
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assignments.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
        toast({
          title: "Error",
          description: "Please fill in all password fields",
          variant: "destructive",
        });
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast({
          title: "Error",
          description: "New passwords do not match",
          variant: "destructive",
        });
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return;
      }

      const success = await changePassword(passwordForm.newPassword);
      if (success) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        
        setShowPasswordModal(false);
        setIsFirstLogin(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to change password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while changing password",
        variant: "destructive",
      });
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, status: string) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update assignment');
      }

      toast({
        title: "Success",
        description: `Assignment ${status} successfully`,
      });

      fetchAssignments(); // Refresh assignments
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    }
  };

  const calculateStats = () => {
    const totalAssignments = assignments.length;
    const completedToday = assignments.filter(assignment => {
      const today = new Date().toISOString().split('T')[0];
      if (!today) return false;
      return assignment.status === 'completed' && 
             assignment.completed_at && 
             typeof assignment.completed_at === 'string' &&
             assignment.completed_at.startsWith(today);
    }).length;
    
    const pendingAssignments = assignments.filter(assignment => 
      ['assigned', 'accepted', 'in_progress'].includes(assignment.status)
    ).length;
    
    const thisWeekCompleted = assignments.filter(assignment => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return assignment.status === 'completed' && 
             assignment.completed_at && 
             new Date(assignment.completed_at) >= weekAgo;
    }).length;

    setStats({
      totalAssignments,
      completedToday,
      pendingAssignments,
      thisWeekCompleted
    });
  };

  useEffect(() => {
    if (assignments.length > 0) {
      calculateStats();
    }
  }, [assignments]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Get assignments for selected date (updated to use filtered assignments)
  const getAssignmentsForDate = (date: Date, assignmentList?: Assignment[]) => {
    const dateStr = date.toISOString().split('T')[0];
    const assignmentsToCheck = assignmentList || assignments;
    return assignmentsToCheck.filter(assignment => {
      const assignmentDate = (assignment as any).preferred_date || (assignment as any).preferredDate;
      // Handle different date formats
      if (!assignmentDate) return false;
      
      // Convert assignment date to YYYY-MM-DD format for comparison
      let normalizedAssignmentDate;
      if (assignmentDate.includes('-')) {
        // Already in YYYY-MM-DD format
        normalizedAssignmentDate = assignmentDate;
      } else if (assignmentDate.includes('/')) {
        // Convert from DD/MM/YYYY or MM/DD/YYYY to YYYY-MM-DD
        const parts = assignmentDate.split('/');
        if (parts.length === 3) {
          // Assume DD/MM/YYYY format (European)
          normalizedAssignmentDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      
      return normalizedAssignmentDate === dateStr;
    });
  };

  // Get filtered assignments based on view mode and selected date
  const getFilteredAssignments = () => {
    let filtered = assignments;
    
    // Filter by tab (active vs completed)
    if (activeTab === 'active') {
      filtered = assignments.filter(assignment => 
        !['completed', 'cancelled'].includes(assignment.status)
      );
    } else {
      filtered = assignments.filter(assignment => 
        ['completed', 'cancelled'].includes(assignment.status)
      );
    }
    
    if (viewMode === 'calendar' && selectedDate) {
      return getAssignmentsForDate(selectedDate, filtered);
    }
    return filtered;
  };

  // Early returns
  if (!staff) {
    return null;
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedStaffRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center">
                <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">{t('staff.dashboard.title')}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Switcher */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('assignments')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'assignments'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Assignments
                </button>
                <button
                  onClick={() => setActiveView('performance')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'performance'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Performance
                </button>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    // Mark all notifications as read
                    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
                    if (unreadIds.length > 0) {
                      markNotificationsAsRead(unreadIds);
                    }
                  }}
                  className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Profile Menu */}
              <div className="relative profile-menu-container">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{staff.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={async () => {
                        setShowProfileMenu(false);
                        setShowProfileModal(true);
                        setProfileLoading(true);
                        try {
                          const res = await fetch('/api/staff/me', { credentials: 'include' });
                          if (res.ok) {
                            const data = await res.json();
                            if (data.success) {
                              setProfileForm({
                                name: data.data.name || '',
                                phone: data.data.phone || '',
                                address: data.data.address || '',
                                specialization: data.data.specialization || '',
                                experience_years: data.data.experience_years || 0,
                                hourly_rate: data.data.hourly_rate?.toString?.() || ''
                              });
                            }
                          }
                        } finally {
                          setProfileLoading(false);
                        }
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDetailsModal(true);
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Full Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordModal(true);
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                      <Settings className="h-4 w-4 mr-2" />
                        Change Password
                      </button>
                      <button
                        onClick={() => {
                        logout();
                        router.push('/staff/login');
                        }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                      <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'assignments' ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed Today</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.thisWeekCompleted}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Tasks Highlight */}
            {(() => {
              const today = new Date().toISOString().split('T')[0];
              const todayTasks = assignments.filter(a => 
                a.booking?.preferred_date === today && 
                !['completed', 'cancelled'].includes(a.status)
              );
              
              if (todayTasks.length > 0) {
                return (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Target className="h-5 w-5" />
                          <h3 className="text-lg font-bold">{t('staff.dashboard.todaySchedule')}</h3>
                        </div>
                        <p className="text-blue-100 text-sm">{todayTasks.length} {t('staff.dashboard.tasksToday')}</p>
                      </div>
                      <div className="text-4xl font-bold">{todayTasks.length}</div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {todayTasks.slice(0, 2).map(task => (
                        <div key={task.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                          <p className="font-semibold text-sm">{task.booking?.service_type}</p>
                          <p className="text-xs text-blue-100 mt-1">{task.booking?.preferred_time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 mb-8">
                <Button
                  onClick={() => setViewMode('calendar')}
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                className="flex items-center"
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                {t('common.calendar') || 'Calendar View'}
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'default' : 'outline'}
                className="flex items-center"
                >
                  <List className="h-4 w-4 mr-2" />
                {t('common.list') || 'List View'}
              </Button>
              <Button
                onClick={() => setActiveTab('active')}
                variant={activeTab === 'active' ? 'default' : 'outline'}
                className="flex items-center"
              >
                <Zap className="h-4 w-4 mr-2" />
                Active Tasks
                </Button>
              </div>

            {/* Assignments Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {t('staff.dashboard.myAssignments')} ({getFilteredAssignments().length})
                    </h2>
            </div>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('active')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'active'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Active ({assignments.filter(a => !['completed', 'cancelled'].includes(a.status)).length})
                    </button>
                    <button
                      onClick={() => setActiveTab('completed')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'completed'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Completed ({assignments.filter(a => ['completed', 'cancelled'].includes(a.status)).length})
                    </button>
          </div>
            </div>
            </div>

              {viewMode === 'calendar' ? (
            <div className="p-6">
              <Calendar 
                assignments={assignments}
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate || undefined}
              />
              {selectedDate && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Assignments for {selectedDate.toLocaleDateString('nl-NL')}
                  </h3>
                      {getAssignmentsForDate(selectedDate, getFilteredAssignments()).length > 0 ? (
                    <div className="space-y-4">
                          {getAssignmentsForDate(selectedDate, getFilteredAssignments()).map((assignment) => (
                            <div key={assignment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                      {getStatusIcon(assignment.status)}
                                      <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                                    </span>
                                    {assignment.team && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        <Users className="h-3 w-3 mr-1" />
                                        {assignment.team.name}
                                      </span>
                                    )}
                                  </div>
                            <h4 className="text-lg font-medium text-gray-900">
                                    {assignment.booking?.service_type || 'Service Assignment'}
                            </h4>
                                  <p className="text-sm text-gray-600">
                                    Customer: {assignment.booking?.customer_name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Address: {assignment.booking?.address}
                                  </p>
                                  {assignment.booking?.notes && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      Notes: {assignment.booking.notes}
                                    </p>
                                  )}
                          </div>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAssignment(assignment);
                                      setShowAssignmentModal(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  {assignment.status === 'assigned' && (
                                    <Button
                                      onClick={() => updateAssignmentStatus(assignment.id, 'accepted')}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      {t('staff.dashboard.assignmentCard.accept')}
                                    </Button>
                                  )}
                                  {assignment.status === 'accepted' && (
                                    <Button
                                      onClick={() => updateAssignmentStatus(assignment.id, 'in_progress')}
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Play className="h-4 w-4 mr-1" />
                                      {t('staff.dashboard.assignmentCard.start')}
                                    </Button>
                                  )}
                                  {assignment.status === 'in_progress' && (
                                    <Button
                                      onClick={() => updateAssignmentStatus(assignment.id, 'completed')}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Square className="h-4 w-4 mr-1" />
                                      {t('staff.dashboard.assignmentCard.complete')}
                                    </Button>
                                  )}
                            </div>
                            </div>
                        </div>
                      ))}
                    </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          {activeTab === 'active' ? t('staff.dashboard.noAssignments') : t('staff.dashboard.noAssignments')}
                        </p>
                  )}
                </div>
              )}
            </div>
          ) : (
                <div className="p-6">
                  {getFilteredAssignments().length > 0 ? (
                    <div className="space-y-4">
                      {getFilteredAssignments().map((assignment) => (
                        <div key={assignment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                    <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {getStatusIcon(assignment.status)}
                                  <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                        </span>
                                {assignment.team && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <Users className="h-3 w-3 mr-1" />
                                    {assignment.team.name}
                        </span>
                                )}
                      </div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {assignment.booking?.service_type || 'Service Assignment'}
                              </h4>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                {new Date((assignment as any).preferred_date || (assignment as any).preferredDate).toLocaleDateString('nl-NL')}
                      </div>
                              <p className="text-sm text-gray-600">
                                Customer: {assignment.booking?.customer_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Address: {assignment.booking?.address}
                              </p>
                              {assignment.booking?.notes && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Notes: {assignment.booking.notes}
                                </p>
                              )}
                          </div>
                            <div className="flex flex-col space-y-2">
                              {/* Quick Action Buttons Based on Status */}
                              {assignment.status === 'assigned' && (
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => updateAssignmentStatus(assignment.id, 'accepted')}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    {t('staff.dashboard.assignmentCard.accept')}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAssignment(assignment);
                                      setShowAssignmentModal(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                          </div>
                              )}
                              {assignment.status === 'accepted' && (
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => updateAssignmentStatus(assignment.id, 'in_progress')}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <Play className="h-4 w-4 mr-1" />
                                    {t('staff.dashboard.assignmentCard.start')}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAssignment(assignment);
                                      setShowAssignmentModal(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                          </div>
                              )}
                              {assignment.status === 'in_progress' && (
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => updateAssignmentStatus(assignment.id, 'completed')}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    {t('staff.dashboard.assignmentCard.complete')}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAssignment(assignment);
                                      setShowAssignmentModal(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              {(assignment.status === 'completed' || assignment.status === 'cancelled') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAssignment(assignment);
                                    setShowAssignmentModal(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        {activeTab === 'active' ? (
                          <Clock className="h-12 w-12 mx-auto" />
                        ) : (
                          <CheckCircle className="h-12 w-12 mx-auto" />
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {activeTab === 'active' ? 'No Active Assignments' : 'No Completed Assignments'}
                      </h3>
                      <p className="text-gray-500">
                        {activeTab === 'active' 
                          ? 'You have no active assignments at the moment.' 
                          : 'You have no completed assignments yet.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Performance View */
          <div className="space-y-6">
            {performanceData ? (
              <>
                {/* Performance Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                          <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                        <p className="text-2xl font-bold text-gray-900">{performanceData.overview.total_assignments}</p>
                      </div>
                          </div>
                        </div>
                        
                  <div className="bg-white rounded-lg shadow p-6">
                          <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{performanceData.overview.completed_assignments}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                          <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                          </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Success Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{performanceData.overview.success_rate}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock className="h-6 w-6 text-orange-600" />
                            </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {performanceData.avgCompletionTime?.avg_hours 
                            ? `${Math.round(performanceData.avgCompletionTime.avg_hours)}h`
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                        </div>
                      </div>
                      
                {/* Service Performance */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Performance</h3>
                  <div className="space-y-4">
                    {performanceData.servicePerformance.map((service: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{service.service_type}</p>
                          <p className="text-sm text-gray-600">
                            {service.completed_assignments} / {service.total_assignments} completed
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{service.success_rate}%</p>
                          <p className="text-sm text-gray-600">Success Rate</p>
                    </div>
                  </div>
                    ))}
                  </div>
                </div>

                {/* Time Performance */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Time</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {performanceData.timePerformance.map((time: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">{time.time_period}</p>
                        <p className="text-2xl font-bold text-gray-900">{time.success_rate}%</p>
                        <p className="text-sm text-gray-600">{time.completed} / {time.assignments} completed</p>
                </div>
              ))}
            </div>
                </div>

                {/* Team Performance */}
                {performanceData.teamPerformance.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
                    <div className="space-y-4">
                      {performanceData.teamPerformance.map((team: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{team.team_name}</p>
                            <p className="text-sm text-gray-600">{team.member_count} members</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{team.team_success_rate}%</p>
                            <p className="text-sm text-gray-600">
                              {team.team_completed} / {team.team_assignments} completed
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading performance data...</p>
        </div>
            )}
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isFirstLogin ? t('common.password') || 'Set Your Password' : t('staff.dashboard.changePassword')}
            </h3>
              <div className="space-y-4">
                {!isFirstLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('dashboard.modals.password.current')}</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
              </div>
            )}
              <div>
                  <label className="block text-sm font-medium text-gray-700">{t('dashboard.modals.password.new')}</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">{t('dashboard.modals.password.confirm')}</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button onClick={handlePasswordChange}>
                  {isFirstLogin ? t('common.password') || 'Set Password' : t('dashboard.modals.password.button')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-1">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('staff.dashboard.editProfile')}</h3>
              {profileLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const res = await fetch('/api/staff/me', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                          name: profileForm.name,
                          phone: profileForm.phone,
                          address: profileForm.address,
                          specialization: profileForm.specialization,
                          experience_years: profileForm.experience_years,
                          // hourly_rate is managed by admin only
                        })
                      });
                      if (!res.ok) throw new Error('Failed to save');
                      const data = await res.json();
                      if (!data.success) throw new Error(data.error || 'Failed to save');
                      toast({ title: 'Success', description: 'Profile updated successfully' });
                      setShowProfileModal(false);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.modals.profile.name')}</label>
                      <Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.modals.profile.phone')}</label>
                      <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.modals.profile.address')}</label>
                      <Input value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.staff.form.specialization')}</label>
                      <Input value={profileForm.specialization} onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })} placeholder="e.g., Deep Cleaning, Window Cleaning" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.staff.form.experience')}</label>
                      <Input type="number" min={0} value={profileForm.experience_years} onChange={(e) => setProfileForm({ ...profileForm, experience_years: parseInt(e.target.value || '0', 10) })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.staff.form.hourlyRate')}</label>
                      <Input type="number" step="0.01" value={profileForm.hourly_rate} disabled title="Contact your admin to update hourly rate" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                  <Button
                    variant="outline"
                      type="button"
                    onClick={() => {
                        setShowProfileModal(false);
                      }}
                  >
                    {t('common.cancel')}
                  </Button>
                    <Button type="submit">{t('dashboard.modals.profile.save')}</Button>
                  </div>
                </form>
                )}
              </div>
            </div>
          </div>
      )}

      {/* Assignment Detail Modal */}
      {showAssignmentModal && selectedAssignment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('dashboard.bookingCard.service')}</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAssignment.booking?.service_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('dashboard.bookingCard.status')}</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAssignment.status)}`}>
                      {getStatusIcon(selectedAssignment.status)}
                      <span className="ml-1 capitalize">{selectedAssignment.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('staff.dashboard.assignmentCard.customer')}</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAssignment.booking?.customer_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAssignment.booking?.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date((selectedAssignment as any).preferred_date || (selectedAssignment as any).preferredDate).toLocaleDateString('nl-NL')}
                  </p>
                </div>
                {selectedAssignment.booking?.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('dashboard.bookingCard.notes')}</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAssignment.booking.notes}</p>
                  </div>
                )}
                {selectedAssignment.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assignment Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAssignment.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                {selectedAssignment.status === 'assigned' && (
                  <Button
                    onClick={() => {
                      updateAssignmentStatus(selectedAssignment.id, 'accepted');
                      setShowAssignmentModal(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Assignment
                  </Button>
                )}
                {selectedAssignment.status === 'accepted' && (
                  <Button
                    onClick={() => {
                      updateAssignmentStatus(selectedAssignment.id, 'in_progress');
                      setShowAssignmentModal(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Assignment
                  </Button>
                )}
                {selectedAssignment.status === 'in_progress' && (
                  <Button
                    onClick={() => {
                      updateAssignmentStatus(selectedAssignment.id, 'completed');
                      setShowAssignmentModal(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedAssignment(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Profile Details Modal */}
      <StaffProfileDetailsModal
        isOpen={showProfileDetailsModal}
        onClose={() => setShowProfileDetailsModal(false)}
        staffDetails={staffDetails}
      />
      </div>
    </ProtectedStaffRoute>
  );
}