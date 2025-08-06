import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Only create the client inside the hook, and only once
let supabase: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}
import { products as mockProducts } from '../data/mockData';
import type { Product } from '../types';

export const usePublicProducts = (featured?: boolean) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      console.log('[usePublicProducts] Fetching products...');
      if (!supabase) {
        setProducts([]);
        setError('Supabase client not initialized');
        setLoading(false);
        return;
      }
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // Check for is_active field first, fallback to not filtering
      try {
        query = query.eq('is_active', true);
      } catch (e) {
        console.log('[usePublicProducts] is_active field might not exist, continuing without filter');
      }

      if (featured) {
        try {
          query = query.eq('is_featured', true);
        } catch (e) {
          // Fallback to old 'featured' field
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

      // Transform Supabase data to frontend Product format
      const transformedProducts = (data || []).map((product: any) => ({
        id: String(product.id),
        name: String(product.name ?? ''),
        price: Number(product.sale_price ?? product.price ?? 0),
        originalPrice: product.sale_price ? Number(product.price ?? 0) : undefined,
        discountPercentage: product.sale_price && product.price
          ? Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100)
          : undefined,
        images: [
          // Fallback image if no images are available
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        category: product.category_id?.toString() || product.category || 'general',
        subcategory: undefined,
        occasion: [],
        fabric: undefined,
        color: 'Multi', // Default color since it's not in the current schema
        sizes: ['S', 'M', 'L', 'XL'], // Default sizes since it's not in the current schema
        description: String(product.description ?? ''),
        isFeatured: product.is_featured ?? product.featured ?? false,
        isNew: false, // Could be calculated based on created_at
        rating: 4.5, // Default rating since reviews aren't implemented yet
        reviewCount: Math.floor(Math.random() * 100) + 10, // Random review count for demo
        stockStatus: 'In Stock' as const, // Default stock status
        specifications: {},
        reviews: []
      }));

      setProducts(transformedProducts);

      // If no products from database, use mock data for development
      if (transformedProducts.length === 0) {
        console.log('[usePublicProducts] No database products, using mock data');
        const filteredMockProducts = featured 
          ? mockProducts.filter(p => p.isFeatured)
          : mockProducts;
        setProducts(filteredMockProducts);
      }
    } catch (e) {
      console.error('[usePublicProducts] Error:', e);

      // Fallback to mock data on error
      console.log('[usePublicProducts] Database error, using mock data');
      const filteredMockProducts = featured 
        ? mockProducts.filter(p => p.isFeatured)
        : mockProducts;
      setProducts(filteredMockProducts);

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