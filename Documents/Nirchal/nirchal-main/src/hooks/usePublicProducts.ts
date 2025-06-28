import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { ProductWithDetails } from '../types/admin';

export const usePublicProducts = (featured?: boolean) => {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [featured]);

  const fetchProducts = async () => {
    try {
      console.log('[usePublicProducts] Fetching products...');
      
      // First try with joins, if that fails, try simple query
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (featured) {
        query = query.eq('featured', true);
      }

      const { data, error } = await query;

      console.log('[usePublicProducts] Query result:', data);
      console.log('[usePublicProducts] Query error:', error);

      if (error) {
        console.error('[usePublicProducts] Supabase error:', error);
        throw error;
      }
      
      // Transform the data to match the expected format
      const transformedProducts = (data || []).map(product => ({
        ...product,
        category: {
          slug: product.category || product.category_id?.toString() || 'unknown'
        },
        images: [], // Will be populated separately if needed
        variants: [], // No variants table in current schema
        inventory: null // No inventory table in current schema
      }));
      
      setProducts(transformedProducts as ProductWithDetails[] || []);
    } catch (e) {
      console.error('[usePublicProducts] Error:', e);
      setError(e instanceof Error ? e.message : 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error
  };
};