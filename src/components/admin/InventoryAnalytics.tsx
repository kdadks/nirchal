import React, { useMemo } from 'react';
import { 
  Package, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  X
} from 'lucide-react';

interface InventoryAnalyticsProps {
  stats: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  inventory: Array<{
    id: string;
    product_id: string;
    variant_id: string | null;
    quantity: number;
    low_stock_threshold: number;
    product_name: string;
    product_price: number;
    variant_price_adjustment?: number;
    cost_price?: number;
    created_at: string;
    updated_at: string;
  }>;
  onClose: () => void;
}

const InventoryAnalytics: React.FC<InventoryAnalyticsProps> = ({ stats, inventory, onClose }) => {
  // Calculate additional analytics
  const analytics = useMemo(() => {
    if (!inventory.length) return {
      averageStockLevel: 0,
      totalProducts: 0,
      totalVariants: 0,
      topProducts: [],
      lowStockPercentage: 0,
      stockDistribution: { inStock: 0, lowStock: 0, outOfStock: 0 },
      valueDistribution: { high: 0, medium: 0, low: 0 }
    };

    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const averageStockLevel = totalQuantity / inventory.length;
    
    const uniqueProducts = new Set(inventory.map(item => item.product_id)).size;
    const totalVariants = inventory.filter(item => item.variant_id).length;
    
    // Calculate stock status distribution
    const stockDistribution = inventory.reduce((acc, item) => {
      if (item.quantity === 0) acc.outOfStock++;
      else if (item.quantity <= item.low_stock_threshold) acc.lowStock++;
      else acc.inStock++;
      return acc;
    }, { inStock: 0, lowStock: 0, outOfStock: 0 });

    // Calculate value distribution
    const valueDistribution = inventory.reduce((acc, item) => {
      const price = item.cost_price || item.product_price || 0;
      const adjustedPrice = item.variant_price_adjustment ? price + item.variant_price_adjustment : price;
      const value = item.quantity * adjustedPrice;
      
      if (value > 10000) acc.high++;
      else if (value > 1000) acc.medium++;
      else acc.low++;
      return acc;
    }, { high: 0, medium: 0, low: 0 });

    // Top 5 products by stock value
    const productValues = inventory
      .map(item => {
        const price = item.cost_price || item.product_price || 0;
        const adjustedPrice = item.variant_price_adjustment ? price + item.variant_price_adjustment : price;
        return {
          name: item.product_name,
          value: item.quantity * adjustedPrice,
          quantity: item.quantity
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const lowStockPercentage = (stats.lowStockItems / stats.totalItems) * 100;

    return {
      averageStockLevel: Math.round(averageStockLevel),
      totalProducts: uniqueProducts,
      totalVariants,
      topProducts: productValues,
      lowStockPercentage: Math.round(lowStockPercentage),
      stockDistribution,
      valueDistribution
    };
  }, [inventory, stats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Inventory Analytics</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Items</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalItems.toLocaleString()}</p>
                <p className="text-xs text-blue-600">
                  {analytics.totalProducts} products • {analytics.totalVariants} variants
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Total Value</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalValue)}</p>
                <p className="text-xs text-green-600">
                  Avg: {formatCurrency(stats.totalValue / Math.max(stats.totalItems, 1))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.lowStockItems}</p>
                <p className="text-xs text-yellow-600">
                  {analytics.lowStockPercentage}% of total
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-900">{stats.outOfStockItems}</p>
                <p className="text-xs text-red-600">
                  {formatPercentage(stats.outOfStockItems, stats.totalItems)}% of total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Status Distribution */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Status Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-700">In Stock</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{analytics.stockDistribution.inStock}</div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(analytics.stockDistribution.inStock, stats.totalItems)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-700">Low Stock</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{analytics.stockDistribution.lowStock}</div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(analytics.stockDistribution.lowStock, stats.totalItems)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-700">Out of Stock</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{analytics.stockDistribution.outOfStock}</div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(analytics.stockDistribution.outOfStock, stats.totalItems)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Progress Bars */}
            <div className="mt-4 space-y-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${formatPercentage(analytics.stockDistribution.inStock, stats.totalItems)}%` }}
                ></div>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${formatPercentage(analytics.stockDistribution.lowStock, stats.totalItems)}%` }}
                ></div>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${formatPercentage(analytics.stockDistribution.outOfStock, stats.totalItems)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Top Products by Value */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products by Stock Value</h3>
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-40" title={product.name}>
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500">Qty: {product.quantity}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(product.value)}</div>
                  </div>
                </div>
              ))}
              {analytics.topProducts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No inventory data available</p>
              )}
            </div>
          </div>

          {/* Value Distribution */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Value Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-700">High Value ({'>'}₹10k)</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{analytics.valueDistribution.high}</div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(analytics.valueDistribution.high, stats.totalItems)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-700">Medium Value (₹1k-₹10k)</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{analytics.valueDistribution.medium}</div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(analytics.valueDistribution.medium, stats.totalItems)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-700">Low Value ({'<'}₹1k)</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{analytics.valueDistribution.low}</div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(analytics.valueDistribution.low, stats.totalItems)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Average Stock Level</span>
                <span className="text-sm font-medium text-gray-900">{analytics.averageStockLevel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Unique Products</span>
                <span className="text-sm font-medium text-gray-900">{analytics.totalProducts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Product Variants</span>
                <span className="text-sm font-medium text-gray-900">{analytics.totalVariants}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Low Stock Alert Rate</span>
                <span className="text-sm font-medium text-gray-900">{analytics.lowStockPercentage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Average Item Value</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(stats.totalValue / Math.max(stats.totalItems, 1))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        {(stats.outOfStockItems > 0 || stats.lowStockItems > 0) && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Action Required</h4>
                <div className="mt-1 text-sm text-yellow-700">
                  {stats.outOfStockItems > 0 && (
                    <p>• {stats.outOfStockItems} items are completely out of stock and need immediate restocking.</p>
                  )}
                  {stats.lowStockItems > 0 && (
                    <p>• {stats.lowStockItems} items are running low on stock and should be reordered soon.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryAnalytics;
