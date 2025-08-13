import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { getStorageImageUrl, getProductImageUrls } from '../utils/storageUtils';
import type { Product } from '../types';

export const usePublicProducts = (featured?: boolean) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          product_variants(*),
          product_reviews(*)
        `)
        .order('created_at', { ascending: false });
      
      if (featured) {
        try {
          query = query.eq('is_featured', true);
        } catch (e) {
          query = query.eq('featured', true);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('[usePublicProducts] Error:', error.message);
        const msg = (error.message || '').toLowerCase();
        const isPermissionIssue = msg.includes('permission denied') || 
                                  msg.includes('not allowed') || 
                                  msg.includes('rls');
        
        if (isPermissionIssue) {
          console.warn('[usePublicProducts] Permission denied, attempting fallback without reviews/images:', error.message);
          // Try a simpler query without joins that might fail due to RLS
          try {
            const fallbackQuery = supabase
              .from('products')
              .select('*')
              .eq('is_active', true);
              
            if (featured) {
              fallbackQuery.eq('is_featured', true);
            }
            
            const fallbackResult = await fallbackQuery;
            if (fallbackResult.error) {
              console.error('[usePublicProducts] Fallback query also failed:', fallbackResult.error);
              setProducts([]);
              return;
            }
            
            // Process fallback data without reviews/images
            const fallbackProducts = (fallbackResult.data || []).map((product: any) => ({
              id: String(product.id),
              slug: product.slug || `product-${product.id}`,
              name: product.name,
              price: Number(product.sale_price || product.price),
              originalPrice: product.sale_price && product.price && product.sale_price !== product.price 
                ? Number(product.price) : undefined,
              discountPercentage: product.sale_price && product.price && product.sale_price !== product.price
                ? Math.round(((product.price - product.sale_price) / product.price) * 100)
                : undefined,
              images: ['/placeholder-product.jpg'], // Fallback image
              category: 'Products',
              subcategory: product.subcategory,
              occasion: [],
              fabric: product.fabric || 'Cotton',
              color: product.color || 'Multi-color',
              colors: [product.color || 'Multi-color'],
              sizes: ['Free Size'],
              description: product.description || '',
              isFeatured: Boolean(product.is_featured),
              isNew: false,
              rating: 0, // No reviews available
              reviewCount: 0,
              stockStatus: 'In Stock' as const,
              specifications: {},
              reviews: [],
              variants: []
            }));
            
            setProducts(fallbackProducts);
            return;
          } catch (fallbackError) {
            console.error('[usePublicProducts] Fallback failed:', fallbackError);
            setProducts([]);
            return;
          }
        }
        throw error;
      }
      
      if (!data || data.length === 0) {
        setProducts([]);
        return;
      }

      // Transform to our Product interface
      const transformedProducts = (data || []).map((product: any) => {
        // Map product_images to public URLs from Supabase storage
        let images: string[] = [];
        
        if (Array.isArray(product.product_images) && product.product_images.length > 0) {
          images = product.product_images.map((img: any) => {
            if (img.image_url) {
              return getStorageImageUrl(img.image_url);
            }
            return getStorageImageUrl(img.image_path);
          }).filter(Boolean);
        } else if (product.image_url) {
          images = [getStorageImageUrl(product.image_url)];
        } else {
          // Try to get images by product ID pattern
          images = getProductImageUrls(product.id);
        }

        // Map variants
        let sizes: string[] = [];
        let colors: string[] = [];
        if (Array.isArray(product.product_variants) && product.product_variants.length > 0) {
          sizes = Array.from(new Set(product.product_variants.map((v: any) => v.size).filter(Boolean)));
          colors = Array.from(new Set(product.product_variants.map((v: any) => v.color).filter(Boolean)));
        }

        // Map reviews - handle gracefully if reviews aren't accessible
        let reviews: any[] = [];
        let reviewCount = 0;
        let rating = 0;
        
        try {
          if (Array.isArray(product.product_reviews) && product.product_reviews.length > 0) {
            reviews = product.product_reviews.map((r: any) => ({
              id: String(r.id),
              userId: r.user_id,
              userName: r.user_name,
              rating: r.rating,
              comment: r.comment,
              createdAt: r.created_at,
              helpful: r.helpful ?? 0,
              images: r.images || []
            }));
            
            reviewCount = reviews.length;
            rating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          }
        } catch (reviewError) {
          console.warn('[usePublicProducts] Could not process reviews for product', product.id, ':', reviewError);
          reviews = [];
          reviewCount = 0;
          rating = 0;
        }

        return {
          id: String(product.id),
          slug: String(product.slug),
          name: String(product.name ?? ''),
          price: Number(product.sale_price ?? product.price ?? 0),
          originalPrice: product.sale_price ? Number(product.price ?? 0) : undefined,
          discountPercentage: product.sale_price && product.price
            ? Math.round(((product.price - product.sale_price) / product.price) * 100)
            : undefined,
          images,
          description: String(product.description ?? ''),
          shortDescription: String(product.short_description ?? ''),
          category: String(product.category ?? ''),
          color: String(product.color ?? ''),
          inStock: Boolean(product.in_stock ?? true),
          stockQuantity: Number(product.stock_quantity ?? 0),
          stockStatus: product.in_stock ? 'In Stock' : 'Out of Stock',
          rating,
          reviewCount,
          isNew: Boolean(product.is_new ?? false),
          isFeatured: Boolean(product.is_featured ?? false),
          isSale: Boolean(product.sale_price && product.sale_price < product.price),
          tags: product.tags ? (Array.isArray(product.tags) ? product.tags : [product.tags]) : [],
          sizes,
          colors,
          weight: product.weight ? String(product.weight) : undefined,
          dimensions: product.dimensions ? String(product.dimensions) : undefined,
          material: product.material ? String(product.material) : undefined,
          careInstructions: product.care_instructions ? String(product.care_instructions) : undefined,
          shippingInfo: product.shipping_info ? String(product.shipping_info) : undefined,
          returnPolicy: product.return_policy ? String(product.return_policy) : undefined,
          reviews,
          relatedProducts: [],
          specifications: {},
          variants: []
        };
      }) as Product[];

      setProducts(transformedProducts);
    } catch (e) {
      console.error('[usePublicProducts] Error during processing:', e);
      setError(e instanceof Error ? e.message : 'An error occurred');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [featured]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};
