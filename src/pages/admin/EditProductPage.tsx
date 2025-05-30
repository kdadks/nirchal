import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useAdmin';
import ProductForm from '../../components/admin/ProductForm';
import type { ProductFormData, ProductWithDetails } from '../../types/admin';

const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading, error, updateProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<ProductWithDetails | null>(null);

  useEffect(() => {
    if (products.length > 0) {
      const foundProduct = products.find(p => p.id === Number(id));
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        navigate('/admin/products', { replace: true });
      }
    }
  }, [products, id, navigate]);

  const handleSubmit = async (data: ProductFormData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updateProduct(Number(id), data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading product: {error}
      </div>
    );
  }

  // Transform product data to form data format
  const initialData: ProductFormData = {
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    category_id: product.category_id,
    price: product.price,
    sale_price: product.sale_price,
    sku: product.sku || '',
    is_active: product.is_active,
    is_featured: product.is_featured,
    meta_title: product.meta_title || '',
    meta_description: product.meta_description || '',
    images: product.images.map(image => ({
      url: image.image_url,
      alt_text: image.alt_text,
      is_primary: image.is_primary
    })),
    variants: product.variants.map(variant => ({
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      price_adjustment: variant.price_adjustment
    })),
    inventory: product.inventory 
      ? {
          quantity: product.inventory.quantity,
          low_stock_threshold: product.inventory.low_stock_threshold
        }
      : {
          quantity: 0,
          low_stock_threshold: 10
        }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update product information and inventory.
        </p>
      </div>

      <ProductForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default EditProductPage;