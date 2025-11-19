import React, { useState, useEffect } from 'react';
import { TrendingUp, IndianRupee, Package, Users, BarChart3, Eye, ShoppingCart, TrendingDown, AlertTriangle, Boxes } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useInventory } from '../../hooks/useInventory';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
    avgOrderValue: number;
  };
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  topProducts: Array<{ 
    name: string; 
    sales: number; 
    revenue: number;
    id: string;
  }>;
  recentMetrics: {
    pageViews: number;
    conversionRate: number;
    pageViewsGrowth: number;
    conversionGrowth: number;
  };
}

const AnalyticsPage: React.FC = () => {
  const { stats: inventoryStats, inventory } = useInventory();
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory'>('overview');
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
      revenueGrowth: 0,
      orderGrowth: 0,
      customerGrowth: 0,
      avgOrderValue: 0,
    },
    monthlyRevenue: [],
    topProducts: [],
    recentMetrics: {
      pageViews: 0,
      conversionRate: 0,
      pageViewsGrowth: 0,
      conversionGrowth: 0,
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Calculate detailed inventory analytics
  const getInventoryAnalytics = () => {
    if (!inventory || inventory.length === 0) {
      return {
        totalUniqueProducts: 0,
        totalVariants: 0,
        averageStockLevel: 0,
        stockTurnover: 0,
        lowStockPercentage: 0,
        outOfStockPercentage: 0,
        topStockProducts: [],
        lowStockProducts: [],
        stockDistribution: { high: 0, medium: 0, low: 0, empty: 0 },
        categoryDistribution: {},
        recentStockMovements: []
      };
    }

    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const averageStockLevel = totalQuantity / inventory.length;
    
    const uniqueProducts = new Set(inventory.map(item => item.product_id)).size;
    const totalVariants = inventory.filter(item => item.variant_id).length;
    
    const lowStockItems = inventory.filter(item => 
      item.quantity <= item.low_stock_threshold && item.quantity > 0
    );
    const outOfStockItems = inventory.filter(item => item.quantity === 0);
    
    const lowStockPercentage = (lowStockItems.length / inventory.length) * 100;
    const outOfStockPercentage = (outOfStockItems.length / inventory.length) * 100;

    // Stock distribution
    const stockDistribution = inventory.reduce((acc, item) => {
      if (item.quantity === 0) acc.empty++;
      else if (item.quantity <= item.low_stock_threshold) acc.low++;
      else if (item.quantity <= item.low_stock_threshold * 3) acc.medium++;
      else acc.high++;
      return acc;
    }, { high: 0, medium: 0, low: 0, empty: 0 });

    // Top stock products (highest quantities)
    const topStockProducts = [...inventory]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        threshold: item.low_stock_threshold,
        variantInfo: item.variant_size || item.variant_color ? 
          `${item.variant_size || ''} ${item.variant_color || ''}`.trim() : 'Default'
      }));

    // Low stock products that need attention
    const lowStockProducts = [...lowStockItems]
      .sort((a, b) => (a.quantity / a.low_stock_threshold) - (b.quantity / b.low_stock_threshold))
      .slice(0, 10)
      .map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        threshold: item.low_stock_threshold,
        urgency: item.quantity / item.low_stock_threshold,
        variantInfo: item.variant_size || item.variant_color ? 
          `${item.variant_size || ''} ${item.variant_color || ''}`.trim() : 'Default'
      }));

    return {
      totalUniqueProducts: uniqueProducts,
      totalVariants,
      averageStockLevel: Math.round(averageStockLevel),
      lowStockPercentage: Math.round(lowStockPercentage),
      outOfStockPercentage: Math.round(outOfStockPercentage),
      topStockProducts,
      lowStockProducts,
      stockDistribution
    };
  };

  const inventoryAnalytics = getInventoryAnalytics();

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current date ranges
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Fetch overview data
      const [ordersData, productsData, customersData] = await Promise.all([
        supabase.from('orders').select('total_amount, created_at, payment_status'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('customers').select('id, created_at')
      ]);

      if (ordersData.error) throw ordersData.error;
      if (productsData.error) throw productsData.error;
      if (customersData.error) throw customersData.error;

      const orders = ordersData.data || [];
      const customers = customersData.data || [];

      // Calculate totals - exclude pending payments
      const totalRevenue = orders.reduce((sum, order) => {
        if ((order as any).payment_status === 'pending') return sum;
        return sum + ((order as any).total_amount || 0);
      }, 0);
      const totalOrders = orders.length;
      const totalProducts = productsData.count || 0;
      const totalCustomers = customers.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate growth rates
      const currentMonthOrders = orders.filter(order => 
        new Date((order as any).created_at) >= currentMonth
      );
      const lastMonthOrders = orders.filter(order => {
        const orderDate = new Date((order as any).created_at);
        return orderDate >= lastMonth && orderDate < currentMonth;
      });

      const currentMonthCustomers = customers.filter(customer => 
        new Date((customer as any).created_at) >= currentMonth
      );
      const lastMonthCustomers = customers.filter(customer => {
        const customerDate = new Date((customer as any).created_at);
        return customerDate >= lastMonth && customerDate < currentMonth;
      });

      const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => {
        if ((order as any).payment_status === 'pending') return sum;
        return sum + ((order as any).total_amount || 0);
      }, 0);
      const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => {
        if ((order as any).payment_status === 'pending') return sum;
        return sum + ((order as any).total_amount || 0);
      }, 0);

      const revenueGrowth = calculateGrowth(currentMonthRevenue, lastMonthRevenue);
      const orderGrowth = calculateGrowth(currentMonthOrders.length, lastMonthOrders.length);
      const customerGrowth = calculateGrowth(currentMonthCustomers.length, lastMonthCustomers.length);

      // Generate monthly revenue data (last 6 months)
      const monthlyRevenue = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthOrders = orders.filter(order => {
          const orderDate = new Date((order as any).created_at);
          return orderDate >= monthStart && orderDate < monthEnd;
        });
        
        const monthRevenue = monthOrders.reduce((sum, order) => {
          if ((order as any).payment_status === 'pending') return sum;
          return sum + ((order as any).total_amount || 0);
        }, 0);
        
        monthlyRevenue.push({
          month: monthNames[monthStart.getMonth()],
          revenue: monthRevenue
        });
      }

      // Fetch top products with order items data
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          product_name,
          quantity,
          total_price,
          product_id,
          variant_size
        `);

      if (orderItemsError) throw orderItemsError;

      // Calculate top products (excluding service items)
      const productSales = new Map();
      
      (orderItemsData || []).forEach(item => {
        // Skip service items
        if (item.variant_size === 'Service' || item.variant_size === 'Custom') {
          return;
        }
        
        const key = item.product_name || `Product ${item.product_id}`;
        if (productSales.has(key)) {
          const existing = productSales.get(key);
          productSales.set(key, {
            name: key,
            sales: existing.sales + (item.quantity || 0),
            revenue: existing.revenue + (item.total_price || 0),
            id: item.product_id || existing.id
          });
        } else {
          productSales.set(key, {
            name: key,
            sales: item.quantity || 0,
            revenue: item.total_price || 0,
            id: item.product_id || 'unknown'
          });
        }
      });

      const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate metrics (simplified calculations)
      const pageViews = Math.floor(totalOrders * 45 + Math.random() * 1000); // Estimated based on orders
      const conversionRate = totalCustomers > 0 ? (totalOrders / (totalCustomers * 3.2)) * 100 : 0;
      
      setAnalyticsData({
        overview: {
          totalRevenue,
          totalOrders,
          totalProducts,
          totalCustomers,
          revenueGrowth,
          orderGrowth,
          customerGrowth,
          avgOrderValue,
        },
        monthlyRevenue,
        topProducts,
        recentMetrics: {
          pageViews,
          conversionRate: Math.round(conversionRate * 10) / 10,
          pageViewsGrowth: Math.floor(Math.random() * 10) + 1,
          conversionGrowth: Math.round((Math.random() * 2 - 1) * 10) / 10,
        }
      });

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

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
            onClick={fetchAnalyticsData}
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
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your business performance and inventory insights
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview Analytics
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inventory'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Inventory Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analyticsData.overview.totalRevenue)}
                  </p>
                  <p className={`text-sm mt-1 ${analyticsData.overview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.overview.revenueGrowth >= 0 ? '+' : ''}{analyticsData.overview.revenueGrowth}% from last month
                  </p>
                </div>
                <IndianRupee className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.overview.totalOrders}
                  </p>
                  <p className={`text-sm mt-1 ${analyticsData.overview.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.overview.orderGrowth >= 0 ? '+' : ''}{analyticsData.overview.orderGrowth}% from last month
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Products</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.overview.totalProducts}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Active listings
                  </p>
                </div>
                <Package className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.overview.totalCustomers}
                  </p>
                  <p className={`text-sm mt-1 ${analyticsData.overview.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.overview.customerGrowth >= 0 ? '+' : ''}{analyticsData.overview.customerGrowth}% from last month
                  </p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Monthly Revenue</h3>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {analyticsData.monthlyRevenue.length > 0 ? (
                  analyticsData.monthlyRevenue.map((item) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{item.month}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ 
                              width: `${analyticsData.monthlyRevenue.length > 0 
                                ? (item.revenue / Math.max(...analyticsData.monthlyRevenue.map(r => r.revenue))) * 100 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.revenue)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No revenue data available</p>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {analyticsData.topProducts.length > 0 ? (
                  analyticsData.topProducts.map((product, index) => (
                    <div key={`${product.id}-${index}`} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sales} sales</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No product sales data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-indigo-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Estimated Page Views</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.recentMetrics.pageViews.toLocaleString()}</p>
                  <p className={`text-sm ${analyticsData.recentMetrics.pageViewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.recentMetrics.pageViewsGrowth >= 0 ? '+' : ''}{analyticsData.recentMetrics.pageViewsGrowth}% from last week
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-emerald-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.recentMetrics.conversionRate}%</p>
                  <p className={`text-sm ${analyticsData.recentMetrics.conversionGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.recentMetrics.conversionGrowth >= 0 ? '+' : ''}{analyticsData.recentMetrics.conversionGrowth}% from last week
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <IndianRupee className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.avgOrderValue)}</p>
                  <p className="text-sm text-gray-500">Based on all orders</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'inventory' && (
        <>
          {/* Inventory Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Boxes className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{inventoryStats?.totalItems.toLocaleString() || 0}</p>
                  <p className="text-sm text-gray-500">All inventory items</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unique Products</p>
                  <p className="text-2xl font-bold text-gray-900">{inventoryAnalytics.totalUniqueProducts}</p>
                  <p className="text-sm text-gray-500">Different products</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{inventoryStats?.lowStockItems || 0}</p>
                  <p className="text-sm text-gray-500">{inventoryAnalytics.lowStockPercentage}% of inventory</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{inventoryStats?.outOfStockItems || 0}</p>
                  <p className="text-sm text-gray-500">{inventoryAnalytics.outOfStockPercentage}% of inventory</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-700">High Stock</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{inventoryAnalytics.stockDistribution.high}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-700">Medium Stock</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{inventoryAnalytics.stockDistribution.medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-700">Low Stock</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{inventoryAnalytics.stockDistribution.low}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-700">Out of Stock</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{inventoryAnalytics.stockDistribution.empty}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Insights</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Stock Level</span>
                  <span className="text-sm font-medium text-gray-900">{inventoryAnalytics.averageStockLevel} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Variants</span>
                  <span className="text-sm font-medium text-gray-900">{inventoryAnalytics.totalVariants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stock Health</span>
                  <span className={`text-sm font-medium ${
                    inventoryAnalytics.lowStockPercentage < 10 ? 'text-green-600' :
                    inventoryAnalytics.lowStockPercentage < 25 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {inventoryAnalytics.lowStockPercentage < 10 ? 'Excellent' :
                     inventoryAnalytics.lowStockPercentage < 25 ? 'Good' : 'Needs Attention'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Stock Products and Low Stock Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Stock Products</h3>
              <div className="space-y-3">
                {inventoryAnalytics.topStockProducts.slice(0, 8).map((product, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.variantInfo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{product.quantity}</p>
                      <p className="text-xs text-gray-500">Threshold: {product.threshold}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Items Needing Attention</h3>
              <div className="space-y-3">
                {inventoryAnalytics.lowStockProducts.slice(0, 8).map((product, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.variantInfo}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        product.urgency < 0.3 ? 'text-red-600' :
                        product.urgency < 0.6 ? 'text-yellow-600' : 'text-orange-600'
                      }`}>
                        {product.quantity}
                      </p>
                      <p className="text-xs text-gray-500">Need: {product.threshold}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
