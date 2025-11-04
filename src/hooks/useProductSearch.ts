import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { getStorageImageUrl } from '../utils/storageUtils';

export interface SearchProduct {
  id: string;
  name: string;
  sale_price: number;
  image_url?: string;
  slug?: string;
  matchType?: 'name' | 'description';
  matchContext?: string;
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

      // Search products by name first, then description
      const { data: nameResults, error: nameError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          sale_price,
          slug,
          description,
          product_images(
            id,
            image_url,
            display_order,
            is_primary
          ),
          product_variants(
            id,
            price_adjustment,
            size,
            color
          )
        `)
        .ilike('name', `%${query}%`)
        .not('category_id', 'is', null) // Only show products with categories on frontend
        .limit(limit);

      // If we have fewer than limit results from name search, search descriptions too
      let descriptionResults: any[] = [];
      const nameResultIds = nameResults?.map(p => p.id) || [];
      
      if ((nameResults?.length || 0) < limit) {
        const { data: descResults, error: _descError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            sale_price,
            slug,
            description,
            product_images(
              id,
              image_url,
              display_order,
              is_primary
            ),
            product_variants(
              id,
              price_adjustment,
              size,
              color
            )
          `)
          .ilike('description', `%${query}%`)
          .not('category_id', 'is', null) // Only show products with categories on frontend
          .not('id', 'in', `(${nameResultIds.join(',')})`)
          .limit(limit - (nameResults?.length || 0));

        descriptionResults = descResults || [];
      }

      // Combine results with name matches first
      const searchResults = [...(nameResults || []), ...descriptionResults];
      
      if (nameError || (descriptionResults.length > 0 && !nameResults)) {
        throw nameError || new Error('Search failed');
      }

      // Transform the results
      const transformedProducts: SearchProduct[] = searchResults.map((product: any, index: number) => {
        // Find the primary image first, then by display_order, or fallback to first image
        const mainImage = product.product_images?.find((img: any) => img.is_primary) || 
                          product.product_images?.find((img: any) => img.display_order === 1) || 
                          product.product_images?.[0];
        
        // Determine match type and context
        const isNameMatch = index < (nameResults?.length || 0);
        const matchType: 'name' | 'description' = isNameMatch ? 'name' : 'description';
        
        let matchContext = '';
        if (!isNameMatch && product.description) {
          // Extract context around the search term for description matches
          const desc = product.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          const queryIndex = desc.toLowerCase().indexOf(query.toLowerCase());
          if (queryIndex !== -1) {
            const start = Math.max(0, queryIndex - 20);
            const end = Math.min(desc.length, queryIndex + query.length + 20);
            matchContext = (start > 0 ? '...' : '') + desc.substring(start, end) + (end < desc.length ? '...' : '');
          }
        }
        
        // Calculate price using the same logic as usePublicProducts and useProductsWithFilters:
        // 1. If variants exist with positive price_adjustment → use minimum positive price_adjustment
        // 2. If no variants → use sale_price only (no fallback to price to help identify products with missing pricing)
        let finalPrice = 0;
        
        const variantPrices = Array.isArray(product.product_variants) && product.product_variants.length > 0
          ? product.product_variants.map((v: any) => v.price_adjustment || 0)
          : [];
        const hasVariants = variantPrices.length > 0;
        const positiveVariantPrices = variantPrices.filter((p: number) => p > 0);
        const minPositiveVariantPrice = positiveVariantPrices.length > 0 ? Math.min(...positiveVariantPrices) : undefined;
        
        if (hasVariants && Number.isFinite(minPositiveVariantPrice as number)) {
          // Use minimum positive variant price
          finalPrice = minPositiveVariantPrice as number;
        } else {
          // Use sale_price only (no fallback to help identify products with missing pricing)
          finalPrice = Number(product.sale_price ?? 0);
        }
        
        return {
          id: String(product.id),
          name: String(product.name),
          sale_price: Number(finalPrice),
          slug: product.slug ? String(product.slug) : undefined,
          image_url: mainImage?.image_url ? getStorageImageUrl(String(mainImage.image_url)) : undefined,
          matchType,
          matchContext: matchContext || undefined
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