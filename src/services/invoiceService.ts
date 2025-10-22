import { supabase, supabaseAdmin } from '../config/supabase';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfMake with fonts
(pdfMake as any).vfs = pdfFonts;

interface OrderData {
  id: string;  // UUID type
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  billing_first_name: string;
  billing_last_name: string;
  billing_company?: string;
  billing_address_line_1: string;
  billing_address_line_2?: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_country: string;
  billing_phone?: string;
  billing_email: string;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_company?: string;
  shipping_address_line_1: string;
  shipping_address_line_2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  shipping_phone?: string;
  created_at: string;
  order_items: Array<{
    product_name: string;
    product_sku?: string;
    variant_size?: string;
    variant_color?: string;
    variant_material?: string;
    unit_price: number;
    quantity: number;
    total_price: number;
  }>;
}

interface CompanySettings {
  store_name: string;
  store_phone: string;
  store_email: string;
  store_address: string;
  gst_number: string;
  pan_number?: string;
}

/**
 * Helper function to fetch settings from key-value settings table
 */
async function getSettingsFromKeyValue(): Promise<CompanySettings | null> {
  try {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value, category')
      .in('category', ['shop', 'billing']);

    if (error || !settings) {
      console.warn('Failed to fetch settings from key-value table:', error);
      return null;
    }

    // Convert array to key-value map
    const settingsMap: Record<string, string> = {};
    settings.forEach((setting: any) => {
      settingsMap[setting.key] = setting.value || '';
    });

    return {
      store_name: settingsMap['store_name'] || settingsMap['company_name'] || 'Company Name',
      store_address: settingsMap['store_address'] || settingsMap['billing_address'] || '',
      store_phone: settingsMap['store_phone'] || '',
      store_email: settingsMap['store_email'] || settingsMap['contact_email'] || '',
      gst_number: settingsMap['gst_number'] || '',
      pan_number: settingsMap['pan_number'] || '',
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  invoiceDate: string;
  orderDate: string;
  company: CompanySettings;
  customer: {
    name: string;
    email: string;
    phone?: string;
    gstNumber?: string;
  };
  billingAddress: string;
  shippingAddress: string;
  shippingName: string;
  shippingPhone?: string;
  items: Array<{
    description: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
}

const GST_RATE = 18; // 18% GST

/**
 * Calculate GST amount from subtotal (Exclusive - GST added on top)
 */
export function calculateGST(subtotal: number, rate: number = GST_RATE): number {
  return (subtotal * rate) / 100;
}

/**
 * Calculate GST amount from total (Inclusive - GST is part of total)
 */
export function calculateGSTInclusive(totalAmount: number, rate: number = GST_RATE): number {
  // If total includes GST, the formula is: GST = Total - (Total / (1 + rate/100))
  // Or simplified: GST = (Total * rate) / (100 + rate)
  return (totalAmount * rate) / (100 + rate);
}

/**
 * Fetch company settings from database
 */
async function getCompanySettings(): Promise<CompanySettings> {
  const { data: settings, error } = await supabase
    .from('settings')
    .select('key, value')
    .eq('category', 'shop')
    .in('key', ['store_name', 'store_phone', 'store_email', 'store_address']);

  if (error) {
    console.error('Error fetching company settings:', error);
    throw new Error('Failed to fetch company settings');
  }

  const { data: gstData } = await supabase
    .from('settings')
    .select('value')
    .eq('category', 'billing')
    .eq('key', 'gst_number')
    .single();

  const settingsMap: Record<string, string> = {};
  settings?.forEach((setting: { key: unknown; value: unknown }) => {
    if (typeof setting.key === 'string' && typeof setting.value === 'string') {
      settingsMap[setting.key] = setting.value;
    }
  });

  return {
    store_name: settingsMap.store_name || 'Nirchal',
    store_phone: settingsMap.store_phone || '',
    store_email: settingsMap.store_email || '',
    store_address: settingsMap.store_address || '',
    gst_number: (typeof gstData?.value === 'string' ? gstData.value : '') || '',
  };
}

/**
 * Fetch order details with items
 */
async function getOrderDetails(orderId: string): Promise<OrderData | null> {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    console.error('Error fetching order:', orderError);
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    return null;
  }

  return {
    ...order,
    order_items: items || [],
  } as OrderData;
}

/**
 * Format invoice data from order
 */
async function formatInvoiceData(order: OrderData, company: CompanySettings, invoiceNumber: string): Promise<InvoiceData> {
  // Fetch GST settings from settings table
  const { data: gstSettings } = await supabase
    .from('settings')
    .select('key, value, category')
    .eq('category', 'billing')
    .in('key', ['tax_rate', 'enable_gst']);

  console.log('Raw GST settings from DB:', gstSettings);

  const settingsMap: Record<string, string> = {};
  gstSettings?.forEach((setting: any) => {
    settingsMap[setting.key] = setting.value || '';
  });

  // Use settings values directly without defaults
  const gstEnabled = settingsMap['enable_gst'] === 'true';
  const taxRate = gstEnabled && settingsMap['tax_rate'] ? Number(settingsMap['tax_rate']) : 0;
  
  console.log('GST Settings:', { gstEnabled, taxRate, settingsMap });

  const billingAddress = [
    order.billing_address_line_1,
    order.billing_address_line_2,
    `${order.billing_city}, ${order.billing_state} ${order.billing_postal_code}`,
    order.billing_country,
  ].filter(Boolean).join('\n');

  const shippingAddress = [
    order.shipping_address_line_1,
    order.shipping_address_line_2,
    `${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}`,
    order.shipping_country,
  ].filter(Boolean).join('\n');

  const shippingName = `${order.shipping_first_name} ${order.shipping_last_name}`;
  const shippingPhone = order.shipping_phone;

  const items = order.order_items.map(item => {
    let description = item.product_name;
    const variants = [];
    if (item.variant_size) variants.push(`Size: ${item.variant_size}`);
    if (item.variant_color) variants.push(`Color: ${item.variant_color}`);
    if (item.variant_material) variants.push(`Material: ${item.variant_material}`);
    if (variants.length > 0) {
      description += ` (${variants.join(', ')})`;
    }

    return {
      description,
      sku: item.product_sku,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      amount: item.total_price,
    };
  });

  // For inclusive GST calculation:
  // If GST is enabled, the order.subtotal already includes GST
  // We need to extract the GST amount from the subtotal
  const subtotal = order.subtotal;
  const gstAmount = gstEnabled ? calculateGSTInclusive(subtotal, taxRate) : 0;
  const subtotalBeforeGST = gstEnabled ? subtotal - gstAmount : subtotal;

  return {
    invoiceNumber,
    orderNumber: order.order_number,
    invoiceDate: new Date().toLocaleDateString('en-IN'),
    orderDate: new Date(order.created_at).toLocaleDateString('en-IN'),
    company,
    customer: {
      name: `${order.billing_first_name} ${order.billing_last_name}`,
      email: order.billing_email,
      phone: order.billing_phone,
      gstNumber: undefined, // Can be added if customer GST is stored
    },
    billingAddress,
    shippingAddress,
    shippingName,
    shippingPhone,
    items,
    subtotal: subtotalBeforeGST,
    gstRate: taxRate,
    gstAmount,
    shippingAmount: order.shipping_amount,
    discountAmount: order.discount_amount,
    totalAmount: subtotal + order.shipping_amount - order.discount_amount,
  };
}

/**
 * Generate PDF invoice using pdfMake
 */
async function generateInvoicePDF(data: InvoiceData, headerImageUrl?: string, footerImageUrl?: string): Promise<string> {
  console.log('PDF Generation with pdfMake - Version 2.0', {
    margins: '40pt (1.4cm)',
    tableWidths: ['*', 35, 70, 70],
    timestamp: new Date().toISOString()
  });
  
  // Helper function to load image as base64
  const loadImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Failed to load image:', url, error);
      return null;
    }
  };

  // Load images if provided
  const headerImageData = headerImageUrl ? await loadImageAsBase64(headerImageUrl) : null;
  const footerImageData = footerImageUrl ? await loadImageAsBase64(footerImageUrl) : null;

  // Prepare table rows
  const tableBody: any[] = [
    // Header row
    [
      { text: 'Description', style: 'tableHeader', bold: true },
      { text: 'Qty', style: 'tableHeader', bold: true, alignment: 'center' },
      { text: 'Unit Price', style: 'tableHeader', bold: true, alignment: 'right' },
      { text: 'Amount', style: 'tableHeader', bold: true, alignment: 'right' }
    ]
  ];

  // Add items
  data.items.forEach(item => {
    const descriptionParts: any[] = [{ text: item.description, fontSize: 9, lineHeight: 1.3 }];
    if (item.sku) {
      descriptionParts.push({ text: `\nSKU: ${item.sku}`, fontSize: 8, color: '#666666' });
    }

    // Format currency without extra spaces
    const formatCurrency = (amount: number) => `₹ ${amount.toFixed(2)}`;

    tableBody.push([
      descriptionParts,
      { text: item.quantity.toString(), alignment: 'center', fontSize: 9 },
      { text: formatCurrency(item.unitPrice), alignment: 'right', fontSize: 9, noWrap: true },
      { text: formatCurrency(item.amount), alignment: 'right', fontSize: 9, noWrap: true }
    ]);
  });

  // Document definition
  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40], // Standard 40 points margin (approx 1.4cm)
    
    header: headerImageData ? {
      image: headerImageData,
      width: 515, // A4 width (595) minus margins (80)
      margin: [40, 20, 40, 0]
    } : undefined,

    footer: footerImageData ? (_currentPage: number, _pageCount: number) => {
      return {
        image: footerImageData,
        width: 515,
        margin: [40, 0, 40, 20]
      };
    } : (_currentPage: number, _pageCount: number) => {
      return {
        columns: [
          {
            text: [
              { text: 'Terms & Conditions:\n', fontSize: 9, bold: true },
              { text: '1. This is a computer-generated invoice and does not require a signature.\n', fontSize: 8 },
              { text: '2. Please check the items at the time of delivery.\n', fontSize: 8 },
              { text: `3. For any queries, please contact us at ${data.company.store_email}`, fontSize: 8 }
            ],
            margin: [40, 10, 40, 20]
          }
        ]
      };
    },

    content: [
      // Header section (if no image)
      ...(!headerImageData ? [{
        table: {
          widths: ['*'],
          body: [[
            {
              stack: [
                { text: data.company.store_name, fontSize: 18, bold: true, color: 'white' },
                { text: data.company.store_address, fontSize: 9, color: 'white', margin: [0, 3, 0, 0] },
                { text: `Phone: ${data.company.store_phone} | Email: ${data.company.store_email}`, fontSize: 9, color: 'white', margin: [0, 2, 0, 0] },
                ...(data.company.gst_number ? [{ text: `GSTIN: ${data.company.gst_number}`, fontSize: 9, color: 'white', margin: [0, 2, 0, 0] }] : [])
              ],
              fillColor: '#4F46E5',
              border: [false, false, false, false],
              margin: [10, 10, 10, 10]
            }
          ]]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 15]
      }] : []),

      // Invoice title
      { text: 'TAX INVOICE', fontSize: 24, bold: true, alignment: 'center', margin: [0, headerImageData ? 10 : 0, 0, 15] },

      // Invoice and Order details
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: `Invoice No: ${data.invoiceNumber}`, fontSize: 10 },
              { text: `Order No: ${data.orderNumber}`, fontSize: 10, margin: [0, 4, 0, 0] }
            ]
          },
          {
            width: '*',
            stack: [
              { text: `Invoice Date: ${data.invoiceDate}`, fontSize: 10, alignment: 'right' },
              { text: `Order Date: ${data.orderDate}`, fontSize: 10, alignment: 'right', margin: [0, 4, 0, 0] }
            ]
          }
        ],
        margin: [0, 0, 0, 12]
      },

      // Bill To and Ship To
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'Bill To:', fontSize: 11, bold: true, margin: [0, 0, 0, 4] },
              { text: data.customer.name, fontSize: 9 },
              { text: data.billingAddress, fontSize: 9, margin: [0, 2, 0, 0] },
              ...(data.customer.phone ? [{ text: `Phone: ${data.customer.phone}`, fontSize: 9, margin: [0, 2, 0, 0] }] : []),
              { text: `Email: ${data.customer.email}`, fontSize: 9, margin: [0, 2, 0, 0] }
            ]
          },
          {
            width: '*',
            stack: [
              { text: 'Ship To:', fontSize: 11, bold: true, margin: [0, 0, 0, 4] },
              { text: data.shippingName, fontSize: 9 },
              { text: data.shippingAddress, fontSize: 9, margin: [0, 2, 0, 0] },
              ...(data.shippingPhone ? [{ text: `Phone: ${data.shippingPhone}`, fontSize: 9, margin: [0, 2, 0, 0] }] : [])
            ]
          }
        ],
        margin: [0, 0, 0, 15]
      },

      // Items table
      {
        table: {
          headerRows: 1,
          widths: ['*', 35, 70, 70], // Better column distribution
          body: tableBody
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? '#F0F0F0' : null),
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#CCCCCC',
          vLineColor: () => '#CCCCCC',
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6
        },
        margin: [0, 0, 0, 10]
      },

      // Totals
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 220,
            stack: [
              {
                columns: [
                  { width: '*', text: 'Subtotal:', fontSize: 10 },
                  { width: 90, text: `₹ ${data.subtotal.toFixed(2)}`, fontSize: 10, alignment: 'right', noWrap: true }
                ],
                margin: [0, 0, 0, 5]
              },
              {
                columns: [
                  { width: '*', text: `GST (${data.gstRate}%):`, fontSize: 10 },
                  { width: 90, text: `₹ ${data.gstAmount.toFixed(2)}`, fontSize: 10, alignment: 'right', noWrap: true }
                ],
                margin: [0, 0, 0, 5]
              },
              ...(data.shippingAmount > 0 ? [{
                columns: [
                  { width: '*', text: 'Shipping:', fontSize: 10 },
                  { width: 90, text: `₹ ${data.shippingAmount.toFixed(2)}`, fontSize: 10, alignment: 'right', noWrap: true }
                ],
                margin: [0, 0, 0, 5]
              }] : []),
              ...(data.discountAmount > 0 ? [{
                columns: [
                  { width: '*', text: 'Discount:', fontSize: 10 },
                  { width: 90, text: `-₹ ${data.discountAmount.toFixed(2)}`, fontSize: 10, alignment: 'right', noWrap: true }
                ],
                margin: [0, 0, 0, 5]
              }] : []),
              {
                canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1 }],
                margin: [0, 5, 0, 8]
              },
              {
                columns: [
                  { width: '*', text: 'Total Amount:', fontSize: 12, bold: true },
                  { width: 90, text: `₹ ${data.totalAmount.toFixed(2)}`, fontSize: 12, bold: true, alignment: 'right', noWrap: true }
                ]
              }
            ]
          }
        ]
      }
    ],
    
    watermark: {
      text: 'Delivered',
      color: '#9ACD32', // Olive light green (YellowGreen)
      opacity: 0.15,
      bold: true,
      italics: false,
      fontSize: 80,
      angle: -45
    },
    
    styles: {
      tableHeader: {
        fontSize: 10,
        fillColor: '#F0F0F0'
      }
    }
  };

  // Generate PDF and return as base64 data URL
  return new Promise((resolve, reject) => {
    try {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBase64((base64) => {
        resolve(`data:application/pdf;base64,${base64}`);
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      reject(error);
    }
  });
}

/**
 * Generate and save invoice for an order
 */
export async function generateInvoice(orderId: string): Promise<{
  success: boolean;
  message: string;
  invoiceId?: string;
  invoiceNumber?: string;
}> {
  try {
    // Check if order exists and has completed payment
    const orderData = await getOrderDetails(orderId);
    if (!orderData) {
      return { success: false, message: 'Order not found' };
    }

    if (orderData.payment_status !== 'completed' && orderData.payment_status !== 'paid') {
      return { success: false, message: 'Invoice can only be generated for completed payments' };
    }

    // Check if invoice already exists
    const { data: existing } = await supabase
      .from('invoices')
      .select('id, invoice_number, status')
      .eq('order_id', orderId)
      .single();

    if (existing) {
      return {
        success: true,
        message: 'Invoice already exists',
        invoiceId: String(existing.id),
        invoiceNumber: String(existing.invoice_number),
      };
    }

    // Get company settings from key-value settings table
    let companySettings = await getSettingsFromKeyValue();
    
    // Fallback to old company_settings table if key-value settings not available
    if (!companySettings) {
      companySettings = await getCompanySettings();
    }

    // Generate invoice number - use admin client for privileged operations
    const client = supabaseAdmin || supabase;
    const { data: invoiceNumData, error: invoiceNumError } = await client
      .rpc('generate_invoice_number');

    if (invoiceNumError || !invoiceNumData) {
      throw new Error('Failed to generate invoice number');
    }

    const invoiceNumber = invoiceNumData as string;

    // Format invoice data (now async to fetch GST settings)
    const invoiceData = await formatInvoiceData(orderData, companySettings, invoiceNumber);

    // Generate PDF with optional header/footer images
    // TODO: Add settings to configure header/footer image URLs
    const headerImageUrl = undefined; // Can be configured from settings
    const footerImageUrl = undefined; // Can be configured from settings
    const pdfBase64 = await generateInvoicePDF(invoiceData, headerImageUrl, footerImageUrl);

    // Save invoice to database - use admin client for privileged operations
    const { data: invoice, error: saveError } = await client
      .from('invoices')
      .insert({
        order_id: orderId,
        order_number: invoiceData.orderNumber,
        invoice_number: invoiceNumber,
        status: 'generated',
        pdf_base64: pdfBase64,
        subtotal: invoiceData.subtotal,
        tax_amount: 0,
        gst_rate: invoiceData.gstRate,
        gst_amount: invoiceData.gstAmount,
        shipping_amount: invoiceData.shippingAmount,
        discount_amount: invoiceData.discountAmount,
        total_amount: invoiceData.totalAmount,
        company_name: companySettings.store_name,
        company_address: companySettings.store_address,
        company_phone: companySettings.store_phone,
        company_email: companySettings.store_email,
        company_gst_number: companySettings.gst_number,
        customer_name: invoiceData.customer.name,
        billing_address: invoiceData.billingAddress,
        shipping_address: invoiceData.shippingAddress,
        customer_email: invoiceData.customer.email,
        customer_phone: invoiceData.customer.phone,
        metadata: {
          items: invoiceData.items,
          order_number: invoiceData.orderNumber,
          order_date: invoiceData.orderDate,
          shipping_name: invoiceData.shippingName,
          shipping_phone: invoiceData.shippingPhone,
        },
      })
      .select()
      .single();

    if (saveError || !invoice) {
      console.error('Save invoice error:', saveError);
      throw new Error(`Failed to save invoice: ${saveError?.message || 'Unknown error'}`);
    }

    return {
      success: true,
      message: 'Invoice generated successfully',
      invoiceId: String(invoice.id),
      invoiceNumber: String(invoice.invoice_number),
    };
  } catch (error) {
    console.error('Error generating invoice:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate invoice',
    };
  }
}

/**
 * Raise invoice (make it visible to customer)
 */
export async function raiseInvoice(invoiceId: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('invoices')
      .update({
        status: 'raised',
        raised_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .eq('status', 'generated');

    if (error) {
      throw error;
    }

    return { success: true, message: 'Invoice raised successfully' };
  } catch (error) {
    console.error('Error raising invoice:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to raise invoice',
    };
  }
}

/**
 * Bulk raise invoices
 */
export async function bulkRaiseInvoices(invoiceIds: string[]): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('invoices')
      .update({
        status: 'raised',
        raised_at: new Date().toISOString(),
      })
      .in('id', invoiceIds)
      .eq('status', 'generated')
      .select('id');

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: `${data?.length || 0} invoices raised successfully`,
      count: data?.length || 0,
    };
  } catch (error) {
    console.error('Error bulk raising invoices:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to raise invoices',
    };
  }
}

