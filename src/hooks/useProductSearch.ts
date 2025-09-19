import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { getStorageImageUrl } from '../utils/storageUtils';

export interface SearchProduct {
  id: string;
  name: string;
  sale_price: number;
  image_url?: string;
  slug?: string;
}

export const useProductSearch = (searchQuery: string, limit: number = 8) => {
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Search products by name and description
      const { data: searchResults, error: searchError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          sale_price,
          slug,
          product_images(
            id,
            image_url,
            display_order
          ),
          product_variants(
            id,
            price_adjustment,
            size,
            color
          )
        `)
        .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
        .limit(limit);

      if (searchError) throw searchError;

      // Transform the results
      const transformedProducts: SearchProduct[] = (searchResults || []).map((product: any) => {
        // Find the main image (display_order 1) or the first image
        const mainImage = product.product_images?.find((img: any) => img.display_order === 1) || product.product_images?.[0];
        
        // Calculate price logic:
        // 1. Use sale_price if available and > 0
        // 2. Use price if available and > 0  
        // 3. Use base price + first variant's price_adjustment
        // 4. Default to 0
        let finalPrice = 0;
        
        if (product.sale_price && product.sale_price > 0) {
          finalPrice = product.sale_price;
        } else if (product.price && product.price > 0) {
          finalPrice = product.price;
        } else if (product.product_variants && product.product_variants.length > 0) {
          // Use base price (or 0) + first variant's price adjustment
          const basePrice = product.price || product.sale_price || 0;
          const firstVariant = product.product_variants[0];
          const priceAdjustment = firstVariant.price_adjustment || 0;
          finalPrice = basePrice + priceAdjustment;
        }
        
        // Debug logging for price issues
        if (finalPrice === 0) {
          console.log('[useProductSearch] Product with 0 price after variant check:', {
            name: product.name,
            sale_price: product.sale_price,
            price: product.price,
            variants: product.product_variants,
            calculated_price: finalPrice
          });
        }
        
        return {
          id: String(product.id),
          name: String(product.name),
          sale_price: Number(finalPrice),
          slug: product.slug ? String(product.slug) : undefined,
          image_url: mainImage?.image_url ? getStorageImageUrl(String(mainImage.image_url)) : undefined
        };
      });

      setProducts(transformedProducts);
    } catch (err) {
      console.error('[useProductSearch] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchProducts]);

  return {
    products,
    loading,
    error
  };
};