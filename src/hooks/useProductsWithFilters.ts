import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../config/supabase';
import { getStorageImageUrl, getProductImageUrls } from '../utils/storageUtils';
import { getCachedCategoryId } from '../utils/categoryCache';
import type { Product } from '../types';

interface ProductFilters {
  category?: string;
  priceRange?: { min: number; max: number };
  fabric?: string;
  occasion?: string;
  search?: string;
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
  // Incrementing id to ignore stale fetch results
  const fetchIdRef = useRef(0);

  const fetchProducts = useCallback(async () => {
    // Mark this fetch with a unique id so that we can ignore stale responses
    const myFetchId = ++fetchIdRef.current;
    const isStale = () => myFetchId !== fetchIdRef.current;

    try {
      // If a newer fetch started, abort early
      if (isStale()) return;

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
            color_hex,
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

      // Apply category filter using cached category ID lookup
      if (filters.category) {
        try {
          // Use cached category ID lookup instead of direct database query
          const categoryId = await getCachedCategoryId(filters.category);
          
          if (categoryId) {
            query = query.eq('category_id', categoryId);
          } else {
            // If category filter was specified but no category was found, return empty results
            console.warn('[useProductsWithFilters] Category not found:', filters.category);
            if (isStale()) return;
            setProducts([]);
            setTotalCount(0);
            setTotalPages(0);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('[useProductsWithFilters] Could not apply category filter:', err);
          // If there's an error finding the category, return empty results rather than all products
          if (isStale()) return;
          setProducts([]);
          setTotalCount(0);
          setTotalPages(0);
          setLoading(false);
          return;
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

      // Apply fabric filter
      if (filters.fabric) {
        query = query.eq('fabric', filters.fabric);
      }

      // Apply occasion filter
      if (filters.occasion) {
        query = query.contains('occasion', [filters.occasion]);
      }

      // Apply search filter - search across name and description
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%, description.ilike.%${filters.search}%`);
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

      let data, error, count;
      
      // First try to get products with images and all filters
      try {
  const result = await query;
  // If a newer fetch started while we were waiting for DB, abort
  if (isStale()) return;
  data = result.data;
  error = result.error;
        count = result.count;
        
        // Handle specific database column errors
        if (error) {
          console.error('[useProductsWithFilters] Database error:', error);
          throw error;
        }
        
      } catch (err: any) {
        console.error('[useProductsWithFilters] Query failed:', err);
        if (isStale()) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        setProducts([]);
        setTotalCount(0);
        setTotalPages(0);
        setLoading(false);
        return;
      }
      
      if (error) {
        console.error('[useProductsWithFilters] Database error:', error);
        if (isStale()) return;
        const msg = (error as any).message || 'Database error';
        setError(msg);
        setProducts([]);
        setTotalCount(0);
        setTotalPages(0);
        setLoading(false);
        return;
      }

  if (isStale()) return;
  setTotalCount(count || 0);
  setTotalPages(Math.ceil((count || 0) / pagination.limit));

      if (!data || data.length === 0) {
        if (isStale()) return;
        setProducts([]);
        return;
      }

      // Fetch review aggregates for current page products
      let ratingMap: Record<string, { count: number; avg: number }> = {};
      try {
        const ids = (data || []).map((p: any) => p.id).filter(Boolean);
        if (ids.length > 0) {
          const { data: reviewRows, error: reviewErr } = await supabase
            .from('product_reviews')
            .select('product_id, rating')
            .in('product_id', ids);
          if (!reviewErr && Array.isArray(reviewRows)) {
            const temp: Record<string, number[]> = {};
            for (const row of reviewRows) {
              const pid = String(row.product_id);
              const r = Number(row.rating) || 0;
              if (!temp[pid]) temp[pid] = [];
              temp[pid].push(r);
            }
            ratingMap = Object.fromEntries(
              Object.entries(temp).map(([pid, arr]) => {
                const count = arr.length;
                const avg = count > 0 ? arr.reduce((a, b) => a + b, 0) / count : 0;
                return [pid, { count, avg }];
              })
            );
          }
        }
      } catch (aggErr) {
        console.warn('[useProductsWithFilters] Could not fetch ratings:', aggErr);
      }

      // Transform to our Product interface
      const transformedProducts = await Promise.all(data.map(async (product: any) => {
        const imageEntries: { url: string; id?: string }[] = [];
        const swatchImageUrls: string[] = [];
        const swatchImageIds = new Set<string>();

        if (Array.isArray(product.product_images) && product.product_images.length > 0) {
          const sortedImages = [...product.product_images].sort((a: any, b: any) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            if (a.created_at && b.created_at) {
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }
            return 0;
          });

          for (const img of sortedImages) {
            const rawUrl = (img.image_url || img.image_path) as string | null;
            const url = rawUrl ? getStorageImageUrl(String(rawUrl)) : '';
            if (!url) continue;
            imageEntries.push({
              url,
              id: img.id ? String(img.id) : undefined
            });
          }
        } else {
          try {
            const { data: productImages } = await supabase
              .from('product_images')
              .select('id, image_url, image_path, is_primary, created_at')
              .eq('product_id', product.id)
              .order('is_primary', { ascending: false });

            if (productImages && productImages.length > 0) {
              const sortedImages = [...productImages].sort((a: any, b: any) => {
                if (a.is_primary && !b.is_primary) return -1;
                if (!a.is_primary && b.is_primary) return 1;
                if (a.created_at && b.created_at) {
                  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                }
                return 0;
              });

              for (const img of sortedImages) {
                const rawUrl = (img.image_url || img.image_path) as string | null;
                const url = rawUrl ? getStorageImageUrl(String(rawUrl)) : '';
                if (!url) continue;
                imageEntries.push({
                  url,
                  id: img.id ? String(img.id) : undefined
                });
              }
            }
          } catch (imgError) {
            console.warn(`[useProductsWithFilters] Could not fetch images for product ${product.id}:`, imgError);
          }
        }

        if (imageEntries.length === 0) {
          const fallbackUrls = getProductImageUrls(product.id);
          fallbackUrls.forEach(url => {
            if (url) {
              imageEntries.push({ url });
            }
          });
        }

  // Ratings from aggregated map
  const agg = ratingMap[String(product.id)] || { count: 0, avg: 0 };
  const reviews: any[] = [];
  const rating = agg.avg;

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
              let swatchImageUrl: string | null = null;
              
              // First priority: Check if the swatch image was joined directly
              if (variant.swatch_image?.image_url) {
                swatchImageUrl = getStorageImageUrl(variant.swatch_image.image_url);
              }
              // Second priority: Look in the main product images array
              else if (variant.swatch_image_id && Array.isArray(product.product_images)) {
                const swatchImage = product.product_images.find((img: any) => 
                  img.id === variant.swatch_image_id || String(img.id) === String(variant.swatch_image_id)
                );
                
                if (swatchImage?.image_url) {
                  swatchImageUrl = getStorageImageUrl(swatchImage.image_url);
                }
              }
              
              // Log missing swatch images only in development
              if (import.meta.env.DEV && variant.swatch_image_id && !swatchImageUrl) {
                console.warn('[useProductsWithFilters] Missing swatch image:', {
                  variantId: variant.id,
                  color: variant.color,
                  swatchImageId: variant.swatch_image_id
                });
              }
              
              // Normalize color_hex to #RRGGBB if provided
              let normalizedHex: string | undefined;
              if (typeof variant.color_hex === 'string') {
                const raw = variant.color_hex.trim();
                const withHash = raw.startsWith('#') ? raw : `#${raw}`;
                if (/^#([0-9A-Fa-f]{6})$/.test(withHash)) {
                  normalizedHex = withHash;
                }
              }

              if (swatchImageUrl) {
                swatchImageUrls.push(swatchImageUrl);
              }
              if (variant.swatch_image_id) {
                swatchImageIds.add(String(variant.swatch_image_id));
              }

              return {
                id: variant.id,
                sku: variant.sku,
                size: variant.size,
                color: variant.color,
                colorHex: normalizedHex,
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

        // Deduplicate images and fall back to swatch images so gallery never empties
        const swatchImageUrlSet = new Set(swatchImageUrls);
        const uniqueImages: string[] = [];
        const seenImages = new Set<string>();
        const addImage = (url?: string | null) => {
          if (!url) return;
          if (seenImages.has(url)) return;
          seenImages.add(url);
          uniqueImages.push(url);
        };

        const galleryCandidates: string[] = [];
        const swatchCandidates: string[] = [];

        for (const entry of imageEntries) {
          const isSwatch = (entry.id && swatchImageIds.has(entry.id)) || swatchImageUrlSet.has(entry.url);
          if (isSwatch) {
            swatchCandidates.push(entry.url);
          } else {
            galleryCandidates.push(entry.url);
          }
        }

        // Add gallery images first, then swatches
        galleryCandidates.forEach(addImage);
        swatchCandidates.forEach(addImage);
        
        // If still no images, add from swatchImageUrls array (fallback)
        if (uniqueImages.length === 0) {
          swatchImageUrls.forEach(addImage);
        }

        if (uniqueImages.length === 0) {
          addImage('/placeholder-product.jpg');
        }

        // New pricing rule:
        // - If variants exist, set display price to min variant priceAdjustment; ignore sale/cost
        // - If no variants, use Sale Price (sale_price) falling back to base price
        const variantPrices = Array.isArray(variants) && variants.length > 0
          ? variants.map((v: any) => v.priceAdjustment || 0)
          : [];
        const hasVariants = variantPrices.length > 0;
        const positiveVariantPrices = variantPrices.filter((p: number) => p > 0);
        const minPositiveVariantPrice = positiveVariantPrices.length > 0 ? Math.min(...positiveVariantPrices) : undefined;

        let displayPrice: number;
        let originalPrice: number | undefined;
        let discountPercentage: number | undefined;

        if (hasVariants && Number.isFinite(minPositiveVariantPrice as number)) {
          displayPrice = minPositiveVariantPrice as number;
          originalPrice = undefined;
          discountPercentage = undefined;
        } else {
          const saleOrBase = Number(product.sale_price || product.price || 0);
          displayPrice = saleOrBase > 0 ? saleOrBase : 0;
          originalPrice = undefined;
          discountPercentage = undefined;
        }

        return {
          id: String(product.id),
          slug: String(product.slug),
          name: String(product.name || ''),
          price: displayPrice,
          originalPrice,
          discountPercentage,
          images: uniqueImages,
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
          stockQuantity: (() => {
            // Calculate standalone product quantity from inventory
            if (Array.isArray(product.inventory) && product.inventory.length > 0) {
              const hasVariants = Array.isArray(product.product_variants) && product.product_variants.length > 0;
              if (!hasVariants) {
                // For products without variants, sum up product-level inventory (variant_id === null)
                const productInventory = product.inventory.filter((inv: any) => inv.variant_id === null);
                return productInventory.reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0);
              }
            }
            return 0;
          })(),
          specifications: {},
          reviews: [],
          variants
        };
      }));

      if (isStale()) return;
      setProducts(transformedProducts as Product[]);
    } catch (err) {
      if (isStale()) return;
      console.error('[useProductsWithFilters] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
    } finally {
      // Only clear loading for the latest fetch
      if (!isStale()) setLoading(false);
    }
  }, [
    filters.category,
    filters.priceRange?.min,
    filters.priceRange?.max,
    filters.fabric,
    filters.occasion,
    filters.search,
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
