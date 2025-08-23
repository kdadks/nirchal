import { SupabaseClient } from '@supabase/supabase-js';

export type CustomerUpsert = {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
};

export type AddressUpsert = {
  customer_id: string;
  type?: 'billing' | 'shipping';
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
  product_id: number | null;
  product_variant_id: number | null;
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
    city: string;
    state: string;
    postal_code: string;
    country?: string;
    phone?: string;
    email: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_line_1: string;
    city: string;
    state: string;
    postal_code: string;
    country?: string;
    phone?: string;
  };
  items: OrderItemInput[];
};

export async function upsertCustomerByEmail(supabase: SupabaseClient, payload: CustomerUpsert): Promise<{ id: string; tempPassword?: string; existingCustomer?: boolean } | null> {
  console.log('Attempting customer upsert for:', payload.email);
  
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
      console.warn('RPC create_checkout_customer failed, falling back to direct insert:', error);
      throw error; // Will trigger fallback
    }
    
    console.log('RPC customer creation successful:', data);
    return {
      id: data.id,
      tempPassword: data.temp_password,
      existingCustomer: data.existing_customer
    };
  } catch (rpcError) {
    console.log('Falling back to direct customer insert...');
    
    // Fallback to original direct insert method
    const { data, error } = await supabase
      .from('customers')
      .upsert({
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone: payload.phone || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'email'
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('Fallback customer creation also failed:', error);
      return null;
    }
    
    console.log('Fallback customer creation successful:', data);
    return {
      id: data.id,
      tempPassword: undefined, // No temp password in fallback mode
      existingCustomer: false
    };
  }
}

export async function upsertCustomerAddress(supabase: SupabaseClient, payload: AddressUpsert): Promise<{ id: number } | null> {
  // Try to find an existing default address of the given type for this customer
  const { data: existing } = await supabase
    .from('customer_addresses')
    .select('id')
    .eq('customer_id', payload.customer_id)
    .eq('type', payload.type || 'shipping')
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
      type: payload.type || 'shipping',
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
      billing_city: input.billing.city,
      billing_state: input.billing.state,
      billing_postal_code: input.billing.postal_code,
      billing_country: input.billing.country || 'India',
      billing_phone: input.billing.phone,
      billing_email: input.billing.email,
      shipping_first_name: input.shipping.first_name,
      shipping_last_name: input.shipping.last_name,
      shipping_address_line_1: input.shipping.address_line_1,
      shipping_city: input.shipping.city,
      shipping_state: input.shipping.state,
      shipping_postal_code: input.shipping.postal_code,
      shipping_country: input.shipping.country || 'India',
      shipping_phone: input.shipping.phone,
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
    }
  }

  return order as any;
}
