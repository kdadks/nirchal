import React, { useState, useEffect } from 'react';
import { Package, TruckIcon, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { ReturnRequestWithItems } from '../../types/return.types';
import { getStatusLabel, getStatusColor, formatDate } from '../../types/return.index';
import toast from 'react-hot-toast';
import { AddTrackingModal } from '../account/AddTrackingModal';
import { ReturnDetailsModal } from '../returns/ReturnDetailsModal';

export const CustomerReturnsTab: React.FC = () => {
  const { customer } = useCustomerAuth();
  const [returns, setReturns] = useState<ReturnRequestWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequestWithItems | null>(null);
  const [isAddTrackingModalOpen, setIsAddTrackingModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [expandedReturns, setExpandedReturns] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (customer?.id) {
      loadCustomerReturns();
    } else {
      setIsLoading(false);
    }
  }, [customer?.id]);

  const loadCustomerReturns = async () => {
    setIsLoading(true);
    try {
      if (!customer?.id) {
        setIsLoading(false);
        return;
      }

      // Fetch returns with items - we'll get order_number from order_id later if needed
      const { data, error } = await supabase
        .from('return_requests')
        .select(`
          *,
          return_items (*)
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading returns:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        toast.error('Failed to load your returns');
        setIsLoading(false);
        return;
      }

      // Fetch order numbers for all returns
      if (data && data.length > 0) {
        const orderIds = [...new Set(data.map((r: any) => r.order_id).filter(Boolean))];
        const { data: ordersData } = await supabase
          .from('orders')
          .select('id, order_number')
          .in('id', orderIds);
        
        // Map order numbers to returns
        const orderMap = new Map(ordersData?.map(o => [o.id, o.order_number]) || []);
        const returnsWithOrderNumbers = data.map((ret: any) => ({
          ...ret,
          order_number: orderMap.get(ret.order_id) || null
        }));
        
        setReturns(returnsWithOrderNumbers as unknown as ReturnRequestWithItems[]);
      } else {
        setReturns((data || []) as unknown as ReturnRequestWithItems[]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while loading returns');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddTrackingModal = (returnRequest: ReturnRequestWithItems) => {
    setSelectedReturn(returnRequest);
    setIsAddTrackingModalOpen(true);
  };

  const openDetailsModal = (returnRequest: ReturnRequestWithItems) => {
    setSelectedReturn(returnRequest);
    setIsDetailsModalOpen(true);
  };

  const handleTrackingAdded = () => {
    loadCustomerReturns();
    setIsAddTrackingModalOpen(false);
    setSelectedReturn(null);
  };

  const toggleReturn = (returnId: string) => {
    setExpandedReturns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(returnId)) {
        newSet.delete(returnId);
      } else {
        newSet.add(returnId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Returns Yet</h3>
        <p className="text-gray-500">You haven't requested any returns yet.</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-6">Your Returns</h2>
      
      {returns.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No returns found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map((returnRequest) => {
            const isExpanded = expandedReturns.has(returnRequest.id);
            
            return (
              <div
                key={returnRequest.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
              >
                {/* Compact Header - Always Visible */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => toggleReturn(returnRequest.id)}
                    className="font-medium text-primary-600 hover:text-primary-700 transition-colors text-sm flex items-center gap-2"
                  >
                    {returnRequest.return_number}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                  
                  {!isExpanded && (
                    <span className="text-xs text-gray-500">
                      {formatDate(returnRequest.created_at)}
                    </span>
                  )}
                  
                  {!isExpanded && returnRequest.order_number && (
                    <span className="text-xs text-gray-600">
                      Order: {returnRequest.order_number}
                    </span>
                  )}
                  
                  {!isExpanded && returnRequest.final_refund_amount && (
                    <span className="font-semibold text-gray-900 text-sm">
                      ₹{returnRequest.final_refund_amount.toFixed(2)}
                    </span>
                  )}
                  
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-md ${
                      returnRequest.status === 'pending_shipment' 
                        ? 'bg-orange-500 text-white' 
                        : getStatusColor(returnRequest.status)
                    }`}
                  >
                    {getStatusLabel(returnRequest.status)}
                  </span>
                </div>

                {/* Expanded View - Full Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                    <div className="text-xs text-gray-500">
                      Requested on {formatDate(returnRequest.created_at)}
                    </div>
                    
                    {/* Order Details - Compact Grid */}
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Order</p>
                        <p className="font-medium text-gray-900">
                          {returnRequest.order_number || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Items</p>
                        <p className="font-medium text-gray-900">
                          {returnRequest.return_items?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Refund</p>
                        <p className="font-semibold text-gray-900">
                          {returnRequest.final_refund_amount
                            ? `₹${returnRequest.final_refund_amount.toFixed(2)}`
                            : returnRequest.calculated_refund_amount
                            ? `₹${returnRequest.calculated_refund_amount.toFixed(2)}`
                            : 'Pending'}
                        </p>
                      </div>
                    </div>

                    {/* Tracking Info - Compact */}
                    {returnRequest.customer_tracking_number && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                        <div className="flex items-start gap-2">
                          <TruckIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-blue-900 text-xs">Tracking</p>
                            <p className="text-xs text-blue-700">
                              {returnRequest.customer_courier_name || 'Courier'}: {returnRequest.customer_tracking_number}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Return Address - Compact */}
                    {returnRequest.return_address_line1 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
                        <p className="font-medium text-gray-900 mb-1">Return To:</p>
                        <p className="text-gray-700">
                          {returnRequest.return_address_line1}
                          {returnRequest.return_address_line2 && `, ${returnRequest.return_address_line2}`}
                          <br />
                          {returnRequest.return_address_city}, {returnRequest.return_address_state}{' '}
                          {returnRequest.return_address_postal_code}
                        </p>
                      </div>
                    )}

                    {/* Actions - Compact */}
                    <div className="flex items-center gap-2 pt-2">
                      {returnRequest.status === 'pending_shipment' &&
                        !returnRequest.customer_tracking_number &&
                        returnRequest.return_address_line1 && (
                          <button
                            onClick={() => openAddTrackingModal(returnRequest)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-xs font-medium"
                          >
                            <TruckIcon className="h-3 w-3" />
                            Add Tracking
                          </button>
                        )}

                      <button
                        onClick={() => openDetailsModal(returnRequest)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium"
                      >
                        <Eye className="h-3 w-3" />
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedReturn && (
        <>
          <AddTrackingModal
            isOpen={isAddTrackingModalOpen}
            onClose={() => {
              setIsAddTrackingModalOpen(false);
              setSelectedReturn(null);
            }}
            returnRequest={selectedReturn}
            onSuccess={handleTrackingAdded}
          />

          <ReturnDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedReturn(null);
            }}
            returnRequest={selectedReturn}
          />
        </>
      )}
    </>
  );
};
