'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Search, Mail, Phone, MapPin, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { User } from '@/types';

interface CustomersTabProps {
  users: User[];
  bookings: any[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
}

export default function CustomersTab({ users, bookings, loading, fetchUsers }: CustomersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Customer statistics
  const customerStats = useMemo(() => {
    return users.map(user => {
      const userBookings = bookings.filter(b => b.email === user.email);
      const completedBookings = userBookings.filter(b => b.status === 'completed');
      const totalSpent = userBookings
        .filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + (b.payment_amount || 0), 0);
      
      return {
        ...user,
        totalBookings: userBookings.length,
        completedBookings: completedBookings.length,
        pendingBookings: userBookings.filter(b => !['completed', 'cancelled'].includes(b.status)).length,
        totalSpent,
        lastBooking: userBookings.length > 0 
          ? new Date(Math.max(...userBookings.map(b => new Date(b.createdAt || b.created_at).getTime())))
          : null,
      };
    });
  }, [users, bookings]);

  // Search filter
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customerStats;
    
    const query = searchQuery.toLowerCase();
    return customerStats.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone?.includes(query)
    );
  }, [customerStats, searchQuery]);

  // Overall stats
  const overallStats = useMemo(() => ({
    total: users.length,
    verified: users.filter(u => u.email_verified).length,
    active: customerStats.filter(c => c.totalBookings > 0).length,
    returning: customerStats.filter(c => c.totalBookings > 1).length,
    totalRevenue: customerStats.reduce((sum, c) => sum + c.totalSpent, 0),
    avgBookingsPerCustomer: users.length > 0 
      ? (bookings.length / users.length).toFixed(1)
      : '0',
  }), [users, customerStats, bookings]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customers Management</h2>
        <Button onClick={fetchUsers} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-xs font-medium text-blue-700 uppercase">Total Customers</p>
          <p className="text-2xl font-bold text-blue-900">{overallStats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-xs font-medium text-green-700 uppercase">Verified</p>
          <p className="text-2xl font-bold text-green-900">{overallStats.verified}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-xs font-medium text-purple-700 uppercase">Active</p>
          <p className="text-2xl font-bold text-purple-900">{overallStats.active}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <p className="text-xs font-medium text-orange-700 uppercase">Returning</p>
          <p className="text-2xl font-bold text-orange-900">{overallStats.returning}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
          <p className="text-xs font-medium text-emerald-700 uppercase">Total Revenue</p>
          <p className="text-xl font-bold text-emerald-900">€{overallStats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
          <p className="text-xs font-medium text-indigo-700 uppercase">Avg Bookings</p>
          <p className="text-2xl font-bold text-indigo-900">{overallStats.avgBookingsPerCustomer}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            Showing {filteredCustomers.length} of {users.length} customers
          </p>
        )}
      </div>

      {/* Customers Table */}
      {users.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No customers found.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phone}</div>
                      {customer.address && (
                        <div className="text-xs text-gray-500 mt-1">{customer.address.substring(0, 30)}...</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-semibold">{customer.totalBookings}</span> total
                      </div>
                      <div className="text-xs text-gray-500">
                        {customer.completedBookings} completed, {customer.pendingBookings} pending
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        €{customer.totalSpent.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.email_verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                      {customer.totalBookings > 1 && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Returning
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                  <p className="text-sm text-blue-100">{selectedCustomer.email}</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </label>
                  <p className="text-sm text-gray-900">{selectedCustomer.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone
                  </label>
                  <p className="text-sm text-gray-900">{selectedCustomer.phone}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Address
                  </label>
                  <p className="text-sm text-gray-900">{selectedCustomer.address || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Member Since
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedCustomer.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Verified
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedCustomer.email_verified ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 uppercase font-medium">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-900">{selectedCustomer.totalBookings}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-green-600 uppercase font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{selectedCustomer.completedBookings}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-xs text-yellow-600 uppercase font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">{selectedCustomer.pendingBookings}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-xs text-emerald-600 uppercase font-medium">Total Spent</p>
                  <p className="text-xl font-bold text-emerald-900">€{selectedCustomer.totalSpent.toFixed(2)}</p>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Bookings</h4>
                <div className="space-y-2">
                  {bookings
                    .filter(b => b.email === selectedCustomer.email)
                    .slice(0, 5)
                    .map((booking, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{booking.serviceType}</p>
                          <p className="text-xs text-gray-600">{booking.preferredDate} - {booking.status}</p>
                        </div>
                        {booking.payment_status === 'paid' && (
                          <span className="text-xs font-semibold text-green-600">
                            €{booking.payment_amount}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button onClick={() => setSelectedCustomer(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  <p className="text-xs text-gray-500">{customer.email}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedCustomer(customer)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 font-medium">Bookings</p>
                <p className="text-lg font-bold text-blue-900">{customer.totalBookings}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 font-medium">Spent</p>
                <p className="text-lg font-bold text-green-900">€{customer.totalSpent.toFixed(0)}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
              <span>
                {customer.email_verified ? '✅ Verified' : '⏳ Pending'}
              </span>
              {customer.totalBookings > 1 && (
                <span className="text-purple-600 font-medium">
                  ⭐ Returning
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

