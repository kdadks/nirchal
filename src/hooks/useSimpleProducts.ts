import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { getStorageImageUrl } from '../utils/storageUtils';
import type { Product } from '../types';

// Simplified version of usePublicProducts without complex joins
export const useSimpleProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simple query without joins first
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('category_id', 'is', null) // Only show products with categories on frontend
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        setProducts([]);
        return;
      }
      
      // Transform to our Product interface with minimal processing
      const transformedProducts: Product[] = data.map((product: any) => ({
        id: String(product.id),
        slug: product.slug || product.name?.toLowerCase().replace(/\s+/g, '-') || `product-${product.id}`,
        name: product.name || 'Unnamed Product',
        price: Number(product.sale_price || product.price || 0),
        originalPrice: product.sale_price ? Number(product.price || 0) : undefined,
        discountPercentage: product.sale_price && product.price
          ? Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100)
          : undefined,
        images: product.image_url ? 
          (product.image_url.startsWith('http') 
            ? [product.image_url]
            : [getStorageImageUrl(product.image_url)]
          ) : [],
        category: String(product.category_id || product.category || 'general'),
        subcategory: undefined,
        occasion: [],
        fabric: undefined,
        color: 'Multi',
        colors: [],
        sizes: [],
        description: product.description || '',
        isFeatured: Boolean(product.is_featured || product.featured),
        isNew: false,
        rating: 0,
        reviewCount: 0,
        stockStatus: 'In Stock' as const,
        stockQuantity: 0, // Simple products don't have inventory data in this hook
        specifications: {},
        reviews: [],
        variants: []
      }));
      
      setProducts(transformedProducts);
      
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
};
