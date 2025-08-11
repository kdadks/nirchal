import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import type { Product } from '../types';

export const usePublicProducts = (featured?: boolean) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      let query = supabase
        .from('products')
        .select(`*, product_images(*), product_variants(*), product_reviews(*)`)
        .order('created_at', { ascending: false });
      try {
        query = query.eq('is_active', true);
      } catch (e) {
        console.log('[usePublicProducts] is_active field might not exist, continuing without filter');
      }
      if (featured) {
        try {
          query = query.eq('is_featured', true);
        } catch (e) {
          query = query.eq('featured', true);
        }
      }
      const { data, error } = await query;
      console.log('[usePublicProducts] Query result:', data);
      console.log('[usePublicProducts] Query error:', error);
      if (error) {
        console.error('[usePublicProducts] Supabase error:', error);
        throw error;
      }
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const transformedProducts = (data || []).map((product: any) => {
        // Map product_images to public URLs
        let images: string[] = [];
        if (Array.isArray(product.product_images) && product.product_images.length > 0) {
          images = product.product_images.map((img: any) =>
            img.image_url && !img.image_url.startsWith('http')
              ? `${supabaseUrl}/storage/v1/object/public/product-images/${img.image_url}`
              : img.image_url
          );
        } else {
          images = ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'];
        }
        // Map variants
        let sizes: string[] = [];
        let colors: string[] = [];
        if (Array.isArray(product.product_variants) && product.product_variants.length > 0) {
          sizes = Array.from(new Set(product.product_variants.map((v: any) => v.size).filter(Boolean)));
          colors = Array.from(new Set(product.product_variants.map((v: any) => v.color).filter(Boolean)));
        }
        // Map reviews
        const reviews = Array.isArray(product.product_reviews) ? product.product_reviews.map((r: any) => ({
          id: String(r.id),
          userId: r.user_id,
          userName: r.user_name,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.created_at,
          helpful: r.helpful ?? 0,
          images: r.images || []
        })) : [];
        const rating = reviews.length > 0
          ? (reviews.reduce((acc: number, r: { rating: number }) => acc + (r.rating || 0), 0) / reviews.length)
          : 0;
        return {
          id: String(product.id),
          slug: String(product.slug),
          name: String(product.name ?? ''),
          price: Number(product.sale_price ?? product.price ?? 0),
          originalPrice: product.sale_price ? Number(product.price ?? 0) : undefined,
          discountPercentage: product.sale_price && product.price
            ? Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100)
            : undefined,
          images,
          category: product.category_id?.toString() || product.category || 'general',
          subcategory: undefined,
          occasion: [],
          fabric: undefined,
          color: colors[0] || 'Multi',
          sizes,
          description: String(product.description ?? ''),
          isFeatured: product.is_featured ?? product.featured ?? false,
          isNew: false,
          rating,
          reviewCount: reviews.length,
          stockStatus: 'In Stock' as const,
          specifications: {},
          reviews,
          variants: product.product_variants || []
        };
      });
      setProducts(transformedProducts);
      if (transformedProducts.length === 0) {
        console.log('[usePublicProducts] No database products, returning empty array');
        setProducts([]);
      }
    } catch (e) {
      console.error('[usePublicProducts] Error:', e);
      console.log('[usePublicProducts] Database error, returning empty array');
      setProducts([]);
      setError(e instanceof Error ? e.message : 'Error fetching products');
    } finally {
      setLoading(false);
    }
  }, [featured]);

    useEffect(() => {
      fetchProducts();
    }, [fetchProducts]);

  return {
    products,
    loading,
    error
  };
};