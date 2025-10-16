import { SupabaseClient } from '@supabase/supabase-js';

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
  cod_amount?: number; // Amount to be collected on delivery
  cod_collected?: boolean; // Whether COD has been collected
  online_amount?: number; // Amount paid online
  payment_split?: boolean; // Whether order used split payment
};

export async function upsertCustomerByEmail(supabase: SupabaseClient, payload: CustomerUpsert): Promise<{ id: string; tempPassword?: string; existingCustomer?: boolean; needsWelcomeEmail?: boolean } | null> {
  // Use RPC function only - no fallback
  const { data, error } = await supabase
    .rpc('create_checkout_customer', {
      p_email: payload.email,
      p_first_name: payload.first_name,
      p_last_name: payload.last_name,
      p_phone: payload.phone || null
    });
    
  if (error) {
    console.error('RPC create_checkout_customer failed:', error);
    return null;
  }
  
  if (!data) {
    console.error('RPC create_checkout_customer returned no data');
    return null;
  }
  
  return {
    id: data.id,
    tempPassword: data.temp_password,
    existingCustomer: data.existing_customer,
    needsWelcomeEmail: data.needs_welcome_email
  };
}

export async function markWelcomeEmailSent(supabase: SupabaseClient, customerId: string): Promise<boolean> {
  // Use RPC function only - no fallback
  const { data, error } = await supabase.rpc('mark_welcome_email_sent', {
    customer_id: parseInt(customerId)
  });
  
  if (error) {
    console.error('RPC mark_welcome_email_sent failed:', error);
    return false;
  }
  
  return data === true;
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
      // Split payment fields
      cod_amount: input.cod_amount || 0,
      cod_collected: input.cod_collected || false,
      online_amount: input.online_amount || input.total_amount,
      payment_split: input.payment_split || false,
    })
    .select('id, order_number')
    .single();

  if (orderError || !order) {
    console.error('createOrderWithItems: order insert failed:', orderError?.message);
    return null;
  }

  if (input.items?.length) {
    console.log('[createOrderWithItems] Inserting order items:', {
      orderId: order.id,
      itemsCount: input.items.length,
      items: input.items
    });

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

    console.log('[createOrderWithItems] Items payload:', itemsPayload);

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsPayload)
      .select();

    if (itemsError) {
      console.error('createOrderWithItems: inserting items failed:', itemsError);
      console.error('createOrderWithItems: itemsPayload that failed:', itemsPayload);
      // continue; order exists
    } else {
      console.log('[createOrderWithItems] Successfully inserted items:', insertedItems?.length);
    }
    
    // ⚠️ IMPORTANT: Do NOT update inventory here!
    // Inventory should only be decremented after payment confirmation from Razorpay webhook
    // If user abandons cart or payment fails, inventory should not be affected
  }

  return order as any;
}

// ⚠️ INVENTORY UPDATE REMOVED FROM HERE
// Inventory is now updated by the Razorpay webhook after payment confirmation
// See: functions/razorpay-webhook.ts -> updateInventoryForOrder()
// This ensures inventory is only decremented when payment is successful
