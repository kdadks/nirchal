import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDisplayDate } from '../../utils/formatDate';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  IndianRupee,
  ArrowUpRight,
  BarChart3,
  TrendingUp,
  Activity,
  Plus
} from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAdminContext } from '../../contexts/AdminContext';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  billing_first_name: string;
  billing_last_name: string;
  billing_email?: string;
  has_return_request?: boolean;
  return_requests?: Array<{
    status: string;
  }>;
}

interface Product {
  id: string;
  name: string;
  price: number; // Base price (admin-only)
  sale_price: number | null;
  created_at: string;
  product_variants?: Array<{
    id: string;
    price_adjustment: number | null; // Customer-facing variant price (overrides sale price)
    size?: string;
    color?: string;
  }>;
}

interface DashboardStats {
  totalRevenue: number;
  ordersToday: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { counts } = useAdminContext();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRevenue: 0,
    ordersToday: 0,
    revenueGrowth: 0,
    ordersGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getProductDisplayPrice = (product: Product) => {
    // Priority: 1. Variant price (price_adjustment) 2. Sale price 3. Base price (admin only)
    // For customers: variant price overrides sale price, base price is admin-only
    // Never return zero - always fallback to a valid price
    if (product.product_variants && product.product_variants.length > 0) {
      const variantPrices = product.product_variants
        .map(v => v.price_adjustment)
        .filter((price): price is number => price !== null && price !== undefined && price > 0);
      
      if (variantPrices.length > 0) {
        return Math.min(...variantPrices);
      }
    }
    
    // Fallback to sale price if no valid variant prices
    if (product.sale_price && product.sale_price > 0) {
      return product.sale_price;
    }
    
    // Final fallback to base price (ensure it's never zero)
    return product.price > 0 ? product.price : 0.01;
  };

