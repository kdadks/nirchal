import { SupabaseClient } from '@supabase/supabase-js';
import { SecurityUtils } from './securityUtils';

export type CustomerUpsert = {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
};

export type AddressUpsert = {
  customer_id: string;
  type?: 'billing' | 'delivery';
  first_name: string;
  last_name: string;
  address_line_1: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
};

export type OrderItemInput = {
  product_id: string | null; // Changed from number to string to support UUIDs
  product_variant_id: string | null; // Changed from number to string to support UUIDs
  product_name: string;
  product_sku?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  variant_size?: string;
  variant_color?: string;
  variant_material?: string;
};

export type CreateOrderInput = {
  customer_id: string | number | null;
  payment_method: string;
  subtotal: number;
  shipping_amount: number;
  total_amount: number;
  billing: {
    first_name: string;
    last_name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country?: string;
    phone?: string;
    email: string;
  };
  delivery: {
    first_name: string;
    last_name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country?: string;
    phone?: string;
  };
  items: OrderItemInput[];
};

export async function upsertCustomerByEmail(supabase: SupabaseClient, payload: CustomerUpsert): Promise<{ id: string; tempPassword?: string; existingCustomer?: boolean; needsWelcomeEmail?: boolean } | null> {
  // Try the new temp password function first, fallback to direct insert if it fails
  try {
    const { data, error } = await supabase
      .rpc('create_checkout_customer', {
        p_email: payload.email,
        p_first_name: payload.first_name,
        p_last_name: payload.last_name,
        p_phone: payload.phone || null
      });
      
    if (error) {
      // RPC failed, fallback to direct insert
      throw error; // Will trigger fallback
    }
    
    return {
      id: data.id,
      tempPassword: data.temp_password,
      existingCustomer: data.existing_customer,
      needsWelcomeEmail: data.needs_welcome_email
    };
  } catch (rpcError) {
    // RPC function failed, using fallback method
    
    // Enhanced fallback: Check if customer exists first
    const { data: existingCustomer, error: checkError } = await supabase
      .from('customers')
      .select('id, welcome_email_sent')
      .eq('email', payload.email)
      .single();
    
    if (!checkError && existingCustomer) {
      // Existing customer - update their info
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          first_name: payload.first_name,
          last_name: payload.last_name,
          phone: payload.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingCustomer.id);
      
      if (updateError) {
        console.error('Failed to update existing customer:', updateError);
      }
      
      return {
        id: existingCustomer.id,
        tempPassword: undefined,
        existingCustomer: true,
        needsWelcomeEmail: !existingCustomer.welcome_email_sent // Send if never sent
      };
    } else {
      // New customer - create with temp password
      const tempPassword = generateTempPassword();
      
      // Hash the temp password using bcrypt
      const hashedPassword = await SecurityUtils.hashPassword(tempPassword);
      
      const { data, error } = await supabase
        .from('customers')
        .insert({
          email: payload.email,
          first_name: payload.first_name,
          last_name: payload.last_name,
          phone: payload.phone || null,
          password_hash: hashedPassword, // Properly encrypted password
          welcome_email_sent: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();
        
      if (error) {
        console.error('Failed to create new customer with temp password:', error);
        return null;
      }
      
      return {
        id: data.id,
        tempPassword: SecurityUtils.encryptTempData(tempPassword), // Encrypt temp password for secure transmission
        existingCustomer: false,
        needsWelcomeEmail: true
      };
    }
  }
}

// Helper function to generate temp password
function generateTempPassword(): string {
  // Generate a clean, user-friendly password without prefixes
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function markWelcomeEmailSent(supabase: SupabaseClient, customerId: string): Promise<boolean> {
  try {
    // Try RPC function first
    const { data, error } = await supabase.rpc('mark_welcome_email_sent', {
      customer_id: parseInt(customerId)
    });
    
    if (!error && data === true) {
      return true;
    }
    
    // Fallback to direct update
    // RPC failed, using fallback method
    const { error: updateError } = await supabase
      .from('customers')
      .update({
        welcome_email_sent: true,
        welcome_email_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(customerId));
    
    if (updateError) {
      console.error('Failed to mark welcome email as sent (fallback):', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error marking welcome email as sent:', error);
    return false;
  }
}

export async function upsertCustomerAddress(supabase: SupabaseClient, payload: AddressUpsert): Promise<{ id: number } | null> {
  // Try to find an existing default address of the given type for this customer
  const { data: existing } = await supabase
    .from('customer_addresses')
    .select('id')
    .eq('customer_id', payload.customer_id)
    .eq('type', payload.type || 'delivery')
    .order('is_default', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await supabase
      .from('customer_addresses')
      .update({
        first_name: payload.first_name,
        last_name: payload.last_name,
        address_line_1: payload.address_line_1,
        city: payload.city,
        state: payload.state,
        postal_code: payload.postal_code,
        country: payload.country || 'India',
        is_default: payload.is_default ?? true,
      })
      .eq('id', existing.id)
      .select('id')
      .single();
    if (error) {
      console.warn('upsertCustomerAddress(update) error (non-fatal):', error.message);
      return null;
    }
    return data as any;
  }

  const { data, error } = await supabase
    .from('customer_addresses')
    .insert({
      customer_id: payload.customer_id,
      type: payload.type || 'delivery',
      first_name: payload.first_name,
      last_name: payload.last_name,
      address_line_1: payload.address_line_1,
      city: payload.city,
      state: payload.state,
      postal_code: payload.postal_code,
      country: payload.country || 'India',
      is_default: payload.is_default ?? true,
    })
    .select('id')
    .single();
  if (error) {
    console.warn('upsertCustomerAddress(insert) error (non-fatal):', error.message);
    return null;
  }
  return data as any;
}

export async function updateCustomerProfile(
  supabase: SupabaseClient,
  payload: { id: string; first_name: string; last_name: string; phone?: string }
): Promise<boolean> {
  const { error } = await supabase
    .from('customers')
    .update({
      first_name: payload.first_name,
      last_name: payload.last_name,
      phone: payload.phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.id);
  if (error) {
    console.warn('updateCustomerProfile error (non-fatal):', error.message);
    return false;
  }
  return true;
}

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const t = String(now.getTime()).slice(-6);
  return `ORD-${y}${m}${d}-${t}`;
}

export async function createOrderWithItems(supabase: SupabaseClient, input: CreateOrderInput): Promise<{ id: number | string; order_number: string } | null> {
  const order_number = generateOrderNumber();

  // Pass customer_id directly as UUID (nullable)
  const customerIdForInsert: string | null = input.customer_id as string | null;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number,
      customer_id: customerIdForInsert,
      status: 'pending',
      payment_status: 'pending',
      payment_method: input.payment_method,
      subtotal: input.subtotal,
      tax_amount: 0,
      shipping_amount: input.shipping_amount,
      discount_amount: 0,
      total_amount: input.total_amount,
      billing_first_name: input.billing.first_name,
      billing_last_name: input.billing.last_name,
      billing_address_line_1: input.billing.address_line_1,
      billing_address_line_2: input.billing.address_line_2,
      billing_city: input.billing.city,
      billing_state: input.billing.state,
      billing_postal_code: input.billing.postal_code,
      billing_country: input.billing.country || 'India',
      billing_phone: input.billing.phone,
      billing_email: input.billing.email,
      shipping_first_name: input.delivery.first_name,
      shipping_last_name: input.delivery.last_name,
      shipping_address_line_1: input.delivery.address_line_1,
      shipping_address_line_2: input.delivery.address_line_2,
      shipping_city: input.delivery.city,
      shipping_state: input.delivery.state,
      shipping_postal_code: input.delivery.postal_code,
      shipping_country: input.delivery.country || 'India',
      shipping_phone: input.delivery.phone,
    })
    .select('id, order_number')
    .single();

  if (orderError || !order) {
    console.error('createOrderWithItems: order insert failed:', orderError?.message);
    return null;
  }

  if (input.items?.length) {
    const itemsPayload = input.items.map(it => ({
      order_id: order.id,
      product_id: it.product_id,
      product_variant_id: it.product_variant_id,
      product_name: it.product_name,
      product_sku: it.product_sku,
      variant_size: it.variant_size,
      variant_color: it.variant_color,
      variant_material: it.variant_material,
      unit_price: it.unit_price,
      quantity: it.quantity,
      total_price: it.total_price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsPayload);

    if (itemsError) {
      console.warn('createOrderWithItems: inserting items failed:', itemsError.message);
      // continue; order exists
    } else {
      // Successfully created order items, now update inventory
      await updateInventoryForOrder(supabase, input.items);
    }
  }

  return order as any;
}

// Function to update inventory when an order is placed
async function updateInventoryForOrder(supabase: SupabaseClient, items: OrderItemInput[]) {

  
  for (const item of items) {
    try {
      // Find the inventory record for this product/variant
      let inventoryQuery = supabase
        .from('inventory')
        .select('id, quantity, product_id, variant_id, products!inner(name)')
        .eq('product_id', item.product_id);

      // If there's a variant, look for variant-specific inventory
      if (item.product_variant_id) {
        inventoryQuery = inventoryQuery.eq('variant_id', item.product_variant_id);
      } else {
        // No variant, look for default inventory (variant_id is null)
        inventoryQuery = inventoryQuery.is('variant_id', null);
      }

      const { data: inventoryRecords, error: inventoryError } = await inventoryQuery;

      if (inventoryError) {
        console.error(`[updateInventoryForOrder] Error finding inventory for item ${item.product_name}:`, inventoryError);
        continue;
      }

      if (!inventoryRecords || inventoryRecords.length === 0) {
        console.warn(`[updateInventoryForOrder] No inventory record found for product ${item.product_name}, variant ${item.product_variant_id || 'default'}`);
        continue;
      }

      const inventoryRecord = inventoryRecords[0];
      const oldQuantity = inventoryRecord.quantity;
      const newQuantity = Math.max(0, oldQuantity - item.quantity); // Prevent negative inventory

      // Update the inventory quantity
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', inventoryRecord.id);

      if (updateError) {
        console.error(`[updateInventoryForOrder] Error updating inventory for ${item.product_name}:`, updateError);
        continue;
      }

      // Create inventory history record
      const { error: historyError } = await supabase
        .from('inventory_history')
        .insert({
          inventory_id: inventoryRecord.id,
          previous_quantity: oldQuantity, // Use correct column name
          new_quantity: newQuantity,
          change_type: 'STOCK_OUT', // Use change_type instead of action_type
          reason: 'Customer Order',
          created_by: null, // Use created_by instead of user_name
          created_at: new Date().toISOString()
        });

      if (historyError) {
        console.error(`[updateInventoryForOrder] Error creating inventory history for ${item.product_name}:`, historyError);
        // Don't fail the order if history creation fails
      } else {
        // History creation failed but order should continue
      }

    } catch (error) {
      console.error(`[updateInventoryForOrder] Unexpected error processing ${item.product_name}:`, error);
    }
  }
}