/**
 * Preview invoice PDF (without changing status)
 */
export async function previewInvoice(invoiceId: string): Promise<{ success: boolean; message: string; pdf?: string }> {
  try {
    console.log('Preview invoice called for ID:', invoiceId);
    
    // Get invoice details
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      throw new Error('Invoice not found');
    }

    // Get company settings from key-value settings table
    let companySettings = await getSettingsFromKeyValue();
    
    // Fallback to invoice's stored company data if settings not available
    if (!companySettings) {
      companySettings = {
        store_name: String(invoice.company_name || 'Company Name'),
        store_address: String(invoice.company_address || ''),
        store_phone: String(invoice.company_phone || ''),
        store_email: String(invoice.company_email || ''),
        gst_number: String(invoice.company_gst_number || ''),
      };
    }

    // Reconstruct invoice data from stored metadata
    const metadata = invoice.metadata as any;
    const items = metadata?.items || [];
    const invoiceData: InvoiceData = {
      invoiceNumber: String(invoice.invoice_number),
      invoiceDate: new Date(invoice.created_at as string).toLocaleDateString('en-IN'),
      orderNumber: String(invoice.order_number),
      orderDate: metadata?.order_date || new Date(invoice.created_at as string).toLocaleDateString('en-IN'),
      company: companySettings,
      customer: {
        name: String(invoice.customer_name),
        email: String(invoice.customer_email || ''),
        phone: String(invoice.customer_phone || ''),
      },
      billingAddress: String(invoice.billing_address),
      shippingAddress: String(invoice.shipping_address),
      shippingName: String(metadata?.shipping_name || ''),
      shippingPhone: String(metadata?.shipping_phone || ''),
      items: items,
      subtotal: Number(invoice.subtotal),
      gstRate: Number(invoice.gst_rate),
      gstAmount: Number(invoice.gst_amount),
      shippingAmount: Number(invoice.shipping_amount || 0),
      discountAmount: Number(invoice.discount_amount || 0),
      totalAmount: Number(invoice.total_amount),
    };

    // Regenerate PDF with current pdfMake implementation
    console.log('Regenerating PDF with pdfMake...');
    const headerImageUrl = undefined; // Can be configured from settings
    const footerImageUrl = undefined; // Can be configured from settings
    const pdfBase64 = await generateInvoicePDF(invoiceData, headerImageUrl, footerImageUrl);

    return {
      success: true,
      message: 'Invoice preview generated successfully',
      pdf: pdfBase64,
    };
  } catch (error) {
    console.error('Error previewing invoice:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to preview invoice',
    };
  }
}