  const getProductPriceLabel = (product: Product) => {
    // Check if we have valid variant prices
    if (product.product_variants && product.product_variants.length > 0) {
      const variantPrices = product.product_variants
        .map(v => v.price_adjustment)
        .filter((price): price is number => price !== null && price !== undefined && price > 0);
      
      if (variantPrices.length > 0) {
        return 'Variant Price';
      }
    }
    
    // Fallback to sale price
    if (product.sale_price && product.sale_price > 0) {
      return 'Sale Price';
    }
    
    return 'Base Price (Admin)';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch recent orders with return request status
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          billing_first_name,
          billing_last_name,
          has_return_request,
          return_requests!return_requests_order_id_fkey(
            status
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) {
        throw ordersError;
      }
      setRecentOrders((ordersData as any) || []);

      // Fetch top products with sale_price and variants
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id, 
          name, 
          price, 
          sale_price, 
          created_at,
          product_variants(
            id,
            price_adjustment,
            size,
            color
          )
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      if (productsError) {
        throw productsError;
      }
      setTopProducts((productsData as any) || []);

      // Calculate dashboard stats
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const yesterday = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

      // Orders today (exclude cancelled)
      const { data: todayOrders, error: todayOrdersError } = await supabase
        .from('orders')
        .select('total_amount, status')
        .gte('created_at', todayStart.toISOString());

      if (todayOrdersError) throw todayOrdersError;

      // Orders yesterday (exclude cancelled)
      const { data: yesterdayOrders, error: yesterdayOrdersError } = await supabase
        .from('orders')
        .select('total_amount, status')
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', todayStart.toISOString());

      if (yesterdayOrdersError) throw yesterdayOrdersError;

      // Calculate total revenue (exclude cancelled orders)
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('orders')
        .select('total_amount, status')
        .neq('status', 'cancelled'); // Exclude cancelled orders

      if (allOrdersError) throw allOrdersError;

      // Get total refunded amount (only completed refunds)
      const { data: refundData, error: refundError } = await supabase
        .from('return_requests')
        .select('final_refund_amount, calculated_refund_amount')
        .eq('status', 'refund_completed');

      if (refundError) {
        console.error('Error fetching refunds:', refundError);
      }

      const totalRefunded = (refundData || []).reduce((sum, refund) => {
        const amount = (refund.final_refund_amount as number) || (refund.calculated_refund_amount as number) || 0;
        return sum + amount;
      }, 0);

      console.log('[Admin Dashboard] Total refunded amount:', totalRefunded);

      // Calculate revenue excluding cancelled orders and subtracting refunds
      const grossRevenue = (allOrders || []).reduce((sum, order) => sum + ((order as any).total_amount || 0), 0);
      const totalRevenue = grossRevenue - totalRefunded;

      const todayRevenue = (todayOrders || []).reduce((sum, order) => {
        const orderStatus = (order as any).status;
        if (orderStatus === 'cancelled') return sum;
        return sum + ((order as any).total_amount || 0);
      }, 0);
      
      const yesterdayRevenue = (yesterdayOrders || []).reduce((sum, order) => {
        const orderStatus = (order as any).status;
        if (orderStatus === 'cancelled') return sum;
        return sum + ((order as any).total_amount || 0);
      }, 0);

      const ordersToday = (todayOrders || []).length;
      const ordersYesterday = (yesterdayOrders || []).length;

      const revenueGrowth = yesterdayRevenue > 0 ? 
        Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100) : 0;
      const ordersGrowth = ordersYesterday > 0 ? 
        Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 100) : 0;

      setDashboardStats({
        totalRevenue,
        ordersToday,
        revenueGrowth,
        ordersGrowth
      });

    } catch (error) {
      // Error handling for production
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: 'Total Products',
      value: counts.products.toString(),
      change: '+12%',
      changeType: 'increase',
      icon: <Package className="h-5 w-5" />,
      onClick: () => navigate('/admin/products'),
    },
    {
      title: 'Orders Today',
      value: dashboardStats.ordersToday.toString(),
      change: `${dashboardStats.ordersGrowth >= 0 ? '+' : ''}${dashboardStats.ordersGrowth}%`,
      changeType: dashboardStats.ordersGrowth >= 0 ? 'increase' : 'decrease',
      icon: <ShoppingCart className="h-5 w-5" />,
      onClick: () => navigate('/admin/orders'),
    },
    {
      title: 'Active Users',
      value: counts.users.toString(),
      change: '+23%',
      changeType: 'increase',
      icon: <Users className="h-5 w-5" />,
      onClick: () => navigate('/admin/users'),
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(dashboardStats.totalRevenue),
      change: `${dashboardStats.revenueGrowth >= 0 ? '+' : ''}${dashboardStats.revenueGrowth}%`,
      changeType: dashboardStats.revenueGrowth >= 0 ? 'increase' : 'decrease',
      icon: <IndianRupee className="h-5 w-5" />,
      onClick: () => navigate('/admin/analytics'),
    }
  ];

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Add a new product to catalog',
      icon: <Plus className="h-5 w-5" />,
      onClick: () => navigate('/admin/products/create'),
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: <ShoppingCart className="h-5 w-5" />,
      onClick: () => navigate('/admin/orders'),
    },
    {
      title: 'Analytics',
      description: 'View sales analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      onClick: () => navigate('/admin/analytics'),
    },
    {
      title: 'Manage Users',
      description: 'View and manage users',
      icon: <Users className="h-5 w-5" />,
      onClick: () => navigate('/admin/users'),
    }
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md uppercase w-20 min-w-20 bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md uppercase w-20 min-w-20 bg-blue-100 text-blue-800';
      case 'shipped':
        return 'inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md uppercase w-20 min-w-20 bg-purple-100 text-purple-800';
      case 'delivered':
        return 'inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md uppercase w-20 min-w-20 bg-green-100 text-green-800';
      case 'cancelled':
        return 'inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md uppercase w-20 min-w-20 bg-red-100 text-red-800';
      default:
        return 'inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md uppercase w-20 min-w-20 bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid var(--admin-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="admin-card"
            style={{ cursor: 'pointer' }}
            onClick={stat.onClick}
          >
            <div className="admin-card-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p className="admin-text-secondary admin-text-sm" style={{ margin: '0 0 4px 0' }}>
                    {stat.title}
                  </p>
                  <p className="admin-font-mono" style={{ 
                    fontSize: '24px', 
                    fontWeight: '600', 
                    margin: '0 0 4px 0',
                    color: 'var(--admin-text-primary)'
                  }}>
                    {stat.value}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingUp className="h-4 w-4" style={{ color: 'var(--admin-success)' }} />
                    <span className="admin-text-xs" style={{ color: 'var(--admin-success)' }}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: 'var(--admin-bg)', 
                  borderRadius: '8px',
                  color: 'var(--admin-primary)'
                }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 400px', 
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity className="h-5 w-5" style={{ color: 'var(--admin-primary)' }} />
              <h2 className="admin-card-title">Recent Orders</h2>
            </div>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              View all
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          <div className="admin-card-content" style={{ padding: 0 }}>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Order Status</th>
                    <th>Return Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order, index) => {
                      const returnRequest = order.return_requests && order.return_requests.length > 0 
                        ? order.return_requests[0] 
                        : null;
                      const returnStatus = returnRequest?.status;
                      
                      return (
                        <tr key={index}>
                          <td>
                            <span className="admin-font-mono admin-text-sm">{order.order_number}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--admin-primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: '600'
                              }}>
                                {getInitials(order.billing_first_name, order.billing_last_name)}
                              </div>
                              <span className="admin-text-sm">{order.billing_first_name} {order.billing_last_name}</span>
                            </div>
                          </td>
                          <td>
                            <span className={getStatusBadgeClass(order.status)}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            {returnStatus ? (
                              <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md uppercase ${
                                returnStatus === 'refund_completed' ? 'bg-green-100 text-green-800 w-24 min-w-24' :
                                returnStatus === 'refund_initiated' ? 'bg-blue-100 text-blue-800 w-24 min-w-24' :
                                returnStatus === 'rejected' ? 'bg-red-100 text-red-800 w-24 min-w-24' :
                                returnStatus === 'approved' || returnStatus === 'partially_approved' ? 'bg-green-50 text-green-700 w-24 min-w-24' :
                                returnStatus === 'under_inspection' || returnStatus === 'received' ? 'bg-purple-100 text-purple-800 w-24 min-w-24' :
                                returnStatus === 'shipped_by_customer' ? 'bg-blue-50 text-blue-700 w-24 min-w-24' :
                                'bg-yellow-100 text-yellow-800 w-24 min-w-24'
                              }`}>
                                {returnStatus === 'refund_completed' ? 'Refunded' :
                                 returnStatus === 'refund_initiated' ? 'Refunding' :
                                 returnStatus === 'partially_approved' ? 'Partial' :
                                 returnStatus === 'shipped_by_customer' ? 'In Transit' :
                                 returnStatus === 'under_inspection' ? 'Inspecting' :
                                 returnStatus === 'pending_shipment' ? 'Pending' :
                                 returnStatus.replace(/_/g, ' ')}
                              </span>
                            ) : (
                              <span className="admin-text-muted admin-text-sm">—</span>
                            )}
                          </td>
                        <td>
                          <span className="admin-font-mono admin-text-sm">{formatCurrency(order.total_amount)}</span>
                        </td>
                        <td>
                          <span className="admin-text-muted admin-text-sm">
                            {formatDisplayDate(order.created_at)}
                          </span>
                        </td>
                      </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                        <span className="admin-text-muted">No recent orders found</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Products Sidebar */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package className="h-5 w-5" style={{ color: 'var(--admin-success)' }} />
              <h2 className="admin-card-title">Recent Products</h2>
            </div>
          </div>
          
          <div className="admin-card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} style={{ 
                    padding: '12px', 
                    border: '1px solid var(--admin-border)', 
                    borderRadius: '6px' 
                  }}>
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <p style={{ 
                          fontWeight: '500', 
                          margin: '0',
                          fontSize: '14px',
                          flex: 1
                        }}>
                          {product.name}
                        </p>
                        {product.product_variants && product.product_variants.length > 0 && (
                          <span className="admin-text-muted admin-text-xs" style={{ 
                            backgroundColor: 'var(--admin-bg)', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            marginLeft: '8px'
                          }}>
                            {product.product_variants.length} variants
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="admin-text-muted admin-text-sm">
                          {getProductPriceLabel(product)}
                        </span>
                        <span className="admin-font-mono admin-text-sm" style={{ fontWeight: '600' }}>
                          {formatCurrency(getProductDisplayPrice(product))}
                        </span>
                        {/* Show original price if variant price is different and exists */}
                        {product.product_variants && product.product_variants.length > 0 && 
                         product.product_variants.some(v => v.price_adjustment !== null && v.price_adjustment > 0) && (
                          <span className="admin-text-muted admin-text-xs" style={{ textDecoration: 'line-through' }}>
                            {formatCurrency(product.sale_price && product.sale_price > 0 ? product.sale_price : product.price)}
                          </span>
                        )}
                        {/* Show base price crossed out if only sale price is active */}
                        {(!product.product_variants?.some(v => v.price_adjustment !== null && v.price_adjustment > 0)) && 
                         product.sale_price && product.sale_price > 0 && product.sale_price < product.price && (
                          <span className="admin-text-muted admin-text-xs" style={{ textDecoration: 'line-through' }}>
                            {formatCurrency(product.price)}
                          </span>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <TrendingUp 
                            className="h-4 w-4" 
                            style={{ 
                              color: product.sale_price && product.sale_price < product.price 
                                ? 'var(--admin-success)' 
                                : 'var(--admin-primary)'
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center' 
                }}>
                  <span className="admin-text-muted">No products found</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Quick Actions</h2>
        </div>
        
        <div className="admin-card-content">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="admin-btn admin-btn-secondary"
                style={{ 
                  height: 'auto',
                  padding: '16px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: 'var(--admin-bg)', 
                  borderRadius: '6px',
                  marginBottom: '8px',
                  color: 'var(--admin-primary)'
                }}>
                  {action.icon}
                </div>
                <div>
                  <p style={{ 
                    fontWeight: '500', 
                    margin: '0 0 4px 0',
                    color: 'var(--admin-text-primary)'
                  }}>
                    {action.title}
                  </p>
                  <p className="admin-text-muted admin-text-sm" style={{ margin: 0 }}>
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
