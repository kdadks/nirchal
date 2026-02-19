import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, DollarSign, Package, Filter, Search, RefreshCw } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { formatCurrency } from '../../utils/formatCurrency';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

interface AbandonedCart {
  id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  cart_items: any[];
  total_items: number;
  total_value: number;
  abandoned_at: string;
  status: 'abandoned' | 'recovered' | 'expired' | 'contacted' | 'payment_failed';
  email_sent: boolean;
  sms_sent: boolean;
  notes: string | null;
  created_at: string;
}

const AbandonedCartsPage: React.FC = () => {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);

  const fetchAbandonedCarts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('abandoned_carts')
        .select('*')
        .order('abandoned_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setCarts((data as unknown as AbandonedCart[]) || []);
    } catch (error) {
      console.error('Error fetching abandoned carts:', error);
      toast.error('Failed to load abandoned carts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbandonedCarts();
  }, [statusFilter]);

  const filteredCarts = carts.filter(cart => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      cart.guest_name.toLowerCase().includes(term) ||
      cart.guest_email?.toLowerCase().includes(term) ||
      cart.guest_phone?.includes(term)
    );
  });

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: paginatedCarts,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    data: filteredCarts,
    defaultItemsPerPage: 25,
  });

  const updateCartStatus = async (cartId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('abandoned_carts')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', cartId);

      if (error) throw error;

      toast.success(`Cart status updated to ${newStatus}`);
      fetchAbandonedCarts();
    } catch (error) {
      console.error('Error updating cart status:', error);
      toast.error('Failed to update cart status');
    }
  };

  const markEmailSent = async (cartId: string) => {
    try {
      const { error } = await supabase
        .from('abandoned_carts')
        .update({ 
          email_sent: true, 
          email_sent_at: new Date().toISOString(),
          status: 'contacted',
          updated_at: new Date().toISOString()
        })
        .eq('id', cartId);

      if (error) throw error;

      toast.success('Email marked as sent');
      fetchAbandonedCarts();
    } catch (error) {
      console.error('Error marking email as sent:', error);
      toast.error('Failed to update email status');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'abandoned':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'recovered':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'payment_failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Abandoned Carts ({totalItems})
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Track and recover abandoned shopping carts
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 text-xs font-medium rounded-md ${
                  showFilters ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-700'
                } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </button>
              <button
                onClick={fetchAbandonedCarts}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-xs font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="payment_failed">Payment Failed</option>
                  <option value="abandoned">Abandoned</option>
                  <option value="contacted">Contacted</option>
                  <option value="recovered">Recovered</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, phone..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading abandoned carts...</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cart Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abandoned
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCarts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      No abandoned carts found
                    </td>
                  </tr>
                ) : (
                  paginatedCarts.map((cart) => (
                    <tr key={cart.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{cart.guest_name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {cart.guest_email && (
                            <div className="flex items-center text-xs">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              {cart.guest_email}
                            </div>
                          )}
                          {cart.guest_phone && (
                            <div className="flex items-center text-xs mt-1">
                              <Phone className="h-3 w-3 mr-1 text-gray-400" />
                              {cart.guest_phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <Package className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="mr-2">{cart.total_items} items</span>
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                          {formatCurrency(cart.total_value)}
                        </div>
                        <button
                          onClick={() => setSelectedCart(cart)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                        >
                          View items
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(cart.abandoned_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(cart.abandoned_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(cart.status)}`}>
                          {cart.status === 'payment_failed' ? 'Payment Failed' : cart.status}
                        </span>
                        {cart.notes && (
                          <div className="text-xs text-gray-500 mt-1 max-w-[160px] truncate" title={cart.notes}>
                            {cart.notes}
                          </div>
                        )}
                        {cart.email_sent && (
                          <div className="text-xs text-gray-500 mt-1">✓ Email sent</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex flex-col gap-1">
                          {cart.guest_email && !cart.email_sent && (
                            <button
                              onClick={() => markEmailSent(cart.id)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Mark Email Sent
                            </button>
                          )}
                          {(cart.status === 'abandoned' || cart.status === 'payment_failed') && (
                            <button
                              onClick={() => updateCartStatus(cart.id, 'recovered')}
                              className="text-xs text-green-600 hover:text-green-800"
                            >
                              Mark Recovered
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && paginatedCarts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Cart Items Modal */}
      {selectedCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Cart Items</h3>
              <button
                onClick={() => setSelectedCart(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {selectedCart.cart_items.map((item: any, index: number) => (
                  <div key={index} className="flex gap-3 border-b pb-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                      {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                      <p className="text-sm text-gray-900 mt-1">
                        {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(selectedCart.total_value)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbandonedCartsPage;
