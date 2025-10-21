import React, { useState, useEffect } from 'react';
import { UserCheck, Mail, Phone, Calendar, Clock } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAdminSearch } from '../../contexts/AdminSearchContext';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

interface GuestVisitor {
  id: string;
  visitor_id: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  browser: string;
  os: string;
  device_type: string;
  screen_resolution: string;
  referrer: string;
  pages_visited: number;
  time_spent: number;
  visit_count: number;
  first_visit: string;
  last_visit: string;
  info_captured: boolean;
  created_at: string;
}

const GuestVisitorsPage: React.FC = () => {
  const [visitors, setVisitors] = useState<GuestVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { searchTerm } = useAdminSearch();

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guest_visitors')
        .select(`
          id,
          visitor_id,
          guest_name,
          guest_email,
          guest_phone,
          browser,
          os,
          device_type,
          screen_resolution,
          referrer,
          pages_visited,
          time_spent,
          visit_count,
          first_visit,
          last_visit,
          info_captured,
          created_at
        `)
        .order('last_visit', { ascending: false });

      if (error) throw error;

      setVisitors((data as any) || []);
    } catch (err) {
      console.error('Error fetching guest visitors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load guest visitors');
      toast.error('Failed to load guest visitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // Filter visitors based on search term
  const filteredVisitors = visitors.filter(visitor => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      visitor.guest_name?.toLowerCase().includes(search) ||
      visitor.guest_email?.toLowerCase().includes(search) ||
      visitor.guest_phone?.includes(search)
    );
  });

  // Get unique guest visitors (by email or phone)
  const uniqueVisitors = filteredVisitors.reduce((acc, visitor) => {
    const existing = acc.find(v => 
      (visitor.guest_email && v.guest_email === visitor.guest_email) ||
      (visitor.guest_phone && v.guest_phone === visitor.guest_phone)
    );
    
    if (!existing) {
      acc.push(visitor);
    }
    return acc;
  }, [] as GuestVisitor[]);

  // Pagination
  const { currentPage, totalPages, paginatedData: paginatedItems, totalItems, itemsPerPage, setCurrentPage, setItemsPerPage } =
    usePagination({ data: uniqueVisitors, defaultItemsPerPage: 25 });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserCheck className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Guest Visitors</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track and manage guest visitors who have interacted with your store
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary-600">{uniqueVisitors.length}</p>
            <p className="text-sm text-gray-500">Total Guests</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">With Contact Info</p>
              <p className="text-2xl font-bold text-gray-900">
                {uniqueVisitors.filter(v => v.info_captured).length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Returning Visitors</p>
              <p className="text-2xl font-bold text-gray-900">
                {uniqueVisitors.filter(v => (v.visit_count || 0) > 1).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mobile Visitors</p>
              <p className="text-2xl font-bold text-gray-900">
                {uniqueVisitors.filter(v => v.device_type === 'Mobile').length}
              </p>
            </div>
            <Phone className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Time on Site</p>
              <p className="text-2xl font-bold text-gray-900">
                {visitors.length > 0 
                  ? Math.round(visitors.reduce((sum, v) => sum + (v.time_spent || 0), 0) / visitors.length / 60) 
                  : 0}m
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Visitors Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitor Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device / Browser
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-lg font-medium">No guest visitors found</p>
                    <p className="text-sm">Guest visitors will appear here once they visit your site</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {visitor.guest_name || 'Anonymous Visitor'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {visitor.visit_count || 1} {visitor.visit_count === 1 ? 'visit' : 'visits'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {visitor.guest_email && (
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            {visitor.guest_email}
                          </div>
                        )}
                        {visitor.guest_phone && (
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            {visitor.guest_phone}
                          </div>
                        )}
                        {!visitor.guest_email && !visitor.guest_phone && (
                          <span className="text-sm text-gray-400">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          {visitor.device_type} • {visitor.browser}
                        </div>
                        <div className="text-xs text-gray-500">
                          {visitor.os} • {visitor.screen_resolution}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          {visitor.pages_visited || 0} pages
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round((visitor.time_spent || 0) / 60)}m on site
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(visitor.last_visit)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              showItemsPerPage={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestVisitorsPage;
