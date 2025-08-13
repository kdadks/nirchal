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
      
      // Build the query - try to fetch images and variants but handle permission errors gracefully
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, is_primary),
          product_variants(*)
        `, { count: 'exact' })
        .eq('is_active', true);

      // Apply category filter using category_id
      if (filters.category) {
        console.log('[useProductsWithFilters] Applying category filter:', filters.category);
        try {
          // Get category ID from category slug (URL parameter uses slug)
          const { data: categoryData } = await supabase
            .from('categories')
            .select('id, name, slug')
            .eq('slug', filters.category)
            .single();
          
          console.log('[useProductsWithFilters] Category data by slug:', categoryData);
          
          if (categoryData) {
            console.log('[useProductsWithFilters] Found category by slug, applying filter with ID:', categoryData.id);
            query = query.eq('category_id', categoryData.id);
          } else {
            // Fallback: try matching by name if slug doesn't work
            console.log('[useProductsWithFilters] Category not found by slug, trying by name');
            const { data: categoryByName } = await supabase
              .from('categories')
              .select('id, name, slug')
              .eq('name', filters.category)
              .single();
            
            console.log('[useProductsWithFilters] Category data by name:', categoryByName);
            
            if (categoryByName) {
              console.log('[useProductsWithFilters] Found category by name, applying filter with ID:', categoryByName.id);
              query = query.eq('category_id', categoryByName.id);
            } else {
              console.log('[useProductsWithFilters] No category found for:', filters.category);
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

      console.log('[useProductsWithFilters] Executing query with filters:', filters);
      
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
          console.log('[useProductsWithFilters] Applying category filter in fallback:', filters.category);
          try {
            // Get category ID from category slug (URL parameter uses slug)
            const { data: categoryData } = await supabase
              .from('categories')
              .select('id, name, slug')
              .eq('slug', filters.category)
              .single();
            
            console.log('[useProductsWithFilters] Fallback - Category data by slug:', categoryData);
            
            if (categoryData) {
              console.log('[useProductsWithFilters] Fallback - Found category by slug, applying filter with ID:', categoryData.id);
              fallbackQuery = fallbackQuery.eq('category_id', categoryData.id);
            } else {
              // Fallback: try matching by name if slug doesn't work
              console.log('[useProductsWithFilters] Fallback - Category not found by slug, trying by name');
              const { data: categoryByName } = await supabase
                .from('categories')
                .select('id, name, slug')
                .eq('name', filters.category)
                .single();
              
              console.log('[useProductsWithFilters] Fallback - Category data by name:', categoryByName);
              
              if (categoryByName) {
                console.log('[useProductsWithFilters] Fallback - Found category by name, applying filter with ID:', categoryByName.id);
                fallbackQuery = fallbackQuery.eq('category_id', categoryByName.id);
              } else {
                console.log('[useProductsWithFilters] Fallback - No category found for:', filters.category);
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

      console.log('[useProductsWithFilters] Query completed - Total count:', count, 'Data length:', data?.length);
      console.log('[useProductsWithFilters] Applied filters:', filters);

      if (!data || data.length === 0) {
        console.log('[useProductsWithFilters] No products found with current filters');
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

        // Determine stock status - assume all products are in stock for now
        const stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';

        return {
          id: String(product.id),
          slug: String(product.slug),
          name: String(product.name || ''),
          price: Number(product.sale_price || product.price || 0),
          originalPrice: product.sale_price && product.price && product.sale_price !== product.price 
            ? Number(product.price || 0) 
            : undefined,
          discountPercentage: product.sale_price && product.price && product.sale_price !== product.price
            ? Math.round(((product.price - product.sale_price) / product.price) * 100)
            : undefined,
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
              return variantSizes.length > 0 ? variantSizes : ['Free Size'];
            }
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
          variants: []
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
