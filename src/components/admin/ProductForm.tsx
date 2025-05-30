import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Upload } from 'lucide-react';
import type { ProductFormData } from '../../types/admin';
import { useCategories } from '../../hooks/useAdmin';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    category_id: initialData?.category_id || 0,
    price: initialData?.price || 0,
    sale_price: initialData?.sale_price || null,
    sku: initialData?.sku || '',
    is_active: initialData?.is_active ?? true,
    is_featured: initialData?.is_featured ?? false,
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    images: initialData?.images || [],
    variants: initialData?.variants || [],
    inventory: initialData?.inventory || {
      quantity: 0,
      low_stock_threshold: 10
    }
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file),
      is_primary: formData.images.length === 0
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const setPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        is_primary: i === index
      }))
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        sku: '',
        size: '',
        color: '',
        price_adjustment: 0
      }]
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      await onSubmit(formData);
      navigate('/admin/products');
    } catch (error) {
      console.error('Error submitting product:', error);
      // You might want to show a toast notification here
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData(prev => ({ ...prev, category_id: Number(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sale Price</label>
            <input
              type="number"
              value={formData.sale_price || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                sale_price: e.target.value ? Number(e.target.value) : null 
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              min="0"
              step="0.01"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.url}
                alt={`Product ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={12} />
              </button>
              <button
                type="button"
                onClick={() => setPrimaryImage(index)}
                className={`absolute bottom-2 right-2 p-1 rounded-full ${
                  image.is_primary 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Primary
              </button>
            </div>
          ))}
          <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-500">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <span className="mt-2 block text-sm text-gray-600">Add Images</span>
          </label>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Variants</h3>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-primary-600 bg-primary-100 hover:bg-primary-200"
          >
            <Plus size={16} className="mr-1" />
            Add Variant
          </button>
        </div>
        {formData.variants.map((variant, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pb-4 border-b last:border-0">
            <div>
              <label className="block text-sm font-medium text-gray-700">Size</label>
              <input
                type="text"
                value={variant.size || ''}
                onChange={(e) => {
                  const newVariants = [...formData.variants];
                  newVariants[index] = { ...variant, size: e.target.value };
                  setFormData(prev => ({ ...prev, variants: newVariants }));
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input
                type="text"
                value={variant.color || ''}
                onChange={(e) => {
                  const newVariants = [...formData.variants];
                  newVariants[index] = { ...variant, color: e.target.value };
                  setFormData(prev => ({ ...prev, variants: newVariants }));
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">SKU</label>
              <input
                type="text"
                value={variant.sku || ''}
                onChange={(e) => {
                  const newVariants = [...formData.variants];
                  newVariants[index] = { ...variant, sku: e.target.value };
                  setFormData(prev => ({ ...prev, variants: newVariants }));
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price Adjustment</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  value={variant.price_adjustment}
                  onChange={(e) => {
                    const newVariants = [...formData.variants];
                    newVariants[index] = { ...variant, price_adjustment: Number(e.target.value) };
                    setFormData(prev => ({ ...prev, variants: newVariants }));
                  }}
                  className="block w-full rounded-l-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  step="0.01"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              value={formData.inventory.quantity}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                inventory: { ...prev.inventory, quantity: Number(e.target.value) }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
            <input
              type="number"
              value={formData.inventory.low_stock_threshold}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                inventory: { ...prev.inventory, low_stock_threshold: Number(e.target.value) }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;