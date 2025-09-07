import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { getStorageImageUrl, getProductImageUrls } from '../utils/storageUtils';
import { mockProducts } from '../data/mockData';
import type { Product } from '../types';

export const usePublicProducts = (featured?: boolean) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (import.meta.env.DEV) {
        console.debug('[usePublicProducts] start fetch, mock products:', mockProducts.length, 'first variants:', mockProducts[0]?.variants?.length || 0);
      }
      
      // TEMPORARY: Force mock data to test swatches
      const USE_MOCK_DATA = false; // Set to false to use database
      
      if (USE_MOCK_DATA) {
  if (import.meta.env.DEV) console.debug('[usePublicProducts] using mock data');
        const filteredMockProducts = featured 
          ? mockProducts.filter(p => p.isFeatured)
          : mockProducts;
        
        setProducts(filteredMockProducts);
        setLoading(false);
        return;
      }
      
      // Start with a basic query without problematic joins like product_reviews
      let query = supabase
        .from('products')
        .select(`
          *,
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
        .eq('is_active', true)
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
          console.warn('[usePublicProducts] Permission denied, attempting fallback without joins:', error.message);
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
              console.error('[usePublicProducts] Fallback query failed:', fallbackResult.error);
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
            if (import.meta.env.DEV) console.debug('[usePublicProducts] using mock data as final fallback');
            
            // Use mock data as final fallback
            const filteredMockProducts = featured 
              ? mockProducts.filter(p => p.isFeatured)
              : mockProducts;
            
            setProducts(filteredMockProducts);
            return;
          }
        }
        throw error;
      }
      
      if (!data || data.length === 0) {
        setProducts([]);
        return;
      }

      // Fetch review aggregates (count and average rating) for these products
      let ratingMap: Record<string, { count: number; avg: number }> = {};
      try {
        const productIds = (data || []).map((p: any) => p.id).filter(Boolean);
        if (productIds.length > 0) {
          const { data: reviewRows, error: reviewErr } = await supabase
            .from('product_reviews')
            .select('product_id, rating')
            .in('product_id', productIds);
          if (!reviewErr && Array.isArray(reviewRows)) {
            const temp: Record<string, number[]> = {};
            for (const row of reviewRows) {
              const pid = String(row.product_id);
              const r = Number(row.rating) || 0;
              if (!temp[pid]) temp[pid] = [];
              temp[pid].push(r);
            }
            ratingMap = Object.fromEntries(
              Object.entries(temp).map(([pid, arr]) => {
                const count = arr.length;
                const avg = count > 0 ? arr.reduce((a, b) => a + b, 0) / count : 0;
                return [pid, { count, avg }];
              })
            );
          }
        }
      } catch (aggErr) {
        console.warn('[usePublicProducts] Could not fetch ratings:', aggErr);
      }

      // Transform to our Product interface
      const transformedProducts = (data || []).map((product: any) => {
        // Debug: Log raw product data to see the structure
  if (import.meta.env.DEV) console.debug('[usePublicProducts] raw product data', {
          productId: product.id,
          productName: product.name,
          variantsCount: product.product_variants?.length || 0,
          imagesCount: product.product_images?.length || 0,
          allImageIds: product.product_images?.map((img: any) => img.id) || [],
          allVariantSwatchIds: product.product_variants?.map((v: any) => v.swatch_image_id).filter(Boolean) || [],
          sampleVariant: product.product_variants?.[0],
          sampleImage: product.product_images?.[0]
        });
        
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

        // Map variants with swatch information
        let sizes: string[] = [];
        let colors: string[] = [];
        let variants: any[] = [];
        
        if (Array.isArray(product.product_variants) && product.product_variants.length > 0) {
          sizes = Array.from(new Set(product.product_variants.map((v: any) => v.size).filter(Boolean)));
          colors = Array.from(new Set(product.product_variants.map((v: any) => v.color).filter(Boolean)));
          
          // If no size variants exist, show "Free Size"
          if (sizes.length === 0) {
            sizes = ['Free Size'];
          }
          
            // Process variants with swatch images and inventory
            variants = product.product_variants.map((variant: any) => {
              if (import.meta.env.DEV) console.debug('[usePublicProducts] processing variant', {
                id: variant.id,
                color: variant.color,
                swatchImageId: variant.swatch_image_id,
                swatchImageJoined: variant.swatch_image,
                productImagesCount: product.product_images?.length || 0
              });
              
              let swatchImageUrl = null;
              
              // Debug: Check what we have available
              if (import.meta.env.DEV) console.debug('[usePublicProducts] swatch debug', {
                variantId: variant.id,
                swatchImageId: variant.swatch_image_id,
                hasDirectJoin: !!variant.swatch_image,
                directJoinData: variant.swatch_image,
                availableProductImages: product.product_images?.map((img: any) => ({ id: img.id, image_url: img.image_url }))
              });
              
              // First try to use the directly joined swatch image
              if (variant.swatch_image?.image_url) {
                swatchImageUrl = getStorageImageUrl(variant.swatch_image.image_url);
                if (import.meta.env.DEV) console.debug('[usePublicProducts] joined swatch URL', swatchImageUrl);
              }
              // Try to find the specific swatch image by ID in product_images array
              else if (variant.swatch_image_id && Array.isArray(product.product_images)) {
                if (import.meta.env.DEV) {
                  console.debug('[usePublicProducts] searching swatch in product_images');
                  console.debug('[usePublicProducts] available images', product.product_images.map((img: any) => ({ id: img.id, image_url: img.image_url })));
                  console.debug('[usePublicProducts] swatch_image_id', variant.swatch_image_id);
                }
                
                const swatchImage = product.product_images.find((img: any) => {
                  // Try both string and direct comparison
                  return img.id === variant.swatch_image_id || String(img.id) === String(variant.swatch_image_id);
                });
                
                if (import.meta.env.DEV) console.debug('[usePublicProducts] found swatch image record', swatchImage);
                if (swatchImage?.image_url) {
                  swatchImageUrl = getStorageImageUrl(swatchImage.image_url);
                  if (import.meta.env.DEV) console.debug('[usePublicProducts] swatch URL from record', swatchImageUrl);
                } else {
                  if (import.meta.env.DEV) console.debug('[usePublicProducts] no specific swatch image found');
                }
              }

              // If still no swatch image found, log the issue
              if (!swatchImageUrl && variant.swatch_image_id) {
                console.warn('[usePublicProducts] ⚠️ Swatch image not found for variant:', {
                  variantId: variant.id,
                  color: variant.color,
                  swatchImageId: variant.swatch_image_id,
                  message: 'The swatch_image_id exists but no corresponding image was found in product_images'
                });
              }
              
              if (import.meta.env.DEV) console.debug('[usePublicProducts] final swatch result', {
                variantId: variant.id,
                color: variant.color,
                swatchImageId: variant.swatch_image_id,
                finalSwatchImageUrl: swatchImageUrl
              });
              
              // Normalize hex value to #RRGGBB if possible
              let normalizedHex: string | undefined;
              if (typeof variant.color_hex === 'string') {
                const raw = variant.color_hex.trim();
                const withHash = raw.startsWith('#') ? raw : `#${raw}`;
                if (/^#([0-9A-Fa-f]{6})$/.test(withHash)) {
                  normalizedHex = withHash;
                }
              }

              // Find inventory quantity for this variant
              let variantQuantity = 0;
              if (Array.isArray(product.inventory)) {
                const variantInventory = product.inventory.find((inv: any) => 
                  inv.variant_id === variant.id || String(inv.variant_id) === String(variant.id)
                );
                variantQuantity = variantInventory?.quantity || 0;
              }

              return {
                id: variant.id,
                sku: variant.sku,
                size: variant.size,
                color: variant.color,
                colorHex: normalizedHex,
                material: undefined, // Not available in current schema
                style: undefined,    // Not available in current schema
                priceAdjustment: variant.price_adjustment || 0,
                quantity: variantQuantity, // Now properly mapped from inventory
                variantType: variant.color ? 'color' : variant.size ? 'size' : undefined,
                swatchImageId: variant.swatch_image_id,
                swatchImage: swatchImageUrl
              };
            });
        }
        
        // If no variants exist at all, show "Free Size"
        if (sizes.length === 0) {
          sizes = ['Free Size'];
        }

  // Use aggregated ratings from product_reviews
  const agg = ratingMap[String(product.id)] || { count: 0, avg: 0 };
  const reviews: any[] = [];
  const reviewCount = agg.count;
  const rating = agg.avg;

        // New pricing rule:
        // - If variants exist, show the minimum variant price (priceAdjustment) and ignore sale/cost
        // - If no variants, show Sale Price (product.sale_price) falling back to product.price
        const variantPrices = Array.isArray(variants) && variants.length > 0
          ? variants.map(v => v.priceAdjustment || 0)
          : [];
        const hasVariants = variantPrices.length > 0;
        const positiveVariantPrices = variantPrices.filter(p => p > 0);
        const minPositiveVariantPrice = positiveVariantPrices.length > 0 ? Math.min(...positiveVariantPrices) : undefined;
        
        let displayPrice: number;
        let originalPrice: number | undefined;
        let discountPercentage: number | undefined;
        
        if (hasVariants && Number.isFinite(minPositiveVariantPrice as number)) {
          displayPrice = minPositiveVariantPrice as number;
          originalPrice = undefined;
          discountPercentage = undefined;
        } else {
          // If variants exist but all are zero, or no variants, show sale price (never zero)
          const saleOrBase = Number(product.sale_price ?? product.price ?? 0);
          displayPrice = saleOrBase > 0 ? saleOrBase : 0;
          originalPrice = undefined;
          discountPercentage = undefined;
        }

        return {
          id: String(product.id),
          slug: String(product.slug),
          name: String(product.name ?? ''),
          price: displayPrice,
          originalPrice,
          discountPercentage,
          images,
          description: String(product.description ?? ''),
          shortDescription: String(product.short_description ?? ''),
          category: String(product.category ?? ''),
          color: String(product.color ?? ''),
          inStock: Boolean(product.in_stock ?? true),
          stockQuantity: Number(product.stock_quantity ?? 0),
          stockStatus: (() => {
            // Calculate stock status based on inventory data
            if (Array.isArray(product.inventory) && product.inventory.length > 0) {
              // If product has variants, only count variant-level inventory (variant_id !== null)
              // If product has no variants, only count product-level inventory (variant_id === null)
              const hasVariants = Array.isArray(product.product_variants) && product.product_variants.length > 0;
              const relevantInventory = product.inventory.filter((inv: any) => {
                if (hasVariants) {
                  // For products with variants, only count variant-specific inventory
                  return inv.variant_id !== null;
                } else {
                  // For products without variants, only count product-level inventory
                  return inv.variant_id === null;
                }
              });
              
              const totalQuantity = relevantInventory.reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0);
              const minThreshold = relevantInventory.length > 0 
                ? Math.min(...relevantInventory.map((inv: any) => inv.low_stock_threshold || 10))
                : 10;
              
              if (totalQuantity === 0) {
                return 'Out of Stock';
              } else if (totalQuantity <= minThreshold) {
                return 'Low Stock';
              } else {
                return 'In Stock';
              }
            } else {
              // No inventory data means out of stock
              return 'Out of Stock';
            }
          })(),
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
          variants
        };
      }) as Product[];

      setProducts(transformedProducts);
    } catch (e) {
  console.error('[usePublicProducts] Error during processing:', e);
  if (import.meta.env.DEV) console.debug('[usePublicProducts] falling back to mock data');
      
      // Use mock data as fallback, filtering by featured if needed
      const filteredMockProducts = featured 
        ? mockProducts.filter(p => p.isFeatured)
        : mockProducts;
      
      if (import.meta.env.DEV) {
        console.debug('[usePublicProducts] mock products used:', filteredMockProducts.length);
        console.debug('[usePublicProducts] first mock product variants:', filteredMockProducts[0]?.variants);
      }
      
      setProducts(filteredMockProducts);
      setError(null); // Clear error since we have fallback data
    } finally {
      setLoading(false);
    }
  }, [featured]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};
