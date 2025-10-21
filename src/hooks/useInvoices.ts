import { useState } from 'react';
import {
  generateInvoice,
  bulkGenerateInvoices,
  raiseInvoice,
  bulkRaiseInvoices,
  downloadInvoice,
  getInvoiceByOrderId,
} from '../services/invoiceService';

interface UseInvoicesResult {
  generating: boolean;
  raising: boolean;
  downloading: boolean;
  error: string | null;
  generateInvoiceForOrder: (orderId: string) => Promise<{
    success: boolean;
    invoiceId?: string;
    invoiceNumber?: string;
  }>;
  generateBulkInvoices: (orderIds: string[]) => Promise<{
    success: boolean;
    count: number;
    results?: Array<{ orderId: string; success: boolean; invoiceNumber?: string; message?: string }>;
  }>;
  raiseInvoiceById: (invoiceId: string) => Promise<boolean>;
  raiseBulkInvoices: (invoiceIds: string[]) => Promise<{ success: boolean; count: number }>;
  downloadInvoiceById: (invoiceId: string, orderId?: string) => Promise<string | null>;
  checkInvoiceForOrder: (orderId: string) => Promise<{
    id: string;
    invoice_number: string;
    status: string;
    generated_at: string;
    raised_at: string | null;
  } | null>;
}

export function useInvoices(): UseInvoicesResult {
  const [generating, setGenerating] = useState(false);
  const [raising, setRaising] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInvoiceForOrder = async (orderId: string) => {
    setGenerating(true);
    setError(null);
    try {
      const result = await generateInvoice(orderId);
      if (!result.success) {
        setError(result.message);
      }
      return {
        success: result.success,
        invoiceId: result.invoiceId,
        invoiceNumber: result.invoiceNumber,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate invoice';
      setError(message);
      return { success: false };
    } finally {
      setGenerating(false);
    }
  };

  const generateBulkInvoices = async (orderIds: string[]) => {
    setGenerating(true);
    setError(null);
    try {
      const result = await bulkGenerateInvoices(orderIds);
      if (!result.success) {
        setError(result.message);
      }
      return {
        success: result.success,
        count: result.results?.filter(r => r.success).length || 0,
        results: result.results,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate invoices';
      setError(message);
      return { success: false, count: 0 };
    } finally {
      setGenerating(false);
    }
  };

  const raiseInvoiceById = async (invoiceId: string): Promise<boolean> => {
    setRaising(true);
    setError(null);
    try {
      const result = await raiseInvoice(invoiceId);
      if (!result.success) {
        setError(result.message);
      }
      return result.success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to raise invoice';
      setError(message);
      return false;
    } finally {
      setRaising(false);
    }
  };

  const raiseBulkInvoices = async (invoiceIds: string[]) => {
    setRaising(true);
    setError(null);
    try {
      const result = await bulkRaiseInvoices(invoiceIds);
      if (!result.success) {
        setError(result.message);
      }
      return {
        success: result.success,
        count: result.count || 0,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to raise invoices';
      setError(message);
      return { success: false, count: 0 };
    } finally {
      setRaising(false);
    }
  };

  const downloadInvoiceById = async (invoiceId: string, orderId?: string): Promise<string | null> => {
    setDownloading(true);
    setError(null);
    try {
      const result = await downloadInvoice(invoiceId, orderId);
      if (!result.success) {
        setError(result.message);
        return null;
      }
      return result.pdf || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download invoice';
      setError(message);
      return null;
    } finally {
      setDownloading(false);
    }
  };

  const checkInvoiceForOrder = async (orderId: string) => {
    try {
      return await getInvoiceByOrderId(orderId);
    } catch (err) {
      console.error('Error checking invoice:', err);
      return null;
    }
  };

  return {
    generating,
    raising,
    downloading,
    error,
    generateInvoiceForOrder,
    generateBulkInvoices,
    raiseInvoiceById,
    raiseBulkInvoices,
    downloadInvoiceById,
    checkInvoiceForOrder,
  };
}
