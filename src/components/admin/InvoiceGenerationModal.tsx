import React, { useState, useEffect } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatCurrency';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface OrderDetails {
  id: string;
  order_number: string;
  total_amount: number;
  billing_first_name: string;
  billing_last_name: string;
  billing_address_line_1: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_phone?: string;
  billing_email: string;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_address_line_1: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
}

interface InvoiceData {
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  customerNotes?: string;
}

interface InvoiceGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onGenerate: (orderIds: string[]) => Promise<void>;
}

const InvoiceGenerationModal: React.FC<InvoiceGenerationModalProps> = ({
  isOpen,
  onClose,
  orders,
  onGenerate
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    subtotal: 0,
    gstRate: 18,
    gstAmount: 0,
    shippingAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    customerNotes: ''
  });

  useEffect(() => {
    if (isOpen && orders.length > 0) {
      loadOrderDetails(orders[selectedOrderIndex].id);
    }
  }, [isOpen, selectedOrderIndex, orders]);

  const loadOrderDetails = async (orderId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          billing_first_name,
          billing_last_name,
          billing_address_line_1,
          billing_city,
          billing_state,
          billing_postal_code,
          billing_phone,
          billing_email,
          shipping_first_name,
          shipping_last_name,
          shipping_address_line_1,
          shipping_city,
          shipping_state,
          shipping_postal_code,
          subtotal,
          shipping_amount,
          discount_amount
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      setOrderDetails(data as OrderDetails);
      
      // Calculate initial invoice data from order
      // GST is INCLUSIVE in the total - we need to extract it
      const totalAmount = Number(data.total_amount || 0);
      const shippingAmount = Number(data.shipping_amount || 0);
      const discountAmount = Number(data.discount_amount || 0);
      const gstRate = 18;
      
      // Calculate base amount (total - shipping + discount)
      const amountIncludingGst = totalAmount - shippingAmount + discountAmount;
      
      // Extract GST from inclusive amount
      // If total = base + (base * 0.18), then base = total / 1.18
      const subtotal = Math.round(amountIncludingGst / (1 + gstRate / 100));
      const gstAmount = Math.round(amountIncludingGst - subtotal);

      setInvoiceData({
        subtotal,
        gstRate,
        gstAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        customerNotes: ''
      });
    } catch (error) {
      console.error('Error loading order details:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to load order details: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const recalculateTotal = (updates: Partial<InvoiceData>) => {
    const newData = { ...invoiceData, ...updates };
    
    // If GST rate changed, recalculate subtotal to keep total the same
    if (updates.gstRate !== undefined) {
      // Total should remain constant (amount already paid)
      // Total = Subtotal + GST + Shipping - Discount
      // Rearrange: Subtotal = (Total - Shipping + Discount) / (1 + GST%)
      const amountIncludingGst = newData.totalAmount - newData.shippingAmount + newData.discountAmount;
      const newSubtotal = Math.round(amountIncludingGst / (1 + newData.gstRate / 100));
      const newGstAmount = Math.round(amountIncludingGst - newSubtotal);
      
      setInvoiceData({
        ...newData,
        subtotal: newSubtotal,
        gstAmount: newGstAmount
      });
    } else {
      // For other changes (subtotal, shipping, discount), recalculate total normally
      const gstAmount = Math.round(newData.subtotal * newData.gstRate / 100);
      const totalAmount = Math.round(newData.subtotal + gstAmount + newData.shippingAmount - newData.discountAmount);
      
      setInvoiceData({
        ...newData,
        gstAmount,
        totalAmount
      });
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const orderIds = orders.map(o => o.id);
      await onGenerate(orderIds);
      onClose();
    } catch (error) {
      console.error('Error generating invoices:', error);
      toast.error('Failed to generate invoices');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Generate Invoice{orders.length > 1 ? 's' : ''}
              </h2>
              <p className="text-sm text-gray-600">
                {orders.length} order{orders.length > 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Selector (if multiple orders) */}
          {orders.length > 1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Reviewing {orders.length} orders
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {orders.map((order, index) => (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrderIndex(index)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          index === selectedOrderIndex
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {order.order_number}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading order details...</p>
            </div>
          ) : orderDetails ? (
            <>
              {/* Order Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Order Number:</span>
                      <span className="ml-2 font-medium">{orderDetails.order_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <span className="ml-2 font-medium">
                        {orderDetails.billing_first_name} {orderDetails.billing_last_name}
                      </span>
                    </div>
                    {orderDetails.billing_email && (
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2">{orderDetails.billing_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Billing Address</h3>
                  <div className="text-sm text-gray-600">
                    <p>{orderDetails.billing_first_name} {orderDetails.billing_last_name}</p>
                    <p>{orderDetails.billing_address_line_1}</p>
                    <p>{orderDetails.billing_city}, {orderDetails.billing_state} {orderDetails.billing_postal_code}</p>
                    {orderDetails.billing_phone && <p>Phone: {orderDetails.billing_phone}</p>}
                  </div>
                </div>
              </div>

              {/* Invoice Amount Adjustments */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Invoice Amounts</h3>
                  <p className="text-xs text-gray-500">
                    GST is extracted from the total amount paid (inclusive pricing)
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Subtotal
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={invoiceData.subtotal}
                      onChange={(e) => recalculateTotal({ subtotal: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      GST Rate (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={invoiceData.gstRate}
                      onChange={(e) => recalculateTotal({ gstRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Shipping Amount
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={invoiceData.shippingAmount}
                      onChange={(e) => recalculateTotal({ shippingAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Discount Amount
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={invoiceData.discountAmount}
                      onChange={(e) => recalculateTotal({ discountAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Calculated Totals */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="text-xs text-gray-500 mb-3 bg-blue-50 border border-blue-200 rounded p-2">
                    💡 Breakdown: Subtotal ({formatCurrency(invoiceData.subtotal)}) + GST {invoiceData.gstRate}% ({formatCurrency(invoiceData.gstAmount)}) + Shipping ({formatCurrency(invoiceData.shippingAmount)}) - Discount ({formatCurrency(invoiceData.discountAmount)})
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal (Base Amount):</span>
                    <span className="font-medium">{formatCurrency(invoiceData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST ({invoiceData.gstRate}%):</span>
                    <span className="font-medium">{formatCurrency(invoiceData.gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">{formatCurrency(invoiceData.shippingAmount)}</span>
                  </div>
                  {invoiceData.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span className="font-medium">-{formatCurrency(invoiceData.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                    <span className="text-gray-900">Total Payable:</span>
                    <span className="text-primary-600">{formatCurrency(invoiceData.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={invoiceData.customerNotes}
                  onChange={(e) => setInvoiceData({ ...invoiceData, customerNotes: e.target.value })}
                  rows={3}
                  placeholder="Add any special notes or instructions for this invoice..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            {orders.length === 1 
              ? 'Review the invoice details and generate when ready.'
              : `Reviewing order ${selectedOrderIndex + 1} of ${orders.length}. All orders will use standard rates.`
            }
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              {loading ? 'Generating...' : `Generate ${orders.length} Invoice${orders.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerationModal;
