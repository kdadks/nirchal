import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Download, 
  BarChart3,
  AlertTriangle,
  TrendingDown,
  Edit,
  History,
  RefreshCw,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Archive
} from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import InventoryAdjustmentModal from '../../components/admin/InventoryAdjustmentModal';
import InventoryHistoryModal from '../../components/admin/InventoryHistoryModal';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const InventoryPage: React.FC = () => {
  const {
    inventory,
    loading,
    error,
    stats,
    fetchInventory,
    adjustInventory,
    getInventoryHistory
  } = useInventory();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Modal states
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyInventoryId, setHistoryInventoryId] = useState<string>('');
  const [historyProductName, setHistoryProductName] = useState<string>('');

  // Load inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Filter and sort inventory
  const filteredInventory = inventory
    .filter(item => {
      const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      switch (filterStatus) {
        case 'low-stock':
          return matchesSearch && item.quantity <= item.low_stock_threshold && item.quantity > 0;
        case 'out-of-stock':
          return matchesSearch && item.quantity === 0;
        case 'in-stock':
          return matchesSearch && item.quantity > item.low_stock_threshold;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => {
      let aVal: any = a[sortBy as keyof typeof a];
      let bVal: any = b[sortBy as keyof typeof b];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

  // Pagination calculations
  const totalItems = filteredInventory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = filteredInventory.slice(startIndex, endIndex);

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === currentPageItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentPageItems.map(item => item.id));
    }
  };

  const handleAdjustment = async (adjustments: Array<{
    inventoryId: string;
    adjustment: number;
    reason: string;
    reference?: string;
  }>) => {
    try {
      for (const adj of adjustments) {
        await adjustInventory(adj.inventoryId, adj.adjustment, adj.reason, adj.reference);
      }
      await fetchInventory(); // Refresh inventory
      setSelectedItems([]); // Clear selection
    } catch (error) {
      console.error('Failed to apply adjustments:', error);
      throw error;
    }
  };

  const handleShowHistory = (inventoryId: string, productName: string) => {
    setHistoryInventoryId(inventoryId);
    setHistoryProductName(productName);
    setShowHistoryModal(true);
  };

  const handleExportInventory = () => {
    // Get selected inventory items or all visible items if none selected
    const itemsToExport = selectedItems.length > 0 
      ? filteredInventory.filter(item => selectedItems.includes(item.id))
      : currentPageItems;

    if (itemsToExport.length === 0) {
      return;
    }

    // Prepare data for Excel
    const exportData = itemsToExport.map(item => {
      const variantName = (() => {
        const parts = [];
        if (item.variant_size) parts.push(item.variant_size);
        if (item.variant_color) parts.push(item.variant_color);
        return parts.length > 0 ? parts.join(' / ') : 'Default';
      })();

      const status = getStockStatus(item);

      return {
        'Product Name': item.product_name,
        'Product SKU': item.product_sku || '',
        'Variant Name': variantName,
        'Variant SKU': item.variant_sku || '',
        'Current Stock': item.quantity,
        'Low Stock Threshold': item.low_stock_threshold,
        'Status': status.label,
        'Last Updated': new Date(item.updated_at).toLocaleDateString()
      };
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = selectedItems.length > 0 
      ? `inventory_selected_${timestamp}.xlsx`
      : `inventory_page_${currentPage}_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  const getStockStatus = (item: any) => {
    if (item.quantity === 0) {
      return { label: 'Out of Stock', className: 'bg-red-100 text-red-800' };
    } else if (item.quantity <= item.low_stock_threshold) {
      return { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'In Stock', className: 'bg-green-100 text-green-800' };
    }
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your product inventory levels
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => navigate('/admin/analytics')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Boxes className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Items</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalItems.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Archive className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Inventory</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalQuantity.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-xl font-bold text-gray-900">{stats.lowStockItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                <p className="text-xl font-bold text-gray-900">{stats.outOfStockItems}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64"
                />
              </div>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[140px]"
              >
                <option value="all">All Items</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="product_name-asc">Name A-Z</option>
                <option value="product_name-desc">Name Z-A</option>
                <option value="quantity-asc">Quantity Low-High</option>
                <option value="quantity-desc">Quantity High-Low</option>
                <option value="updated_at-desc">Recently Updated</option>
                <option value="updated_at-asc">Oldest Updated</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <div className="relative group">
                <button
                  onClick={handleExportInventory}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export Excel
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  {selectedItems.length > 0 
                    ? `Export ${selectedItems.length} selected records` 
                    : `Export ${currentPageItems.length} records from current page`
                  }
                </div>
              </div>
              <button
                onClick={() => setShowAdjustmentModal(true)}
                disabled={selectedItems.length === 0}
                className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-300 flex items-center"
                title="Bulk adjust inventory quantities for selected items (add/subtract stock, handle returns, damaged goods, etc.)"
              >
                <Edit className="h-4 w-4 mr-1" />
                Adjust Selected ({selectedItems.length})
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="responsive-table-wrapper">
          <table className="admin-table admin-inventory-table min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="admin-table-col-0 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === currentPageItems.length && currentPageItems.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="admin-table-col-1 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="admin-table-col-2 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variant Name
                </th>
                <th className="admin-table-col-3 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="admin-table-col-4 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="admin-table-col-5 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hide-mobile">
                  Last Updated
                </th>
                <th className="admin-table-col-6 px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPageItems.map((item) => {
                const status = getStockStatus(item);
                
                // Create variant name from size and color
                const variantName = (() => {
                  const parts = [];
                  if (item.variant_size) parts.push(item.variant_size);
                  if (item.variant_color) parts.push(item.variant_color);
                  return parts.length > 0 ? parts.join(' / ') : 'Default';
                })();

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="admin-table-col-0 px-3 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="admin-table-col-1 px-3 py-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate text-left">{item.product_name}</div>
                        <div className="text-xs text-gray-500 truncate text-left">
                          SKU: {item.variant_sku || item.product_sku || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="admin-table-col-2 px-3 py-3">
                      <div className="min-w-0 ml-4">
                        <div className="text-sm font-medium text-gray-900 truncate">{variantName}</div>
                      </div>
                    </td>
                    <td className="admin-table-col-3 px-3 py-3 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{item.quantity}</div>
                        <div className="text-xs text-gray-500">Threshold: {item.low_stock_threshold}</div>
                      </div>
                    </td>
                    <td className="admin-table-col-4 px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${status.className} uppercase`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="admin-table-col-5 px-3 py-3 whitespace-nowrap text-sm text-gray-500 hide-mobile">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </td>
                    <td className="admin-table-col-6 px-3 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleShowHistory(item.id, item.product_name)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View History"
                        >
                          <History className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {currentPageItems.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No inventory items found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {/* Page numbers */}
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
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <InventoryAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        onAdjust={handleAdjustment}
        inventory={inventory}
        selectedItems={selectedItems}
      />

      <InventoryHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onFetchHistory={getInventoryHistory}
        inventoryId={historyInventoryId}
        productName={historyProductName}
      />
    </div>
  );
};

export default InventoryPage;
