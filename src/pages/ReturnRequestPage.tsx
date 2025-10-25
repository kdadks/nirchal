import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { ReturnRequestForm } from '../components/returns/ReturnRequestForm';
import SEO from '../components/SEO';
import { AlertTriangle, ArrowLeft, Package } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_variant_id?: string;
  variant_size?: string;
  variant_color?: string;
  variant_material?: string;
  product_sku?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  delivered_at: string;
  created_at: string;
  order_items: OrderItem[];
}

const ReturnRequestPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const navigate = useNavigate();
  const { customer } = useCustomerAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) {
      navigate('/myaccount?tab=orders');
      return;
    }

    if (!orderId) {
      setError('Order ID is required');
      setLoading(false);
      return;
    }

    loadOrder();
  }, [orderId, customer, navigate]);

  const loadOrder = async () => {
    if (!orderId || !customer) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          delivered_at,
          created_at,
          order_items (
            id,
            product_id,
            product_name,
            product_variant_id,
            variant_size,
            variant_color,
            variant_material,
            product_sku,
            unit_price,
            quantity,
            total_price
          )
        `)
        .eq('id', orderId)
        .eq('customer_id', customer.id)
        .single();

      if (fetchError) {
        console.error('Error loading order:', fetchError);
        setError('Failed to load order details');
        return;
      }

      if (!data) {
        setError('Order not found');
        return;
      }

      // Ensure delivered_at is a string (not null) for the form
      const orderData = {
        ...data,
        delivered_at: data.delivered_at || data.created_at, // Fallback to created_at if delivered_at is null
      } as unknown as Order;

      setOrder(orderData);
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate('/myaccount?tab=orders');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <>
        <SEO
          title="Return Request Error - Nirchal"
          description="Error loading return request"
        />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Process Request</h1>
              <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
              <Link
                to="/myaccount?tab=orders"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Check if order is eligible for return
  const isDelivered = order.status === 'delivered';
  const isPaid = order.payment_status === 'paid';
  const isEligible = isDelivered && isPaid;

  if (!isEligible) {
    return (
      <>
        <SEO
          title="Return Not Available - Nirchal"
          description="This order is not eligible for return"
        />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center gap-3 mb-6">
                <Package size={32} className="text-gray-400" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Return Not Available</h1>
                  <p className="text-gray-500">Order #{order.order_number}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">Order Not Eligible</h3>
                    <p className="text-yellow-800 text-sm">
                      {!isDelivered && 'Returns can only be requested for delivered orders.'}
                      {isDelivered && !isPaid && 'Returns can only be requested for paid orders.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div>
                    <span className="text-gray-500">Order Status:</span>
                    <p className="font-medium capitalize">{order.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment Status:</span>
                    <p className="font-medium capitalize">{order.payment_status}</p>
                  </div>
                </div>

                <Link
                  to="/myaccount?tab=orders"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft size={20} />
                  Back to Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`Return Request - Order #${order.order_number}`}
        description="Submit a return request for your order"
      />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Link
              to="/myaccount?tab=orders"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              Back to Orders
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Request Return</h1>
            <p className="text-gray-600">Order #{order.order_number}</p>
          </div>

          <ReturnRequestForm
            isOpen={true}
            onClose={() => navigate('/myaccount?tab=orders')}
            order={order}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </>
  );
};

export default ReturnRequestPage;
