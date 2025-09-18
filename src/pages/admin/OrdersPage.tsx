import React, { useState, useEffect } from 'react';
import { Package, Clock, IndianRupee, CheckCircle, Truck, XCircle, PlayCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAdminSearch } from '../../contexts/AdminSearchContext';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/common/Pagination';
import OrderEditModal from '../../components/admin/OrderEditModal';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  billing_phone: string;
  customer_id: string;
  logistics_partner_id?: string;
  tracking_number?: string;
  shipped_at?: string;
  logistics_partners?: {
    name: string;
    tracking_url_template: string;
  }[];
}
import toast from 'react-hot-toast';
import { transactionalEmailService } from '../../services/transactionalEmailService';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { searchTerm } = useAdminSearch();
  
  // Filter states
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          created_at,
          billing_first_name,
          billing_last_name,
          billing_email,
          billing_phone,
          customer_id,
          logistics_partner_id,
          tracking_number,
          shipped_at,
          logistics_partners(
            name,
            tracking_url_template
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders((data as any) || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on selected filters and search term
  const filteredOrders = orders.filter((order) => {
    const orderStatusMatch = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    const paymentStatusMatch = paymentStatusFilter === 'all' || order.payment_status === paymentStatusFilter;
    
    // Search term filter
    let searchMatch = true;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesOrderNumber = order.order_number.toLowerCase().includes(searchLower);
      const matchesCustomerName = `${order.billing_first_name} ${order.billing_last_name}`.toLowerCase().includes(searchLower);
      const matchesEmail = order.billing_email.toLowerCase().includes(searchLower);
      const matchesPhone = order.billing_phone?.toLowerCase().includes(searchLower) || false;
      const matchesTracking = order.tracking_number?.toLowerCase().includes(searchLower) || false;
      
      searchMatch = matchesOrderNumber || matchesCustomerName || matchesEmail || matchesPhone || matchesTracking;
    }
    
    return orderStatusMatch && paymentStatusMatch && searchMatch;
  });

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: paginatedOrders,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    data: filteredOrders,
    defaultItemsPerPage: 50,
  });

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId);
      
      // Get the order details for email - include logistics partner info for shipping emails
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          billing_email,
          billing_first_name,
          billing_last_name,
          total_amount,
          created_at,
          tracking_number,
          logistics_partner_id,
          logistics_partners(
            name,
            tracking_url_template
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Send appropriate email based on status
      try {
        if (newStatus === 'processing') {
          // Send order confirmation email when admin processes the order
          await transactionalEmailService.sendOrderConfirmationEmail({
            id: (orderData as any).id,
            order_number: (orderData as any).order_number,
            customer_name: `${(orderData as any).billing_first_name} ${(orderData as any).billing_last_name}`,
            customer_email: (orderData as any).billing_email,
            total_amount: (orderData as any).total_amount,
            status: 'confirmed',
            items: [] // Items will be fetched in the email service if needed
          });

        } else if (newStatus === 'shipped' && (orderData as any).tracking_number) {
          // Send specialized shipping email with tracking details
          await transactionalEmailService.sendShippingEmail({
            id: (orderData as any).id,
            order_number: (orderData as any).order_number,
            customer_name: `${(orderData as any).billing_first_name} ${(orderData as any).billing_last_name}`,
            customer_email: (orderData as any).billing_email,
            total_amount: (orderData as any).total_amount,
            status: newStatus,
            tracking_number: (orderData as any).tracking_number,
            logistics_partner: (orderData as any).logistics_partners?.[0] ? {
              name: (orderData as any).logistics_partners[0].name,
              tracking_url_template: (orderData as any).logistics_partners[0].tracking_url_template
            } : undefined
          });

        } else {
          // Send regular order status update email for other status changes
          await transactionalEmailService.sendOrderStatusUpdateEmail({
            id: (orderData as any).id,
            order_number: (orderData as any).order_number,
            customer_name: `${(orderData as any).billing_first_name} ${(orderData as any).billing_last_name}`,
            customer_email: (orderData as any).billing_email,
            total_amount: (orderData as any).total_amount,
            status: newStatus,
            tracking_number: (orderData as any).tracking_number
          });

        }
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't block the status update if email fails
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleOrderUpdate = () => {
    fetchOrders(); // Refresh the orders list
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      case 'partially_refunded':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
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

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const processingOrders = orders.filter(order => order.status === 'processing');
  const shippedOrders = orders.filter(order => order.status === 'shipped');
  const deliveredOrders = orders.filter(order => order.status === 'delivered');
  const cancelledOrders = orders.filter(order => order.status === 'cancelled');
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

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
            onClick={fetchOrders}
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <PlayCircle className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-gray-900">{processingOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Shipped</p>
              <p className="text-2xl font-bold text-gray-900">{shippedOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{deliveredOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">{cancelledOrders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <IndianRupee className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <IndianRupee className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(pendingOrders.reduce((sum, order) => sum + order.total_amount, 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <IndianRupee className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(deliveredOrders.reduce((sum, order) => sum + order.total_amount, 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <IndianRupee className="h-8 w-8 text-gray-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.length > 0 ? formatCurrency(totalRevenue / orders.length) : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  id="orderStatus"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  id="paymentStatus"
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="all">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="partially_refunded">Partially Refunded</option>
                </select>
              </div>
              
              <button
                onClick={() => {
                  setOrderStatusFilter('all');
                  setPaymentStatusFilter('all');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Filter Results Indicator */}
          {(orderStatusFilter !== 'all' || paymentStatusFilter !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filteredOrders.length} of {orders.length} orders
                {orderStatusFilter !== 'all' && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Order: {orderStatusFilter}
                  </span>
                )}
                {paymentStatusFilter !== 'all' && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Payment: {paymentStatusFilter}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOrderClick(order.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                      >
                        {order.order_number}
                      </button>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.billing_first_name} {order.billing_last_name}
                      </div>
                      {order.billing_phone && (
                        <div className="text-xs text-gray-500">{order.billing_phone}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md w-20 min-w-20 uppercase ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md w-24 min-w-24 uppercase ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {order.tracking_number ? (
                        <div className="space-y-1">
                          <div className="font-medium text-xs">{order.tracking_number}</div>
                          {order.logistics_partners?.[0] && (
                            <>
                              <div className="text-xs text-gray-500">{order.logistics_partners[0].name}</div>
                              {order.logistics_partners[0].tracking_url_template && (
                                <a
                                  href={order.logistics_partners[0].tracking_url_template.replace('{tracking_number}', order.tracking_number)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs underline"
                                >
                                  Track Package
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No tracking</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                            disabled={updating === order.id}
                            className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50 transition-colors w-16 min-w-16"
                          >
                            {updating === order.id ? 'Updating...' : 'Process'}
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <div className="relative group">
                            <button
                              onClick={() => updateOrderStatus(order.id, 'shipped')}
                              disabled={updating === order.id || !order.tracking_number}
                              className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium transition-colors w-16 min-w-16 ${
                                !order.tracking_number 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-purple-100 text-purple-800 hover:bg-purple-200 disabled:opacity-50'
                              }`}
                            >
                              {updating === order.id ? 'Updating...' : 'Ship'}
                            </button>
                            {!order.tracking_number && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                Add tracking number to enable shipping
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            )}
                          </div>
                        )}
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            disabled={updating === order.id}
                            className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 transition-colors w-16 min-w-16"
                          >
                            {updating === order.id ? 'Updating...' : 'Deliver'}
                          </button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            disabled={updating === order.id}
                            className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50 transition-colors w-16 min-w-16"
                          >
                            {updating === order.id ? 'Updating...' : 'Cancel'}
                          </button>
                        )}
                      </div>
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

      {/* Order Edit Modal */}
      {selectedOrderId && (
        <OrderEditModal
          orderId={selectedOrderId}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onUpdate={handleOrderUpdate}
        />
      )}
    </div>
  );
};

export default OrdersPage;
