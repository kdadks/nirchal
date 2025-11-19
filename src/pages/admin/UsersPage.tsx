import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Mail, Phone, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAdminSearch } from '../../contexts/AdminSearchContext';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/common/Pagination';
import CustomerDetailsModal from '../../components/admin/CustomerDetailsModal';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  password_change_required?: boolean;
  temp_password_created_at?: string;
}

const UsersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { searchTerm } = useAdminSearch();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          is_active,
          created_at,
          password_change_required,
          temp_password_created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCustomers((data as any) || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search term
  const filteredCustomers = React.useMemo(() => {
    if (!searchTerm) return customers;
    
    const searchLower = searchTerm.toLowerCase();
    return customers.filter(customer => {
      const matchesName = `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchLower);
      const matchesEmail = customer.email.toLowerCase().includes(searchLower);
      const matchesPhone = customer.phone?.toLowerCase().includes(searchLower);
      
      return matchesName || matchesEmail || matchesPhone;
    });
  }, [customers, searchTerm]);

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: paginatedCustomers,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    data: filteredCustomers,
    defaultItemsPerPage: 25,
  });

  const toggleCustomerStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      setUpdating(customerId);
      const { error } = await supabase
        .from('customers')
        .update({ is_active: !currentStatus })
        .eq('id', customerId);

      if (error) throw error;

      // Update local state
      setCustomers(customers.map(customer => 
        customer.id === customerId 
          ? { ...customer, is_active: !currentStatus }
          : customer
      ));
    } catch (err) {
      console.error('Error updating customer status:', err);
      toast.error('Failed to update customer status');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const activeCustomers = customers.filter(customer => customer.is_active);
  const tempPasswordCustomers = customers.filter(customer => customer.password_change_required);
  const newCustomers = customers.filter(customer => {
    const createdDate = new Date(customer.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate > weekAgo;
  });

  if (loading) {
    return (
      <div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCustomers}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{activeCustomers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Temp Passwords</p>
              <p className="text-2xl font-bold text-gray-900">{tempPasswordCustomers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <UserX className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New This Week</p>
              <p className="text-2xl font-bold text-gray-900">{newCustomers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Customer List</h2>
        </div>
        <div className="overflow-x-auto">
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No customers found</p>
            </div>
          ) : (
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {getInitials(customer.first_name, customer.last_name)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => {
                              setSelectedCustomerId(customer.id);
                              setShowDetailsModal(true);
                            }}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition"
                          >
                            {customer.first_name} {customer.last_name}
                          </button>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center mt-1">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md uppercase w-20 min-w-20 ${
                          customer.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {customer.password_change_required && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md uppercase bg-yellow-100 text-yellow-800 w-20 min-w-20">
                            Temp Password
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(customer.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleCustomerStatus(customer.id, customer.is_active)}
                        disabled={updating === customer.id}
                        className={`px-3 py-1 rounded text-xs font-medium disabled:opacity-50 ${
                          customer.is_active
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {updating === customer.id 
                          ? 'Updating...' 
                          : customer.is_active 
                            ? 'Deactivate' 
                            : 'Activate'
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCustomerId(null);
        }}
        customerId={selectedCustomerId || ''}
      />
    </div>
  );
};

export default UsersPage;