/**
 * Download invoice PDF
 */
export async function downloadInvoice(invoiceId: string, orderId?: string): Promise<{ success: boolean; message: string; pdf?: string }> {
  try {
    let query = supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .in('status', ['raised', 'downloaded']);

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data: invoice, error } = await query.single();

    if (error || !invoice) {
      throw new Error('Invoice not found or not available');
    }

    // Update downloaded status only if it's currently 'raised' - use admin client for privileged operations
    if (invoice.status === 'raised') {
      const client = supabaseAdmin || supabase;
      await client
        .from('invoices')
        .update({
          status: 'downloaded',
          downloaded_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .eq('status', 'raised');
    }

    return {
      success: true,
      message: 'Invoice retrieved successfully',
      pdf: typeof invoice.pdf_base64 === 'string' ? invoice.pdf_base64 : undefined,
    };
  } catch (error) {
    console.error('Error downloading invoice:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to download invoice',
    };
  }
}

/**
 * Get invoice by order ID
 */
export async function getInvoiceByOrderId(orderId: string): Promise<{
  id: string;
  invoice_number: string;
  status: string;
  created_at: string;
  raised_at: string | null;
} | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, status, created_at, raised_at')
      .eq('order_id', orderId)
      .in('status', ['raised', 'downloaded'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: String(data.id),
      invoice_number: String(data.invoice_number),
      status: String(data.status),
      created_at: String(data.created_at),
      raised_at: data.raised_at ? String(data.raised_at) : null,
    };
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }
}

