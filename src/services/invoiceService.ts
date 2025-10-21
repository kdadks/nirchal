import { supabase } from '../config/supabase';
import jsPDF from 'jspdf';

interface OrderData {
  id: number;
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
 * Calculate GST amount from subtotal
 */
export function calculateGST(subtotal: number, rate: number = GST_RATE): number {
  return (subtotal * rate) / 100;
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
async function getOrderDetails(orderId: number): Promise<OrderData | null> {
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
function formatInvoiceData(order: OrderData, company: CompanySettings, invoiceNumber: string): InvoiceData {
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

  const subtotal = order.subtotal;
  const gstAmount = calculateGST(subtotal);

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
    items,
    subtotal,
    gstRate: GST_RATE,
    gstAmount,
    shippingAmount: order.shipping_amount,
    discountAmount: order.discount_amount,
    totalAmount: subtotal + gstAmount + order.shipping_amount - order.discount_amount,
  };
}

/**
 * Generate PDF invoice
 */
function generateInvoicePDF(data: InvoiceData): string {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Helper function to add text
  const addText = (text: string, x: number, fontSize: number = 10, style: string = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);
    doc.text(text, x, yPos);
    yPos += fontSize * 0.5;
  };

  // Header - Company Info
  doc.setFillColor(79, 70, 229); // Indigo
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  addText(data.company.store_name, 20, 20, 'bold');
  addText(data.company.store_address, 20, 10);
  addText(`Phone: ${data.company.store_phone} | Email: ${data.company.store_email}`, 20, 9);
  if (data.company.gst_number) {
    addText(`GSTIN: ${data.company.gst_number}`, 20, 9);
  }

  yPos = 50;
  doc.setTextColor(0, 0, 0);

  // Invoice Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Invoice Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${data.invoiceNumber}`, 20, yPos);
  doc.text(`Invoice Date: ${data.invoiceDate}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 6;
  doc.text(`Order No: ${data.orderNumber}`, 20, yPos);
  doc.text(`Order Date: ${data.orderDate}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 12;

  // Bill To and Ship To
  const colWidth = (pageWidth - 40) / 2;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, yPos);
  doc.text('Ship To:', 20 + colWidth + 10, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  const billLines = [
    data.customer.name,
    ...data.billingAddress.split('\n'),
    data.customer.phone ? `Phone: ${data.customer.phone}` : '',
    `Email: ${data.customer.email}`,
  ].filter(Boolean);

  const shipLines = [
    data.shippingAddress.includes(data.customer.name) ? '' : data.customer.name,
    ...data.shippingAddress.split('\n'),
  ].filter(Boolean);

  const maxLines = Math.max(billLines.length, shipLines.length);
  for (let i = 0; i < maxLines; i++) {
    if (billLines[i]) doc.text(billLines[i], 20, yPos, { maxWidth: colWidth - 5 });
    if (shipLines[i]) doc.text(shipLines[i], 20 + colWidth + 10, yPos, { maxWidth: colWidth - 5 });
    yPos += 5;
  }
  yPos += 10;

  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos - 6, pageWidth - 40, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 22, yPos);
  doc.text('Qty', pageWidth - 100, yPos, { align: 'center' });
  doc.text('Unit Price', pageWidth - 70, yPos, { align: 'right' });
  doc.text('Amount', pageWidth - 22, yPos, { align: 'right' });
  yPos += 10;

  // Table Items
  doc.setFont('helvetica', 'normal');
  data.items.forEach((item) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    const lines = doc.splitTextToSize(item.description, 100);
    lines.forEach((line: string, lineIndex: number) => {
      doc.text(line, 22, yPos);
      if (lineIndex === 0) {
        doc.text(item.quantity.toString(), pageWidth - 100, yPos, { align: 'center' });
        doc.text(`₹${item.unitPrice.toFixed(2)}`, pageWidth - 70, yPos, { align: 'right' });
        doc.text(`₹${item.amount.toFixed(2)}`, pageWidth - 22, yPos, { align: 'right' });
      }
      yPos += 5;
    });

    if (item.sku) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`SKU: ${item.sku}`, 22, yPos);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      yPos += 6;
    }
  });

  yPos += 5;
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;

  // Totals
  const totalsX = pageWidth - 90;
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(`₹${data.subtotal.toFixed(2)}`, pageWidth - 22, yPos, { align: 'right' });
  yPos += 6;

  doc.text(`GST (${data.gstRate}%):`, totalsX, yPos);
  doc.text(`₹${data.gstAmount.toFixed(2)}`, pageWidth - 22, yPos, { align: 'right' });
  yPos += 6;

  if (data.shippingAmount > 0) {
    doc.text('Shipping:', totalsX, yPos);
    doc.text(`₹${data.shippingAmount.toFixed(2)}`, pageWidth - 22, yPos, { align: 'right' });
    yPos += 6;
  }

  if (data.discountAmount > 0) {
    doc.text('Discount:', totalsX, yPos);
    doc.text(`-₹${data.discountAmount.toFixed(2)}`, pageWidth - 22, yPos, { align: 'right' });
    yPos += 6;
  }

  doc.setLineWidth(0.5);
  doc.line(totalsX, yPos, pageWidth - 20, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', totalsX, yPos);
  doc.text(`₹${data.totalAmount.toFixed(2)}`, pageWidth - 22, yPos, { align: 'right' });

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Terms & Conditions:', 20, yPos);
  yPos += 5;
  doc.setFontSize(8);
  doc.text('1. This is a computer-generated invoice and does not require a signature.', 20, yPos);
  yPos += 4;
  doc.text('2. Please check the items at the time of delivery.', 20, yPos);
  yPos += 4;
  doc.text('3. For any queries, please contact us at ' + data.company.store_email, 20, yPos);

  // Generate base64
  return doc.output('dataurlstring');
}

