import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useAdmin';
import DataTable from '../../components/admin/DataTable';
import type { ProductWithDetails } from '../../types/admin';
import { Package, Plus, Edit, Trash2, Eye } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, deleteProduct, refresh } = useProducts();

  // Debug: log products data
  React.useEffect(() => {
    if (products) console.log('[ProductsPage] products:', products);
  }, [products]);

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (row: ProductWithDetails) => (
        <div className="font-medium">{row.name}</div>
      ),
      sortable: true,
    },
    {
      key: 'category',
      title: 'Category',
      render: (row: ProductWithDetails) => {
        // Defensive: handle null, array, or object
        if (!row.category) return '-';
        if (Array.isArray(row.category)) {
          return row.category[0]?.name || '-';
        }
        return row.category.name || '-';
      },
    },
    {
      key: 'price',
      title: 'Price',
  render: (row: ProductWithDetails) => `₹${row.sale_price ?? row.price}`,
      sortable: true,
    },
    {
      key: 'images',
      title: 'Image',
      render: (row: ProductWithDetails) => {
        const img = row.images?.find(img => img.is_primary) || row.images?.[0];
        if (!img) return <span className="text-gray-400">No image</span>;
        // Build Supabase Storage public URL
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
        const publicUrl = img.image_url?.startsWith('http')
          ? img.image_url
          : `${supabaseUrl}/storage/v1/object/public/product-images/${img.image_url}`;
        return (
          <img src={publicUrl} alt={img.alt_text || ''} className="h-12 w-12 object-cover rounded" />
        );
      },
    },
    {
      key: 'variants',
      title: 'Variants',
      render: (row: ProductWithDetails) => (
        <span>{row.variants?.length || 0}</span>
      ),
    },
    {
      key: 'inventory',
      title: 'Stock',
      render: (row: ProductWithDetails) => {
        if (!row.inventory || row.inventory.length === 0) return '-';
        const total = row.inventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
        return total;
      },
    },
  ];

  const actions = [
    {
      label: 'View',
      color: 'default' as const,
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: ProductWithDetails) => navigate(`/admin/products/${row.id}`),
    },
    {
      label: 'Edit',
      color: 'primary' as const,
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: ProductWithDetails) => navigate(`/admin/products/edit/${row.id}`),
    },
    {
      label: 'Delete',
      color: 'danger' as const,
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async (row: ProductWithDetails) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
          await deleteProduct(row.id);
          refresh();
        }
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-6 lg:mb-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-2xl">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-800 to-accent-600 bg-clip-text text-transparent">
                Products
              </h1>
              <p className="text-neutral-600 font-accent">
                Manage your product catalog and inventory
              </p>
            </div>
          </div>
        </div>
        
        <button
          className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-200 group"
          onClick={() => navigate('/admin/products/create')}
        >
          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
          <span className="font-medium">Add Product</span>
        </button>
      </div>

      {/* Products Table */}
      <DataTable
        title="Product Catalog"
        subtitle={`${products?.length || 0} products in your store`}
        columns={columns}
        data={products || []}
        actions={actions}
        isLoading={loading}
        searchable={true}
        filterable={true}
      />
    </div>
  );
};

export default ProductsPage;
//