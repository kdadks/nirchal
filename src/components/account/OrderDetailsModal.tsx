import React, { useState, useEffect } from 'react';
import { X, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { getStorageImageUrl } from '../../utils/storageUtils';
import toast from 'react-hot-toast';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku?: string;
  product_image?: string;
  variant_size?: string;
  variant_color?: string;
  variant_material?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

interface OrderDetails {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method?: string;
  payment_transaction_id?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  billing_first_name: string;
  billing_last_name: string;
  billing_company?: string;
  billing_address_line_1: string;
  billing_address_line_2?: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_country: string;
  billing_phone?: string;
  billing_email: string;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_company?: string;
  shipping_address_line_1: string;
  shipping_address_line_2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  shipping_phone?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  admin_notes?: string;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  orderId
}) => {
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderDetails();
    }
  }, [isOpen, orderId]);

  const loadOrderDetails = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      // Load order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Load order items with product images
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products(
            id,
            name,
            product_images(image_url, is_primary)
          )
        `)
        .eq('order_id', orderId)
        .order('id');

      if (itemsError) throw itemsError;

      // Process items to extract product images using the same logic as reviews
      const processedItems = (items || []).map((item: any) => {
        let productImage: string | undefined;
        
        // Use the same logic as usePublicProducts for image handling
        if (item.products?.product_images && Array.isArray(item.products.product_images) && item.products.product_images.length > 0) {
          const productImages = item.products.product_images;
          // Find primary image first, then fallback to first image
          const primaryImage = productImages.find((img: any) => img.is_primary);
          const selectedImageData = primaryImage || productImages[0];
          
          if (selectedImageData?.image_url) {
            productImage = getStorageImageUrl(selectedImageData.image_url);
          }
        }
        
        return {
          ...item,
          product_image: productImage
        };
      });

      setOrderDetails(order);
      setOrderItems(processedItems);
    } catch (error) {
      console.error('Error loading order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
      case 'refunded':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${day}-${month}-${year} at ${time}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Order Details {orderDetails?.order_number && `- ${orderDetails.order_number}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Loading order details...</span>
            </div>
          ) : orderDetails ? (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(orderDetails.status)}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Order Status</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(orderDetails.status)}`}>
                          {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(orderDetails.payment_status)}`}>
                          Payment: {orderDetails.payment_status.charAt(0).toUpperCase() + orderDetails.payment_status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">{formatDate(orderDetails.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.product_image || 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
                            }}
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                              {item.product_sku && (
                                <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                {item.variant_size && <span>Size: {item.variant_size}</span>}
                                {item.variant_color && <span>Color: {item.variant_color}</span>}
                                {item.variant_material && <span>Material: {item.variant_material}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(item.unit_price)} × {item.quantity}</p>
                              <p className="text-lg font-semibold text-primary-600">
                                {formatCurrency(item.total_price)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(orderDetails.subtotal)}</span>
                  </div>
                  {orderDetails.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatCurrency(orderDetails.tax_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatCurrency(orderDetails.shipping_amount)}</span>
                  </div>
                  {orderDetails.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(orderDetails.discount_amount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(orderDetails.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Billing Address */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Billing Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">
                      {orderDetails.billing_first_name} {orderDetails.billing_last_name}
                    </p>
                    {orderDetails.billing_company && (
                      <p className="text-gray-600">{orderDetails.billing_company}</p>
                    )}
                    <p className="text-gray-600">{orderDetails.billing_address_line_1}</p>
                    {orderDetails.billing_address_line_2 && (
                      <p className="text-gray-600">{orderDetails.billing_address_line_2}</p>
                    )}
                    <p className="text-gray-600">
                      {orderDetails.billing_city}, {orderDetails.billing_state} {orderDetails.billing_postal_code}
                    </p>
                    <p className="text-gray-600">{orderDetails.billing_country}</p>
                    {orderDetails.billing_phone && (
                      <p className="text-gray-600">Phone: {orderDetails.billing_phone}</p>
                    )}
                    <p className="text-gray-600">Email: {orderDetails.billing_email}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">
                      {orderDetails.shipping_first_name} {orderDetails.shipping_last_name}
                    </p>
                    {orderDetails.shipping_company && (
                      <p className="text-gray-600">{orderDetails.shipping_company}</p>
                    )}
                    <p className="text-gray-600">{orderDetails.shipping_address_line_1}</p>
                    {orderDetails.shipping_address_line_2 && (
                      <p className="text-gray-600">{orderDetails.shipping_address_line_2}</p>
                    )}
                    <p className="text-gray-600">
                      {orderDetails.shipping_city}, {orderDetails.shipping_state} {orderDetails.shipping_postal_code}
                    </p>
                    <p className="text-gray-600">{orderDetails.shipping_country}</p>
                    {orderDetails.shipping_phone && (
                      <p className="text-gray-600">Phone: {orderDetails.shipping_phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium">
                        {orderDetails.payment_method ? 
                          orderDetails.payment_method.charAt(0).toUpperCase() + orderDetails.payment_method.slice(1) 
                          : 'Not specified'}
                      </p>
                    </div>
                    {orderDetails.payment_transaction_id && (
                      <div>
                        <p className="text-sm text-gray-500">Transaction ID</p>
                        <p className="font-medium font-mono text-sm">{orderDetails.payment_transaction_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tracking Information */}
              {(orderDetails.shipped_at || orderDetails.delivered_at) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Tracking Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {orderDetails.shipped_at && (
                        <div className="flex justify-between">
                          <span>Shipped At</span>
                          <span>{formatDate(orderDetails.shipped_at)}</span>
                        </div>
                      )}
                      {orderDetails.delivered_at && (
                        <div className="flex justify-between">
                          <span>Delivered At</span>
                          <span>{formatDate(orderDetails.delivered_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {orderDetails.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Order Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600">{orderDetails.notes}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Order not found</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
