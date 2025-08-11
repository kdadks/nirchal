/* global URL */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Upload } from 'lucide-react';
import type { ProductFormData, ProductFormDataWithDelete } from '../../types/admin';
import { useCategories } from '../../hooks/useAdmin';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormDataWithDelete) => Promise<void>;
  isLoading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const { categories } = useCategories();
  // Separate images into existing (from DB) and new (from upload)
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
    images: initialData?.images?.map(img => ({ ...img, existing: true, toDelete: false })) || [],
    variants: initialData?.variants || [],
    inventory: initialData?.inventory || {
      quantity: 0,
      low_stock_threshold: 10
    }
  });
  // Track variants to delete (by id)
  const [variantsToDelete, setVariantsToDelete] = useState<number[]>([]);

  // Track if the user has manually edited the slug
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Slugify helper
  function slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }

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

  // Set primary image
  const setPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        is_primary: i === index
      }))
    }));
  };
  // Edit alt_text
  const handleAltTextChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? { ...img, alt_text: value } : img)
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
    setFormData(prev => {
      const variant = prev.variants[index];
      if (variant && variant.id) {
        setVariantsToDelete(ids => [...ids, variant.id!]);
      }
      return {
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      };
    });
  };

  const [submitError, setSubmitError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setSubmitError(null);

    // Validation: quantity must be > 0 (either sum of variants or product quantity)
    let hasError = false;
    if (formData.variants && formData.variants.length > 0) {
      const sum = formData.variants.reduce((sum, v) => sum + (v.quantity ? Number(v.quantity) : 0), 0);
      if (sum === 0) {
        setSubmitError('The sum of all variant quantities is zero. Please enter at least one variant with quantity.');
        hasError = true;
      }
    } else {
      if (!formData.inventory.quantity || formData.inventory.quantity === 0) {
        setSubmitError('Product quantity is zero. Please enter a quantity.');
        hasError = true;
      }
    }
    // Add more validations here as needed

    if (hasError) return;

    try {
      console.log('[ProductForm] Submitting. variantsToDelete:', variantsToDelete);
      await onSubmit({
        ...formData,
        images: formData.images,
        variantsToDelete
      });
      navigate('/admin/products');
    } catch (error: any) {
      setSubmitError(error?.message || 'Error submitting product');
      console.error('Error submitting product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {submitError && (
        <div className="mb-4 text-red-600 font-semibold">{submitError}</div>
      )}
      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                const newName = e.target.value;
                setFormData(prev => {
                  // If slug was not manually edited, auto-generate it
                  if (!slugManuallyEdited) {
                    return { ...prev, name: newName, slug: slugify(newName) };
                  }
                  return { ...prev, name: newName };
                });
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }));
                setSlugManuallyEdited(true);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Must be unique. Used in the product URL.</p>
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
              {categories.map((category: any) => (
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
          {formData.images.filter(img => !img.toDelete).map((image, index) => {
            let imgSrc = '';
            if (image.file && image.url) {
              // New upload, use local preview
              imgSrc = image.url;
            } else if (image.image_url) {
              // Existing image, always construct public URL if not already full
              if (image.image_url.startsWith('http')) {
                imgSrc = image.image_url;
              } else {
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
                imgSrc = `${supabaseUrl}/storage/v1/object/public/product-images/${image.image_url}`;
              }
            }
            return (
              <div key={image.id || index} className="relative">
                <img
                  src={imgSrc}
                  alt={image.alt_text || `Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => {
                      const images = [...prev.images];
                      if (images[index].existing) {
                        images[index].toDelete = true;
                      } else {
                        images.splice(index, 1);
                      }
                      return { ...prev, images };
                    });
                  }}
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
                <input
                  type="text"
                  value={image.alt_text || ''}
                  onChange={e => handleAltTextChange(index, e.target.value)}
                  placeholder="Alt text"
                  className="mt-2 block w-full rounded border px-2 py-1 text-xs"
                />
              </div>
            );
          })}
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
          <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 pb-4 border-b last:border-0">
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                value={variant.quantity ?? ''}
                onChange={(e) => {
                  const newVariants = [...formData.variants];
                  newVariants[index] = { ...variant, quantity: e.target.value ? Number(e.target.value) : undefined };
                  setFormData(prev => ({ ...prev, variants: newVariants }));
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
              <input
                type="number"
                value={variant.low_stock_threshold ?? 10}
                onChange={(e) => {
                  const newVariants = [...formData.variants];
                  newVariants[index] = { ...variant, low_stock_threshold: Number(e.target.value) };
                  setFormData(prev => ({ ...prev, variants: newVariants }));
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                min="0"
              />
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
            {formData.variants && formData.variants.length > 0 ? (
              <>
                <input
                  type="number"
                  value={formData.variants.reduce((sum, v) => sum + (v.quantity ? Number(v.quantity) : 0), 0)}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 cursor-not-allowed shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  min="0"
                />
                {formData.variants.reduce((sum, v) => sum + (v.quantity ? Number(v.quantity) : 0), 0) === 0 && (
                  <div className="text-red-600 text-sm mt-1">Warning: The sum of all variant quantities is zero. Please enter at least one variant with quantity.</div>
                )}
              </>
            ) : (
              <>
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
                {(!formData.inventory.quantity || formData.inventory.quantity === 0) && (
                  <div className="text-red-600 text-sm mt-1">Warning: Product quantity is zero. Please enter a quantity.</div>
                )}
              </>
            )}
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
          {isLoading ? 'Saving...' : initialData?.name ? 'Update Product' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;