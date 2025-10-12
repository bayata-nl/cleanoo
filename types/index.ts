export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  password: string;
  email_verified: boolean;
  verification_token?: string;
  token_expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface BookingForm {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  createdAt: Date;
  updatedAt?: Date;
  status: 'pending_verification' | 'pending_password' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  verification_token?: string;
  verified_at?: Date;
  userId?: string | null;
  notes?: string;
  cancellationReason?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  price?: string;
}

export interface Personnel {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: 'cleaner' | 'supervisor' | 'manager';
  status: 'active' | 'inactive' | 'on_leave';
  specialization?: string;
  experience_years: number;
  hourly_rate?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  team_leader_id?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
  team_leader?: Personnel;
  members?: TeamMember[];
  member_count?: number;
  team_leader_name?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  staff_id: string;
  role_in_team: 'leader' | 'member' | 'specialist';
  joined_at: Date;
  staff?: Personnel;
}

export interface Assignment {
  id: string;
  booking_id: string;
  team_id?: string;
  staff_id?: string;
  assigned_by: string;
  assignment_type: 'team' | 'individual';
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  assigned_at: Date;
  accepted_at?: Date;
  completed_at?: Date;
  notes?: string;
  booking?: BookingForm;
  team?: Team;
  staff?: Personnel;
  assigned_by_staff?: Personnel;
  customer_name?: string;
  customer_email?: string;
  preferred_date?: string;
  preferred_time?: string;
  team_name?: string;
  staff_name?: string;
  service_type?: string;
} 

// Database row helpers (snake_case as stored in SQLite)
export interface BookingDbRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string | null;
  status: 'pending_verification' | 'pending_password' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  verification_token?: string | null;
  verified_at?: string | null;
  user_id?: number | null;
  created_at: string;
  updated_at?: string | null;
}