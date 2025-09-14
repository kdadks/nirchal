import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCategories, useVendors } from '../../hooks/useAdmin';
import { usePagination } from '../../hooks/usePagination';
import { useAdminSearch } from '../../contexts/AdminSearchContext';
import Pagination from '../../components/common/Pagination';
import ProductImportModal from '../../components/admin/ProductImportModal';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import { getStorageImageUrl } from '../../utils/storageUtils';
import { Package, Filter, Trash2, Upload, Download } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, deleteProduct, deleteProducts, updateProduct, refresh } = useProducts();
  const { categories } = useCategories();
  const { vendors } = useVendors();
  const { searchTerm } = useAdminSearch();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'bulk'; id?: string; ids?: string[] }>({ type: 'single' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    vendor: ''
  });

  // Debug: log products data
  React.useEffect(() => {
    if (products && products.length > 0) {
  if (import.meta.env.DEV) console.debug(`[ProductsPage] loaded ${products.length} products with inventory`);
    }
  }, [products]);

  // Filter products based on current filters and search term
  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(searchLower);
        const matchesDescription = product.description?.toLowerCase().includes(searchLower);
        const matchesSku = product.sku?.toLowerCase().includes(searchLower);
        const matchesCategory = categories.find(cat => cat.id === product.category_id)?.name.toLowerCase().includes(searchLower);
        const matchesVendor = vendors.find(v => v.id === product.vendor_id)?.name.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesDescription && !matchesSku && !matchesCategory && !matchesVendor) {
          return false;
        }
      }
      
      // Status filter
      if (filters.status) {
        const isActive = product.is_active;
        if (filters.status === 'active' && !isActive) return false;
        if (filters.status === 'inactive' && isActive) return false;
      }
      
      // Category filter
      if (filters.category && product.category_id !== filters.category) {
        return false;
      }
      
      // Vendor filter
      if (filters.vendor && product.vendor_id !== filters.vendor) {
        return false;
      }
      
      return true;
    });
  }, [products, filters, searchTerm, categories, vendors]);

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: paginatedProducts,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    data: filteredProducts,
    defaultItemsPerPage: 25,
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all products from current page only
      setSelectedProducts(prev => {
        const currentPageIds = paginatedProducts?.map(p => p.id.toString()) || [];
        const newSelected = [...new Set([...prev, ...currentPageIds])];
        return newSelected;
      });
    } else {
      // Deselect all products from current page
      const currentPageIds = paginatedProducts?.map(p => p.id.toString()) || [];
      setSelectedProducts(prev => prev.filter(id => !currentPageIds.includes(id)));
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setDeleteTarget({ type: 'single', id: productId });
    setShowDeleteConfirm(true);
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    setDeleteTarget({ type: 'bulk', ids: selectedProducts });
    setShowDeleteConfirm(true);
  };

  const handleToggleFeatured = async (productId: string, currentFeaturedStatus: boolean) => {
    try {
      await updateProduct(productId, { is_featured: !currentFeaturedStatus });
      await refresh(); // Refresh the products list to show updated status
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'single' && deleteTarget.id) {
        await deleteProduct(deleteTarget.id);
      } else if (deleteTarget.type === 'bulk' && deleteTarget.ids) {
        await deleteProducts(deleteTarget.ids);
        setSelectedProducts([]); // Clear selection after bulk delete
      }
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete error:', error);
      // You could add a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Header with Title and Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Products ({totalItems}{filters.status || filters.category || filters.vendor ? ` of ${products?.length || 0}` : ''})</h1>
            </div>
            <div className="flex items-center space-x-3">
              {selectedProducts.length > 0 && (
                <>
                  <span className="text-sm text-gray-500">
                    {selectedProducts.length} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Selected
                  </button>
                </>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? 'Hide Filters' : 'Filters'}
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="h-4 w-4 mr-1" />
                Import
              </button>
              <button
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
              <button
                onClick={() => navigate('/admin/products/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Package className="h-4 w-4 mr-1" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select
                  value={filters.vendor}
                  onChange={(e) => setFilters(prev => ({ ...prev, vendor: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Vendors</option>
                  {vendors.filter(vendor => vendor.is_active).map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="responsive-table-wrapper">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading products...</p>
            </div>
          ) : (
            <table className="admin-table admin-products-table min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="admin-table-col-0 px-4 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={paginatedProducts?.length > 0 && selectedProducts.length === paginatedProducts.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="admin-table-col-1 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th scope="col" className="admin-table-col-2 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="admin-table-col-3 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="admin-table-col-4 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inventory
                  </th>
                  <th scope="col" className="admin-table-col-5 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="admin-table-col-6 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th scope="col" className="admin-table-col-7 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProducts?.map((product) => {
                  const img = product.images?.find(img => img.is_primary) || product.images?.[0];
                  const publicUrl = img?.image_url?.startsWith('http')
                    ? img.image_url
                    : img?.image_url 
                    ? getStorageImageUrl(img.image_url)
                    : null;
                  
                  const totalStock = product.inventory?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0;
                  const variantCount = product.variants?.length || 0;
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="admin-table-col-0 px-4 py-2 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id.toString())}
                          onChange={(e) => handleSelectProduct(product.id.toString(), e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="admin-table-col-1 px-4 py-2 whitespace-nowrap text-center">
                        {publicUrl ? (
                          <img 
                            src={publicUrl} 
                            alt={img?.alt_text || product.name} 
                            className="h-8 w-8 rounded-md object-cover mx-auto"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center mx-auto">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="admin-table-col-2 px-4 py-2">
                        <div className="flex items-center min-w-0">
                          <div className="min-w-0 flex-1">
                            <button
                              onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block max-w-full"
                              title={product.name}
                            >
                              {product.name}
                            </button>
                            {product.sku && (
                              <div className="text-xs text-gray-400 truncate max-w-full" title={`SKU: ${product.sku}`}>
                                SKU: {product.sku}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="admin-table-col-3 px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {product.category ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 truncate max-w-full">
                            {Array.isArray(product.category) ? product.category[0]?.name : product.category.name}
                          </span>
                        ) : (
                          <span className="text-gray-400">No category</span>
                        )}
                      </td>
                      <td className="admin-table-col-4 px-4 py-2 whitespace-nowrap">
                        <div className="text-sm">
                          <div className={`font-medium ${
                            totalStock > 10 
                              ? 'text-green-600' 
                              : totalStock > 0 
                              ? 'text-yellow-600' 
                              : 'text-red-600'
                          }`}>
                            {totalStock} in stock
                          </div>
                          {variantCount > 0 && (
                            <div className="text-xs text-gray-500">
                              {variantCount} variant{variantCount !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="admin-table-col-5 px-4 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md uppercase ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="admin-table-col-6 px-4 py-2 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleFeatured(product.id.toString(), Boolean(product.is_featured))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            product.is_featured
                              ? 'bg-blue-600'
                              : 'bg-gray-200'
                          }`}
                          title={product.is_featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              product.is_featured ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="admin-table-col-7 px-4 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleDeleteProduct(product.id.toString())}
                            className="text-red-600 hover:text-red-800"
                            title="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-4 py-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget({ type: 'single' });
        }}
        onConfirm={confirmDelete}
        title={deleteTarget.type === 'single' ? 'Delete Product' : 'Delete Products'}
        description={
          deleteTarget.type === 'single' 
            ? 'Are you sure you want to delete this product? This action cannot be undone.'
            : `Are you sure you want to delete ${deleteTarget.ids?.length} selected products? This action cannot be undone.`
        }
        itemType="product"
        items={
          deleteTarget.type === 'bulk' && deleteTarget.ids
            ? deleteTarget.ids.map(id => {
                const product = products?.find(p => p.id === id);
                return { id, name: product?.name || 'Unknown Product' };
              })
            : []
        }
        singleItemName={
          deleteTarget.type === 'single' && deleteTarget.id
            ? products?.find(p => p.id === deleteTarget.id)?.name
            : undefined
        }
        consequences={[
          'Product information and description',
          'All product images',
          'Product variants and inventory',
          'Product history and analytics'
        ]}
        isDeleting={isDeleting}
        variant="danger"
      />

      {/* Import Modal */}
      <ProductImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => {
          setShowImportModal(false);
          refresh();
        }}
      />
    </div>
  );
};

export default ProductsPage;
