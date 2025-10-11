'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  status: string;
  specialization?: string;
  experience_years: number;
  hourly_rate?: number;
}

interface StaffAuthContextType {
  staff: Staff | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing staff session
    const savedStaff = localStorage.getItem('staff');
    if (savedStaff) {
      try {
        setStaff(JSON.parse(savedStaff));
      } catch (error) {
        console.error('Error parsing saved staff:', error);
        localStorage.removeItem('staff');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) return false;
      const result = await response.json();
      if (!result.success || !result.user) return false;

      setStaff(result.user);
      localStorage.setItem('staff', JSON.stringify(result.user));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setStaff(null);
    localStorage.removeItem('staff');
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    try {
      if (!staff) return false;

      const response = await fetch(`/api/staff/${staff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
        credentials: 'include',
      });

      if (!response.ok) return false;

      const result = await response.json();
      if (!result.success) return false;

      // Do not store password on client
      const updatedStaff = { ...staff } as Staff;
      setStaff(updatedStaff);
      localStorage.setItem('staff', JSON.stringify(updatedStaff));
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  };

  return (
    <StaffAuthContext.Provider value={{ staff, login, logout, changePassword, isLoading }}>
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
}

