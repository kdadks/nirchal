import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  TruckIcon,
  RefreshCw,
  Trash2,
  Edit,
  Mail,
} from 'lucide-react';
import { supabase } from '../../config/supabase';
import { returnService } from '../../services/returnService';
import { returnEmailService } from '../../services/returnEmailService';
import { createRefund } from '../../services/razorpayRefundService';
import { ReturnRequestWithItems, ReturnRequestStatus } from '../../types/return.types';
import { getStatusLabel, getStatusColor, formatDate } from '../../types/return.index';
import toast from 'react-hot-toast';
import { ReturnInspectionModal } from './ReturnInspectionModal';
import { ReturnDetailsModal } from './ReturnDetailsModal';
import { ReturnAddressEditModal } from './ReturnAddressEditModal';

const STATUS_FILTERS: { value: ReturnRequestStatus | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All Returns', icon: <Package className="h-4 w-4" /> },
  { value: 'pending_shipment', label: 'Pending Shipment', icon: <Clock className="h-4 w-4" /> },
  { value: 'shipped_by_customer', label: 'In Transit', icon: <TruckIcon className="h-4 w-4" /> },
  { value: 'received', label: 'Received', icon: <Package className="h-4 w-4" /> },
  { value: 'under_inspection', label: 'Inspecting', icon: <Search className="h-4 w-4" /> },
  { value: 'approved', label: 'Full Refund', icon: <CheckCircle className="h-4 w-4" /> },
  { value: 'partially_approved', label: 'Partial Refund', icon: <CheckCircle className="h-4 w-4" /> },
  { value: 'rejected', label: 'Rejected', icon: <XCircle className="h-4 w-4" /> },
  { value: 'refund_initiated', label: 'Refund Processing', icon: <RefreshCw className="h-4 w-4" /> },
  { value: 'refund_completed', label: 'Completed', icon: <CheckCircle className="h-4 w-4" /> },
];

