import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useAdmin';
import ProductForm from '../../components/admin/ProductForm';
import { getStorageImageUrl } from '../../utils/storageUtils';
import type { ProductFormDataWithDelete, ProductWithDetails } from '../../types/admin';

const EditProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading, error, updateProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<ProductWithDetails | null>(null);

  useEffect(() => {
    if (products.length > 0) {
      const foundProduct = products.find(p => p.id === id);
      if (import.meta.env.DEV) {
        console.debug('[EditProductPage] looking for product ID:', id);
        console.debug('[EditProductPage] available products:', products.map(p => ({ id: p.id, name: p.name, variants: p.variants?.length || 0 })));
      }
      if (foundProduct) {
        if (import.meta.env.DEV) {
          console.debug('[EditProductPage] found product:', foundProduct.name);
          console.debug('[EditProductPage] product variants:', foundProduct.variants);
          console.debug('[EditProductPage] product inventory:', foundProduct.inventory);
        }
        setProduct(foundProduct);
      } else {
  if (import.meta.env.DEV) console.debug('[EditProductPage] product not found, redirecting');
        navigate('/admin/products', { replace: true });
      }
    } else {
  if (import.meta.env.DEV) console.debug('[EditProductPage] no products yet, len:', products.length);
    }
  }, [products, id, navigate]);

  const handleSubmit = async (data: ProductFormDataWithDelete) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      // Collect images to delete
      const imagesToDelete = data.images?.filter(img => img.toDelete && img.id);
      await updateProduct(id, { ...data, imagesToDelete, variantsToDelete: data.variantsToDelete });
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
  const initialData: ProductFormDataWithDelete = {
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    category_id: product.category_id,
    vendor_id: product.vendor_id || null,
    price: product.price,
    sale_price: product.sale_price,
    sku: product.sku || '',
    is_active: product.is_active,
    meta_title: product.meta_title || '',
    meta_description: product.meta_description || '',
    // Product attributes
    fabric: product.fabric || null,
    color: product.color || null,
    occasion: product.occasion || null,
    subcategory: product.subcategory || null,
    // Google Merchant Center fields
    gtin: product.gtin || null,
    mpn: product.mpn || null,
    gender: product.gender || null,
    age_group: product.age_group || null,
    google_product_category: product.google_product_category || null,
    google_category_id: product.google_category_id || null,
    images: (product.images || []).map(image => ({
      id: image.id,
      image_url: image.image_url,
      alt_text: image.alt_text,
      is_primary: image.is_primary,
      existing: true,
      toDelete: false
    })),
    variants: (product.variants || []).map(variant => {
      // Find inventory for this variant
      const inv = Array.isArray(product.inventory)
        ? product.inventory.find((i: any) => i.variant_id === variant.id)
        : null;
  if (import.meta.env.DEV) console.debug(`[EditProductPage] mapping variant ${variant.id}:`, {
        variant,
        variantKeys: Object.keys(variant),
        foundInventory: inv,
        totalInventoryRecords: Array.isArray(product.inventory) ? product.inventory.length : 'not array',
        hasSwatchImageId: !!variant.swatch_image_id,
        hasSwatchImage: !!(variant as any).swatch_image,
        swatchImageId: variant.swatch_image_id,
        swatchImageData: (variant as any).swatch_image
      });
      
      // Process swatch image URL
      let swatchImageUrl = null;
      if (variant.swatch_image_id && (variant as any).swatch_image) {
        const swatchImg = (variant as any).swatch_image;
        swatchImageUrl = swatchImg.image_url ? getStorageImageUrl(swatchImg.image_url) : null;
  if (import.meta.env.DEV) console.debug(`[EditProductPage] processed swatch URL for variant ${variant.id}:`, {
          originalUrl: swatchImg.image_url,
          processedUrl: swatchImageUrl
        });
      }
      
      return {
        id: variant.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
  color_hex: (variant as any).color_hex || null,
        material: null, // Not yet supported in database
        style: null,    // Not yet supported in database
        variant_type: variant.size ? 'size' : variant.color ? 'color' : undefined,
        price_adjustment: variant.price_adjustment,
        quantity: inv ? inv.quantity : 0,
        low_stock_threshold: inv ? inv.low_stock_threshold : 2,
        swatch_image_id: variant.swatch_image_id,
        swatch_image: swatchImageUrl
      };
    }),
    inventory: (() => {
      // Find product-level inventory (variant_id === null)
      const productInventory = Array.isArray(product.inventory) 
        ? product.inventory.find((i: any) => i.variant_id === null)
        : null;
      
      if (productInventory) {
        return { 
          quantity: productInventory.quantity, 
          low_stock_threshold: productInventory.low_stock_threshold 
        };
      }
      
      // Default when no product-level inventory found
      return { quantity: 0, low_stock_threshold: 2 };
    })()
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