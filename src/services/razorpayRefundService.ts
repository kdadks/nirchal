/**
 * Razorpay Refund Service
 * 
 * This service handles automatic refund processing via Razorpay API
 * for approved return requests.
 * 
 * Features:
 * - Create full or partial refunds
 * - Check refund status
 * - Handle refund webhooks
 * - Update database with refund details
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import type { RazorpayRefundResponse } from '../types/razorpay-refund.types';

// Refund status type based on database schema
type RefundStatus = 'pending' | 'initiated' | 'processed' | 'failed';

// Database transaction type based on schema
interface RazorpayRefundTransaction {
  id: string;
  return_request_id: string;
  order_id: string;
  transaction_number: string;
  refund_amount: number;
  razorpay_payment_id: string;
  razorpay_refund_id: string | null;
  razorpay_order_id: string | null;
  status: RefundStatus;
  razorpay_response: any;
  razorpay_speed: string | null;
  razorpay_status: string | null;
  initiated_at: string | null;
  processed_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  initiated_by: string | null;
  original_amount: number;
  deduction_amount: number;
  deduction_details: any;
  notes: string | null;
  created_at: string;
}

interface CreateRefundParams {
  returnRequestId: string;
  paymentId: string;
  amount: number; // Amount in rupees
  notes?: Record<string, string>;
}

interface RefundStatusResponse {
  status: RefundStatus;
  refundId?: string;
  amount?: number;
  createdAt?: string;
  error?: string;
}

/**
 * Get database client - use admin client to bypass RLS
 */
const getDbClient = () => supabaseAdmin || supabase;

/**
 * Create a refund via Razorpay API (called via serverless function)
 */
