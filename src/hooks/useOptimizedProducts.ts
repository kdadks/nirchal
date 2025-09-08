import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Define the type here since we need it
interface ProductWithDetails {
  id: string;
  name: string;
  category_id?: string;
  category?: any;
  images?: any[];
  variants?: any[];
  inventory?: any[];
  [key: string]: any;
}

interface OptimizedProductsHook {
  products: ProductWithDetails[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useOptimizedProducts = (): OptimizedProductsHook => {
  const { supabase } = useAuth();
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!supabase) return;
    
    try {
      setLoading(true);
      setError(null);
      



      // Fetch all data in parallel for maximum speed
      const [
        { data: productsData, error: productsError },
        { data: categoriesData, error: categoriesError },
        { data: imagesData, error: imagesError },
        { data: variantsData, error: variantsError },
        { data: inventoryData, error: inventoryError }
      ] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false }),
        
        supabase
          .from('categories')
          .select('id, name'),
        
        supabase
          .from('product_images')
          .select('*'),
        
        supabase
          .from('product_variants')
          .select('*'),
        
        supabase
          .from('inventory')
          .select('*')
      ]);

      // Check for errors
      if (productsError) throw productsError;
      if (categoriesError) console.warn('[OptimizedProducts] Categories error:', categoriesError);
      if (imagesError) console.warn('[OptimizedProducts] Images error:', imagesError);
      if (variantsError) console.warn('[OptimizedProducts] Variants error:', variantsError);
      if (inventoryError) console.warn('[OptimizedProducts] Inventory error:', inventoryError);

      // Create lookup maps for efficient joining
      const categoriesMap = new Map(
        (categoriesData || []).map(cat => [cat.id, cat])
      );
      
      const imagesByProduct = new Map();
      (imagesData || []).forEach(img => {
        if (!imagesByProduct.has(img.product_id)) {
          imagesByProduct.set(img.product_id, []);
        }
        imagesByProduct.get(img.product_id).push(img);
      });

      const variantsByProduct = new Map();
      (variantsData || []).forEach(variant => {
        if (!variantsByProduct.has(variant.product_id)) {
          variantsByProduct.set(variant.product_id, []);
        }
        variantsByProduct.get(variant.product_id).push(variant);
      });

      const inventoryByProduct = new Map();
      (inventoryData || []).forEach(inv => {
        if (!inventoryByProduct.has(inv.product_id)) {
          inventoryByProduct.set(inv.product_id, []);
        }
        inventoryByProduct.get(inv.product_id).push(inv);
      });

      // Efficiently combine all data
      const enrichedProducts = (productsData || []).map(product => ({
        ...product,
        category: categoriesMap.get(product.category_id) || null,
        images: imagesByProduct.get(product.id) || [],
        variants: variantsByProduct.get(product.id) || [],
        inventory: inventoryByProduct.get(product.id) || []
      }));


      // Products loaded successfully

      setProducts(enrichedProducts);
    } catch (e) {
      console.error('[OptimizedProducts] Error:', e);
      setError(e instanceof Error ? e.message : 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    fetchProducts();
  }, [supabase]);

  return {
    products,
    loading,
    error,
    refresh: fetchProducts
  };
};
