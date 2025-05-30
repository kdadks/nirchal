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
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*),
          inventory:inventory(*)
        `)
        .order('created_at', { ascending: false });

      if (featured) {
        query = query.eq('featured', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data as ProductWithDetails[] || []);
    } catch (e) {
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