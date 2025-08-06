import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useAdmin';
import DataTable from '../../components/admin/DataTable';
import type { ProductWithDetails } from '../../types/admin';

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
      render: (row: ProductWithDetails) => `₹${row.price}`,
      sortable: true,
    },
    {
      key: 'images',
      title: 'Image',
      render: (row: ProductWithDetails) => {
        const img = row.images?.find(img => img.is_primary) || row.images?.[0];
        return img ? (
          <img src={img.image_url} alt={img.alt_text || ''} className="h-12 w-12 object-cover rounded" />
        ) : (
          <span className="text-gray-400">No image</span>
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
      render: (row: ProductWithDetails) => row.inventory?.quantity ?? '-',
    },
  ];

  const actions = [
    {
      label: 'Edit',
      color: 'primary' as const,
      onClick: (row: ProductWithDetails) => navigate(`/admin/products/edit/${row.id}`),
    },
    {
      label: 'Delete',
      color: 'danger' as const,
      onClick: async (row: ProductWithDetails) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
          await deleteProduct(row.id);
          refresh();
        }
      },
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button
          className="bg-primary-600 text-white px-4 py-2 rounded"
          onClick={() => navigate('/admin/products/create')}
        >
          Add Product
        </button>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <DataTable
          columns={columns}
          data={products}
          actions={actions}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
//