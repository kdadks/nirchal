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
  // COD fields
  cod_amount?: number;
  cod_collected?: boolean;
  online_amount?: number;
  payment_split?: boolean;
  // Return request tracking
  has_return_request?: boolean;
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
  const [codFilter, setCodFilter] = useState<string>('all'); // all, pending_cod, collected_cod

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
          cod_amount,
          cod_collected,
          online_amount,
          payment_split,
          has_return_request,
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
    
    // COD filter logic
    let codMatch = true;
    if (codFilter === 'pending_cod') {
      codMatch = (order.cod_amount ?? 0) > 0 && !order.cod_collected;
    } else if (codFilter === 'collected_cod') {
      codMatch = (order.cod_amount ?? 0) > 0 && order.cod_collected === true;
    }
    
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
    
    return orderStatusMatch && paymentStatusMatch && codMatch && searchMatch;
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

  // Restore inventory when order is cancelled
  const restoreInventoryForOrder = async (orderId: string) => {
    try {
      console.log('🔄 Restoring inventory for cancelled order:', orderId);

      // Get order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      for (const item of (items || []) as any[]) {
        try {
          // Find inventory record for this product/variant
          let inventoryQuery = supabase
            .from('inventory')
            .select('*')
            .eq('product_id', item.product_id);
          
          if (item.product_variant_id) {
            inventoryQuery = inventoryQuery.eq('variant_id', item.product_variant_id);
          } else {
            inventoryQuery = inventoryQuery.is('variant_id', null);
          }

          const { data: inventoryRecords, error: inventoryError } = await inventoryQuery;

          if (inventoryError) {
            console.error(`Failed to fetch inventory for product ${item.product_id}:`, inventoryError);
            continue;
          }

          if (!inventoryRecords || inventoryRecords.length === 0) {
            console.warn(`No inventory record found for product ${item.product_id}`);
            continue;
          }

          const inventoryRecord = inventoryRecords[0] as any;
          const oldQuantity = Number(inventoryRecord.quantity || 0);
          const newQuantity = oldQuantity + Number(item.quantity || 0);

          // Update inventory quantity
          const { error: updateError } = await supabase
            .from('inventory')
            .update({
              quantity: newQuantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', inventoryRecord.id);

          if (updateError) {
            console.error(`Failed to update inventory for product ${item.product_id}:`, updateError);
            continue;
          }

          // Create inventory history record
          await supabase
            .from('inventory_history')
            .insert({
              inventory_id: inventoryRecord.id,
              previous_quantity: oldQuantity,
              new_quantity: newQuantity,
              change_type: 'STOCK_IN',
              reason: `Order ${orderId} - Cancelled (Inventory Restored)`,
              created_by: null
            });

          console.log(`✅ Inventory restored: Product ${item.product_id} (${oldQuantity} → ${newQuantity})`);

        } catch (error) {
          console.error(`Error processing inventory restoration for item:`, error);
        }
      }

      console.log('✅ Inventory restoration completed for order:', orderId);

    } catch (error) {
      console.error('Error restoring inventory:', error);
      toast.error('Failed to restore inventory');
    }
  };

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
          status,
          logistics_partner_id,
          logistics_partners(
            name,
            tracking_url_template
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      const oldStatus = (orderData as any).status;

      // If cancelling an order, restore inventory
      if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
        await restoreInventoryForOrder(orderId);
      }

      // Prepare update data
      const updateData: any = { status: newStatus };
      
      // Set delivered_at timestamp when marking as delivered
      if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      // Update order status
      const { error } = await supabase
        .from('orders')
        .update(updateData)
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
          // Note: logistics_partners is returned as a single object by Supabase, not an array
          const logisticsPartnerData = (orderData as any).logistics_partners;
          
          await transactionalEmailService.sendShippingEmail({
            id: (orderData as any).id,
            order_number: (orderData as any).order_number,
            customer_name: `${(orderData as any).billing_first_name} ${(orderData as any).billing_last_name}`,
            customer_email: (orderData as any).billing_email,
            total_amount: (orderData as any).total_amount,
            status: newStatus,
            tracking_number: (orderData as any).tracking_number,
            logistics_partner: logisticsPartnerData ? {
              name: logisticsPartnerData.name || 'Logistics Partner',
              tracking_url_template: logisticsPartnerData.tracking_url_template
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
          ? { 
              ...order, 
              status: newStatus,
              ...(newStatus === 'delivered' ? { delivered_at: new Date().toISOString() } : {})
            }
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

  // Mark COD as collected (confirm via toast actions)
  const markCodAsCollected = (orderId: string) => {
    toast((t) => (
      <div className="flex flex-col space-y-2">
        <div className="text-sm">Mark COD as collected for this order?</div>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 bg-green-600 text-white rounded"
            onClick={async () => {
              try {
                toast.dismiss(t.id);
                setUpdating(orderId);
                const { error } = await supabase
                  .from('orders')
                  .update({ cod_collected: true })
                  .eq('id', orderId);

                if (error) throw error;

                setOrders((prev) => prev.map(order => 
                  order.id === orderId ? { ...order, cod_collected: true } : order
                ));

                toast.success('✅ COD marked as collected');
              } catch (err) {
                console.error('Error marking COD as collected:', err);
                toast.error('Failed to mark COD as collected');
              } finally {
                setUpdating(null);
              }
            }}
          >
            Yes
          </button>
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => toast.dismiss(t.id)}>No</button>
        </div>
      </div>
    ), { duration: 8000 });
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
  
  // Calculate total revenue (excluding cancelled orders)
  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status === 'cancelled') return sum;
    return sum + order.total_amount;
  }, 0);

  // COD Statistics
  const pendingCodOrders = orders.filter(order => (order.cod_amount ?? 0) > 0 && !order.cod_collected);
  const collectedCodOrders = orders.filter(order => (order.cod_amount ?? 0) > 0 && order.cod_collected);
  const totalPendingCod = pendingCodOrders.reduce((sum, order) => sum + (order.cod_amount ?? 0), 0);
  const totalCollectedCod = collectedCodOrders.reduce((sum, order) => sum + (order.cod_amount ?? 0), 0);

  // Calculate pending revenue (COD amounts not collected from non-cancelled orders)
  const pendingRevenue = orders.reduce((sum, order) => {
    if (order.status === 'cancelled') return sum;
    if ((order.cod_amount ?? 0) > 0 && !order.cod_collected) {
      return sum + (order.cod_amount ?? 0);
    }
    return sum;
  }, 0);

  // Calculate delivered revenue (Total Revenue - Pending Revenue)
  const deliveredRevenue = totalRevenue - pendingRevenue;

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
      {/* Stats - Compact Version */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-600">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">{pendingOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-600">Processing</p>
              <p className="text-xl font-bold text-gray-900">{processingOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-purple-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-600">Shipped</p>
              <p className="text-xl font-bold text-gray-900">{shippedOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-600">Delivered</p>
              <p className="text-xl font-bold text-gray-900">{deliveredOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-600">Cancelled</p>
              <p className="text-xl font-bold text-gray-900">{cancelledOrders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Stats - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-orange-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-600">Pending Revenue</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(pendingRevenue)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-600">Delivered Revenue</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(deliveredRevenue)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-gray-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-600">Avg Order Value</p>
              <p className="text-lg font-bold text-gray-900">
                {orders.length > 0 ? formatCurrency(totalRevenue / orders.length) : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Stats - What's Paid vs Pending */}
      {(pendingCodOrders.length > 0 || collectedCodOrders.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-orange-300">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-orange-800">Pending COD</p>
                <p className="text-lg font-bold text-orange-900">{formatCurrency(totalPendingCod)}</p>
                <p className="text-xs text-orange-700">{pendingCodOrders.length} orders</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-green-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-green-800">Collected COD</p>
                <p className="text-lg font-bold text-green-900">{formatCurrency(totalCollectedCod)}</p>
                <p className="text-xs text-green-700">{collectedCodOrders.length} orders</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-blue-300">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-800">Online Paid</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(orders.reduce((sum, order) => {
                    // Calculate online paid amount
                    if (order.payment_split && order.online_amount) {
                      // Split payment: only online_amount was paid online
                      return sum + order.online_amount;
                    } else if (!order.cod_amount || order.cod_amount === 0) {
                      // Full online payment: total_amount is paid
                      return sum + order.total_amount;
                    }
                    return sum;
                  }, 0))}
                </p>
                <p className="text-xs text-blue-700">
                  {orders.filter(order => 
                    (order.payment_split && order.online_amount) || 
                    (!order.cod_amount || order.cod_amount === 0)
                  ).length} orders
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
              
              <div>
                <label htmlFor="codFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  COD Status
                </label>
                <select
                  id="codFilter"
                  value={codFilter}
                  onChange={(e) => setCodFilter(e.target.value)}
                  className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                >
                  <option value="all">All Orders</option>
                  <option value="pending_cod">🟡 Pending COD</option>
                  <option value="collected_cod">🟢 COD Collected</option>
                </select>
              </div>
              
              <button
                onClick={() => {
                  setOrderStatusFilter('all');
                  setPaymentStatusFilter('all');
                  setCodFilter('all');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Filter Results Indicator */}
          {(orderStatusFilter !== 'all' || paymentStatusFilter !== 'all' || codFilter !== 'all') && (
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
                {codFilter !== 'all' && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    COD: {codFilter === 'pending_cod' ? 'Pending' : 'Collected'}
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
                  <th className="px-3 py-2 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">
                    Return
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-emerald-600 uppercase tracking-wider">
                    COD
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
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      {order.has_return_request ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                          ↩️ Return
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {order.tracking_number ? (
                        <div className="space-y-1">
                          <div className="font-medium text-xs">{order.tracking_number}</div>
                          {order.logistics_partners && typeof order.logistics_partners === 'object' && (
                            <>
                              <div className="text-xs text-gray-500">{(order.logistics_partners as any).name}</div>
                              {(order.logistics_partners as any).tracking_url_template && (
                                <a
                                  href={(order.logistics_partners as any).tracking_url_template.replace('{tracking_number}', order.tracking_number)}
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
                    <td className="px-3 py-2 whitespace-nowrap">
                      {order.cod_amount && order.cod_amount > 0 ? (
                        <div className="space-y-1">
                          <div className={`text-sm font-semibold ${order.cod_collected ? 'text-green-700' : 'text-orange-700'}`}>
                            {formatCurrency(order.cod_amount)}
                          </div>
                          {order.cod_collected ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Collected
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              ⏳ Pending
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
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
                        {/* COD Collection Button */}
                        {(order.cod_amount ?? 0) > 0 && !order.cod_collected && (
                          <button
                            onClick={() => markCodAsCollected(order.id)}
                            disabled={updating === order.id}
                            className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 hover:bg-emerald-200 disabled:opacity-50 transition-colors whitespace-nowrap"
                            title="Mark COD as collected"
                          >
                            {updating === order.id ? '...' : '💰 Collect'}
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
