'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAdminData } from '@/hooks/useAdminData';
import { useAdminModals } from '@/hooks/useAdminModals';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ServicesTab from '@/components/admin/tabs/ServicesTab';
import StaffTab from '@/components/admin/tabs/StaffTab';
import TeamsTab from '@/components/admin/tabs/TeamsTab';
import OperationsTab from '@/components/admin/tabs/OperationsTab';
import AnalyticsTab from '@/components/admin/tabs/AnalyticsTab';
import CustomersTab from '@/components/admin/tabs/CustomersTab';

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('operations');
  
  const adminData = useAdminData();
  const adminModals = useAdminModals();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include' // Include cookies
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setIsAuthenticated(true);
          adminData.fetchAllData();
        } else {
          router.push('/admin/login');
        }
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      router.push('/admin/login');
    }
  };

  const handleLogout = async () => {
    try {
      // Clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear any stored auth data
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'services':
        return <ServicesTab {...adminData} {...adminModals} />;
      case 'customers':
        return <CustomersTab users={adminData.users} bookings={adminData.bookings} loading={adminData.loading} fetchUsers={adminData.fetchUsers} />;
      case 'staff':
        return <StaffTab {...adminData} {...adminModals} />;
      case 'teams':
        return <TeamsTab {...adminData} {...adminModals} />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'operations':
        return <OperationsTab {...adminData} />;
      default:
        return <OperationsTab {...adminData} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout onLogout={handleLogout} userName="Admin">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTabContent()}
    </AdminLayout>
  );
}
