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

      console.log('[useInventory] Fetching inventory from database...');

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

      console.log('[useInventory] Database response:', { data, error });

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

      // Filter inventory based on variant logic:
      // - If a product has variants, show only variant stock
      // - If a product has no variants, show only default stock (variant_id = null)
      
      // Group inventory by product_id to analyze variant structure
      const productGroups = inventoryData.reduce((groups: { [key: string]: any[] }, item) => {
        if (!groups[item.product_id]) {
          groups[item.product_id] = [];
        }
        groups[item.product_id].push(item);
        return groups;
      }, {});

      const filteredInventoryData: any[] = [];

      Object.entries(productGroups).forEach(([, items]) => {
        // Check if this product has any variants
        const hasVariants = items.some(item => item.variant_id !== null);
        
        if (hasVariants) {
          // Product has variants - only show variant stock (variant_id !== null)
          const variantItems = items.filter(item => item.variant_id !== null);
          filteredInventoryData.push(...variantItems);
          console.log(`[useInventory] Product ${items[0].product_name} has variants - showing ${variantItems.length} variant records`);
        } else {
          // Product has no variants - only show default stock (variant_id === null)
          const defaultItems = items.filter(item => item.variant_id === null);
          filteredInventoryData.push(...defaultItems);
          console.log(`[useInventory] Product ${items[0].product_name} has no variants - showing ${defaultItems.length} default records`);
        }
      });

      console.log('[useInventory] Successfully fetched and filtered inventory:', filteredInventoryData.length, 'items');
      setInventory(filteredInventoryData);
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

      console.log('[useInventory] Updating inventory:', { id, updates });

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
      console.log('[useInventory] Inventory updated successfully');
    } catch (error) {
      console.error('[useInventory] Error updating inventory:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update inventory');
      throw error;
    }
  }, [supabase]);

  const adjustInventory = useCallback(async (id: string, adjustmentQuantity: number, reason: string, reference?: string) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      console.log('[useInventory] Adjusting inventory:', { id, adjustmentQuantity, reason, reference });

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
            old_quantity: currentItem.quantity,
            new_quantity: newQuantity,
            adjustment: adjustmentQuantity,
            reason: reason,
            reference: reference || null,
            action_type: 'adjustment',
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

      // Build query with filters
      let query = supabase
        .from('inventory_history')
        .select(`
          *,
          inventory!inner(
            id,
            product_id,
            variant_id,
            products!inner(name),
            product_variants(size, color)
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.inventoryId) {
        query = query.eq('inventory_id', filters.inventoryId);
      }
      if (filters?.actionType) {
        query = query.eq('action_type', filters.actionType);
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

      const { data, error, count } = await query;

      if (error) {
        // If history table doesn't exist, return empty results
        if (error.code === '42P01') {
          console.warn('[useInventory] Inventory history table does not exist');
          return { records: [], total: 0 };
        }
        throw new Error(`Failed to fetch inventory history: ${error.message}`);
      }

      // Transform the data to match the expected format for the modal
      const transformedRecords = (data || []).map((record: any) => ({
        id: record.id,
        inventory_id: record.inventory_id,
        product_name: record.inventory?.products?.name || 'Unknown Product',
        product_id: record.inventory?.product_id || '',
        variant_id: record.inventory?.variant_id || null,
        old_quantity: record.old_quantity,
        new_quantity: record.new_quantity,
        adjustment: record.adjustment,
        reason: record.reason || 'No reason provided',
        reference: record.reference || null,
        user_id: record.user_id || null,
        user_name: record.user_name || null,
        created_at: record.created_at,
        action_type: record.action_type || 'adjustment'
      }));

      console.log('[useInventory] Successfully fetched inventory history:', transformedRecords.length, 'records');
      console.log('[useInventory] Sample record:', transformedRecords[0]);

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
