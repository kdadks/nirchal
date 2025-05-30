import React from 'react';
import { useProducts } from '../../hooks/useAdmin';
import ProductForm from '../../components/admin/ProductForm';
import type { ProductFormData } from '../../types/admin';

const CreateProductPage: React.FC = () => {
  const { createProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await createProduct(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create Product</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new product to your catalog.
        </p>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default CreateProductPage;