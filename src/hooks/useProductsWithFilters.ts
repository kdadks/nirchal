import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { getStorageImageUrl } from '../utils/storageUtils';
import type { Product } from '../types';

interface ProductFilters {
  category?: string;
  priceRange?: { min: number; max: number };
  fabric?: string;
  occasion?: string;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'rating' | 'name';
}

interface PaginationOptions {
  page: number;
  limit: number;
}

export const useProductsWithFilters = (
  filters: ProductFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 20 }
) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the products with variants to extract swatch image IDs
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          product_variants(
            id,
            sku,
            size,
            color,
            price_adjustment,
            swatch_image_id,
            swatch_image:product_images!swatch_image_id(*)
          ),
          inventory(
            id,
            product_id,
            variant_id,
            quantity,
            low_stock_threshold
          )
        `, { count: 'exact' })
        .eq('is_active', true);

      // Apply category filter using category_id
      if (filters.category) {
  if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Applying category filter:', filters.category);
        try {
          // Get category ID from category slug (URL parameter uses slug)
          const { data: categoryData } = await supabase
            .from('categories')
            .select('id, name, slug')
            .eq('slug', filters.category)
            .single();
          
          if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Category by slug:', categoryData);
          
          if (categoryData) {
            if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Found category by slug:', categoryData.id);
            query = query.eq('category_id', categoryData.id);
          } else {
            // Fallback: try matching by name if slug doesn't work
            if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Category not found by slug, try name');
            const { data: categoryByName } = await supabase
              .from('categories')
              .select('id, name, slug')
              .eq('name', filters.category)
              .single();
            
            if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Category by name:', categoryByName);
            
            if (categoryByName) {
              if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Found category by name:', categoryByName.id);
              query = query.eq('category_id', categoryByName.id);
            } else {
              if (import.meta.env.DEV) console.debug('[useProductsWithFilters] No category for:', filters.category);
            }
          }
        } catch (err) {
          console.warn('[useProductsWithFilters] Could not apply category filter:', err);
        }
      }

      // Apply price range filter
      if (filters.priceRange) {
        if (filters.priceRange.min > 0) {
          query = query.gte('sale_price', filters.priceRange.min);
        }
        if (filters.priceRange.max < 100000) {
          query = query.lte('sale_price', filters.priceRange.max);
        }
      }

      // Apply fabric filter - handle gracefully if column doesn't exist
      if (filters.fabric) {
        try {
          query = query.eq('fabric', filters.fabric);
        } catch (err) {
          console.warn('[useProductsWithFilters] Fabric column may not exist, skipping fabric filter:', err);
        }
      }

      // Apply occasion filter - handle both JSON array and text formats
      if (filters.occasion) {
        try {
          // First try JSON array contains (for JSONB columns)
          query = query.contains('occasion', [filters.occasion]);
        } catch (err) {
          console.warn('[useProductsWithFilters] JSON occasion filter failed, trying text filter:', err);
          try {
            // Fallback to text-based search (for TEXT columns)
            query = query.ilike('occasion', `%${filters.occasion}%`);
          } catch (textErr) {
            console.warn('[useProductsWithFilters] Occasion column may not exist, skipping occasion filter:', textErr);
          }
        }
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_low':
          query = query.order('sale_price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('sale_price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'rating':
          // This would need a computed column or separate handling
          query = query.order('created_at', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Apply pagination
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);

  if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Executing query', filters);
      
      let data, error, count;
      
      // First try to get products with images and all filters
      try {
        const result = await query;
        data = result.data;
        error = result.error;
        count = result.count;
        
        // Handle specific database column errors
        if (error) {
          const msg = (error.message || '').toLowerCase();
          const isSchemaIssue = msg.includes('column') ||
                                msg.includes('does not exist') ||
                                msg.includes('invalid input syntax for type json') ||
                                msg.includes('json');
          const isPermissionIssue = msg.includes('permission denied') ||
                                    msg.includes('not allowed') ||
                                    msg.includes('rls');

          // If schema/permission issues (most likely product_images blocked by RLS), fallback
          if (isSchemaIssue || isPermissionIssue) {
            console.warn('[useProductsWithFilters] Schema/permission issue, attempting fallback query:', error.message);
            throw new Error('Schema or permission issue - attempting fallback');
          }
        }
      } catch (err: any) {
        if (err.message === 'Schema or permission issue - attempting fallback' || 
            (err.message && (err.message.toLowerCase().includes('column') || err.message.toLowerCase().includes('json') || err.message.toLowerCase().includes('permission')))) {
          console.warn('[useProductsWithFilters] Query failed due to schema issues, using minimal fallback:', err);
        } else {
          console.warn('[useProductsWithFilters] Query failed, falling back to simple query:', err);
        }
        
        // Fallback to the most basic query possible - no filters that might cause issues
        let fallbackQuery = supabase
          .from('products')
          .select('*', { count: 'exact' })
          .eq('is_active', true);
          
        // Apply category filter in fallback too
        if (filters.category) {
          if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Fallback category filter:', filters.category);
          try {
            // Get category ID from category slug (URL parameter uses slug)
            const { data: categoryData } = await supabase
              .from('categories')
              .select('id, name, slug')
              .eq('slug', filters.category)
              .single();
            
            if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Fallback category by slug:', categoryData);
            
            if (categoryData) {
              if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Fallback found category by slug:', categoryData.id);
              fallbackQuery = fallbackQuery.eq('category_id', categoryData.id);
            } else {
              // Fallback: try matching by name if slug doesn't work
              if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Fallback: category not by slug, try name');
              const { data: categoryByName } = await supabase
                .from('categories')
                .select('id, name, slug')
                .eq('name', filters.category)
                .single();
              
              if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Fallback category by name:', categoryByName);
              
              if (categoryByName) {
                if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Fallback found category by name:', categoryByName.id);
                fallbackQuery = fallbackQuery.eq('category_id', categoryByName.id);
              } else {
                if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Fallback: no category for', filters.category);
              }
            }
          } catch (err) {
            console.warn('[useProductsWithFilters] Fallback category filter failed:', err);
          }
        }
          
        // Only apply safe filters in fallback
        if (filters.priceRange) {
          if (filters.priceRange.min > 0) {
            fallbackQuery = fallbackQuery.gte('sale_price', filters.priceRange.min);
          }
          if (filters.priceRange.max < 100000) {
            fallbackQuery = fallbackQuery.lte('sale_price', filters.priceRange.max);
          }
        }
        
        // Skip fabric and occasion filters in fallback to avoid JSON/column issues
        // Skip category filter in fallback to avoid relationship issues
        
        switch (filters.sortBy) {
          case 'price_low':
            fallbackQuery = fallbackQuery.order('sale_price', { ascending: true });
            break;
          case 'price_high':
            fallbackQuery = fallbackQuery.order('sale_price', { ascending: false });
            break;
          case 'name':
            fallbackQuery = fallbackQuery.order('name', { ascending: true });
            break;
          case 'rating':
            fallbackQuery = fallbackQuery.order('created_at', { ascending: false });
            break;
          case 'newest':
          default:
            fallbackQuery = fallbackQuery.order('created_at', { ascending: false });
            break;
        }
        
        const from = (pagination.page - 1) * pagination.limit;
        const to = from + pagination.limit - 1;
        fallbackQuery = fallbackQuery.range(from, to);
        
        try {
          const fallbackResult = await fallbackQuery;
          data = fallbackResult.data;
          error = fallbackResult.error;
          count = fallbackResult.count;
        } catch (fallbackErr) {
          console.error('[useProductsWithFilters] Even fallback query failed:', fallbackErr);
          // If even the most basic query fails, return empty results
          setProducts([]);
          setTotalCount(0);
          setTotalPages(0);
          return;
        }
      }
      
      if (error) {
        console.error('[useProductsWithFilters] Database error:', error);
        const msg = (error.message || '').toLowerCase();
        const isSchemaIssue = msg.includes('column') || msg.includes('does not exist') || msg.includes('invalid input syntax for type json') || msg.includes('json');
        const isPermissionIssue = msg.includes('permission denied') || msg.includes('not allowed') || msg.includes('rls');

        // For schema/permission issues, don't crash UI; return empty list
        if (isSchemaIssue || isPermissionIssue) {
          console.warn('[useProductsWithFilters] Database schema/permission issue - returning empty products:', error.message);
          setProducts([]);
          setTotalCount(0);
          setTotalPages(0);
          return;
        }
        throw new Error(`Database error: ${error.message}`);
      }

      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / pagination.limit));

      if (import.meta.env.DEV) {
        console.debug('[useProductsWithFilters] Query done count:', count, 'len:', data?.length);
        console.debug('[useProductsWithFilters] Filters:', filters);
      }

      if (!data || data.length === 0) {
  if (import.meta.env.DEV) console.debug('[useProductsWithFilters] No products for filters');
        setProducts([]);
        return;
      }

      // Transform to our Product interface
      const transformedProducts = await Promise.all(data.map(async (product: any) => {
        // Handle product images with fallback for permission issues
        let images: string[] = [];
        
        if (Array.isArray(product.product_images) && product.product_images.length > 0) {
          images = product.product_images
            .map((img: any) => {
              const imageUrl = img.image_url;
              return imageUrl ? getStorageImageUrl(imageUrl) : null;
            })
            .filter((url: string | null): url is string => Boolean(url));
        } else {
          // Try to fetch images separately if not included in main query
          try {
            const { data: productImages } = await supabase
              .from('product_images')
              .select('image_url, is_primary')
              .eq('product_id', product.id)
              .order('is_primary', { ascending: false });
              
            if (productImages && productImages.length > 0) {
              images = productImages
                .map((img: any) => {
                  const imageUrl = img.image_url;
                  return imageUrl ? getStorageImageUrl(imageUrl) : null;
                })
                .filter((url: string | null): url is string => Boolean(url));
            }
          } catch (imgError) {
            console.warn(`[useProductsWithFilters] Could not fetch images for product ${product.id}:`, imgError);
          }
        }
        
        // If still no images, use placeholder
        if (images.length === 0) {
          images = ['/placeholder-product.jpg'];
        }

        // No reviews for now since product_reviews may also have permission issues
        const reviews: any[] = [];
        const rating = 0;

        // Determine stock status based on inventory
        let stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
        
        if (Array.isArray(product.inventory) && product.inventory.length > 0) {
          // If product has variants, only count variant-level inventory (variant_id !== null)
          // If product has no variants, only count product-level inventory (variant_id === null)
          const hasVariants = Array.isArray(product.product_variants) && product.product_variants.length > 0;
          const relevantInventory = product.inventory.filter((inv: any) => {
            if (hasVariants) {
              // For products with variants, only count variant-specific inventory
              return inv.variant_id !== null;
            } else {
              // For products without variants, only count product-level inventory
              return inv.variant_id === null;
            }
          });
          
          const totalQuantity = relevantInventory.reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0);
          const minThreshold = relevantInventory.length > 0 
            ? Math.min(...relevantInventory.map((inv: any) => inv.low_stock_threshold || 10))
            : 10;
          
          if (totalQuantity === 0) {
            stockStatus = 'Out of Stock';
          } else if (totalQuantity <= minThreshold) {
            stockStatus = 'Low Stock';
          }
        } else {
          // No inventory data means out of stock
          stockStatus = 'Out of Stock';
        }

        // Process variants to check for price adjustments
        const variants = (() => {
          if (Array.isArray(product.product_variants) && product.product_variants.length > 0) {
            return product.product_variants.map((variant: any) => {
              // Handle swatch image processing...
              let swatchImageUrl = null;
              
              // First priority: Check if the swatch image was joined directly
              if (variant.swatch_image?.image_url) {
                swatchImageUrl = getStorageImageUrl(variant.swatch_image.image_url);
                if (import.meta.env.DEV) console.debug('[useProductsWithFilters] joined swatch URL:', swatchImageUrl);
              }
              // Second priority: Look in the main product images array
              else if (variant.swatch_image_id && Array.isArray(product.product_images)) {
                if (import.meta.env.DEV) console.debug('[useProductsWithFilters] search swatch in product_images:', {
                  searchingFor: variant.swatch_image_id,
                  searchingForType: typeof variant.swatch_image_id,
                  availableImageIds: product.product_images.map((img: any) => ({
                    id: img.id,
                    type: typeof img.id,
                    image_url: img.image_url
                  })),
                  // Show first few actual IDs for comparison
                  actualIds: product.product_images.slice(0, 3).map((img: any) => img.id)
                });
                
                const swatchImage = product.product_images.find((img: any) => 
                  img.id === variant.swatch_image_id || String(img.id) === String(variant.swatch_image_id)
                );
                
                if (swatchImage?.image_url) {
                  swatchImageUrl = getStorageImageUrl(swatchImage.image_url);
                  if (import.meta.env.DEV) console.debug('[useProductsWithFilters] found swatch URL in product_images:', swatchImageUrl);
                } else {
                  if (import.meta.env.DEV) console.debug('[useProductsWithFilters] no swatch in product_images for ID:', variant.swatch_image_id);
                }
              }
              
              if (import.meta.env.DEV && variant.swatch_image_id && !swatchImageUrl) {
                console.warn('[useProductsWithFilters] Missing swatch image:', {
                  variantId: variant.id,
                  color: variant.color,
                  swatchImageId: variant.swatch_image_id
                });
              }
              
              if (import.meta.env.DEV) console.debug('[useProductsWithFilters] Final swatch result:', {
                variantId: variant.id,
                color: variant.color,
                finalSwatchImageUrl: swatchImageUrl
              });
              
              return {
                id: variant.id,
                sku: variant.sku,
                size: variant.size,
                color: variant.color,
                material: undefined, // Not available in current schema
                style: undefined,    // Not available in current schema
                priceAdjustment: variant.price_adjustment || 0,
                quantity: 0,         // Not available in current schema
                variantType: variant.color ? 'color' : variant.size ? 'size' : undefined,
                swatchImageId: variant.swatch_image_id,
                swatchImage: swatchImageUrl
              };
            });
          }
          return [];
        })();

        // Check if any variants have price adjustments
        const hasVariantPriceAdjustments = variants.some((v: any) => v.priceAdjustment && v.priceAdjustment !== 0);
        
        // Calculate pricing logic
        let displayPrice: number;
        let originalPrice: number | undefined;
        let discountPercentage: number | undefined;
        
        if (hasVariantPriceAdjustments) {
          // When variants have price adjustments, show base price only
          // Don't show sale price as variants will show their own adjusted prices
          displayPrice = Number(product.price || 0);
          originalPrice = undefined;
          discountPercentage = undefined;
        } else {
          // Normal pricing logic when no variant price adjustments
          displayPrice = Number(product.sale_price || product.price || 0);
          originalPrice = product.sale_price && product.price && product.sale_price !== product.price 
            ? Number(product.price || 0) 
            : undefined;
          discountPercentage = product.sale_price && product.price && product.sale_price !== product.price
            ? Math.round(((product.price - product.sale_price) / product.price) * 100)
            : undefined;
        }

        return {
          id: String(product.id),
          slug: String(product.slug),
          name: String(product.name || ''),
          price: displayPrice,
          originalPrice,
          discountPercentage,
          images,
          category: 'Category ' + (product.category_id || '1'), // Temporary category mapping
          subcategory: product.subcategory,
          occasion: (() => {
            // Handle both JSON array and comma-separated text formats
            if (Array.isArray(product.occasion)) {
              return product.occasion;
            } else if (typeof product.occasion === 'string') {
              try {
                // Try to parse as JSON first
                const parsed = JSON.parse(product.occasion);
                return Array.isArray(parsed) ? parsed : [product.occasion];
              } catch {
                // If not JSON, treat as comma-separated text
                return product.occasion.split(',').map((o: string) => o.trim());
              }
            }
            return [];
          })(),
          fabric: product.fabric || 'Cotton', // Default fabric
          color: product.color || 'Multi-color',
          colors: (() => {
            // Map variants to colors
            if (Array.isArray(product.product_variants) && product.product_variants.length > 0) {
              const variantColors: string[] = Array.from(new Set(
                product.product_variants
                  .map((v: any) => v.color ? String(v.color) : '')
                  .filter((color: string) => color.trim() !== '')
              ));
              return variantColors.length > 0 ? variantColors : [product.color || 'Multi-color'];
            }
            return [product.color || 'Multi-color'];
          })(),
          sizes: (() => {
            // Map variants to sizes  
            if (Array.isArray(product.product_variants) && product.product_variants.length > 0) {
              const variantSizes: string[] = Array.from(new Set(
                product.product_variants
                  .map((v: any) => v.size ? String(v.size) : '')
                  .filter((size: string) => size.trim() !== '')
              ));
              // If no size variants exist, show "Free Size"
              return variantSizes.length > 0 ? variantSizes : ['Free Size'];
            }
            // No variants at all, show "Free Size"
            return ['Free Size'];
          })(),
          description: String(product.description || ''),
          isFeatured: product.is_featured || false,
          isNew: false, // Default to false
          rating: Number(rating.toFixed(1)),
          reviewCount: reviews.length,
          stockStatus,
          specifications: {},
          reviews: [],
          variants
        };
      }));

      setProducts(transformedProducts as Product[]);
    } catch (err) {
      console.error('[useProductsWithFilters] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [
    filters.category,
    filters.priceRange?.min,
    filters.priceRange?.max,
    filters.fabric,
    filters.occasion,
    filters.sortBy,
    pagination.page,
    pagination.limit
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage: pagination.page,
    refetch: fetchProducts
  };
};
