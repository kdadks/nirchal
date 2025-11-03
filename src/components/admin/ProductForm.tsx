import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Upload, Package, Trash2 } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import type { ProductFormData, ProductFormDataWithDelete } from '../../types/admin';
import { useCategories, useVendors } from '../../hooks/useAdmin';
import { SwatchSelectionModal } from './SwatchSelectionModal';
import { getStorageImageUrl } from '../../utils/storageUtils';
import { sanitizeFormData } from '../../utils/formUtils';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormDataWithDelete) => Promise<void>;
  isLoading?: boolean;
}

// Quill editor configuration for rich text editing
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image'],
    ['clean']
  ],
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'color', 'background', 'link', 'image'
];

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { vendors } = useVendors();
  
  // Generate unique IDs for React keys only (not database IDs)
  let idCounter = 0;
  const generateUniqueId = () => {
    const timestamp = Date.now();
    const counter = ++idCounter;
    return `${timestamp}-${counter}`;
  };

  // Generate UUIDs for database records
  const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // State for variant type selection modal
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedVariantType, setSelectedVariantType] = useState<'size' | 'color' | null>(null);
  const [showBulkVariantForm, setShowBulkVariantForm] = useState(false);
  const [bulkVariantValues, setBulkVariantValues] = useState('');
  const [pendingVariants, setPendingVariants] = useState<any[]>([]);
  
  // State for swatch selection modal
  const [showSwatchModal, setShowSwatchModal] = useState(false);
  const [selectedVariantForSwatch, setSelectedVariantForSwatch] = useState<number | null>(null);
  const [selectedColorForSwatch, setSelectedColorForSwatch] = useState<string | null>(null);
  
  // State for image SEO modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [localAltText, setLocalAltText] = useState('');
  const [localTitle, setLocalTitle] = useState('');
  const [localSeoDescription, setLocalSeoDescription] = useState('');
  
  // Separate images into existing (from DB) and new (from upload)
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    category_id: initialData?.category_id || '',
    vendor_id: initialData?.vendor_id || null,
    price: initialData?.price || 0,
    sale_price: initialData?.sale_price || null,
    sku: initialData?.sku || '',
    is_active: initialData?.is_active ?? true,
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    images: initialData?.images?.map(img => ({ ...img, existing: true, toDelete: false })) || [],
    variants: initialData?.variants || [],
    inventory: initialData?.inventory || {
      quantity: 0,
      low_stock_threshold: 2
    }
  });

  // Debug logging for variants
  if (import.meta.env.DEV) console.debug('[ProductForm] init data', {
    hasInitialData: !!initialData,
    variantsCount: initialData?.variants?.length || 0,
    variants: initialData?.variants,
    inventory: initialData?.inventory
  });
  // Track variants to delete (by id)
  const [variantsToDelete, setVariantsToDelete] = useState<string[]>([]);

  // Track if the user has manually edited the slug
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Handle loading existing swatch images from swatch_image_id references
  useEffect(() => {
    if (initialData?.variants) {
  if (import.meta.env.DEV) console.debug('[ProductForm] process initial variants for swatches:', 
        initialData.variants.map(v => ({ 
          id: v.id, 
          hasSwatchImageId: !!v.swatch_image_id,
          hasSwatchImage: !!v.swatch_image,
          swatchImage: v.swatch_image,
          swatchImageType: typeof v.swatch_image
        }))
      );
      
      const variantsWithSwatchUrls = initialData.variants.map(variant => {
        // If variant has swatch_image_id but no swatch_image URL, construct it
        if (variant.swatch_image_id && !variant.swatch_image && initialData.images) {
          if (import.meta.env.DEV) console.debug('[ProductForm] build swatch URL for variant:', variant.id);
          const swatchImage = initialData.images.find(img => img.id === variant.swatch_image_id);
          if (swatchImage?.image_url) {
            const swatchUrl = getStorageImageUrl(swatchImage.image_url);
            if (import.meta.env.DEV) console.debug('[ProductForm] swatch URL:', swatchUrl);
            return { ...variant, swatch_image: swatchUrl };
          }
        }
        return variant;
      });
      
      // Update formData if any swatch URLs were added
      const hasChanges = variantsWithSwatchUrls.some((variant, index) => 
        variant.swatch_image !== initialData.variants![index].swatch_image
      );
      
      if (hasChanges) {
  if (import.meta.env.DEV) console.debug('[ProductForm] add swatch URLs to variants');
        setFormData(prev => ({ ...prev, variants: variantsWithSwatchUrls }));
      } else {
  if (import.meta.env.DEV) console.debug('[ProductForm] no swatch URL changes');
      }
    }
  }, [initialData]);

  // Slugify helper
  function slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, {
              id: generateUniqueId(),
              image_url: '',
              alt_text: file.name,
              is_primary: prev.images.length === 0,
              file,
              url: reader.result as string,
              existing: false,
              toDelete: false
            }]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
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
    setShowVariantModal(true);
  };

  const addVariantOfType = (type: 'size' | 'color') => {
    setSelectedVariantType(type);
    setShowVariantModal(false);
    setShowBulkVariantForm(true);
    setBulkVariantValues('');
    setPendingVariants([]);
  };

  const handleBulkVariantInput = (values: string) => {
    setBulkVariantValues(values);
    const newValues = values
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);

    if (newValues.length === 0) {
      setPendingVariants([]);
      return;
    }

    // Get existing variants grouped by type
    const existingSizes = Array.from(new Set(
      formData.variants
        .filter(v => v.size)
        .map(v => v.size)
    ));
    
    const existingColors = Array.from(new Set(
      formData.variants
        .filter(v => v.color)
        .map(v => v.color)
    ));

    let variants: any[] = [];

    if (selectedVariantType === 'color') {
      if (existingSizes.length === 0) {
        // No existing sizes, create color-only variants
        variants = newValues.map(color => ({
          id: generateUUID(),
          size: null,
          color: color,
          material: null,
          style: null,
          sku: '',
          price_adjustment: 0,
          quantity: 0,
          variant_type: selectedVariantType,
          swatch_image: null,
          low_stock_threshold: formData.inventory.low_stock_threshold
        }));
      } else {
        // Create combinations with existing sizes
        variants = [];
        newValues.forEach(color => {
          existingSizes.forEach(size => {
            variants.push({
              id: generateUUID(),
              size: size,
              color: color,
              material: null,
              style: null,
              sku: '',
              price_adjustment: 0,
              quantity: 0,
              variant_type: 'combination',
              swatch_image: null,
              low_stock_threshold: formData.inventory.low_stock_threshold
            });
          });
        });
        
        // Filtering will be handled in confirmBulkVariants
      }
    } else if (selectedVariantType === 'size') {
      if (existingColors.length === 0) {
        // No existing colors, create size-only variants
        variants = newValues.map(size => ({
          id: generateUUID(),
          size: size,
          color: null,
          material: null,
          style: null,
          sku: '',
          price_adjustment: 0,
          quantity: 0,
          variant_type: selectedVariantType,
          swatch_image: null,
          low_stock_threshold: formData.inventory.low_stock_threshold
        }));
      } else {
        // Create combinations with existing colors (add sizes as children of each color)
        variants = [];
        newValues.forEach(size => {
          existingColors.forEach(color => {
            variants.push({
              id: generateUUID(),
              size: size,
              color: color,
              material: null,
              style: null,
              sku: '',
              price_adjustment: 0,
              quantity: 0,
              variant_type: 'combination',
              swatch_image: null,
              low_stock_threshold: formData.inventory.low_stock_threshold
            });
          });
        });
        
        // Filtering will be handled in confirmBulkVariants
      }
    }

    setPendingVariants(variants);
  };

  const confirmBulkVariants = () => {
    if (pendingVariants.length > 0) {
      // Get existing variants grouped by type
      const existingSizes = Array.from(new Set(
        formData.variants
          .filter(v => v.size)
          .map(v => v.size)
      ));
      
      const existingColors = Array.from(new Set(
        formData.variants
          .filter(v => v.color)
          .map(v => v.color)
      ));

      let filteredExistingVariants = formData.variants;

      // Apply filtering based on variant type being added
      if (selectedVariantType === 'color' && existingSizes.length > 0) {
        // Adding colors to existing sizes - remove size-only variants
        filteredExistingVariants = formData.variants.filter(v => !(v.size && !v.color));
      } else if (selectedVariantType === 'size' && existingColors.length > 0) {
        // Adding sizes to existing colors - remove color-only variants  
        filteredExistingVariants = formData.variants.filter(v => !(v.color && !v.size));
      }

      setFormData(prev => ({
        ...prev,
        variants: [
          ...filteredExistingVariants, 
          ...pendingVariants.map(v => ({ 
            ...v, 
            low_stock_threshold: prev.inventory.low_stock_threshold 
          }))
        ]
      }));
    }
    setShowBulkVariantForm(false);
    setBulkVariantValues('');
    setPendingVariants([]);
    setSelectedVariantType(null);
  };

  const updatePendingVariantQuantity = (index: number, quantity: number) => {
    setPendingVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity };
      return updated;
    });
  };

  const updatePendingVariantPriceAdjustment = (index: number, priceAdjustment: number) => {
    setPendingVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], price_adjustment: priceAdjustment };
      return updated;
    });
  };

  const cancelBulkVariants = () => {
    setShowBulkVariantForm(false);
    setBulkVariantValues('');
    setPendingVariants([]);
    setSelectedVariantType(null);
  };

  const handleImageClick = (index: number) => {
    const image = formData.images[index];
    setLocalAltText(image?.alt_text || '');
    setLocalTitle(image?.title || '');
    setLocalSeoDescription(image?.seo_description || '');
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const updateImageSEO = (index: number, updates: Partial<typeof formData.images[0]>) => {
    setFormData(prev => {
      const images = [...prev.images];
      images[index] = { ...images[index], ...updates };
      return { ...prev, images };
    });
  };

  const handleSwatchSelection = (imageId: string, imageUrl: string) => {
  if (import.meta.env.DEV) console.debug('[ProductForm] swatch selected', { imageId, imageUrl });
    // If group color is selected, apply swatch to all variants of that color
    if (selectedColorForSwatch) {
      const colorKey = selectedColorForSwatch;
      const updated = formData.variants.map(v => 
        ((v.color || 'No Color') === colorKey)
          ? { ...v, swatch_image_id: imageId, swatch_image: imageUrl }
          : v
      );
      setFormData(prev => ({ ...prev, variants: updated }));
    } else if (selectedVariantForSwatch !== null) {
      const newVariants = [...formData.variants];
      newVariants[selectedVariantForSwatch] = { 
        ...newVariants[selectedVariantForSwatch], 
        swatch_image_id: imageId,
        swatch_image: imageUrl // Keep for display purposes
      };
      if (import.meta.env.DEV) console.debug('[ProductForm] updated variant', newVariants[selectedVariantForSwatch]);
      setFormData(prev => ({ ...prev, variants: newVariants }));
    }
    setShowSwatchModal(false);
    setSelectedVariantForSwatch(null);
    setSelectedColorForSwatch(null);
  };

  const [submitError, setSubmitError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setSubmitError(null);

    // Updated validation: If variants exist, ignore product-level quantity
    // If no variants, allow zero quantity and just save the product
    let hasError = false;
    if (formData.variants && formData.variants.length > 0) {
      // No validation needed for variant quantities - allow zero
      // The inventory system will handle stock status display
    } else {
      // No variants - allow zero quantity, just save product with threshold
      // No error for zero quantity
    }

    if (hasError) return;

    // Helper function to check if a string is a valid UUID
    const isValidUUID = (str: string): boolean => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(str);
    };

    // Ensure all variants have valid UUIDs (remove invalid IDs so they're treated as new variants)
    const sanitizedFormData = {
      ...formData,
      variants: formData.variants.map(variant => {
        // If the variant has an invalid ID (like timestamp-based), remove it entirely
        // This will make the backend treat it as a new variant (INSERT) instead of update (UPDATE)
        if (variant.id && !isValidUUID(variant.id)) {
          const { id, ...variantWithoutId } = variant;
          return variantWithoutId;
        }
        return variant;
      })
    };

    try {
      if (import.meta.env.DEV) {
        console.debug('[ProductForm] original variants', formData.variants);
        console.debug('[ProductForm] sanitized variants', sanitizedFormData.variants);
        console.debug('[ProductForm] variantsToDelete', variantsToDelete);
      }
      
      // Sanitize the form data before submission
      const finalFormData = sanitizeFormData(sanitizedFormData);
      
      await onSubmit({
        ...finalFormData,
        images: finalFormData.images,
        variantsToDelete
      });
      navigate('/admin/products');
    } catch (error: any) {
      setSubmitError(error?.message || 'Error submitting product');
      console.error('Error submitting product:', error);
    }
  };

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="mb-4 text-red-600 font-semibold">{submitError}</div>
          )}
          
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
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
                    setSlugManuallyEdited(true);
                    setFormData(prev => ({ ...prev, slug: e.target.value }));
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">SKU (Optional)</label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Optional product SKU"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category (Optional)</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">No Category</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Vendor</label>
                <select
                  value={formData.vendor_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor_id: e.target.value || null }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select Vendor (Optional)</option>
                  {vendors.filter((vendor: any) => vendor.is_active).map((vendor: any) => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>
            <div className="space-y-4">
              {formData.images.filter(img => !img.toDelete).length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {formData.images.filter(img => !img.toDelete).map((image, index) => {
                    let imgSrc = '';
                    if (image.file && image.url) {
                      // New upload, use local preview
                      imgSrc = image.url;
                    } else if (image.image_url) {
                      // Existing image, use local storage utility to get correct URL
                      imgSrc = getStorageImageUrl(image.image_url);
                    }
                    return (
                      <div key={image.id || index} className="relative group">
                        <img
                          src={imgSrc}
                          alt={image.alt_text || `Product ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-primary-500 transition-colors"
                          onClick={() => handleImageClick(index)}
                          title="Click to edit image details"
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
                          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={8} />
                        </button>
                        {image.is_primary && (
                          <div className="absolute -bottom-1 -right-1 bg-primary-500 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                            Primary
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 block">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-600">Upload Images</span>
                <span className="text-xs text-gray-500">Click to select multiple images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory</h3>
            <div className="space-y-4">
              {formData.variants.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Total Inventory Summary</h4>
                  <div className="text-sm text-blue-700">
                    <div className="flex justify-between">
                      <span>Total Quantity Across All Variants:</span>
                      <span className="font-semibold">
                        {formData.variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0)} units
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Number of Variants:</span>
                      <span className="font-semibold">{formData.variants.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Product-level quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product Quantity {formData.variants.length > 0 ? '(for products without variants)' : ''}
                </label>
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
                {formData.variants.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    This quantity is used when the product has no variants. Variant quantities take precedence.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                <input
                  type="number"
                  value={formData.inventory.low_stock_threshold}
                  onChange={(e) => {
                    const newThreshold = Number(e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      inventory: { ...prev.inventory, low_stock_threshold: newThreshold },
                      variants: prev.variants.map(v => ({ ...v, low_stock_threshold: newThreshold }))
                    }));
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Alert when any variant goes below this quantity
                </p>
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
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Description */}
  <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
          <div className="quill-wrapper">
            <ReactQuill
              theme="snow"
              value={formData.description || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Enter product description with rich text formatting..."
              style={{ height: '300px', marginBottom: '60px' }}
            />
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Variants</h3>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus size={16} className="mr-1" />
              Add Variant
            </button>
          </div>

          {/* Bulk Update Controls for Existing Variants */}
          {formData.variants.length > 0 && (
            <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Bulk Update All Existing Variants</h5>
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Set All Quantities
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      className="w-20 rounded border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-1 px-2"
                      min="0"
                      id="bulk-existing-quantity-input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('bulk-existing-quantity-input') as HTMLInputElement;
                        const value = Number(input.value);
                        if (!isNaN(value)) {
                          setFormData(prev => ({
                            ...prev,
                            variants: prev.variants.map(v => ({ ...v, quantity: value }))
                          }));
                          input.value = '';
                        }
                      }}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Set All Price Adjustments
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 5.00"
                      step="0.01"
                      className="w-20 rounded border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-1 px-2"
                      id="bulk-existing-price-input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('bulk-existing-price-input') as HTMLInputElement;
                        const value = Number(input.value);
                        if (!isNaN(value)) {
                          setFormData(prev => ({
                            ...prev,
                            variants: prev.variants.map(v => ({ ...v, price_adjustment: value }))
                          }));
                          input.value = '';
                        }
                      }}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quick Actions
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          variants: prev.variants.map(v => ({ ...v, quantity: 0 }))
                        }));
                      }}
                      className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                    >
                      Clear Qty
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          variants: prev.variants.map(v => ({ ...v, price_adjustment: 0 }))
                        }));
                      }}
                      className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                    >
                      Clear Price
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {(() => {
              const hasAnySize = formData.variants.some(v => v.size);
              if (!hasAnySize) {
                // Simple color-only list (no pagination)
                return (
                  <div className="variant-grid space-y-4">
                    {formData.variants.map((variant, index) => (
                      <div key={variant.id || `variant-${index}`} className="border border-gray-200 rounded-lg p-3">
                        {/* Desktop Layout */}
                        <div className="hidden lg:flex items-center gap-3">
                          {/* Sequential number */}
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 flex-shrink-0">
                            {index + 1}
                          </div>

                          {/* Swatch (Image or Color Hex) */}
                          <button
                            type="button"
                            onClick={() => { 
                              setSelectedVariantForSwatch(index); 
                              setSelectedColorForSwatch(variant.color); 
                              setShowSwatchModal(true); 
                            }}
                            className={`w-10 h-10 rounded-md border ${variant.swatch_image || variant.color_hex ? 'border-gray-300' : 'border-dashed border-gray-400'} overflow-hidden flex items-center justify-center bg-white flex-shrink-0`}
                            title={variant.swatch_image ? 'Change swatch' : 'Add swatch'}
                          >
                            {variant.swatch_image ? (
                              <img src={variant.swatch_image} alt={`${variant.color} swatch`} className="w-full h-full object-cover" />
                            ) : variant.color_hex ? (
                              <div className="w-full h-full" style={{ backgroundColor: variant.color_hex }} />
                            ) : (
                              <span className="text-gray-400 text-xs">40x40</span>
                            )}
                          </button>

                          {/* Color name */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{variant.color || 'No Color'}</span>
                              {/* Inline color hex input */}
                              <input
                                type="color"
                                value={(variant.color_hex && /^#([0-9A-Fa-f]{6})$/.test(variant.color_hex)) ? variant.color_hex : '#000000'}
                                onChange={(e) => {
                                  const hex = e.target.value;
                                  const newVariants = [...formData.variants];
                                  newVariants[index] = { ...variant, color_hex: hex } as any;
                                  setFormData(prev => ({ ...prev, variants: newVariants }));
                                }}
                                className="w-[25px] h-[25px] p-0 border border-gray-300 rounded cursor-pointer"
                                title="Pick color"
                              />
                              <input
                                type="text"
                                placeholder="#RRGGBB"
                                value={variant.color_hex || ''}
                                onChange={(e) => {
                                  const hex = e.target.value;
                                  const newVariants = [...formData.variants];
                                  newVariants[index] = { ...variant, color_hex: hex } as any;
                                  setFormData(prev => ({ ...prev, variants: newVariants }));
                                }}
                                className="w-24 rounded border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-xs py-1 px-2"
                                title="Hex color code"
                              />
                              {/* Color square preview 25x25 */}
                              <div className="w-[25px] h-[25px] rounded border border-gray-300" style={{ backgroundColor: variant.color_hex || 'transparent' }} title={variant.color_hex || ''} />
                            </div>
                          </div>

                          {/* Price adjustment */}
                          <div className="w-24 text-center">
                            <div className="text-xs text-gray-600 mb-1">Price Adj</div>
                            <input
                              type="number"
                              value={variant.price_adjustment || 0}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index] = { ...variant, price_adjustment: Number(e.target.value) } as any;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                              className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-xs py-1 px-2 text-center"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>

                          {/* Quantity */}
                          <div className="w-20 text-center">
                            <div className="text-xs text-gray-600 mb-1">Qty</div>
                            <input
                              type="number"
                              value={variant.quantity || 0}
                              onChange={(e) => {
                                const newVariants = [...formData.variants];
                                newVariants[index] = { ...variant, quantity: Number(e.target.value) } as any;
                                setFormData(prev => ({ ...prev, variants: newVariants }));
                              }}
                              className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-xs py-1 px-2 text-center"
                              min="0"
                              placeholder="0"
                            />
                          </div>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              if (variant.id) {
                                setVariantsToDelete(ids => [...ids, variant.id!]);
                              }
                              setFormData(prev => ({
                                ...prev,
                                variants: prev.variants.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete this variant"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Mobile/Tablet Layout */}
                        <div className="lg:hidden space-y-3">
                          {/* Header with number and delete */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                                {index + 1}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{variant.color || 'No Color'}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (variant.id) {
                                  setVariantsToDelete(ids => [...ids, variant.id!]);
                                }
                                setFormData(prev => ({
                                  ...prev,
                                  variants: prev.variants.filter((_, i) => i !== index)
                                }));
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete this variant"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Swatch and Color Controls */}
                          <div className="flex items-center gap-3">
                            <div className="text-xs font-medium text-gray-600 w-16">Swatch:</div>
                            <button
                              type="button"
                              onClick={() => { 
                                setSelectedVariantForSwatch(index); 
                                setSelectedColorForSwatch(variant.color); 
                                setShowSwatchModal(true); 
                              }}
                              className={`w-10 h-10 rounded-md border ${variant.swatch_image || variant.color_hex ? 'border-gray-300' : 'border-dashed border-gray-400'} overflow-hidden flex items-center justify-center bg-white flex-shrink-0`}
                              title={variant.swatch_image ? 'Change swatch' : 'Add swatch'}
                            >
                              {variant.swatch_image ? (
                                <img src={variant.swatch_image} alt={`${variant.color} swatch`} className="w-full h-full object-cover" />
                              ) : variant.color_hex ? (
                                <div className="w-full h-full" style={{ backgroundColor: variant.color_hex }} />
                              ) : (
                                <span className="text-gray-400 text-xs">40x40</span>
                              )}
                            </button>
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="color"
                                value={(variant.color_hex && /^#([0-9A-Fa-f]{6})$/.test(variant.color_hex)) ? variant.color_hex : '#000000'}
                                onChange={(e) => {
                                  const hex = e.target.value;
                                  const newVariants = [...formData.variants];
                                  newVariants[index] = { ...variant, color_hex: hex } as any;
                                  setFormData(prev => ({ ...prev, variants: newVariants }));
                                }}
                                className="w-[25px] h-[25px] p-0 border border-gray-300 rounded cursor-pointer"
                                title="Pick color"
                              />
                              <input
                                type="text"
                                placeholder="#RRGGBB"
                                value={variant.color_hex || ''}
                                onChange={(e) => {
                                  const hex = e.target.value;
                                  const newVariants = [...formData.variants];
                                  newVariants[index] = { ...variant, color_hex: hex } as any;
                                  setFormData(prev => ({ ...prev, variants: newVariants }));
                                }}
                                className="flex-1 rounded border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-xs py-1 px-2"
                                title="Hex color code"
                              />
                              <div className="w-[25px] h-[25px] rounded border border-gray-300" style={{ backgroundColor: variant.color_hex || 'transparent' }} title={variant.color_hex || ''} />
                            </div>
                          </div>

                          {/* Price and Quantity */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs font-medium text-gray-600 mb-1">Price Adjustment</div>
                              <input
                                type="number"
                                value={variant.price_adjustment || 0}
                                onChange={(e) => {
                                  const newVariants = [...formData.variants];
                                  newVariants[index] = { ...variant, price_adjustment: Number(e.target.value) } as any;
                                  setFormData(prev => ({ ...prev, variants: newVariants }));
                                }}
                                className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 px-3"
                                step="0.01"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-600 mb-1">Quantity</div>
                              <input
                                type="number"
                                value={variant.quantity || 0}
                                onChange={(e) => {
                                  const newVariants = [...formData.variants];
                                  newVariants[index] = { ...variant, quantity: Number(e.target.value) } as any;
                                  setFormData(prev => ({ ...prev, variants: newVariants }));
                                }}
                                className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 px-3"
                                min="0"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              } else {
                // Grouped by color with size sub-rows (no pagination)
                const colorKey = (v: any) => (v.color ? String(v.color) : 'No Color');
                const groups: Record<string, any[]> = {};
                formData.variants.forEach(v => {
                  const key = colorKey(v);
                  groups[key] = groups[key] || [];
                  groups[key].push(v);
                });
                const colorNames = Object.keys(groups);
                return (
                  <div className="variant-grid space-y-4">
                    {colorNames.map((color, colorIdx) => {
                      const group = groups[color];
                      const swatchUrl = group.find(g => g.swatch_image)?.swatch_image || null;
                      const groupHex = group.find(g => g.color_hex)?.color_hex || '';
                      return (
                        <div key={`group-${color}`} className="border border-gray-200 rounded-lg p-3">
                          {/* Desktop Layout */}
                          <div className="hidden lg:flex items-center gap-3 py-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 flex-shrink-0">
                              {colorIdx + 1}
                            </div>

                            <button
                              type="button"
                              onClick={() => { setSelectedColorForSwatch(color); setShowSwatchModal(true); }}
                              className={`w-10 h-10 rounded-md border ${(swatchUrl || groupHex) ? 'border-gray-300' : 'border-dashed border-gray-400'} overflow-hidden flex items-center justify-center bg-white flex-shrink-0`}
                              title={swatchUrl ? 'Change swatch' : 'Add swatch'}
                            >
                              {swatchUrl ? (
                                <img src={swatchUrl} alt={`${color} swatch`} className="w-full h-full object-cover" />
                              ) : groupHex ? (
                                <div className="w-full h-full" style={{ backgroundColor: groupHex }} />
                              ) : (
                                <span className="text-gray-400 text-xs">40x40</span>
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 truncate block">{color === 'No Color' ? 'No Color' : color}</span>
                                {/* Group-level hex input applies to all variants in this color */}
                                <input
                                  type="color"
                                  value={(groupHex && /^#([0-9A-Fa-f]{6})$/.test(groupHex)) ? groupHex : '#000000'}
                                  onChange={(e) => {
                                    const hex = e.target.value;
                                    setFormData(prev => ({
                                      ...prev,
                                      variants: prev.variants.map(v => ((v.color || 'No Color') === color ? { ...v, color_hex: hex } : v))
                                    }));
                                  }}
                                  className="w-[25px] h-[25px] p-0 border border-gray-300 rounded cursor-pointer"
                                  title="Pick color for this group"
                                />
                                <input
                                  type="text"
                                  placeholder="#RRGGBB"
                                  value={groupHex}
                                  onChange={(e) => {
                                    const hex = e.target.value;
                                    setFormData(prev => ({
                                      ...prev,
                                      variants: prev.variants.map(v => ((v.color || 'No Color') === color ? { ...v, color_hex: hex } : v))
                                    }));
                                  }}
                                  className="w-24 rounded border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-xs py-1 px-2"
                                  title="Hex color code for this color group"
                                />
                                <div className="w-[25px] h-[25px] rounded border border-gray-300" style={{ backgroundColor: groupHex || 'transparent' }} title={groupHex || ''} />
                              </div>
                              <span className="text-xs text-gray-500">{group.length} size{group.length !== 1 ? 's' : ''}</span>
                            </div>

                            <div className="w-24 text-center">
                              <div className="text-xs text-gray-600 mb-1">Price Adj</div>
                              <input
                                type="number"
                                value={group[0]?.price_adjustment || 0}
                                onChange={(e) => {
                                  const newPriceAdj = Number(e.target.value);
                                  setFormData(prev => ({
                                    ...prev,
                                    variants: prev.variants.map(v => (colorKey(v) === color ? { ...v, price_adjustment: newPriceAdj } : v))
                                  }));
                                }}
                                className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-xs py-1 px-2 text-center"
                                step="0.01"
                                placeholder="0.00"
                                title="Price adjustment for all sizes of this color"
                              />
                            </div>

                            <div className="w-20 text-center">
                              <div className="text-xs text-gray-600 mb-1">Total Qty</div>
                              <div className="text-sm font-medium text-gray-900">{group.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0)}</div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const indicesToRemove = formData.variants
                                  .map((v, idx) => ({ v, idx }))
                                  .filter(({ v }) => colorKey(v) === color)
                                  .map(({ idx }) => idx);
                                indicesToRemove.reverse().forEach(index => {
                                  const variant = formData.variants[index];
                                  if (variant && variant.id) {
                                    setVariantsToDelete(ids => [...ids, variant.id!]);
                                  }
                                });
                                setFormData(prev => ({
                                  ...prev,
                                  variants: prev.variants.filter(v => colorKey(v) !== color)
                                }));
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete this color and all its sizes"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Mobile/Tablet Layout */}
                          <div className="lg:hidden space-y-3 py-2">
                            {/* Header with color name and delete */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                                  {colorIdx + 1}
                                </div>
                                <span className="text-sm font-medium text-gray-900">{color === 'No Color' ? 'No Color' : color}</span>
                                <span className="text-xs text-gray-500">({group.length} size{group.length !== 1 ? 's' : ''})</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const indicesToRemove = formData.variants
                                    .map((v, idx) => ({ v, idx }))
                                    .filter(({ v }) => colorKey(v) === color)
                                    .map(({ idx }) => idx);
                                  indicesToRemove.reverse().forEach(index => {
                                    const variant = formData.variants[index];
                                    if (variant && variant.id) {
                                      setVariantsToDelete(ids => [...ids, variant.id!]);
                                    }
                                  });
                                  setFormData(prev => ({
                                    ...prev,
                                    variants: prev.variants.filter(v => colorKey(v) !== color)
                                  }));
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Delete this color and all its sizes"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {/* Swatch and Color Controls */}
                            <div className="flex items-center gap-3">
                              <div className="text-xs font-medium text-gray-600 w-16">Swatch:</div>
                              <button
                                type="button"
                                onClick={() => { setSelectedColorForSwatch(color); setShowSwatchModal(true); }}
                                className={`w-10 h-10 rounded-md border ${(swatchUrl || groupHex) ? 'border-gray-300' : 'border-dashed border-gray-400'} overflow-hidden flex items-center justify-center bg-white flex-shrink-0`}
                                title={swatchUrl ? 'Change swatch' : 'Add swatch'}
                              >
                                {swatchUrl ? (
                                  <img src={swatchUrl} alt={`${color} swatch`} className="w-full h-full object-cover" />
                                ) : groupHex ? (
                                  <div className="w-full h-full" style={{ backgroundColor: groupHex }} />
                                ) : (
                                  <span className="text-gray-400 text-xs">40x40</span>
                                )}
                              </button>
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="color"
                                  value={(groupHex && /^#([0-9A-Fa-f]{6})$/.test(groupHex)) ? groupHex : '#000000'}
                                  onChange={(e) => {
                                    const hex = e.target.value;
                                    setFormData(prev => ({
                                      ...prev,
                                      variants: prev.variants.map(v => ((v.color || 'No Color') === color ? { ...v, color_hex: hex } : v))
                                    }));
                                  }}
                                  className="w-[25px] h-[25px] p-0 border border-gray-300 rounded cursor-pointer"
                                  title="Pick color for this group"
                                />
                                <input
                                  type="text"
                                  placeholder="#RRGGBB"
                                  value={groupHex}
                                  onChange={(e) => {
                                    const hex = e.target.value;
                                    setFormData(prev => ({
                                      ...prev,
                                      variants: prev.variants.map(v => ((v.color || 'No Color') === color ? { ...v, color_hex: hex } : v))
                                    }));
                                  }}
                                  className="flex-1 rounded border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-xs py-1 px-2"
                                  title="Hex color code for this color group"
                                />
                                <div className="w-[25px] h-[25px] rounded border border-gray-300" style={{ backgroundColor: groupHex || 'transparent' }} title={groupHex || ''} />
                              </div>
                            </div>

                            {/* Price Adjustment and Total Quantity */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs font-medium text-gray-600 mb-1">Price Adjustment (All)</div>
                                <input
                                  type="number"
                                  value={group[0]?.price_adjustment || 0}
                                  onChange={(e) => {
                                    const newPriceAdj = Number(e.target.value);
                                    setFormData(prev => ({
                                      ...prev,
                                      variants: prev.variants.map(v => (colorKey(v) === color ? { ...v, price_adjustment: newPriceAdj } : v))
                                    }));
                                  }}
                                  className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 px-3"
                                  step="0.01"
                                  placeholder="0.00"
                                  title="Price adjustment for all sizes of this color"
                                />
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-600 mb-1">Total Quantity</div>
                                <div className="w-full rounded-md border border-gray-200 bg-gray-50 text-sm py-2 px-3 font-medium text-gray-900">
                                  {group.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="ml-0 lg:ml-14 space-y-1">
                            {group.map((variant: any, idx: number) => {
                              const index = formData.variants.findIndex(v => v.id === variant.id);
                              const getVariantLabel = (v: any) => {
                                const parts: string[] = [];
                                if (v.size) parts.push(v.size);
                                if (parts.length === 0 && v.color) {
                                  return `Color Only`;
                                }
                                return parts.length > 0 ? parts.join(', ') : 'Free Size';
                              };
                              const variantLabel = getVariantLabel(variant);

                              return (
                                <div key={variant.id || `v-${color}-${idx}`} className="bg-gray-50 rounded px-3 py-2">
                                  {/* Desktop Layout */}
                                  <div className="hidden lg:flex items-center gap-3">
                                    <div className="flex-1">
                                      <span className="text-xs font-medium text-gray-700">{variantLabel}</span>
                                    </div>

                                    <div className="w-24 text-center">
                                      <input
                                        type="number"
                                        value={variant.price_adjustment || 0}
                                        onChange={(e) => {
                                          const newVariants = [...formData.variants];
                                          newVariants[index] = { ...variant, price_adjustment: Number(e.target.value) } as any;
                                          setFormData(prev => ({ ...prev, variants: newVariants }));
                                        }}
                                        className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-xs py-1 px-2 text-center"
                                        step="0.01"
                                        placeholder="0.00"
                                        title={`Price adjustment for ${variantLabel}`}
                                      />
                                    </div>

                                    <div className="w-20 text-center">
                                      <input
                                        type="number"
                                        value={variant.quantity || 0}
                                        onChange={(e) => {
                                          const newVariants = [...formData.variants];
                                          newVariants[index] = { ...variant, quantity: Number(e.target.value) } as any;
                                          setFormData(prev => ({ ...prev, variants: newVariants }));
                                        }}
                                        className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-xs py-1 px-2 text-center"
                                        min="0"
                                        placeholder="0"
                                        title={`Quantity for ${variantLabel}`}
                                      />
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const variantToRemove = formData.variants[index];
                                        if (variantToRemove && variantToRemove.id) {
                                          setVariantsToDelete(ids => [...ids, variantToRemove.id!]);
                                        }
                                        setFormData(prev => ({
                                          ...prev,
                                          variants: prev.variants.filter((_, i) => i !== index)
                                        }));
                                      }}
                                      className="text-red-500 hover:text-red-700 p-1"
                                      title={`Delete ${variantLabel}`}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>

                                  {/* Mobile/Tablet Layout */}
                                  <div className="lg:hidden space-y-2">
                                    {/* Size name and delete */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-700">{variantLabel}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const variantToRemove = formData.variants[index];
                                          if (variantToRemove && variantToRemove.id) {
                                            setVariantsToDelete(ids => [...ids, variantToRemove.id!]);
                                          }
                                          setFormData(prev => ({
                                            ...prev,
                                            variants: prev.variants.filter((_, i) => i !== index)
                                          }));
                                        }}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        title={`Delete ${variantLabel}`}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>

                                    {/* Price and Quantity */}
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <div className="text-xs font-medium text-gray-600 mb-1">Price Adjustment</div>
                                        <input
                                          type="number"
                                          value={variant.price_adjustment || 0}
                                          onChange={(e) => {
                                            const newVariants = [...formData.variants];
                                            newVariants[index] = { ...variant, price_adjustment: Number(e.target.value) } as any;
                                            setFormData(prev => ({ ...prev, variants: newVariants }));
                                          }}
                                          className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 px-3"
                                          step="0.01"
                                          placeholder="0.00"
                                          title={`Price adjustment for ${variantLabel}`}
                                        />
                                      </div>
                                      <div>
                                        <div className="text-xs font-medium text-gray-600 mb-1">Quantity</div>
                                        <input
                                          type="number"
                                          value={variant.quantity || 0}
                                          onChange={(e) => {
                                            const newVariants = [...formData.variants];
                                            newVariants[index] = { ...variant, quantity: Number(e.target.value) } as any;
                                            setFormData(prev => ({ ...prev, variants: newVariants }));
                                          }}
                                          className="w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-2 px-3"
                                          min="0"
                                          placeholder="0"
                                          title={`Quantity for ${variantLabel}`}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }
            })()}

            {formData.variants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No variants added yet. Click "Add Variant" to create size, color, or material options.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SEO</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meta Title
                <span className={`text-xs ml-2 ${
                  (formData.meta_title || '').length > 60 
                    ? 'text-red-500' 
                    : (formData.meta_title || '').length > 50 
                      ? 'text-yellow-500' 
                      : 'text-gray-500'
                }`}>
                  ({(formData.meta_title || '').length}/60 characters)
                </span>
              </label>
              <input
                type="text"
                value={formData.meta_title || ''}
                onChange={(e) => {
                  if (e.target.value.length <= 60) {
                    setFormData(prev => ({ ...prev, meta_title: e.target.value }));
                  }
                }}
                maxLength={60}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="SEO title for search engines (50-60 chars recommended)"
              />
              {(formData.meta_title || '').length > 50 && (
                <p className={`text-xs mt-1 ${
                  (formData.meta_title || '').length > 60 
                    ? 'text-red-500' 
                    : 'text-yellow-500'
                }`}>
                  {(formData.meta_title || '').length > 60 
                    ? 'Title is too long and may be truncated in search results'
                    : 'Approaching character limit - consider keeping under 60 characters'
                  }
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meta Description
                <span className={`text-xs ml-2 ${
                  (formData.meta_description || '').length > 160 
                    ? 'text-red-500' 
                    : (formData.meta_description || '').length > 150 
                      ? 'text-yellow-500' 
                      : 'text-gray-500'
                }`}>
                  ({(formData.meta_description || '').length}/160 characters)
                </span>
              </label>
              <textarea
                value={formData.meta_description || ''}
                onChange={(e) => {
                  if (e.target.value.length <= 160) {
                    setFormData(prev => ({ ...prev, meta_description: e.target.value }));
                  }
                }}
                maxLength={160}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="SEO description for search engines (150-160 chars recommended)"
              />
              {(formData.meta_description || '').length > 150 && (
                <p className={`text-xs mt-1 ${
                  (formData.meta_description || '').length > 160 
                    ? 'text-red-500' 
                    : 'text-yellow-500'
                }`}>
                  {(formData.meta_description || '').length > 160 
                    ? 'Description is too long and may be truncated in search results'
                    : 'Approaching character limit - consider keeping under 160 characters'
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* All Modals */}
      {/* Variant Type Selection Modal */}
      {showVariantModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal modal-sm">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Select Variant Type</h3>
              <p className="admin-modal-subtitle">
                Choose what type of variant you want to add. This will determine which fields are available.
              </p>
            </div>
            
            <div className="admin-modal-body">
              <div className="variant-type-grid">
                <button
                  type="button"
                  onClick={() => addVariantOfType('size')}
                  className="variant-type-card"
                >
                  <div className="variant-type-icon" style={{ backgroundColor: '#3b82f6' }}>
                    <span>S</span>
                  </div>
                  <span className="variant-type-title">Size</span>
                  <span className="variant-type-description">S, M, L, XL, etc.</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => addVariantOfType('color')}
                  className="variant-type-card"
                >
                  <div className="variant-type-icon" style={{ background: 'linear-gradient(45deg, #ef4444, #3b82f6)' }}>
                    ●
                  </div>
                  <span className="variant-type-title">Color</span>
                  <span className="variant-type-description">Red, Blue, Green, etc.</span>
                </button>
              </div>
            </div>
            
            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => setShowVariantModal(false)}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Variant Creation Modal */}
      {showBulkVariantForm && selectedVariantType && (
        <div className="admin-modal-overlay">
          <div className="admin-modal modal-lg">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                Add {selectedVariantType.charAt(0).toUpperCase() + selectedVariantType.slice(1)} Variants
              </h3>
              <p className="admin-modal-subtitle">
                Create multiple {selectedVariantType} variants at once by entering values below.
              </p>
            </div>

            <div className="admin-modal-body">
              <div className="admin-form-field">
                <label className="admin-label">
                  Enter {selectedVariantType} values (comma-separated)
                </label>
                <input
                  type="text"
                  value={bulkVariantValues}
                  onChange={(e) => handleBulkVariantInput(e.target.value)}
                  placeholder={
                    selectedVariantType === 'size' ? 'S, M, L, XL, XXL' :
                    'Red, Blue, Green, Black, White'
                  }
                  className="admin-input"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {selectedVariantType === 'color' 
                    ? `Separate each color with a comma. These will be the main variants.`
                    : `Separate each ${selectedVariantType} with a comma. ${
                        formData.variants.filter(v => v.color).length > 0 
                          ? `These will be added as sub-variants to all existing colors.`
                          : `Create colors first before adding ${selectedVariantType} variants.`
                      }`
                  }
                </p>
              </div>

            {pendingVariants.length > 0 && (
              <div className="bulk-variant-preview">
                <div className="bulk-variant-header">
                  Preview - {pendingVariants.length} variants will be created
                </div>

                <div>
                  {pendingVariants.map((variant, index) => (
                    <div key={variant.id || `pending-variant-${index}`} className="bulk-variant-item">
                      <div className="bulk-variant-name">
                        {selectedVariantType === 'color' ? variant.color :
                         `${variant.color} - ${variant.size}`}
                      </div>
                      <div className="bulk-variant-fields">
                        <div className="bulk-variant-field">
                          <label>Quantity</label>
                          <input
                            type="number"
                            value={variant.quantity || 0}
                            onChange={(e) => updatePendingVariantQuantity(index, Number(e.target.value))}
                            min="0"
                            placeholder="0"
                          />
                        </div>
                        <div className="bulk-variant-field">
                          <label>Price Adj</label>
                          <input
                            type="number"
                            value={variant.price_adjustment || 0}
                            onChange={(e) => updatePendingVariantPriceAdjustment(index, Number(e.target.value))}
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="text-xs text-gray-600">
                          {selectedVariantType === 'color' ? 'Main' : 'Sub-variant'}
                        </div>
                        <button
                          type="button"
                          onClick={() => setPendingVariants(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-800 p-1 ml-2"
                          title="Remove this variant"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bulk Update Controls */}
                <div className="bulk-variant-actions">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Quantity"
                        className="w-20 rounded border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-1 px-2"
                        min="0"
                        id="bulk-quantity-input"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('bulk-quantity-input') as HTMLInputElement;
                          const value = Number(input.value);
                          if (!isNaN(value)) {
                            setPendingVariants(prev => prev.map(v => ({ ...v, quantity: value })));
                            input.value = '';
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Set All Quantities
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Price"
                        step="0.01"
                        className="w-20 rounded border-gray-300 focus:border-primary-500 focus:ring-primary-500 text-sm py-1 px-2"
                        id="bulk-price-input"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('bulk-price-input') as HTMLInputElement;
                          const value = Number(input.value);
                          if (!isNaN(value)) {
                            setPendingVariants(prev => prev.map(v => ({ ...v, price_adjustment: value })));
                            input.value = '';
                          }
                        }}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Set All Prices
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
            
            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={cancelBulkVariants}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBulkVariants}
                disabled={pendingVariants.length === 0}
                className={`admin-btn ${
                  pendingVariants.length > 0
                    ? 'admin-btn-primary'
                    : 'admin-btn-secondary opacity-50 cursor-not-allowed'
                }`}
              >
                Add {pendingVariants.length} Variants
              </button>
            </div>
          </div>
        </div>
      )}      {/* Image SEO Modal */}
      {showImageModal && selectedImageIndex !== null && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="text-lg font-medium text-gray-900">Edit Image Details</h3>
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedImageIndex(null);
                  setLocalAltText('');
                  setLocalTitle('');
                  setLocalSeoDescription('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="admin-modal-body">
              <div className="space-y-4">
                <div>
                  <label className="admin-label">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={localAltText}
                    onChange={(e) => setLocalAltText(e.target.value)}
                    placeholder="Describe the image for accessibility"
                    className="admin-input"
                  />
                </div>
                
                <div>
                  <label className="admin-label">
                    Image Title
                  </label>
                  <input
                    type="text"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    placeholder="Image title for SEO"
                    className="admin-input"
                  />
                </div>
                
                <div>
                  <label className="admin-label">
                    SEO Description
                  </label>
                  <textarea
                    value={localSeoDescription}
                    onChange={(e) => setLocalSeoDescription(e.target.value)}
                    placeholder="Additional SEO description for this image"
                    rows={3}
                    className="admin-textarea"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="set-primary"
                    checked={formData.images[selectedImageIndex]?.is_primary || false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPrimaryImage(selectedImageIndex);
                      }
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="set-primary" className="text-sm text-gray-700">
                    Set as primary image
                  </label>
                </div>
              </div>
            </div>
              
            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedImageIndex(null);
                  setLocalAltText('');
                  setLocalTitle('');
                  setLocalSeoDescription('');
                }}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateImageSEO(selectedImageIndex, {
                    alt_text: localAltText,
                    title: localTitle,
                    seo_description: localSeoDescription
                  });
                  setShowImageModal(false);
                  setSelectedImageIndex(null);
                  setLocalAltText('');
                  setLocalTitle('');
                  setLocalSeoDescription('');
                }}
                className="admin-btn admin-btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swatch Selection Modal */}
      {showSwatchModal && (
        <SwatchSelectionModal
          isOpen={showSwatchModal}
          onClose={() => {
            setShowSwatchModal(false);
            setSelectedVariantForSwatch(null);
            setSelectedColorForSwatch(null);
          }}
          productImages={formData.images}
          onSelectSwatch={(imageId: string) => {
            // If empty imageId, clear swatch selection
            if (!imageId) {
              if (selectedVariantForSwatch !== null) {
                setFormData(prev => {
                  const newVariants = [...prev.variants];
                  const v = newVariants[selectedVariantForSwatch!];
                  if (v) {
                    newVariants[selectedVariantForSwatch!] = { ...v, swatch_image_id: null, swatch_image: null } as any;
                  }
                  return { ...prev, variants: newVariants };
                });
              } else if (selectedColorForSwatch) {
                const color = selectedColorForSwatch;
                setFormData(prev => ({
                  ...prev,
                  variants: prev.variants.map(v => ((v.color || 'No Color') === color)
                    ? ({ ...v, swatch_image_id: null, swatch_image: null } as any)
                    : v)
                }));
              }
              setShowSwatchModal(false);
              setSelectedVariantForSwatch(null);
              setSelectedColorForSwatch(null);
              return;
            }
            if (selectedVariantForSwatch !== null) {
              const selectedImage = formData.images.find(img => img.id === imageId);
              if (selectedImage) {
                let imageUrl = selectedImage.image_url || selectedImage.url;
                if (imageUrl) {
                  // Convert to full GitHub storage URL
                  imageUrl = getStorageImageUrl(imageUrl);
                  handleSwatchSelection(imageId, imageUrl);
                }
              }
            } else if (selectedColorForSwatch) {
              const selectedImage = formData.images.find(img => img.id === imageId);
              if (selectedImage) {
                let imageUrl = selectedImage.image_url || selectedImage.url;
                if (imageUrl) {
                  imageUrl = getStorageImageUrl(imageUrl);
                  handleSwatchSelection(imageId, imageUrl);
                }
              }
            }
          }}
          currentSwatchId={(() => {
            if (selectedVariantForSwatch !== null) {
              return formData.variants[selectedVariantForSwatch]?.swatch_image_id || null;
            }
            if (selectedColorForSwatch) {
              const color = selectedColorForSwatch;
              const v = formData.variants.find(v => (v.color || 'No Color') === color && v.swatch_image_id);
              return v?.swatch_image_id || null;
            }
            return null;
          })()}
        />
      )}
    </>
  );
};

export default ProductForm;
