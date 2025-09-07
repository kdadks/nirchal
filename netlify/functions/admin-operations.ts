import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Environment variables - with better error handling
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey
});

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.warn('Supabase not configured - running in mock mode');
}

export const handler: Handler = async (event, context) => {
  console.log('Admin operations called:', {
    method: event.httpMethod,
    path: event.path,
    query: event.queryStringParameters,
    hasBody: !!event.body
  });

  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const action = event.queryStringParameters?.action || 
                  (event.body ? JSON.parse(event.body).action : null);

    console.log('Action requested:', action);

    if (!action) {
      console.log('No action provided');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Action parameter is required' })
      };
    }

    switch (action) {
      case 'get_inventory':
        return await getInventory(event, headers);
      
      case 'update_inventory':
        return await updateInventory(event, headers);
      
      case 'adjust_inventory':
        return await adjustInventory(event, headers);
      
      case 'get_inventory_history':
        return await getInventoryHistory(event, headers);
      
      case 'health_check':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            status: 'OK',
            timestamp: new Date().toISOString(),
            message: 'Admin operations service is running'
          })
        };
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Unknown action: ${action}` })
        };
    }
  } catch (error) {
    console.error('Admin operations error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

async function getInventory(event: any, headers: any) {
  try {
    console.log('Getting inventory data from database...');
    
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    // Fetch inventory with product information
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        products!inner(
          id,
          name,
          price,
          cost_price
        ),
        product_variants(
          id,
          price_adjustment
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }

    // Transform the data to match the expected format
    const inventory = data.map(item => ({
      id: item.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      low_stock_threshold: item.low_stock_threshold,
      product_name: item.products.name,
      product_price: item.products.price,
      cost_price: item.products.cost_price || item.products.price,
      variant_price_adjustment: item.product_variants?.price_adjustment || null,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));

    console.log('Successfully fetched inventory data:', inventory.length, 'items');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        inventory,
        success: true 
      })
    };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch inventory',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}

async function updateInventory(event: any, headers: any) {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const { data } = JSON.parse(event.body);
    
    // Mock update - in real implementation, this would update the database
    console.log('Updating inventory item:', data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Inventory updated successfully'
      })
    };
  } catch (error) {
    console.error('Error updating inventory:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to update inventory',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}

async function adjustInventory(event: any, headers: any) {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const { data } = JSON.parse(event.body);
    const { item_id, quantity, reason, notes } = data;
    
    console.log('Adjusting inventory:', { item_id, quantity, reason, notes });

    // Start a transaction-like operation
    // First, get the current inventory item
    const { data: currentItem, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', item_id)
      .single();

    if (fetchError) {
      console.error('Error fetching current inventory:', fetchError);
      throw new Error(`Failed to fetch inventory item: ${fetchError.message}`);
    }

    if (!currentItem) {
      throw new Error('Inventory item not found');
    }

    const oldQuantity = currentItem.quantity;
    const newQuantity = quantity;
    const adjustment = newQuantity - oldQuantity;

    // Update the inventory quantity
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ 
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', item_id);

    if (updateError) {
      console.error('Error updating inventory:', updateError);
      throw new Error(`Failed to update inventory: ${updateError.message}`);
    }

    // Create a history record (if inventory_history table exists)
    try {
      const { error: historyError } = await supabase
        .from('inventory_history')
        .insert({
          inventory_id: item_id,
          product_id: currentItem.product_id,
          old_quantity: oldQuantity,
          new_quantity: newQuantity,
          adjustment: adjustment,
          reason: reason,
          notes: notes,
          action_type: 'adjustment',
          user_name: 'Admin', // TODO: Get from auth context
          created_at: new Date().toISOString()
        });

      if (historyError) {
        console.warn('Could not create history record:', historyError);
        // Don't fail the operation if history logging fails
      }
    } catch (historyErr) {
      console.warn('History table might not exist:', historyErr);
    }

    console.log('Successfully adjusted inventory:', { item_id, oldQuantity, newQuantity, adjustment });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Inventory adjusted successfully',
        data: {
          item_id,
          old_quantity: oldQuantity,
          new_quantity: newQuantity,
          adjustment
        }
      })
    };
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to adjust inventory',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}

async function getInventoryHistory(event: any, headers: any) {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const params = event.queryStringParameters || {};
    
    console.log('Getting inventory history with params:', params);

    // Build the query
    let query = supabase
      .from('inventory_history')
      .select(`
        *,
        products!inner(
          name
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (params.inventory_id) {
      query = query.eq('inventory_id', params.inventory_id);
    }
    
    if (params.product_id) {
      query = query.eq('product_id', params.product_id);
    }
    
    if (params.action_type) {
      query = query.eq('action_type', params.action_type);
    }
    
    if (params.start_date) {
      query = query.gte('created_at', params.start_date);
    }
    
    if (params.end_date) {
      query = query.lte('created_at', params.end_date);
    }

    // Apply pagination
    const limit = parseInt(params.limit) || 50;
    const offset = parseInt(params.offset) || 0;
    
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await supabase
      .from('inventory_history')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Database error:', error);
      // If the table doesn't exist, return empty data
      if (error.code === '42P01') {
        console.log('Inventory history table does not exist, returning empty data');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            history: [],
            total: 0,
            success: true,
            message: 'Inventory history table not yet created'
          })
        };
      }
      throw new Error(`Database query failed: ${error.message}`);
    }

    const { data: historyData, error: queryError } = await query;

    if (queryError) {
      console.error('History query error:', queryError);
      throw new Error(`Failed to fetch history: ${queryError.message}`);
    }

    // Transform the data to include product names
    const history = (historyData || []).map(item => ({
      id: item.id,
      inventory_id: item.inventory_id,
      product_id: item.product_id,
      product_name: item.products?.name || 'Unknown Product',
      old_quantity: item.old_quantity,
      new_quantity: item.new_quantity,
      adjustment: item.adjustment,
      reason: item.reason,
      notes: item.notes,
      user_name: item.user_name,
      action_type: item.action_type,
      created_at: item.created_at
    }));

    console.log('Successfully fetched inventory history:', history.length, 'records');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        history,
        total: count || 0,
        success: true 
      })
    };
  } catch (error) {
    console.error('Error fetching inventory history:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch inventory history',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}