export async function createRefund(params: CreateRefundParams): Promise<{
  success: boolean;
  refundId?: string;
  transactionNumber?: string;
  error?: string;
}> {
  const { returnRequestId, paymentId, amount, notes } = params;

  try {
    console.log(`[Refund Service] Creating refund for return: ${returnRequestId}`);

    const db = getDbClient();

    // Get return request details with customer information for email
    const { data: returnRequest, error: fetchError } = await db
      .from('return_requests')
      .select(`
        *,
        return_items (*),
        customers!inner (first_name, last_name, email, phone)
      `)
      .eq('id', returnRequestId)
      .single();

    if (fetchError) throw fetchError;

    // Convert rupees to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    console.log(`[Refund Service] Initiating refund: ₹${amount} (${amountInPaise} paise)`);

    // Call serverless function to create refund
    const response = await fetch('/api/create-razorpay-refund', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_id: paymentId,
        amount: amountInPaise,
        notes: {
          return_request_id: returnRequestId,
          ...notes,
        },
      }),
    });

    console.log(`[Refund Service] Response status: ${response.status}`);

    // Get response text first
    const responseText = await response.text();
    console.log(`[Refund Service] Response text:`, responseText);

    // Parse JSON from text
    let data: RazorpayRefundResponse;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[Refund Service] Invalid JSON response:', responseText);
      throw new Error(`Invalid response from refund API: ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      const errorData = data as any;
      const errorMessage = errorData.error || 'Failed to create refund';
      
      // Provide user-friendly error messages for common issues
      if (errorMessage.includes('does not have enough balance')) {
        throw new Error('Insufficient balance in Razorpay account to process refund. Please add funds to your Razorpay account from the dashboard or contact support.');
      }
      
      throw new Error(errorMessage);
    }

    // Calculate deduction
    const originalAmount = (returnRequest.original_order_amount as number) || amount;
    const deductionAmount = originalAmount - amount;

    // Prepare customer data for email
    const customer = returnRequest.customers as any;
    const returnWithCustomer = {
      ...returnRequest,
      customer_first_name: customer?.first_name,
      customer_last_name: customer?.last_name,
      customer_email: customer?.email,
      customer_phone: customer?.phone,
    };

    // Get current user ID for initiated_by
    const { data: { user } } = await supabase.auth.getUser();

    // Save refund transaction to database (let DB generate transaction_number)
    const { data: transaction, error: dbError } = await db
      .from('razorpay_refund_transactions')
      .insert({
        return_request_id: returnRequestId,
        order_id: returnRequest.order_id,
        razorpay_payment_id: paymentId,
        razorpay_refund_id: data.id,
        razorpay_order_id: null, // Will be populated if available
        refund_amount: amount,
        status: (data.status === 'pending' ? 'initiated' : data.status) as RefundStatus,
        razorpay_response: data,
        razorpay_status: data.status,
        razorpay_speed: data.speed_requested || 'normal',
        initiated_at: new Date().toISOString(),
        processed_at: null,
        failed_at: null,
        failure_reason: null,
        initiated_by: user?.id || null,
        original_amount: originalAmount,
        deduction_amount: deductionAmount,
        deduction_details: null,
        notes: notes ? JSON.stringify(notes) : null,
      })
      .select('transaction_number')
      .single();

    if (dbError) {
      console.error('[Refund Service] Failed to save refund transaction:', dbError);
      console.error('[Refund Service] Error details:', {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint
      });
      // Don't throw error - refund was created, just log the DB error
    } else {
      console.log('[Refund Service] Successfully saved refund transaction:', transaction?.transaction_number);
    }

    // Update return request status
    const { error: updateError } = await db
      .from('return_requests')
      .update({
        status: 'refund_initiated',
        razorpay_refund_id: data.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', returnRequestId);

    if (updateError) {
      console.error('[Refund Service] Failed to update return request:', updateError);
    }

    // Add status history
    await db.from('return_status_history').insert({
      return_request_id: returnRequestId,
      status: 'refund_initiated',
      notes: `Refund initiated: ${transaction?.transaction_number || data.id}`,
      created_by: user?.id || null,
    });

    console.log(`[Refund Service] Refund created successfully: ${data.id}`);

    // Send email notification to customer (async, don't wait)
    console.log('[Refund Service] Attempting to send refund initiated email');
    console.log('[Refund Service] Customer email:', returnWithCustomer.customer_email);
    console.log('[Refund Service] Customer name:', `${returnWithCustomer.customer_first_name} ${returnWithCustomer.customer_last_name}`);
    
    import('../services/returnEmailService').then(({ returnEmailService }) => {
      console.log('[Refund Service] Successfully loaded returnEmailService');
      returnEmailService.sendReturnStatusChangeEmail(
        returnWithCustomer as any, // Use properly formatted customer data
        'refund_initiated',
        {
          refundTransaction: transaction as any,
          refundDate: new Date().toLocaleDateString(),
        }
      ).then((success) => {
        if (success) {
          console.log('✅ [Refund Service] Email sending completed successfully');
        } else {
          console.error('❌ [Refund Service] Email sending failed');
        }
      }).catch(err => {
        console.error('❌ [Refund Service] Failed to send refund email:', err);
      });
    }).catch(err => {
      console.error('❌ [Refund Service] Failed to load return email service:', err);
    });

    return {
      success: true,
      refundId: data.id,
      transactionNumber: transaction?.transaction_number as string | undefined,
    };
  } catch (error) {
    console.error('[Refund Service] Error creating refund:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create refund',
    };
  }
}

/**
 * Get refund status from database
 */
export async function getRefundStatus(returnRequestId: string): Promise<RefundStatusResponse> {
  try {
    const db = getDbClient();
    const { data, error } = await db
      .from('razorpay_refund_transactions')
      .select('status, razorpay_refund_id, refund_amount, created_at')
      .eq('return_request_id', returnRequestId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No refund found
        return {
          status: 'pending',
          error: 'No refund transaction found',
        };
      }
      throw error;
    }

    return {
      status: data.status as RefundStatus,
      refundId: (data.razorpay_refund_id as string | null) || undefined,
      amount: data.refund_amount as number,
      createdAt: data.created_at as string,
    };
  } catch (error) {
    console.error('[Refund Service] Error getting refund status:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to get refund status',
    };
  }
}

/**
 * Check refund status from Razorpay API
 */
export async function checkRefundStatusFromRazorpay(
  paymentId: string,
  refundId: string
): Promise<RefundStatusResponse> {
  try {
    const response = await fetch(`/functions/check-razorpay-refund-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_id: paymentId,
        refund_id: refundId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check refund status');
    }

    const data = await response.json();

    return {
      status: data.status,
      refundId: data.id,
      amount: data.amount / 100, // Convert paise to rupees
      createdAt: new Date(data.created_at * 1000).toISOString(),
    };
  } catch (error) {
    console.error('[Refund Service] Error checking refund status:', error);
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to check refund status',
    };
  }
}

/**
 * Handle refund webhook from Razorpay
 * This should be called from the webhook handler
 */
