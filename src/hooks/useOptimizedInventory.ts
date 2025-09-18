import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface InventoryItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  low_stock_threshold: number;
  product_name?: string;
  product_price?: number;
  variant_size?: string;
  variant_color?: string;
  created_at: string;
  updated_at: string;
}

interface OptimizedInventoryHook {
  inventory: InventoryItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useOptimizedInventory = (): OptimizedInventoryHook => {
  const { supabase } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    if (!supabase) return;
    
    try {
      setLoading(true);
      setError(null);
      

      // Fetch all data in parallel
      const [
        { data: inventoryData, error: inventoryError },
        { data: productsData, error: productsError },
        { data: variantsData, error: variantsError }
      ] = await Promise.all([
        supabase
          .from('inventory')
          .select('*')
          .order('created_at', { ascending: false }),
        
        supabase
          .from('products')
          .select('id, name, price'),
        
        supabase
          .from('product_variants')
          .select('id, size, color, product_id')
      ]);

      if (inventoryError) throw inventoryError;
      if (productsError) console.warn('[OptimizedInventory] Products error:', productsError);
      if (variantsError) console.warn('[OptimizedInventory] Variants error:', variantsError);

      // Create lookup maps
      const productsMap = new Map(
        (productsData || []).map(product => [product.id, product])
      );
      
      const variantsMap = new Map(
        (variantsData || []).map(variant => [variant.id, variant])
      );

      // Enrich inventory data
      const enrichedInventory = (inventoryData || []).map(item => {
        const product = productsMap.get(item.product_id);
        const variant = item.variant_id ? variantsMap.get(item.variant_id) : null;
        
        return {
          ...item,
          product_name: product?.name || 'Unknown Product',
          product_price: product?.price || 0,
          variant_size: variant?.size || null,
          variant_color: variant?.color || null
        };
      });

      setInventory(enrichedInventory);
    } catch (e) {
      console.error('[OptimizedInventory] Error:', e);
      setError(e instanceof Error ? e.message : 'Error fetching inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    fetchInventory();
  }, [supabase]);

  return {
    inventory,
    loading,
    error,
    refresh: fetchInventory
  };
};
