import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Eye, Archive } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import { useProducts } from '../../hooks/useAdmin';
import type { ProductWithDetails } from '../../types/admin';

const SORTABLE_FIELDS: (keyof ProductWithDetails)[] = ['name', 'price', 'created_at'];

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, error, deleteProduct, updateProduct } = useProducts();
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProductWithDetails;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig || !SORTABLE_FIELDS.includes(sortConfig.key)) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }

    return 0;
  });

  const columns = [
    {
      key: 'name',
      title: 'Product Name',
      sortable: true,
      render: (row: ProductWithDetails) => (
        <div className="flex items-center">
          {row.images?.[0] && (
            <img
              src={row.images[0].image_url}
              alt={row.name}
              className="w-10 h-10 rounded object-cover mr-3"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">SKU: {row.sku || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      render: (row: ProductWithDetails) => row.category?.name || 'Uncategorized'
    },
    {
      key: 'price',
      title: 'Price',
      sortable: true,
      render: (row: ProductWithDetails) => (
        <div>
          <div className="font-medium">₹{row.price.toLocaleString()}</div>
          {row.sale_price && (
            <div className="text-sm text-green-600">
              Sale: ₹{row.sale_price.toLocaleString()}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'inventory',
      title: 'Stock',
      render: (row: ProductWithDetails) => (
        <div className={`font-medium ${
          row.inventory?.quantity === 0 
            ? 'text-red-600' 
            : row.inventory?.quantity && row.inventory.quantity <= (row.inventory.low_stock_threshold || 10)
              ? 'text-yellow-600'
              : 'text-green-600'
        }`}>
          {row.inventory?.quantity || 0}
        </div>
      )
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (row: ProductWithDetails) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const handleArchive = async (product: ProductWithDetails) => {
    try {
      await updateProduct(product.id, { is_active: !product.is_active });
    } catch (error) {
      console.error('Error updating product status:', error);
      // You might want to show a toast notification here
    }
  };

  const actions = [
    {
      label: 'View',
      icon: <Eye size={16} />,
      onClick: (row: ProductWithDetails) => navigate(`/admin/products/${row.id}`),
      color: 'default' as const
    },
    {
      label: 'Edit',
      icon: <Edit size={16} />,
      onClick: (row: ProductWithDetails) => navigate(`/admin/products/${row.id}/edit`),
      color: 'primary' as const
    },
    {
      label: (row: ProductWithDetails) => row.is_active ? 'Archive' : 'Unarchive',
      icon: <Archive size={16} />,
      onClick: handleArchive,
      color: 'default' as const
    },
    {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      onClick: (row: ProductWithDetails) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
          deleteProduct(row.id);
        }
      },
      color: 'danger' as const
    }
  ];

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading products: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus size={20} className="mr-2" />
          Add New Product
        </button>
      </div>

      <DataTable<ProductWithDetails>
        columns={columns}
        data={sortedProducts}
        actions={actions}
        isLoading={loading}
        onSort={(key, direction) => setSortConfig({ key, direction })}
      />
    </div>
  );
};

export default ProductsPage;