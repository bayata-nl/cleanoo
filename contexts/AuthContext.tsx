'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { email: string; password: string; phone: string; address: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Demo: client-side fake auth retained for non-staff users
      const userData: User = { 
        id: Date.now().toString(), 
        name: email.split('@')[0] || 'User', // Use email prefix as name
        email, 
        phone: '' // Default empty phone
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast({ title: "Login Successful", description: "Welcome back!" });
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message || "Invalid email or password", variant: "destructive" });
      throw error;
    }
  };

  const signUp = async (data: { email: string; password: string; phone: string; address: string }) => {
    try {
      // Simple registration - in production, you'd save to your database
      const userData: User = {
        id: Date.now().toString(),
        name: data.email.split('@')[0] || 'User',
        email: data.email,
        phone: data.phone || '',
        address: data.address || ''
      };

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      toast({
        title: "Account Created",
        description: "Welcome to Cleanoo!",
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Başlat: Custom Google OAuth flow
      if (typeof window !== 'undefined') {
        window.location.href = '/api/auth/google';
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    try {
      // Remove from localStorage
      localStorage.removeItem('user');
      setUser(null);

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signInWithGoogle, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
