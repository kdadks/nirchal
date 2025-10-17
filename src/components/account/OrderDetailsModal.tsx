import React, { useState, useEffect } from 'react';
import { X, Package, Truck, CheckCircle, Clock, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { getStorageImageUrl, getProductImageUrls } from '../../utils/storageUtils';
import toast from 'react-hot-toast';
import { useRazorpay } from '../../hooks/useRazorpay';

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
  logistics_partner_id?: string;
  tracking_number?: string;
  logistics_partners?: {
    id: string;
    name: string;
    tracking_url_template?: string;
    website?: string;
  };
  // COD Payment fields
  cod_amount?: number;
  cod_collected?: boolean;
  online_amount?: number;
  payment_split?: boolean;
  razorpay_order_id?: string;
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
  const [retryingPayment, setRetryingPayment] = useState(false);
  const { openCheckout, verifyPayment, isLoaded: razorpayLoaded } = useRazorpay();

  // Helper function to generate tracking URL
  const getTrackingUrl = (order: OrderDetails): string | null => {
    if (!order.tracking_number || !order.logistics_partners?.tracking_url_template) {
      return null;
    }
    
    return order.logistics_partners.tracking_url_template.replace(
      '{tracking_number}', 
      order.tracking_number
    );
  };

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
        .select(`
          *,
          logistics_partners(
            id,
            name,
            tracking_url_template,
            website
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Order not found');

      // Handle the logistics_partners relation safely
      const logistics_partners = order.logistics_partners && 
        typeof order.logistics_partners === 'object' && 
        !Array.isArray(order.logistics_partners) && 
        'id' in order.logistics_partners 
          ? order.logistics_partners 
          : undefined;

      // Type assertion to ensure proper typing
      const typedOrder = {
        ...order,
        logistics_partners
      } as unknown as OrderDetails;

      // Load order items - first get all items without products join
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('id');

      if (itemsError) throw itemsError;

      // For items that have product_id, fetch product details separately
      const itemsWithProducts = await Promise.all(
        (items || []).map(async (item: any) => {
          if (!item.product_id) {
            // Service item - no product to fetch
            return { ...item, products: null };
          }

          // Product item - fetch product details
          try {
            const { data: product, error: productError } = await supabase
              .from('products')
              .select(`
                id,
                name,
                product_images(image_url, is_primary),
                product_variants(
                  id,
                  color,
                  size,
                  swatch_image_id,
                  product_images!swatch_image_id(image_url)
                )
              `)
              .eq('id', item.product_id)
              .single();

            if (productError) {
              console.warn(`Failed to load product for item ${item.id}:`, productError);
              return { ...item, products: null };
            }

            return { ...item, products: product };
          } catch (error) {
            console.warn(`Error fetching product for item ${item.id}:`, error);
            return { ...item, products: null };
          }
        })
      );

      // Debug logging
      if (import.meta.env.DEV) {
        console.log('[OrderDetailsModal] Order items loaded:', {
          orderId,
          itemsCount: itemsWithProducts?.length || 0,
          items: itemsWithProducts
        });
      }

      // Process items to extract product images with variant-specific swatch support
      const processedItems = (itemsWithProducts || []).map((item: any) => {
        let productImage: string | undefined;
        let productData = item.products;
        
        // If no product data from join (product_id was null), try to find product by name
        if (!productData && item.product_name) {
          // This is a fallback for old order items without product_id
          // We can't fetch additional data here, so we'll rely on pattern-based URLs
        }
        
        // First priority: Try to find variant-specific swatch image
        if (item.variant_color && productData?.product_variants) {
          const matchingVariant = productData.product_variants.find((variant: any) => {
            const colorMatch = variant.color === item.variant_color;
            // Handle size matching - if variant has no size (null) and order item has 'Free Size', consider it a match
            const sizeMatch = !item.variant_size || 
                             item.variant_size === 'Free Size' || 
                             variant.size === item.variant_size ||
                             !variant.size;
            return colorMatch && sizeMatch;
          });
          
          if (matchingVariant?.product_images?.image_url) {
            productImage = getStorageImageUrl(matchingVariant.product_images.image_url);
            if (import.meta.env.DEV) {
              console.log('[OrderDetailsModal] Using variant swatch image:', {
                itemId: item.id,
                variantColor: item.variant_color,
                variantSize: item.variant_size,
                swatchImageUrl: productImage
              });
            }
          }
        }
        
        // Second priority: Use primary/first product image as fallback
        if (!productImage && productData?.product_images && Array.isArray(productData.product_images) && productData.product_images.length > 0) {
          const productImages = productData.product_images;
          const primaryImage = productImages.find((img: any) => img.is_primary);
          const selectedImageData = primaryImage || productImages[0];
          
          if (selectedImageData?.image_url) {
            productImage = getStorageImageUrl(selectedImageData.image_url);
          }
        } 
        
        // Third priority: Pattern-based fallback (for items without proper product_id)
        if (!productImage && (item.product_id || item.product_name)) {
          const possibleImages = getProductImageUrls(item.product_id || 'unknown', item.product_name);
          productImage = possibleImages[0];
        }
        
        return {
          ...item,
          product_image: productImage
        };
      });

      if (import.meta.env.DEV) {
        console.log('[OrderDetailsModal] Setting order items:', {
          orderId,
          processedItemsCount: processedItems.length,
          processedItems
        });
      }

      setOrderDetails(typedOrder);
      setOrderItems(processedItems);
    } catch (error) {
      console.error('Error loading order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!orderDetails || retryingPayment) return;

    // Check if Razorpay is loaded
    if (!razorpayLoaded) {
      toast.error('Payment system is loading. Please try again in a moment.');
      return;
    }

    // Check if order has pending payment
    if (orderDetails.payment_status !== 'pending' && orderDetails.payment_status !== 'failed') {
      toast.error('This order has already been paid');
      return;
    }

    if (!orderDetails.razorpay_order_id) {
      toast.error('Payment information not found. Please contact support.');
      return;
    }

    setRetryingPayment(true);

    try {
      // Fetch Razorpay settings from settings table
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('key, value')
        .eq('category', 'payment')
        .eq('key', 'razorpay_key_id');

      if (settingsError || !settingsData || settingsData.length === 0) {
        console.error('Failed to fetch Razorpay settings:', settingsError);
        toast.error('Payment configuration error. Please contact support.');
        setRetryingPayment(false);
        return;
      }

      const razorpayKey = settingsData[0].value as string;

      // Calculate amount to pay
      const amountToPay = orderDetails.payment_split 
        ? (orderDetails.online_amount || 0) 
        : orderDetails.total_amount;

      // Open Razorpay checkout with existing order ID
      openCheckout({
        key: razorpayKey,
        amount: Math.round(amountToPay * 100), // Convert to paise
        currency: 'INR',
        name: 'Nirchal Sarees',
        description: `Payment for Order ${orderDetails.order_number}`,
        order_id: orderDetails.razorpay_order_id,
        image: '/logo.png',
        prefill: {
          name: `${orderDetails.billing_first_name} ${orderDetails.billing_last_name}`,
          email: orderDetails.billing_email,
          contact: orderDetails.billing_phone || ''
        },
        theme: {
          color: '#d97706'
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderDetails.id.toString()
            });

            if (verificationResult.verified) {
              toast.success('✅ Payment successful!', { duration: 4000 });
              
              // Reload order details to show updated payment status
              await loadOrderDetails();
            } else {
              toast.error('❌ Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('❌ Payment verification failed. Please contact support.');
          } finally {
            setRetryingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled', { icon: '⚠️' });
            setRetryingPayment(false);
          }
        }
      });
    } catch (error) {
      console.error('Error initiating retry payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setRetryingPayment(false);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10100] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div 
          className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Order Details {orderDetails?.order_number && `- ${orderDetails.order_number}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Loading order details...</span>
            </div>
          ) : orderDetails ? (
            <div className="space-y-4">
              {/* Order Status */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(orderDetails.status)}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Order Status</h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(orderDetails.status)}`}>
                          {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Order Date</p>
                    <p className="text-sm font-medium">{formatDate(orderDetails.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Order Items</h3>
                {import.meta.env.DEV && (
                  <p className="text-xs text-gray-500 mb-2">Debug: {orderItems.length} items in state</p>
                )}
                <div className="space-y-2">
                  {orderItems.map((item) => {
                    // Detect if this is a service item
                    const isService = item.variant_size === 'Service' || item.variant_size === 'Custom';
                    
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                              {item.product_image ? (
                                <img
                                  src={item.product_image}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const placeholder = target.nextElementSibling as HTMLElement;
                                    if (placeholder) placeholder.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className="w-full h-full flex items-center justify-center text-gray-400"
                                style={{ display: item.product_image ? 'none' : 'flex' }}
                              >
                                <Package size={18} />
                              </div>
                            </div>
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.product_name}</h4>
                                {item.product_sku && (
                                  <p className="text-xs text-gray-500">SKU: {item.product_sku}</p>
                                )}
                                {/* Only show size/color/material for non-service items */}
                                {!isService && (
                                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-600">
                                    {item.variant_size && <span>Size: {item.variant_size}</span>}
                                    {item.variant_color && <span>Color: {item.variant_color}</span>}
                                    {item.variant_material && <span>Material: {item.variant_material}</span>}
                                  </div>
                                )}
                                {/* Show service badge */}
                                {isService && (
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    Service
                                  </span>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs text-gray-600">{formatCurrency(item.unit_price)} × {item.quantity}</p>
                                <p className="text-sm font-semibold text-primary-600">
                                  {formatCurrency(item.total_price)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-1.5 text-sm">
                  {/* Product/Service Breakdown */}
                  {(() => {
                    const productItems = orderItems.filter(item => 
                      item.variant_size !== 'Service' && item.variant_size !== 'Custom'
                    );
                    const serviceItems = orderItems.filter(item => 
                      item.variant_size === 'Service' || item.variant_size === 'Custom'
                    );
                    const productsTotal = productItems.reduce((sum, item) => sum + item.total_price, 0);
                    const servicesTotal = serviceItems.reduce((sum, item) => sum + item.total_price, 0);

                    return (
                      <>
                        {productItems.length > 0 && (
                          <div className="flex justify-between text-gray-700">
                            <span>Products ({productItems.length})</span>
                            <span>{formatCurrency(productsTotal)}</span>
                          </div>
                        )}
                        {serviceItems.length > 0 && (
                          <div className="flex justify-between text-gray-700">
                            <span>Services ({serviceItems.length})</span>
                            <span>{formatCurrency(servicesTotal)}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>{formatCurrency(orderDetails.subtotal)}</span>
                  </div>
                  {orderDetails.tax_amount > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Tax</span>
                      <span>{formatCurrency(orderDetails.tax_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span>{formatCurrency(orderDetails.shipping_amount)}</span>
                  </div>
                  {orderDetails.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(orderDetails.discount_amount)}</span>
                    </div>
                  )}
                  
                  {/* Payment Split Details */}
                  {orderDetails.payment_split ? (
                    <>
                      <div className="border-t border-gray-300 pt-1.5 mt-1.5"></div>
                      {/* Online Payment Status */}
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <span>💳 Paid Online</span>
                          {orderDetails.payment_status === 'paid' && (
                            <span className="flex items-center gap-0.5 text-green-600 text-xs">
                              <CheckCircle size={14} className="fill-current" />
                              <span className="font-medium">Paid</span>
                            </span>
                          )}
                          {orderDetails.payment_status === 'pending' && (
                            <span className="flex items-center gap-0.5 text-amber-600 text-xs">
                              <Clock size={14} />
                              <span className="font-medium">Pending</span>
                            </span>
                          )}
                          {orderDetails.payment_status === 'failed' && (
                            <span className="flex items-center gap-0.5 text-red-600 text-xs">
                              <AlertCircle size={14} />
                              <span className="font-medium">Failed</span>
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(orderDetails.online_amount || 0)}</span>
                          {(orderDetails.payment_status === 'pending' || orderDetails.payment_status === 'failed') && (
                            <button
                              onClick={handleRetryPayment}
                              disabled={retryingPayment}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 rounded transition-colors"
                              title="Retry Payment"
                            >
                              <RefreshCw size={12} className={retryingPayment ? 'animate-spin' : ''} />
                              {retryingPayment ? 'Processing...' : 'Retry'}
                            </button>
                          )}
                        </div>
                      </div>
                      {/* COD Payment Status */}
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <span>💰 Cash on Delivery</span>
                          {orderDetails.cod_collected && (
                            <span className="flex items-center gap-0.5 text-green-600 text-xs">
                              <CheckCircle size={14} className="fill-current" />
                              <span className="font-medium">Collected</span>
                            </span>
                          )}
                          {!orderDetails.cod_collected && (orderDetails.cod_amount || 0) > 0 && (
                            <span className="flex items-center gap-0.5 text-amber-600 text-xs">
                              <Clock size={14} />
                              <span className="font-medium">Pending</span>
                            </span>
                          )}
                        </span>
                        <span className="font-medium">{formatCurrency(orderDetails.cod_amount || 0)}</span>
                      </div>
                    </>
                  ) : (
                    /* Single Payment (non-split) */
                    <>
                      <div className="border-t border-gray-300 pt-1.5 mt-1.5"></div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <span>💳 Payment Status</span>
                          {orderDetails.payment_status === 'paid' && (
                            <span className="flex items-center gap-0.5 text-green-600 text-xs">
                              <CheckCircle size={14} className="fill-current" />
                              <span className="font-medium">Paid</span>
                            </span>
                          )}
                          {orderDetails.payment_status === 'pending' && (
                            <span className="flex items-center gap-0.5 text-amber-600 text-xs">
                              <Clock size={14} />
                              <span className="font-medium">Pending</span>
                            </span>
                          )}
                          {orderDetails.payment_status === 'failed' && (
                            <span className="flex items-center gap-0.5 text-red-600 text-xs">
                              <AlertCircle size={14} />
                              <span className="font-medium">Failed</span>
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(orderDetails.total_amount)}</span>
                          {(orderDetails.payment_status === 'pending' || orderDetails.payment_status === 'failed') && (
                            <button
                              onClick={handleRetryPayment}
                              disabled={retryingPayment}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 rounded transition-colors"
                              title="Retry Payment"
                            >
                              <RefreshCw size={12} className={retryingPayment ? 'animate-spin' : ''} />
                              {retryingPayment ? 'Processing...' : 'Retry'}
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{formatCurrency(orderDetails.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Billing Address */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Billing Address</h3>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
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
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Shipping Address</h3>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
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
                <h3 className="text-base font-semibold text-gray-900 mb-2">Payment Information</h3>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Payment Method</p>
                      <p className="font-medium">
                        {orderDetails.payment_method ? 
                          orderDetails.payment_method.charAt(0).toUpperCase() + orderDetails.payment_method.slice(1) 
                          : 'Not specified'}
                      </p>
                    </div>
                    {orderDetails.payment_transaction_id && (
                      <div>
                        <p className="text-xs text-gray-500">Transaction ID</p>
                        <p className="font-medium font-mono text-xs">{orderDetails.payment_transaction_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tracking Information */}
              {(orderDetails.shipped_at || orderDetails.delivered_at || orderDetails.tracking_number) && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Tracking Information</h3>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="space-y-2">
                      {/* Logistics Partner */}
                      {orderDetails.logistics_partners && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Courier Partner</span>
                          <span className="font-medium">{orderDetails.logistics_partners.name}</span>
                        </div>
                      )}

                      {/* Tracking Number */}
                      {orderDetails.tracking_number && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tracking Number</span>
                          <span className="font-mono text-xs font-medium bg-white px-2 py-1 rounded border">
                            {orderDetails.tracking_number}
                          </span>
                        </div>
                      )}

                      {/* Tracking URL */}
                      {orderDetails.tracking_number && getTrackingUrl(orderDetails) && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Track Package</span>
                          <a
                            href={getTrackingUrl(orderDetails)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1.5 bg-primary-600 text-white text-xs font-medium rounded hover:bg-primary-700 transition-colors"
                          >
                            <Truck size={14} />
                            Track Order
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="border-t pt-2 space-y-1.5">
                        {orderDetails.shipped_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipped At</span>
                            <span className="font-medium">{formatDate(orderDetails.shipped_at)}</span>
                          </div>
                        )}
                        {orderDetails.delivered_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivered At</span>
                            <span className="font-medium">{formatDate(orderDetails.delivered_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {orderDetails.notes && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Order Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
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
