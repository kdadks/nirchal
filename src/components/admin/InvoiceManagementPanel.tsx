import React, { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle, Clock, Search } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useInvoices } from '../../hooks/useInvoices';
import InvoiceGenerationModal from './InvoiceGenerationModal';
import { InvoicePDFPreviewModal } from './InvoicePDFPreviewModal';
import { previewInvoice } from '../../services/invoiceService';
import toast from 'react-hot-toast';

interface Order {
  id: string;  // UUID type
  order_number: string;
  customer_name: string;
  total_amount: number;
  payment_status: string;
  status: string;
  created_at: string;
}

interface Invoice {
  id: number;  // BIGSERIAL type
  invoice_number: string;
  order_id: string;  // UUID type (references orders.id)
  status: string;
  total_amount: number;
  gst_amount: number;
  created_at: string;
  raised_at: string | null;
  order_number: string;
  customer_name: string;
}

type TabType = 'eligible' | 'generated' | 'raised';

const InvoiceManagementPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('eligible');
  const [eligibleOrders, setEligibleOrders] = useState<Order[]>([]);
  const [generatedInvoices, setGeneratedInvoices] = useState<Invoice[]>([]);
  const [raisedInvoices, setRaisedInvoices] = useState<Invoice[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());  // UUID type
  const [selectedInvoices, setSelectedInvoices] = useState<Set<number>>(new Set());  // BIGSERIAL type
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [ordersToGenerate, setOrdersToGenerate] = useState<Order[]>([]);
  
  // PDF Preview Modal state
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [previewPDFData, setPreviewPDFData] = useState<string | null>(null);
  const [previewInvoiceNumber, setPreviewInvoiceNumber] = useState('');
  
  const { 
    generateBulkInvoices, 
    raiseBulkInvoices,
    generating,
    raising 
  } = useInvoices();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'eligible') {
        await loadEligibleOrders();
      } else if (activeTab === 'generated') {
        await loadGeneratedInvoices();
      } else {
        await loadRaisedInvoices();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadEligibleOrders = async () => {
    try {
      // Get orders with delivered status that don't have invoices yet
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, billing_first_name, billing_last_name, total_amount, payment_status, status, created_at')
        .eq('status', 'delivered')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get existing invoices to filter out orders that already have them
      const { data: existingInvoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('order_id');

      if (invoicesError) throw invoicesError;

      const orderIdsWithInvoices = new Set(existingInvoices?.map(inv => inv.order_id) || []);
      
      const eligible = (orders || [])
        .filter(order => !orderIdsWithInvoices.has(order.id))
        .map(order => ({
          id: String(order.id),  // UUID type
          order_number: String(order.order_number),
          customer_name: `${order.billing_first_name} ${order.billing_last_name}`,
          total_amount: Number(order.total_amount),
          payment_status: String(order.payment_status),
          status: String(order.status),
          created_at: String(order.created_at)
        }));

      setEligibleOrders(eligible);
    } catch (error) {
      console.error('Error loading eligible orders:', error);
      toast.error('Failed to load eligible orders');
    }
  };

  const loadGeneratedInvoices = async () => {
    try {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          order_id,
          status,
          total_amount,
          gst_amount,
          created_at,
          raised_at,
          order_number,
          customer_name
        `)
        .eq('status', 'generated')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedInvoices = (invoices || []).map(inv => ({
        id: Number(inv.id),  // BIGSERIAL type
        invoice_number: String(inv.invoice_number),
        order_id: String(inv.order_id),  // UUID type
        status: String(inv.status),
        total_amount: Number(inv.total_amount),
        gst_amount: Number(inv.gst_amount),
        created_at: String(inv.created_at),
        raised_at: inv.raised_at ? String(inv.raised_at) : null,
        order_number: String(inv.order_number),
        customer_name: String(inv.customer_name)
      }));

      setGeneratedInvoices(typedInvoices);
    } catch (error) {
      console.error('Error loading generated invoices:', error);
      toast.error('Failed to load generated invoices');
    }
  };

  const loadRaisedInvoices = async () => {
    try {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          order_id,
          status,
          total_amount,
          gst_amount,
          created_at,
          raised_at,
          order_number,
          customer_name
        `)
        .in('status', ['raised', 'downloaded'])
        .order('raised_at', { ascending: false });

      if (error) throw error;

      const typedInvoices = (invoices || []).map(inv => ({
        id: Number(inv.id),  // BIGSERIAL type
        invoice_number: String(inv.invoice_number),
        order_id: String(inv.order_id),  // UUID type
        status: String(inv.status),
        total_amount: Number(inv.total_amount),
        gst_amount: Number(inv.gst_amount),
        created_at: String(inv.created_at),
        raised_at: inv.raised_at ? String(inv.raised_at) : null,
        order_number: String(inv.order_number),
        customer_name: String(inv.customer_name)
      }));

      setRaisedInvoices(typedInvoices);
    } catch (error) {
      console.error('Error loading raised invoices:', error);
      toast.error('Failed to load raised invoices');
    }
  };

  const handleSelectAll = () => {
    if (activeTab === 'eligible') {
      if (selectedOrders.size === filteredOrders.length) {
        setSelectedOrders(new Set());
      } else {
        setSelectedOrders(new Set(filteredOrders.map(order => order.id)));
      }
    } else if (activeTab === 'generated') {
      if (selectedInvoices.size === filteredGeneratedInvoices.length) {
        setSelectedInvoices(new Set());
      } else {
        setSelectedInvoices(new Set(filteredGeneratedInvoices.map(inv => inv.id)));
      }
    }
  };

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectInvoice = (invoiceId: number) => {
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId);
    } else {
      newSelected.add(invoiceId);
    }
    setSelectedInvoices(newSelected);
  };

  const handleGenerateInvoices = async () => {
    if (selectedOrders.size === 0) {
      toast.error('Please select at least one order');
      return;
    }

    // Get full order objects for selected IDs
    const orders = eligibleOrders.filter(order => selectedOrders.has(order.id));
    setOrdersToGenerate(orders);
    setShowGenerateModal(true);
  };

  const handleConfirmGenerate = async (orderIds: string[]) => {
    const result = await generateBulkInvoices(orderIds);
    
    if (result.results) {
      const successCount = result.results.filter(r => r.success).length;
      const failCount = result.results.length - successCount;

      if (successCount > 0) {
        toast.success(`Generated ${successCount} invoice(s)`);
      }
      if (failCount > 0) {
        toast.error(`Failed to generate ${failCount} invoice(s)`);
      }
    }

    setSelectedOrders(new Set());
    setShowGenerateModal(false);
    setOrdersToGenerate([]);
    await loadEligibleOrders();
    await loadGeneratedInvoices();
  };

  const handleRaiseInvoices = async () => {
    if (selectedInvoices.size === 0) {
      toast.error('Please select at least one invoice');
      return;
    }

    const invoiceIds = Array.from(selectedInvoices).map(id => id.toString());
    const result = await raiseBulkInvoices(invoiceIds);
    
    if (result.success) {
      toast.success(`Raised ${result.count} invoice(s)`);
    } else {
      toast.error(`Failed to raise invoices`);
    }

    setSelectedInvoices(new Set());
    await loadGeneratedInvoices();
  };

  const handlePreviewPDF = async (invoiceId: number, invoiceNumber: string) => {
    try {
      setPreviewInvoiceNumber(invoiceNumber);
      setPreviewPDFData(null);
      setShowPDFPreview(true);
      
      const result = await previewInvoice(invoiceId.toString());
      
      if (result.success && result.pdf) {
        setPreviewPDFData(result.pdf);
      } else {
        toast.error(result.message || 'Failed to load PDF preview');
        setShowPDFPreview(false);
      }
    } catch (error) {
      console.error('Error previewing PDF:', error);
      toast.error('Failed to preview invoice');
      setShowPDFPreview(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter data based on search term
  const filteredOrders = eligibleOrders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGeneratedInvoices = generatedInvoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRaisedInvoices = raisedInvoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Generate, manage and raise invoices for completed orders
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => {
              setActiveTab('eligible');
              setSearchTerm('');
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'eligible'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Eligible Orders</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {eligibleOrders.length}
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('generated');
              setSearchTerm('');
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'generated'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Generated Invoices</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                {generatedInvoices.length}
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('raised');
              setSearchTerm('');
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'raised'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Raised Invoices</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">
                {raisedInvoices.length}
              </span>
            </div>
          </button>
        </nav>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order number, invoice number, or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {activeTab === 'eligible' && selectedOrders.size > 0 && (
          <button
            onClick={handleGenerateInvoices}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            {generating ? 'Generating...' : `Generate ${selectedOrders.size} Invoice(s)`}
          </button>
        )}

        {activeTab === 'generated' && selectedInvoices.size > 0 && (
          <button
            onClick={handleRaiseInvoices}
            disabled={raising}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            {raising ? 'Raising...' : `Raise ${selectedInvoices.size} Invoice(s)`}
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      ) : (
        <>
          {/* Eligible Orders Tab */}
          {activeTab === 'eligible' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No orders found matching your search' : 'No eligible orders for invoice generation'}
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {order.customer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Generated Invoices Tab */}
          {activeTab === 'generated' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredGeneratedInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No invoices found matching your search' : 'No generated invoices pending to be raised'}
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.size === filteredGeneratedInvoices.length && filteredGeneratedInvoices.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GST
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Generated On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGeneratedInvoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedInvoices.has(invoice.id)}
                            onChange={() => handleSelectInvoice(invoice.id)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium">
                          <button
                            onClick={() => handlePreviewPDF(invoice.id, invoice.invoice_number)}
                            className="text-primary-600 hover:text-primary-800 hover:underline focus:outline-none focus:underline"
                            title="Click to preview PDF"
                          >
                            {invoice.invoice_number}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {invoice.customer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatCurrency(invoice.gst_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(invoice.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Raised Invoices Tab */}
          {activeTab === 'raised' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredRaisedInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {searchTerm ? 'No invoices found matching your search' : 'No raised invoices yet'}
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Raised On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRaisedInvoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium">
                          <button
                            onClick={() => handlePreviewPDF(invoice.id, invoice.invoice_number)}
                            className="text-primary-600 hover:text-primary-800 hover:underline focus:outline-none focus:underline"
                            title="Click to preview PDF"
                          >
                            {invoice.invoice_number}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {invoice.customer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            invoice.status === 'downloaded' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {invoice.raised_at ? formatDate(invoice.raised_at) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* Invoice Generation Modal */}
      <InvoiceGenerationModal
        isOpen={showGenerateModal}
        onClose={() => {
          setShowGenerateModal(false);
          setOrdersToGenerate([]);
        }}
        orders={ordersToGenerate}
        onGenerate={handleConfirmGenerate}
      />

      {/* PDF Preview Modal */}
      <InvoicePDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => {
          setShowPDFPreview(false);
          setPreviewPDFData(null);
          setPreviewInvoiceNumber('');
        }}
        pdfDataUrl={previewPDFData}
        invoiceNumber={previewInvoiceNumber}
      />
    </div>
  );
};

export default InvoiceManagementPanel;
