'use client';

import { useState, useCallback } from 'react';
import { BookingForm, Personnel, Team, Assignment, Service } from '@/types';

export function useAdminData() {
  const [bookings, setBookings] = useState<BookingForm[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Personnel[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setBookings(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setServices(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const response = await fetch('/api/staff');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStaff(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTeams(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await fetch('/api/assignments');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAssignments(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBookings(),
        fetchServices(),
        fetchStaff(),
        fetchTeams(),
        fetchAssignments()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchBookings, fetchServices, fetchStaff, fetchTeams, fetchAssignments]);

  return {
    // Data
    bookings,
    services,
    staff,
    teams,
    assignments,
    loading,
    
    // Setters
    setBookings,
    setServices,
    setStaff,
    setTeams,
    setAssignments,
    
    // Fetch functions
    fetchBookings,
    fetchServices,
    fetchStaff,
    fetchTeams,
    fetchAssignments,
    fetchAllData
  };
}