/**
 * Generate and save invoice for an order
 */
export async function generateInvoice(orderId: number): Promise<{
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

    // Get company settings
    const companySettings = await getCompanySettings();

    // Generate invoice number
    const { data: invoiceNumData, error: invoiceNumError } = await supabase
      .rpc('generate_invoice_number');

    if (invoiceNumError || !invoiceNumData) {
      throw new Error('Failed to generate invoice number');
    }

    const invoiceNumber = invoiceNumData as string;

    // Format invoice data
    const invoiceData = formatInvoiceData(orderData, companySettings, invoiceNumber);

    // Generate PDF
    const pdfBase64 = generateInvoicePDF(invoiceData);

    // Save invoice to database
    const { data: invoice, error: saveError } = await supabase
      .from('invoices')
      .insert({
        order_id: orderId,
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
        },
      })
      .select()
      .single();

    if (saveError || !invoice) {
      throw new Error('Failed to save invoice');
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
    const { error } = await supabase
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
    const { data, error } = await supabase
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
 * Download invoice PDF
 */
export async function downloadInvoice(invoiceId: string, orderId?: number): Promise<{ success: boolean; message: string; pdf?: string }> {
  try {
    let query = supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('status', 'raised');

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data: invoice, error } = await query.single();

    if (error || !invoice) {
      throw new Error('Invoice not found or not available');
    }

    // Update downloaded status
    await supabase
      .from('invoices')
      .update({
        status: 'downloaded',
        downloaded_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .eq('status', 'raised');

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
export async function getInvoiceByOrderId(orderId: number): Promise<{
  id: string;
  invoice_number: string;
  status: string;
  generated_at: string;
  raised_at: string | null;
} | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, status, generated_at, raised_at')
      .eq('order_id', orderId)
      .eq('status', 'raised')
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: String(data.id),
      invoice_number: String(data.invoice_number),
      status: String(data.status),
      generated_at: String(data.generated_at),
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
export async function bulkGenerateInvoices(orderIds: number[]): Promise<{
  success: boolean;
  message: string;
  results?: Array<{ orderId: number; success: boolean; invoiceNumber?: string; message?: string }>;
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
