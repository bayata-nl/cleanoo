'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface AdminLayoutProps {
  children: ReactNode;
  onLogout: () => void;
  userName?: string;
}

export default function AdminLayout({ children, onLogout, userName }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center group">
              <Sparkles className="h-8 w-8 text-blue-600 mr-3 group-hover:scale-105 transition-transform" />
              <h1 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700">Admin Panel</h1>
            </Link>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {userName && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
