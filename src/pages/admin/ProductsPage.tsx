import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useAdmin';
import DataTable from '../../components/admin/DataTable';
import type { ProductWithDetails } from '../../types/admin';
import { Package, Filter } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    vendor: ''
  });

  // Debug: log products data
  React.useEffect(() => {
    if (products && products.length > 0) {
      console.log(`[ProductsPage] Loaded ${products.length} products with inventory`);
    }
  }, [products]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products?.map(p => p.id.toString()) || []);
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
                  {/* Add dynamic categories here */}
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
                  {/* Add dynamic vendors here */}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={products || []}
        isLoading={loading}
        searchable={true}
        filterable={false}
        title={`Products (${products?.length || 0})`}
        subtitle="All products in your catalog"
        headerActions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {selectedProducts.length > 0 && (
              <div className="admin-text-sm admin-text-muted" style={{ marginRight: '8px' }}>
                {selectedProducts.length} selected
              </div>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        }
      />
    </div>
  );
};

export default ProductsPage;
