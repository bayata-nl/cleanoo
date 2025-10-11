'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Personnel {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'cleaner' | 'supervisor' | 'manager';
  status: 'active' | 'inactive' | 'on_leave';
  specialization?: string;
  experience_years: number;
  hourly_rate?: number;
}

interface PersonnelAuthContextType {
  personnel: Personnel | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const PersonnelAuthContext = createContext<PersonnelAuthContextType | undefined>(undefined);

export function PersonnelAuthProvider({ children }: { children: React.ReactNode }) {
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if personnel is logged in
    const savedPersonnel = localStorage.getItem('personnel');
    if (savedPersonnel) {
      try {
        setPersonnel(JSON.parse(savedPersonnel));
      } catch (error) {
        localStorage.removeItem('personnel');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if personnel exists with this email
      const response = await fetch('/api/personnel');
      const result = await response.json();
      
      if (!result.success) return false;
      
      const foundPersonnel = result.data.find((p: Personnel) => p.email === email);
      
      if (foundPersonnel && foundPersonnel.status === 'active') {
        // Check password - in production, use proper hashing
        if (password === foundPersonnel.password) {
          setPersonnel(foundPersonnel);
          localStorage.setItem('personnel', JSON.stringify(foundPersonnel));
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setPersonnel(null);
    localStorage.removeItem('personnel');
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    try {
      if (!personnel) return false;

      const response = await fetch(`/api/personnel/${personnel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) return false;

      const result = await response.json();
      if (!result.success) return false;

      // Update local personnel data
      const updatedPersonnel = { ...personnel, password: newPassword };
      setPersonnel(updatedPersonnel);
      localStorage.setItem('personnel', JSON.stringify(updatedPersonnel));

      return true;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  };

  return (
    <PersonnelAuthContext.Provider value={{ personnel, login, logout, changePassword, isLoading }}>
      {children}
    </PersonnelAuthContext.Provider>
  );
}

export function usePersonnelAuth() {
  const context = useContext(PersonnelAuthContext);
  if (context === undefined) {
    throw new Error('usePersonnelAuth must be used within a PersonnelAuthProvider');
  }
  return context;
}