/**
 * Bulk generate invoices for eligible orders
 */
export async function bulkGenerateInvoices(orderIds: string[]): Promise<{
  success: boolean;
  message: string;
  results?: Array<{ orderId: string; success: boolean; invoiceNumber?: string; message?: string }>;
}> {
  const results = [];

  for (const orderId of orderIds) {
    const result = await generateInvoice(orderId);
    results.push({
      orderId,
      success: result.success,
      invoiceNumber: result.invoiceNumber,
      message: result.message,
    });
  }

  const successCount = results.filter(r => r.success).length;

  return {
    success: successCount > 0,
    message: `${successCount} of ${orderIds.length} invoices generated successfully`,
    results,
  };
}

/**
 * Delete a generated invoice
 */
export async function deleteInvoice(invoiceId: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = supabaseAdmin || supabase;
    
    // Check if invoice is in 'generated' status (can only delete generated invoices, not raised ones)
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', invoiceId)
      .single();

    if (fetchError || !invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== 'generated') {
      throw new Error('Can only delete invoices in "generated" status');
    }

    const { error } = await client
      .from('invoices')
      .delete()
      .eq('id', invoiceId);

    if (error) {
      throw error;
    }

    return { success: true, message: 'Invoice deleted successfully' };
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete invoice',
    };
  }
}
