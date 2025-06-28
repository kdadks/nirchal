import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { Product } from '../types';

export const usePublicProducts = (featured?: boolean) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [featured]);

  const fetchProducts = async () => {
    try {
      console.log('[usePublicProducts] Fetching products...');
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (featured) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;

      console.log('[usePublicProducts] Query result:', data);
      console.log('[usePublicProducts] Query error:', error);

      if (error) {
        console.error('[usePublicProducts] Supabase error:', error);
        throw error;
      }
      
      // Transform Supabase data to frontend Product format
      const transformedProducts = (data || []).map(product => ({
        id: product.id.toString(),
        name: product.name,
        price: product.sale_price || product.price,
        originalPrice: product.sale_price ? product.price : undefined,
        discountPercentage: product.sale_price
          ? Math.round(((product.price - product.sale_price) / product.price) * 100)
          : undefined,
        images: [
          // Fallback image if no images are available
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        ],
        category: product.category_id?.toString() || 'general',
        subcategory: undefined,
        occasion: [],
        fabric: undefined,
        color: 'Multi', // Default color since it's not in the current schema
        sizes: ['S', 'M', 'L', 'XL'], // Default sizes since it's not in the current schema
        description: product.description || '',
        isFeatured: product.is_featured,
        isNew: false, // Could be calculated based on created_at
        rating: 4.5, // Default rating since reviews aren't implemented yet
        reviewCount: Math.floor(Math.random() * 100) + 10, // Random review count for demo
        stockStatus: 'In Stock' as const, // Default stock status
        specifications: {},
        reviews: []
      }));
      
      setProducts(transformedProducts);
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