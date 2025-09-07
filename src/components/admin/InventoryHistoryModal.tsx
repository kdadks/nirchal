import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  User, 
  TrendingUp, 
  TrendingDown, 
  Package,
  Filter,
  Download,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface HistoryRecord {
  id: string;
  inventory_id: string;
  product_name: string;
  product_id: string;
  variant_id?: string;
  old_quantity: number;
  new_quantity: number;
  adjustment: number;
  reason: string;
  reference?: string;
  user_id?: string;
  user_name?: string;
  created_at: string;
  action_type: 'adjustment' | 'sale' | 'purchase' | 'return' | 'damage' | 'correction';
}

interface InventoryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFetchHistory: (filters?: {
    inventoryId?: string;
    productId?: string;
    startDate?: string;
    endDate?: string;
    actionType?: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ records: HistoryRecord[]; total: number }>;
  inventoryId?: string;
  productName?: string;
}

const InventoryHistoryModal: React.FC<InventoryHistoryModalProps> = ({
  isOpen,
  onClose,
  onFetchHistory,
  inventoryId,
  productName
}) => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    actionType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  const actionTypeOptions = [
    { value: '', label: 'All Actions' },
    { value: 'stock_in', label: 'Stock In' },
    { value: 'stock_out', label: 'Stock Out' },
    { value: 'adjustment', label: 'Manual Adjustment' }
  ];

  const reasonOptions = [
    'Stock Count Correction',
    'Damaged Goods',
    'Lost/Stolen Items',
    'Expired Products',
    'Returns Processing',
    'Quality Control',
    'Supplier Correction',
    'System Error Fix',
    'Physical Audit',
    'Customer Order',
    'Stock Receipt',
    'Other'
  ];

  const loadHistory = async (page: number = 1) => {
    setLoading(true);
    setError('');

    try {
      const queryFilters = {
        inventoryId,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        ...(filters.actionType && { actionType: filters.actionType }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      };

      const result = await onFetchHistory(queryFilters);
      
      // Apply client-side filtering for search term and reason
      let filteredRecords = result.records;
      
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredRecords = filteredRecords.filter(record =>
          record.product_name.toLowerCase().includes(searchLower) ||
          record.reason.toLowerCase().includes(searchLower) ||
          (record.reference && record.reference.toLowerCase().includes(searchLower)) ||
          (record.user_name && record.user_name.toLowerCase().includes(searchLower))
        );
      }

      if (filters.reason) {
        filteredRecords = filteredRecords.filter(record =>
          record.reason === filters.reason
        );
      }

      setHistory(filteredRecords);
      setTotal(result.total);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to load inventory history. Please try again.');
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load history when modal opens or filters change
  useEffect(() => {
    if (isOpen) {
      loadHistory(1);
    }
  }, [isOpen, filters.actionType, filters.startDate, filters.endDate]);

  // Apply search and reason filters with debounce
  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        loadHistory(1);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [filters.searchTerm, filters.reason]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHistory([]);
      setTotal(0);
      setCurrentPage(1);
      setError('');
      setFilters({
        searchTerm: '',
        actionType: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
      setShowFilters(false);
    }
  }, [isOpen]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      actionType: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  const exportHistory = () => {
    const headers = [
      'Date/Time',
      'Product',
      'Action Type',
      'Old Quantity',
      'New Quantity',
      'Adjustment',
      'Reason',
      'Reference',
      'User'
    ];

    const csvContent = [
      headers.join(','),
      ...history.map(record => [
        new Date(record.created_at).toLocaleString(),
        `"${record.product_name}"`,
        record.action_type,
        record.old_quantity,
        record.new_quantity,
        record.adjustment,
        `"${record.reason}"`,
        `"${record.reference || ''}"`,
        `"${record.user_name || 'System'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_history_${inventoryId || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'stock_in':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'stock_out':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'adjustment':
        return <Package className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'stock_in':
        return 'text-green-600 bg-green-50';
      case 'stock_out':
        return 'text-red-600 bg-red-50';
      case 'adjustment':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Inventory History</h3>
                {productName && (
                  <p className="text-sm text-gray-600">Showing history for: {productName}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Controls */}
            <div className="mb-4 flex flex-wrap gap-2 justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 flex items-center"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filters
                </button>
                <button
                  onClick={() => loadHistory(currentPage)}
                  className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 flex items-center"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={exportHistory}
                  className="bg-green-100 text-green-700 px-3 py-2 rounded-md text-sm hover:bg-green-200 flex items-center"
                  disabled={history.length === 0}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </button>
              </div>

              {/* Quick Search */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products, reasons, references..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64"
                  />
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action Type
                    </label>
                    <select
                      value={filters.actionType}
                      onChange={(e) => handleFilterChange('actionType', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      {actionTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <select
                      value={filters.reason}
                      onChange={(e) => handleFilterChange('reason', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">All Reasons</option>
                      {reasonOptions.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* History Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-3" />
                    <span className="text-gray-600">Loading history...</span>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No history records found</p>
                    <p className="text-sm text-gray-400">Try adjusting your filters or check back later</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity Change
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              {formatDate(record.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getActionIcon(record.action_type)}
                              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionColor(record.action_type)}`}>
                                {record.action_type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600">{record.old_quantity}</span>
                                <span className="text-gray-400">→</span>
                                <span className="font-medium">{record.new_quantity}</span>
                              </div>
                              <div className={`text-xs ${record.adjustment > 0 ? 'text-green-600' : record.adjustment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {record.adjustment > 0 ? '+' : ''}{record.adjustment}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-48">
                              <div className="truncate">{record.reason}</div>
                              {record.reference && (
                                <div className="text-xs text-gray-500 truncate">
                                  Ref: {record.reference}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              {record.user_name || 'System'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total} records
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => loadHistory(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => loadHistory(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryHistoryModal;
