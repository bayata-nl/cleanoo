'use client';

import { useState } from 'react';
import { 
  Calendar, 
  Settings, 
  MessageSquare, 
  Users, 
  UserPlus, 
  UserCheck,
  BarChart3
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'operations', label: 'Operations', icon: UserCheck },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'services', label: 'Services', icon: Settings },
  // Testimonials removed per requirements
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'teams', label: 'Teams', icon: UserPlus },
];

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <div className="mb-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