export async function handleRefundWebhook(webhookData: {
  event: string;
  payload: {
    refund: {
      entity: {
        id: string;
        payment_id: string;
        amount: number;
        status: string;
        created_at: number;
        notes?: Record<string, string>;
      };
    };
  };
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { event, payload } = webhookData;
    const refund = payload.refund.entity;

    console.log(`[Refund Webhook] Received event: ${event} for refund: ${refund.id}`);

    // Get return request ID from notes
    const returnRequestId = refund.notes?.return_request_id;
    if (!returnRequestId) {
      console.error('[Refund Webhook] No return_request_id in refund notes');
      return {
        success: false,
        error: 'Missing return_request_id in refund notes',
      };
    }

    const db = getDbClient();

    // Update refund transaction status in database
    const { error: updateError } = await db
      .from('razorpay_refund_transactions')
      .update({
        status: refund.status as RefundStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_refund_id', refund.id);

    if (updateError) {
      console.error('[Refund Webhook] Failed to update refund transaction:', updateError);
      throw updateError;
    }

    // Update return request status based on refund status
    let returnStatus: string | undefined;
    if (refund.status === 'processed') {
      returnStatus = 'refund_completed';
    } else if (refund.status === 'failed') {
      returnStatus = 'approved'; // Reset to approved so admin can retry
    }

    if (returnStatus) {
      const { error: returnUpdateError } = await db
        .from('return_requests')
        .update({
          status: returnStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', returnRequestId);

      if (returnUpdateError) {
        console.error('[Refund Webhook] Failed to update return request:', returnUpdateError);
      }

      // Add status history entry
      await db.from('return_status_history').insert({
        return_request_id: returnRequestId,
        status: returnStatus,
        notes: `Refund ${refund.status} via webhook`,
        created_by: 'system', // System-generated update
      });

      // Send email notification when refund is completed
      if (returnStatus === 'refund_completed') {
        try {
          const { data: returnData } = await db
            .from('return_requests')
            .select(`
              *,
              return_items (*),
              customers!inner (first_name, last_name, email)
            `)
            .eq('id', returnRequestId)
            .single();

          if (returnData && returnData.customers) {
            const customer = returnData.customers as any;
            const returnWithCustomer = {
              ...returnData,
              customer_first_name: customer.first_name,
              customer_last_name: customer.last_name,
              customer_email: customer.email,
            };

            // Import and send email (async, don't wait)
            import('../services/returnEmailService').then(({ returnEmailService }) => {
              returnEmailService.sendReturnStatusChangeEmail(
                returnWithCustomer as any,
                'refund_completed',
                {
                  refundTransaction: {
                    refund_amount: refund.amount / 100, // Convert paise to rupees
                    transaction_number: refund.id,
                  } as any,
                  refundDate: new Date().toLocaleDateString(),
                }
              ).catch(err => console.error('Failed to send refund completion email:', err));
            }).catch(err => console.error('Failed to load return email service:', err));
          }
        } catch (emailError) {
          console.error('Error sending refund completion email:', emailError);
          // Don't fail the webhook if email fails
        }
      }
    }

    console.log(`[Refund Webhook] Successfully processed webhook for refund: ${refund.id}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('[Refund Webhook] Error handling webhook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to handle refund webhook',
    };
  }
}

/**
 * Get all refund transactions for a return request
 */
export async function getRefundTransactions(returnRequestId: string): Promise<{
  success: boolean;
  transactions?: RazorpayRefundTransaction[];
  error?: string;
}> {
  try {
    const db = getDbClient();
    const { data, error } = await db
      .from('razorpay_refund_transactions')
      .select('*')
      .eq('return_request_id', returnRequestId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      transactions: data as unknown as RazorpayRefundTransaction[],
    };
  } catch (error) {
    console.error('[Refund Service] Error getting refund transactions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get refund transactions',
    };
  }
}

/**
 * Retry failed refund
 */
export async function retryFailedRefund(returnRequestId: string): Promise<{
  success: boolean;
  refundId?: string;
  transactionNumber?: string;
  error?: string;
}> {
  try {
    const db = getDbClient();

    // Get return request details
    const { data: returnRequest, error: fetchError } = await db
      .from('return_requests')
      .select('final_refund_amount, razorpay_refund_id, order_id')
      .eq('id', returnRequestId)
      .single();

    if (fetchError) throw fetchError;

    const finalAmount = returnRequest.final_refund_amount as number;
    const orderId = returnRequest.order_id as string;
    const refundId = returnRequest.razorpay_refund_id as string | null;

    if (!finalAmount) {
      throw new Error('Final refund amount not set');
    }

    // Get order details to get payment ID
    const { data: order, error: orderError } = await db
      .from('orders')
      .select('razorpay_payment_id')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    const paymentId = order.razorpay_payment_id as string;

    if (!paymentId) {
      throw new Error('Payment ID not found for this return request');
    }

    // Create new refund
    return await createRefund({
      returnRequestId,
      paymentId,
      amount: finalAmount,
      notes: {
        retry: 'true',
        original_refund_id: refundId || '',
      },
    });
  } catch (error) {
    console.error('[Refund Service] Error retrying refund:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retry refund',
    };
  }
}
