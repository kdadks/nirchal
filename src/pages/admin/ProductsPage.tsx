import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCategories, useVendors } from '../../hooks/useAdmin';
import DataTable from '../../components/admin/DataTable';
import type { ProductWithDetails } from '../../types/admin';
import { Package, Filter, Trash2, AlertTriangle, Upload, Download } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, deleteProduct, deleteProducts } = useProducts();
  const { categories } = useCategories();
  const { vendors } = useVendors();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  // Filter products based on current filters
  const filteredProducts = React.useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
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
  }, [products, filters]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts?.map(p => p.id.toString()) || []);
    } else {
      setSelectedProducts([]);
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

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget({ type: 'single' });
  };

  const columns = [
    {
      key: 'select',
      title: (
        <input
          type="checkbox"
          checked={products?.length > 0 && selectedProducts.length === products.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="admin-checkbox"
        />
      ),
      render: (row: ProductWithDetails) => (
        <input
          type="checkbox"
          checked={selectedProducts.includes(row.id.toString())}
          onChange={(e) => handleSelectProduct(row.id.toString(), e.target.checked)}
          className="admin-checkbox"
        />
      ),
    },
    {
      key: 'thumbnail',
      title: '',
      render: (row: ProductWithDetails) => {
        const img = row.images?.find(img => img.is_primary) || row.images?.[0];
        if (!img) {
          return (
            <div className="admin-product-thumbnail admin-image-placeholder">
              <Package className="h-4 w-4" />
            </div>
          );
        }
        // Build Supabase Storage public URL
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
        const publicUrl = img.image_url?.startsWith('http')
          ? img.image_url
          : `${supabaseUrl}/storage/v1/object/public/product-images/${img.image_url}`;
        return (
          <img 
            src={publicUrl} 
            alt={img.alt_text || ''} 
            className="admin-product-thumbnail"
          />
        );
      },
    },
    {
      key: 'name',
      title: 'Product',
      render: (row: ProductWithDetails) => (
        <div className="admin-product-title-wrapper">
          <button
            onClick={() => navigate(`/admin/products/edit/${row.id}`)}
            className="admin-product-title-link"
          >
            {row.name}
          </button>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      title: 'Status',
      render: (row: ProductWithDetails) => (
        <span className={`admin-badge ${row.is_active ? 'admin-badge-success' : 'admin-badge-neutral'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'inventory',
      title: 'Inventory',
      render: (row: ProductWithDetails) => {
        if (!row.inventory || row.inventory.length === 0) {
          return <span className="admin-text-muted">No stock</span>;
        }
        const totalStock = row.inventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
        const variantCount = row.variants?.length || 0;
        
        return (
          <div className="admin-text-sm">
            <div className={`admin-font-mono ${totalStock > 10 ? 'admin-text-success' : totalStock > 0 ? 'admin-text-warning' : 'admin-text-danger'}`}>
              {totalStock} in stock
            </div>
            {variantCount > 0 && (
              <div className="admin-text-muted admin-text-xs">
                for {variantCount} variant{variantCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'category',
      title: 'Category',
      render: (row: ProductWithDetails) => {
        // Defensive: handle null, array, or object
        if (!row.category) return <span className="admin-text-muted">-</span>;
        if (Array.isArray(row.category)) {
          return row.category[0]?.name || <span className="admin-text-muted">-</span>;
        }
        return row.category.name || <span className="admin-text-muted">-</span>;
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row: ProductWithDetails) => (
        <div className="admin-table-actions">
          <button
            onClick={() => handleDeleteProduct(row.id.toString())}
            className="admin-btn admin-btn-sm admin-btn-danger"
            title="Delete Product"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Filters */}
      {showFilters && (
        <div className="admin-card" style={{ marginBottom: '16px' }}>
          <div className="admin-card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="admin-form-group">
                <label className="admin-label">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="admin-input"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="admin-form-group">
                <label className="admin-label">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="admin-input"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="admin-form-group">
                <label className="admin-label">Vendor</label>
                <select
                  value={filters.vendor}
                  onChange={(e) => setFilters(prev => ({ ...prev, vendor: e.target.value }))}
                  className="admin-input"
                >
                  <option value="">All Vendors</option>
                  {vendors.filter(vendor => vendor.is_active).map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={filteredProducts || []}
        isLoading={loading}
        searchable={true}
        filterable={false}
        title={`Products (${filteredProducts?.length || 0}${filters.status || filters.category || filters.vendor ? ` of ${products?.length || 0}` : ''})`}
        subtitle="All products in your catalog"
        headerActions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {selectedProducts.length > 0 && (
              <>
                <div className="admin-text-sm admin-text-muted" style={{ marginRight: '8px' }}>
                  {selectedProducts.length} selected
                </div>
                <button
                  onClick={handleBulkDelete}
                  className="admin-btn admin-btn-danger admin-btn-sm"
                  title={`Delete ${selectedProducts.length} selected products`}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </button>
              </>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              title="Import Products"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              title="Export Products"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => navigate('/admin/products/create')}
              className="admin-btn admin-btn-primary admin-btn-sm"
              title="Add Product"
            >
              <Package className="h-4 w-4" />
              Add Product
            </button>
          </div>
        }
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirm Deletion
              </h3>
            </div>
            <div className="admin-modal-content">
              <p className="admin-text-secondary">
                {deleteTarget.type === 'single' 
                  ? 'Are you sure you want to delete this product? This action cannot be undone.'
                  : `Are you sure you want to delete ${deleteTarget.ids?.length} selected products? This action cannot be undone.`
                }
              </p>
              <p className="admin-text-sm admin-text-muted" style={{ marginTop: '8px' }}>
                This will permanently delete:
              </p>
              <ul className="admin-text-sm admin-text-muted" style={{ marginTop: '4px', paddingLeft: '16px' }}>
                <li>Product information and description</li>
                <li>All product images</li>
                <li>Product variants and inventory</li>
                <li>Product history and analytics</li>
              </ul>
            </div>
            <div className="admin-modal-actions">
              <button
                onClick={cancelDelete}
                className="admin-btn admin-btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="admin-btn admin-btn-danger"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
