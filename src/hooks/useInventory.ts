import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface InventoryItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  low_stock_threshold: number;
  product_name: string;
  product_sku?: string;
  variant_sku?: string;
  variant_size?: string;
  variant_color?: string;
  product_price: number;
  variant_price_adjustment?: number;
  cost_price?: number;
  created_at: string;
  updated_at: string;
}

interface InventoryStats {
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

interface UseInventoryReturn {
  inventory: InventoryItem[];
  loading: boolean;
  error: string | null;
  stats: InventoryStats;
  fetchInventory: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  updateInventory: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  adjustInventory: (id: string, adjustmentQuantity: number, reason: string, reference?: string) => Promise<void>;
  getInventoryHistory: (filters?: {
    inventoryId?: string;
    productId?: string;
    startDate?: string;
    endDate?: string;
    actionType?: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ records: any[]; total: number }>;
}

export const useInventory = (): UseInventoryReturn => {
  const { supabase } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats
  const stats: InventoryStats = {
    totalItems: inventory.length,
    totalQuantity: inventory.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: inventory.reduce((sum, item) => {
      const price = item.cost_price || item.product_price || 0;
      const adjustedPrice = item.variant_price_adjustment ? price + item.variant_price_adjustment : price;
      return sum + (item.quantity * adjustedPrice);
    }, 0),
    lowStockItems: inventory.filter(item => item.quantity <= item.low_stock_threshold && item.quantity > 0).length,
    outOfStockItems: inventory.filter(item => item.quantity === 0).length,
  };

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Fetch inventory with product information using the same pattern as products
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products!inner(
            id,
            name,
            sku,
            price
          ),
          product_variants(
            id,
            sku,
            size,
            color,
            price_adjustment
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useInventory] Database error:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      // Transform the data to match the expected format
      const inventoryData = (data || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        low_stock_threshold: item.low_stock_threshold,
        product_name: item.products.name,
        product_sku: item.products.sku,
        variant_sku: item.product_variants?.sku || null,
        variant_size: item.product_variants?.size || null,
        variant_color: item.product_variants?.color || null,
        product_price: item.products.price,
        variant_price_adjustment: item.product_variants?.price_adjustment || null,
        cost_price: item.products.price, // Use price as cost_price since cost_price column doesn't exist
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      // Smart filtering to avoid showing duplicate/incorrect inventory:
      // - If a product has variants in the database, only show variant-level inventory (variant_id != null)
      // - If a product has no variants, only show product-level inventory (variant_id = null)
      
      // First, fetch which products have variants
      const productIds = Array.from(new Set(inventoryData.map(item => item.product_id)));
      const { data: variantsData } = await supabase
        .from('product_variants')
        .select('product_id')
        .in('product_id', productIds);
      
      // Create a Set of product IDs that have variants
      const productsWithVariants = new Set(
        (variantsData || []).map((v: any) => v.product_id)
      );
      
      // Filter inventory based on whether product has variants
      const filteredInventory = inventoryData.filter((item: any) => {
        const hasVariants = productsWithVariants.has(item.product_id);
        
        if (hasVariants) {
          // Product has variants - only show variant-specific inventory
          return item.variant_id !== null;
        } else {
          // Product has no variants - only show product-level inventory
          return item.variant_id === null;
        }
      });
      
      setInventory(filteredInventory);
    } catch (error) {
      console.error('[useInventory] Error fetching inventory:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch inventory');
      setInventory([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshInventory = useCallback(async () => {
    await fetchInventory();
  }, [fetchInventory]);

  const updateInventory = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Update inventory in database
      const { error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('[useInventory] Update error:', error);
        throw new Error(`Failed to update inventory: ${error.message}`);
      }

      // Update local state
      setInventory(prev => 
        prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );

      toast.success('Inventory updated successfully');
    } catch (error) {
      console.error('[useInventory] Error updating inventory:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update inventory');
      throw error;
    }
  }, [supabase]);

  const adjustInventory = useCallback(async (id: string, adjustmentQuantity: number, reason: string) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Get current inventory item
      const { data: currentItem, error: fetchError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch current inventory: ${fetchError.message}`);
      }

      const newQuantity = currentItem.quantity + adjustmentQuantity;

      // Update inventory quantity
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Failed to update inventory: ${updateError.message}`);
      }

      // Try to insert into inventory_history if the table exists
      try {
        const { error: historyError } = await supabase
          .from('inventory_history')
          .insert({
            inventory_id: id,
            previous_quantity: currentItem.quantity, // Use correct column name
            new_quantity: newQuantity,
            change_type: adjustmentQuantity > 0 ? 'STOCK_IN' : 'STOCK_OUT', // Use change_type instead of action_type
            reason: reason,
            created_by: null, // Use created_by instead of user_name
            created_at: new Date().toISOString()
          });

        if (historyError) {
          console.warn('[useInventory] Could not save to history:', historyError.message);
        } else {
          console.log('[useInventory] Created inventory history record');
        }
      } catch (historyErr) {
        console.warn('[useInventory] History tracking unavailable:', historyErr);
      }

      // Refresh inventory to get updated quantities
      await fetchInventory();
      
      toast.success('Inventory adjusted successfully');
      console.log('[useInventory] Inventory adjusted successfully');
    } catch (error) {
      console.error('[useInventory] Error adjusting inventory:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to adjust inventory');
      throw error;
    }
  }, [supabase, fetchInventory]);

  const getInventoryHistory = useCallback(async (filters?: {
    inventoryId?: string;
    productId?: string;
    startDate?: string;
    endDate?: string;
    actionType?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      console.log('[useInventory] Fetching inventory history:', filters);
      console.log('[useInventory] Looking for inventory_id:', filters?.inventoryId);

      // Use the same approach as inventory table - simple direct query
      let query = supabase
        .from('inventory_history')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.inventoryId) {
        console.log('[useInventory] Filtering by inventory_id:', filters.inventoryId);
        query = query.eq('inventory_id', filters.inventoryId);
      }
      if (filters?.actionType) {
        console.log('[useInventory] Filtering by change_type:', filters.actionType.toUpperCase());
        query = query.eq('change_type', filters.actionType.toUpperCase());
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      console.log('[useInventory] Executing query...');
      const { data, error, count } = await query;

      console.log('[useInventory] Query result:', { data: data?.length, error, count });
      console.log('[useInventory] Raw data sample:', data?.[0]);

      if (error) {
        console.error('[useInventory] Query error details:', error);
        throw new Error(`Failed to fetch inventory history: ${error.message}`);
      }

      // Transform the data to match the expected format for the modal
      const transformedRecords = (data || []).map((record: any) => ({
        id: record.id,
        inventory_id: record.inventory_id,
        product_name: 'Product ID: ' + record.inventory_id, // Temporary fallback
        product_id: record.inventory_id?.toString() || '',
        variant_id: null,
        old_quantity: record.previous_quantity, // Map from actual column
        new_quantity: record.new_quantity,
        adjustment: record.new_quantity - record.previous_quantity, // Calculate adjustment
        reason: record.reason || 'No reason provided',
        reference: null, // Not available in current schema
        user_id: record.created_by || null,
        user_name: record.created_by ? 'Admin' : 'System', // Map created_by to user_name
        created_at: record.created_at,
        action_type: record.change_type?.toLowerCase() || 'adjustment' // Map change_type to action_type
      }));

      console.log('[useInventory] Successfully fetched inventory history:', transformedRecords.length, 'records');
      console.log('[useInventory] Sample transformed record:', transformedRecords[0]);

      return {
        records: transformedRecords,
        total: count || transformedRecords.length
      };
    } catch (error) {
      console.error('[useInventory] Error fetching inventory history:', error);
      // Don't show toast error here, let the component handle it
      return { records: [], total: 0 };
    }
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    loading,
    error,
    stats,
    fetchInventory,
    refreshInventory,
    updateInventory,
    adjustInventory,
    getInventoryHistory
  };
};
