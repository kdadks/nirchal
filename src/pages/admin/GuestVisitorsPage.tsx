import React, { useState, useEffect } from 'react';
import { UserCheck, Mail, Phone, Calendar, Clock, Globe } from 'lucide-react';
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
  city: string | null;
  country: string | null;
  ip_address: string | null;
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
          created_at,
          city,
          country,
          ip_address
        `)
        .order('last_visit', { ascending: false});

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
    // Filter out "Unknown" browser or OS
    if (visitor.browser === 'Unknown' || visitor.os === 'Unknown') {
      return false;
    }
    
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

      {/* Location Analytics - Pie Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Globe className="h-6 w-6 text-primary-600 mr-3" />
          <h2 className="text-lg font-semibold text-gray-900">Guests by Location</h2>
        </div>
        <LocationPieChart visitors={uniqueVisitors} />
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
                        {(visitor.city || visitor.country) && (
                          <div className="text-xs text-gray-600 font-medium mt-1">
                            📍 {[visitor.city, visitor.country].filter(Boolean).join(', ')}
                          </div>
                        )}
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

// Pie Chart Component for Location Analytics
interface LocationPieChartProps {
  visitors: GuestVisitor[];
}

const LocationPieChart: React.FC<LocationPieChartProps> = ({ visitors }) => {
  // Aggregate visitors by country/state, filtering out Unknown locations
  const locationData = visitors.reduce((acc, visitor) => {
    // Use country if available, otherwise city - skip if neither exists
    const location = visitor.country || visitor.city;
    if (!location) return acc; // Skip entries without location data
    
    const existing = acc.find(item => item.location === location);
    
    if (existing) {
      existing.count++;
    } else {
      acc.push({ location, count: 1 });
    }
    return acc;
  }, [] as Array<{ location: string; count: number }>)
  .sort((a, b) => b.count - a.count)
  .slice(0, 8); // Show top 8 locations

  const total = locationData.reduce((sum, item) => sum + item.count, 0);
  const visitorsWithoutLocation = visitors.length - total;
  
  // Color palette for pie slices
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#f97316'
  ];

  // Calculate pie chart data with SVG paths
  let currentAngle = -Math.PI / 2; // Start at top
  const radius = 80;
  const centerX = 120;
  const centerY = 120;

  const slices = locationData.map((item, index) => {
    const sliceAngle = (item.count / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    // Calculate label position
    const labelAngle = startAngle + sliceAngle / 2;
    const labelRadius = radius * 0.65;
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);

    currentAngle = endAngle;

    return {
      path,
      color: colors[index % colors.length],
      location: item.location,
      count: item.count,
      percentage: Math.round((item.count / total) * 100),
      labelX,
      labelY
    };
  });

  if (locationData.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-500">No location data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Pie Chart */}
      <div className="lg:col-span-2 flex justify-center items-center py-4">
        <svg width="200" height="200" viewBox="0 0 240 240" className="drop-shadow-sm">
          {slices.map((slice, index) => (
            <g key={index}>
              <path
                d={slice.path}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
                opacity="0.85"
              />
              {slice.percentage >= 5 && (
                <text
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor="middle"
                  dy="0.3em"
                  className="text-xs font-semibold fill-white"
                  style={{ pointerEvents: 'none' }}
                >
                  {slice.percentage}%
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-1 overflow-y-auto max-h-72">
        <p className="text-xs font-semibold text-gray-700 mb-3 px-1">Top Locations</p>
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center justify-between px-1 py-1.5 rounded hover:bg-gray-50 group">
            <div className="flex items-center flex-1 min-w-0">
              <div
                className="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: slice.color }}
              ></div>
              <p className="text-xs text-gray-900 truncate font-medium">
                {slice.location}
              </p>
            </div>
            <span className="ml-2 text-xs font-semibold text-gray-600 flex-shrink-0">
              {slice.percentage}%
            </span>
          </div>
        ))}
        {visitorsWithoutLocation > 0 && (
          <div className="flex items-center justify-between px-1 py-1.5 rounded hover:bg-gray-50 text-gray-500 border-t border-gray-100 mt-2 pt-2">
            <span className="text-xs">No location</span>
            <span className="text-xs font-semibold">
              {Math.round((visitorsWithoutLocation / visitors.length) * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestVisitorsPage;