export const ReturnManagementDashboard: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequestWithItems[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<ReturnRequestWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<ReturnRequestStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [stats, setStats] = useState<any>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  // Modal state
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequestWithItems | null>(null);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundDetails, setRefundDetails] = useState<{
    paymentId: string;
    amount: number;
    paymentMethod: string;
  } | null>(null);

  useEffect(() => {
    loadReturns();
    loadStatistics();
  }, [currentPage, selectedStatus, dateFilter]);

  useEffect(() => {
    filterReturns();
  }, [returns, searchTerm]);

  const loadReturns = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};

      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }

      if (dateFilter.from) {
        filters.dateFrom = dateFilter.from;
      }

      if (dateFilter.to) {
        filters.dateTo = dateFilter.to;
      }

      const offset = (currentPage - 1) * itemsPerPage;
      
      const { data, count, error } = await returnService.getAllReturnRequests(
        filters,
        itemsPerPage,
        offset
      );

      if (error) {
        console.error('[ReturnManagement] Error from service:', error);
        toast.error('Failed to load returns');
        return;
      }

      setReturns(data);
      setTotalCount(count);
    } catch (error) {
      console.error('[ReturnManagement] Exception in loadReturns:', error);
      toast.error('An error occurred while loading returns');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await returnService.getReturnStatistics(
        dateFilter.from || undefined,
        dateFilter.to || undefined
      );
      setStats(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const filterReturns = () => {
    if (!searchTerm.trim()) {
      setFilteredReturns(returns);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = returns.filter(
      (ret) =>
        ret.return_number?.toLowerCase().includes(term) ||
        ret.customer_email?.toLowerCase().includes(term) ||
        ret.customer_first_name?.toLowerCase().includes(term) ||
        ret.customer_last_name?.toLowerCase().includes(term)
    );

    setFilteredReturns(filtered);
  };

  const handleMarkAsReceived = async (returnId: string) => {
    try {
      // Get current admin user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      const { error } = await returnService.markAsReceived(returnId, user.id);

      if (error) {
        toast.error('Failed to mark as received');
        return;
      }

      toast.success('Marked as received! Click the email button to notify customer.', {
        duration: 5000,
        icon: '✅',
      });
      loadReturns();
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  };

  const openInspectionModal = (returnRequest: ReturnRequestWithItems) => {
    setSelectedReturn(returnRequest);
    setIsInspectionModalOpen(true);
  };

  const openDetailsModal = (returnRequest: ReturnRequestWithItems) => {
    setSelectedReturn(returnRequest);
    setIsDetailsModalOpen(true);
  };

  const openEditAddressModal = (returnRequest: ReturnRequestWithItems) => {
    setSelectedReturn(returnRequest);
    setIsEditAddressModalOpen(true);
  };

  const handleSendEmail = async (returnRequest: ReturnRequestWithItems) => {
    try {
      const customerName = `${returnRequest.customer_first_name || ''} ${returnRequest.customer_last_name || ''}`.trim() || 'Customer';
      const customerEmail = returnRequest.customer_email || '';

      if (!customerEmail) {
        toast.error('No customer email available');
        return;
      }

      let success = false;
      let emailType = '';

      // Determine which email to send based on return status
      switch (returnRequest.status) {
        case 'pending_shipment':
          // Send return address email
          if (!returnRequest.return_address_line1 || !returnRequest.return_address_city) {
            toast.error('Please add return address before sending email');
            return;
          }
          success = await returnEmailService.sendReturnAddressEmail(
            returnRequest,
            customerEmail,
            customerName
          );
          emailType = 'Return Address';
          break;

        case 'received':
        case 'under_inspection':
          // Send package received confirmation
          success = await returnEmailService.sendReturnReceivedEmail(
            returnRequest,
            customerEmail,
            customerName,
            returnRequest.received_by || 'Warehouse Team',
            returnRequest.received_date ? new Date(returnRequest.received_date).toLocaleDateString() : new Date().toLocaleDateString()
          );
          emailType = 'Package Received Confirmation';
          break;

        case 'approved':
        case 'partially_approved':
        case 'rejected':
          // Send inspection results
          success = await returnEmailService.sendInspectionCompleteEmail(
            returnRequest,
            customerEmail,
            customerName,
            returnRequest.inspection_date ? new Date(returnRequest.inspection_date).toLocaleDateString() : new Date().toLocaleDateString(),
            returnRequest.inspection_notes || undefined
          );
          emailType = 'Inspection Results';
          break;

        case 'refund_initiated':
          // Refund initiated - inform that email is sent automatically
          toast('Refund initiated emails are sent automatically when refund is processed', {
            icon: 'ℹ️',
            duration: 4000,
          });
          return;

        case 'refund_completed':
          // Send refund completion email
          // Note: This requires refund transaction data
          toast('Refund completion emails are sent automatically when refund is processed', {
            icon: 'ℹ️',
            duration: 4000,
          });
          return;

        default:
          toast.error('No email template available for this status');
          return;
      }

      if (success) {
        toast.success(`${emailType} email sent successfully to ${customerEmail}`);
      } else {
        toast.error('Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('An error occurred while sending email');
    }
  };

  const handleDeleteReturn = async (returnId: string, returnNumber: string) => {
    // Use toast for confirmation
    const confirmDelete = await new Promise((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <div>
            <p className="font-semibold text-gray-900">Delete Return Request</p>
            <p className="text-sm text-gray-600 mt-1">
              Are you sure you want to delete return request <strong>{returnNumber}</strong>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
        position: 'top-center',
      });
    });

    if (!confirmDelete) return;

    try {
      const { error } = await returnService.deleteReturnRequest(returnId);

      if (error) {
        toast.error('Failed to delete return request');
        return;
      }

      toast.success('Return request deleted successfully');
      loadReturns();
      loadStatistics();
    } catch (error) {
      console.error('Error deleting return:', error);
      toast.error('An error occurred while deleting');
    }
  };

  const handleInspectionComplete = () => {
    setIsInspectionModalOpen(false);
    setSelectedReturn(null);
    loadReturns();
    loadStatistics();
  };

  const handleInitiateRefund = async (returnRequest: ReturnRequestWithItems) => {
    // Check if order has payment details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('razorpay_payment_id, payment_method')
      .eq('id', returnRequest.order_id)
      .single();

    if (orderError || !order) {
      toast.error('Failed to fetch order payment details');
      return;
    }

    if (!order.razorpay_payment_id) {
      toast.error('No payment ID found for this order. Cannot process refund.');
      return;
    }

    if (order.payment_method !== 'razorpay') {
      toast.error('Only Razorpay payments can be refunded automatically. Please process manually.');
      return;
    }

    // Determine refund amount
    const refundAmount = returnRequest.calculated_refund_amount || returnRequest.original_order_amount;

    // Open refund modal with details
    setSelectedReturn(returnRequest);
    setRefundDetails({
      paymentId: order.razorpay_payment_id as string,
      amount: refundAmount,
      paymentMethod: order.payment_method as string,
    });
    setIsRefundModalOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (!selectedReturn || !refundDetails) return;

    setIsRefundModalOpen(false);

    try {
      const result = await createRefund({
        returnRequestId: selectedReturn.id,
        paymentId: refundDetails.paymentId,
        amount: refundDetails.amount,
        notes: {
          return_number: selectedReturn.return_number,
          reason: 'Return request approved',
        },
      });

      if (result.success) {
        toast.success('Refund initiated successfully!');
        setSelectedReturn(null);
        setRefundDetails(null);
        loadReturns();
        loadStatistics();
      } else {
        toast.error(result.error || 'Failed to initiate refund');
      }
    } catch (error: any) {
      console.error('Error initiating refund:', error);
      toast.error(error.message || 'An error occurred while initiating refund');
    }
  };

  const exportToCSV = () => {
    // TODO: Implement CSV export
    toast.success('Export functionality coming soon');
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Return Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage and process customer return requests
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Returns</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total_returns}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Action</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {(stats.pending || 0) + (stats.in_transit || 0) + (stats.received || 0) + (stats.under_inspection || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Awaiting shipment, in transit, or inspection
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {(stats.approved || 0) + (stats.partially_approved || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Full: {stats.approved || 0} | Partial: {stats.partially_approved || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Refund Amount</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    ₹{(stats.total_refund_amount || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Completed: {stats.completed || 0} | Processing: {stats.refund_initiated || 0}
                  </p>
                </div>
                <RefreshCw className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by return number, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filters */}
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setSelectedStatus(filter.value);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    selectedStatus === filter.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.icon}
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => {
                setDateFilter({ from: '', to: '' });
                setSearchTerm('');
                setSelectedStatus('all');
              }}
              className="mt-6 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Returns List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading returns...</p>
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No returns found</p>
          </div>
        ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Return #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Refund Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReturns.map((returnRequest) => (
                      <tr key={returnRequest.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {returnRequest.return_number}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {returnRequest.customer_first_name} {returnRequest.customer_last_name}
                          </div>
                          <div className="text-sm text-gray-500">{returnRequest.customer_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {returnRequest.return_items?.length || 0} item(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              returnRequest.status
                            )}`}
                          >
                            {getStatusLabel(returnRequest.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {returnRequest.final_refund_amount
                              ? `₹${returnRequest.final_refund_amount.toFixed(2)}`
                              : returnRequest.calculated_refund_amount
                              ? `₹${returnRequest.calculated_refund_amount.toFixed(2)}`
                              : returnRequest.return_items && returnRequest.return_items.length > 0
                              ? `₹${returnRequest.return_items
                                  .reduce((sum, item) => sum + item.total_price, 0)
                                  .toFixed(2)} (Est.)`
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(returnRequest.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {returnRequest.status === 'shipped_by_customer' && (
                              <button
                                onClick={() => handleMarkAsReceived(returnRequest.id)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs"
                              >
                                Mark Received
                              </button>
                            )}

                            {(returnRequest.status === 'received' ||
                              returnRequest.status === 'under_inspection') && (
                              <button
                                onClick={() => openInspectionModal(returnRequest)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs flex items-center gap-1"
                              >
                                <Search className="h-3 w-3" />
                                Inspect
                              </button>
                            )}

                            {(returnRequest.status === 'approved' || returnRequest.status === 'partially_approved') && (
                              <button
                                onClick={() => handleInitiateRefund(returnRequest)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs flex items-center gap-1"
                                title="Initiate refund to original payment method"
                              >
                                <RefreshCw className="h-3 w-3" />
                                Refund
                              </button>
                            )}

                            <button
                              onClick={() => openDetailsModal(returnRequest)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Hide Edit button if Refund button is shown or refund is processing/completed */}
                            {!(
                              returnRequest.status === 'approved' || 
                              returnRequest.status === 'partially_approved' ||
                              returnRequest.status === 'refund_initiated' ||
                              returnRequest.status === 'refund_completed'
                            ) && (
                              <button
                                onClick={() => openEditAddressModal(returnRequest)}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                title="Edit Return Address"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}

                            {/* Smart Email Button - sends different emails based on status */}
                            {/* Hide email button for refund statuses (emails sent automatically) */}
                            {!(
                              returnRequest.status === 'refund_initiated' || 
                              returnRequest.status === 'refund_completed'
                            ) && (
                              <button
                                onClick={() => handleSendEmail(returnRequest)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title={
                                  returnRequest.status === 'pending_shipment'
                                    ? 'Send Return Address Email'
                                    : returnRequest.status === 'received' || returnRequest.status === 'under_inspection'
                                    ? 'Send Package Received Email'
                                    : returnRequest.status === 'approved' || returnRequest.status === 'partially_approved' || returnRequest.status === 'rejected'
                                    ? 'Send Inspection Results Email'
                                    : 'Send Email to Customer'
                                }
                              >
                                <Mail className="h-4 w-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteReturn(returnRequest.id, returnRequest.return_number)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Return"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      {/* Inspection Modal */}
      {selectedReturn && (
        <ReturnInspectionModal
          isOpen={isInspectionModalOpen}
          onClose={() => setIsInspectionModalOpen(false)}
          returnRequest={selectedReturn}
          onComplete={handleInspectionComplete}
        />
      )}

      {/* Details Modal */}
      <ReturnDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        returnRequest={selectedReturn}
      />

      {/* Edit Address Modal */}
      {selectedReturn && (
        <ReturnAddressEditModal
          isOpen={isEditAddressModalOpen}
          onClose={() => setIsEditAddressModalOpen(false)}
          returnRequest={selectedReturn}
          onSave={() => {
            setIsEditAddressModalOpen(false);
            loadReturns();
          }}
        />
      )}

      {/* Refund Confirmation Modal */}
      {isRefundModalOpen && selectedReturn && refundDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Initiate Refund</h3>
                <button
                  onClick={() => {
                    setIsRefundModalOpen(false);
                    setSelectedReturn(null);
                    setRefundDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Return Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Return Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Return Number:</span>
                      <span className="font-medium text-gray-900">{selectedReturn.return_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium text-gray-900">{selectedReturn.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium text-gray-900">
                        {selectedReturn.customer_first_name} {selectedReturn.customer_last_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReturn.status)}`}>
                        {getStatusLabel(selectedReturn.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">Payment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium text-gray-900 uppercase">{refundDetails.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-mono text-xs text-gray-900">{refundDetails.paymentId}</span>
                    </div>
                    {selectedReturn.original_order_amount !== refundDetails.amount && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Original Amount:</span>
                          <span className="text-gray-900">₹{selectedReturn.original_order_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deduction:</span>
                          <span className="text-red-600">
                            -₹{(selectedReturn.original_order_amount - refundDetails.amount).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Refund Amount - Highlighted */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-green-900">Refund Amount:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{refundDetails.amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> This will initiate an automatic refund to the customer's original payment method via Razorpay. This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsRefundModalOpen(false);
                    setSelectedReturn(null);
                    setRefundDetails(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRefund}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Confirm & Initiate Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
