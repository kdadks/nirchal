import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { getStorageImageUrl, getProductImageUrls } from '../utils/storageUtils';
import type { Product } from '../types';

/**
 * Hook to fetch a single product by slug without category filtering
 * Used for direct product page access (e.g., admin testing uncategorized products)
 */
export const useProductBySlug = (slug: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name),
            product_images(*),
            product_variants(
              id,
              sku,
              size,
              color,
              color_hex,
              price_adjustment,
              swatch_image_id,
              swatch_image:product_images!swatch_image_id(*)
            ),
            inventory(
              id,
              product_id,
              variant_id,
              quantity,
              low_stock_threshold
            )
          `)
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (fetchError) {
          console.error('[useProductBySlug] Error:', fetchError);
          setError(fetchError.message);
          setProduct(null);
          return;
        }

        if (!data) {
          setProduct(null);
          return;
        }

        // Transform the product data
        const productData: any = data;
        
        const variants = (productData.product_variants || []).map((v: any) => {
          const inventoryItem = (productData.inventory || []).find(
            (inv: any) => inv.variant_id === v.id
          );
          
          // Get swatch image URL with fallback mechanism
          let swatchImageUrl: string | undefined;
          
          // First try to use the directly joined swatch image
          if (v.swatch_image?.image_url) {
            swatchImageUrl = getStorageImageUrl(v.swatch_image.image_url);
          }
          // Try to find the specific swatch image by ID in product_images array
          else if (v.swatch_image_id && Array.isArray(productData.product_images)) {
            const swatchImage = productData.product_images.find((img: any) => {
              return img.id === v.swatch_image_id || String(img.id) === String(v.swatch_image_id);
            });
            
            if (swatchImage) {
              const rawUrl = swatchImage.image_url || swatchImage.image_path;
              swatchImageUrl = rawUrl ? getStorageImageUrl(rawUrl) : undefined;
            }
          }
          
          return {
            id: v.id,
            size: v.size || '',
            color: v.color || '',
            colorHex: v.color_hex || '',
            sku: v.sku || '',
            priceAdjustment: v.price_adjustment || 0,
            quantity: inventoryItem?.quantity || 0,
            lowStockThreshold: inventoryItem?.low_stock_threshold || 5,
            swatchImageId: v.swatch_image_id || undefined,
            swatchImage: swatchImageUrl
          };
        });
        
        // Extract unique colors and sizes from variants
        const uniqueColors = [...new Set(variants.map((v: any) => v.color).filter(Boolean))] as string[];
        const uniqueSizes = [...new Set(variants.map((v: any) => v.size).filter(Boolean))] as string[];
        
        // Transform product images
        const images: string[] = [];
        if (Array.isArray(productData.product_images) && productData.product_images.length > 0) {
          // Sort images: primary first, then by display_order
          const sortedImages = [...productData.product_images].sort((a: any, b: any) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            if (a.display_order !== undefined && b.display_order !== undefined) {
              return a.display_order - b.display_order;
            }
            return 0;
          });

          sortedImages.forEach((img: any) => {
            const rawUrl = img.image_url || img.image_path;
            const url = rawUrl ? getStorageImageUrl(rawUrl) : '';
            if (url) images.push(url);
          });
        }
        
        // Fallback to generated URLs if no images
        if (images.length === 0) {
          const fallbackUrls = getProductImageUrls(productData.id, productData.name);
          images.push(...fallbackUrls.filter(Boolean));
        }
        
        // Calculate stock quantity
        const stockQuantity = (() => {
          if (Array.isArray(productData.inventory) && productData.inventory.length > 0) {
            const hasVariants = variants && variants.length > 0;
            
            if (hasVariants) {
              // Product HAS variants: sum variant inventory only (variant_id !== null)
              const variantInventory = productData.inventory.filter((inv: any) => inv.variant_id !== null);
              return variantInventory.reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0);
            } else {
              // Product has NO variants: sum product-level inventory only (variant_id === null)
              const productInventory = productData.inventory.filter((inv: any) => inv.variant_id === null);
              const total = productInventory.reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0);
              
              return total;
            }
          }
          return 0;
        })();

        const transformedProduct: Product = {
          id: String(productData.id),
          slug: productData.slug || productData.name?.toLowerCase().replace(/\s+/g, '-') || `product-${productData.id}`,
          name: productData.name || 'Unnamed Product',
          description: productData.description || '',
          category: Array.isArray(productData.category) ? productData.category[0]?.name : productData.category?.name || 'Uncategorized',
          images,
          rating: productData.rating || 0,
          reviewCount: productData.review_count || 0,
          price: 0, // Will be calculated from variants or sale_price
          originalPrice: undefined,
          discountPercentage: undefined,
          color: uniqueColors[0] || '',
          colors: uniqueColors,
          sizes: uniqueSizes,
          stockStatus: 'In Stock',
          stockQuantity,
          reviews: [],
          variants
        };

        // Calculate pricing
        const hasVariantsWithPositiveAdjustment = transformedProduct.variants && 
          transformedProduct.variants.length > 0 && 
          transformedProduct.variants.some(v => v.priceAdjustment > 0);

        if (hasVariantsWithPositiveAdjustment) {
          const minPrice = Math.min(
            ...transformedProduct.variants!
              .filter(v => v.priceAdjustment > 0)
              .map(v => v.priceAdjustment)
          );
          transformedProduct.price = minPrice;
        } else if (productData.sale_price) {
          transformedProduct.price = Number(productData.sale_price);
          if (productData.price && Number(productData.price) > Number(productData.sale_price)) {
            transformedProduct.originalPrice = Number(productData.price);
            transformedProduct.discountPercentage = Math.round(
              ((Number(productData.price) - Number(productData.sale_price)) / Number(productData.price)) * 100
            );
          }
        }

        setProduct(transformedProduct);
      } catch (err) {
        console.error('[useProductBySlug] Unexpected error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  return { product, loading, error };
};
