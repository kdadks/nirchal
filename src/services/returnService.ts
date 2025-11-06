/**
 * Return Service
 * Handles CRUD operations for return requests and items
 */

import { supabase } from '../config/supabase';
import { returnEmailService } from './returnEmailService';
import type {
  ReturnRequest,
  ReturnItem,
  CreateReturnRequestInput,
  ReturnRequestWithItems,
  ReturnRequestComplete,
  CompleteInspectionInput,
  UpdateTrackingInfoInput,
  ReturnRequestStatus,
  ItemCondition,
  RefundCalculation,
} from '../types/return.types';

class ReturnService {
  // Use regular supabase client - RLS policies allow all operations
  private get db() {
    return supabase;
  }

  /**
   * Create a new return request
   */
  async createReturnRequest(
    input: CreateReturnRequestInput
  ): Promise<{ data: ReturnRequestWithItems | null; error: Error | null }> {
    try {
      // Generate unique return number
      const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Fetch the actual order total amount
      const { data: orderData, error: orderError } = await this.db
        .from('orders')
        .select('total_amount')
        .eq('id', input.order_id)
        .single();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        return { data: null, error: new Error(orderError.message) };
      }

      const originalOrderAmount = orderData?.total_amount || 0;
      
      // 1. Create the return request
      const { data: returnRequest, error: requestError } = await this.db
        .from('return_requests')
        .insert({
          return_number: returnNumber,
          order_id: input.order_id,
          customer_id: input.customer_id,
          request_type: input.request_type,
          reason: input.return_reason,
          reason_details: input.reason_description,
          status: 'pending_shipment',
          customer_images: input.customer_images,
          customer_video_url: input.customer_video_url,
          return_address_line1: input.pickup_address,
          return_address_line2: '',
          return_address_city: '',
          return_address_state: '',
          return_address_postal_code: '',
          return_address_country: 'India',
          original_order_amount: originalOrderAmount,
        })
        .select()
        .single();

      if (requestError) {
        console.error('Error creating return request:', requestError);
        console.error('Request error details:', JSON.stringify(requestError, null, 2));
        console.error('Input data:', JSON.stringify(input, null, 2));
        return { data: null, error: new Error(requestError.message) };
      }

      // 2. Create return items
      const returnItems = input.items.map((item) => ({
        return_request_id: returnRequest.id,
        order_item_id: item.order_item_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_variant_id: item.product_variant_id,
        variant_size: item.variant_size,
        variant_color: item.variant_color,
        variant_material: item.variant_material,
        product_sku: item.product_sku,
        quantity: item.quantity_to_return, // Use 'quantity' as per schema
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity_to_return,
        // Note: customer_notes and image_urls are stored at request level, not item level
      }));

      const { data: items, error: itemsError } = await this.db
        .from('return_items')
        .insert(returnItems)
        .select();

      if (itemsError) {
        console.error('Error creating return items:', itemsError);
        // Rollback: delete the return request
        await this.db.from('return_requests').delete().eq('id', returnRequest.id as string);
        return { data: null, error: new Error(itemsError.message) };
      }

      // Send notification email to admin about new return request
      try {
        // Get admin email from settings
        const { data: storeSettings } = await this.db
          .from('settings')
          .select('value')
          .eq('category', 'shop')
          .eq('key', 'store_email')
          .single();

        const adminEmail = storeSettings?.value || 'support@nirchal.com';

        // Get customer details for email
        const { data: customerData } = await this.db
          .from('customers')
          .select('first_name, last_name, email, phone')
          .eq('id', input.customer_id)
          .single();

        const customerName = `${customerData?.first_name || ''} ${customerData?.last_name || ''}`.trim() || 'Customer';

        const adminEmailResponse = await fetch('/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: adminEmail,
            subject: `🔄 New Return Request - ${returnNumber}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                  🔄 New Return Request Submitted
                </h2>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #374151; margin-top: 0;">Return Details</h3>
                  <p><strong>Return Number:</strong> ${returnNumber}</p>
                  <p><strong>Order ID:</strong> ${input.order_id}</p>
                  <p><strong>Customer:</strong> ${customerName} (${customerData?.email || 'N/A'})</p>
                  <p><strong>Customer Phone:</strong> ${customerData?.phone || 'N/A'}</p>
                  <p><strong>Return Reason:</strong> ${input.return_reason}</p>
                  <p><strong>Description:</strong> ${input.reason_description}</p>
                  <p><strong>Items to Return:</strong> ${input.items.length} item(s)</p>
                  <p><strong>Pickup Address:</strong> ${input.pickup_address}</p>
                </div>

                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; color: #92400e;">
                    <strong>Action Required:</strong> Please review this return request in the admin dashboard and provide the return shipping address to the customer.
                  </p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.VITE_APP_URL || 'https://nirchal.com'}/admin/returns" 
                     style="background: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">
                    📋 Review in Admin Dashboard
                  </a>
                </div>

                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  This email was sent automatically by the Nirchal Returns System
                </p>
              </div>
            `,
            fromName: 'Nirchal Returns System'
          }),
        });
        
        if (!adminEmailResponse.ok) {
          const errorText = await adminEmailResponse.text();
          console.error('Failed to send admin notification email:', errorText);
        } else {
          console.log('Admin notification email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending admin notification email:', emailError);
        // Don't fail the return creation if email fails
      }

      return {
        data: {
          ...(returnRequest as unknown as ReturnRequest),
          return_items: items as unknown as ReturnItem[],
        },
        error: null,
      };
    } catch (error) {
      console.error('Error in createReturnRequest:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Error type:', typeof error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  /**
   * Get return request by ID with all related data
   */
  async getReturnRequestById(
    id: string,
    includeHistory = false
  ): Promise<{ data: ReturnRequestComplete | null; error: Error | null }> {
    try {
      let query = supabase.from('return_requests').select(
        `
          *,
          return_items (*)
        `
      );

      if (includeHistory) {
        query = supabase.from('return_requests').select(
          `
            *,
            return_items (*),
            return_status_history (
              id,
              return_request_id,
              from_status,
              to_status,
              changed_at,
              changed_by,
              changed_by_role,
              notes,
              metadata
            )
          `
        );
      }

      const { data, error } = await query.eq('id', id).single();

      if (error) {
        console.error('Error fetching return request:', error);
        return { data: null, error: new Error(error.message) };
      }

      return { data: data as unknown as ReturnRequestComplete, error: null };
    } catch (error) {
      console.error('Error in getReturnRequestById:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  /**
   * Get all return requests for a customer
   */
  async getReturnRequestsByCustomer(
    customerId: string,
    limit = 20,
    offset = 0
  ): Promise<{ data: ReturnRequestWithItems[]; error: Error | null; count: number }> {
    try {
      const { data, error, count } = await this.db
        .from('return_requests')
        .select(
          `
            *,
            return_items (*)
          `,
          { count: 'exact' }
        )
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching customer returns:', error);
        return { data: [], error: new Error(error.message), count: 0 };
      }

      // Fetch customer details
      const { data: customerData } = await this.db
        .from('customers')
        .select('id, first_name, last_name, email, phone')
        .eq('id', customerId)
        .single();

      // Add customer details to each return
      const returnsWithCustomerData = (data || []).map((ret: any) => ({
        ...ret,
        customer_first_name: customerData?.first_name,
        customer_last_name: customerData?.last_name,
        customer_email: customerData?.email,
        customer_phone: customerData?.phone,
      }));

      return {
        data: (returnsWithCustomerData as unknown as ReturnRequestWithItems[]) || [],
        error: null,
        count: count || 0,
      };
    } catch (error) {
      console.error('Error in getReturnRequestsByCustomer:', error);
      return {
        data: [],
        error: error instanceof Error ? error : new Error('Unknown error'),
        count: 0,
      };
    }
  }

  /**
   * Get all return requests (admin)
   */
  async getAllReturnRequests(
    filters?: {
      status?: ReturnRequestStatus;
      searchTerm?: string;
      dateFrom?: string;
      dateTo?: string;
    },
    limit = 50,
    offset = 0
  ): Promise<{ data: ReturnRequestWithItems[]; error: Error | null; count: number }> {
    try {
      let query = this.db
        .from('return_requests')
        .select(
          `
            *,
            return_items (*),
            orders!order_id (
              order_number
            )
          `,
          { count: 'exact' }
        );

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.searchTerm) {
        query = query.or(
          `return_number.ilike.%${filters.searchTerm}%`
        );
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('[ReturnService] Error fetching all returns:', error);
        return { data: [], error: new Error(error.message), count: 0 };
      }

      // Fetch customer data separately for each return and flatten order data
      const returnRequestsWithCustomers = await Promise.all(
        (data || []).map(async (returnRequest: any) => {
          const { data: customerData } = await this.db
            .from('customers')
            .select('first_name, last_name, email, phone')
            .eq('id', returnRequest.customer_id)
            .single();

          return {
            ...returnRequest,
            order_number: returnRequest.orders?.order_number || 'N/A',
            customer_first_name: customerData?.first_name || '',
            customer_last_name: customerData?.last_name || '',
            customer_email: customerData?.email || '',
            customer_phone: customerData?.phone || '',
            orders: undefined, // Remove nested object
          };
        })
      );

      return {
        data: (returnRequestsWithCustomers as unknown as ReturnRequestWithItems[]) || [],
        error: null,
        count: count || 0,
      };
    } catch (error) {
      console.error('Error in getAllReturnRequests:', error);
      return {
        data: [],
        error: error instanceof Error ? error : new Error('Unknown error'),
        count: 0,
      };
    }
  }

  /**
   * Update return request status
   */
  async updateReturnStatus(
    id: string,
    status: ReturnRequestStatus,
    notes?: string
  ): Promise<{ data: ReturnRequest | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('return_requests')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating return status:', error);
        return { data: null, error: new Error(error.message) };
      }

      // Add notes to status history if provided
      if (notes) {
        await this.db.from('return_status_history').insert({
          return_request_id: id,
          notes,
          metadata: { manual_note: true },
        });
      }

      return { data: data as unknown as ReturnRequest, error: null };
    } catch (error) {
      console.error('Error in updateReturnStatus:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  /**
   * Mark return as shipped by customer
   */
  async markAsShipped(
    id: string,
    trackingInfo: UpdateTrackingInfoInput
  ): Promise<{ data: ReturnRequest | null; error: Error | null }> {
    try {
      // Use admin client (bypasses RLS) - customer auth validation happens at UI level
      const { data, error } = await this.db
        .from('return_requests')
        .update({
          status: 'shipped_by_customer',
          customer_tracking_number: trackingInfo.customer_tracking_number,
          customer_courier_name: trackingInfo.customer_courier_name,
          customer_shipped_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error marking as shipped:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        return { data: null, error: new Error(error.message || 'Failed to mark return as shipped') };
      }

      return { data: data as unknown as ReturnRequest, error: null };
    } catch (error) {
      console.error('Error in markAsShipped:', error);
      console.error('Error type:', typeof error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred while marking as shipped'),
      };
    }
  }

  /**
   * Mark return as received (admin)
   */
  async markAsReceived(
    id: string,
    receivedBy: string
  ): Promise<{ data: ReturnRequest | null; error: Error | null }> {
    try {
      const { data, error } = await this.db
        .from('return_requests')
        .update({
          status: 'received',
          received_date: new Date().toISOString(),
          received_by: receivedBy,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error marking as received:', error);
        return { data: null, error: new Error(error.message) };
      }

      // Automatically send return received confirmation email
      try {
        const returnWithItems = await this.getReturnRequestById(id);
        if (returnWithItems.data) {
          const success = await returnEmailService.sendReturnStatusChangeEmail(
            returnWithItems.data as any,
            'received',
            {
              receivedBy,
              receivedDate: new Date().toLocaleDateString()
            }
          );
          
          if (!success) {
            console.error('Failed to send return received email');
          }
        }
      } catch (emailError) {
        console.error('Error sending return received email:', emailError);
        // Don't fail the status update if email fails
      }

      return { data: data as unknown as ReturnRequest, error: null };
    } catch (error) {
      console.error('Error in markAsReceived:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  /**
   * Complete inspection and update item conditions
   */
  async completeInspection(
    input: CompleteInspectionInput
  ): Promise<{ data: ReturnRequestWithItems | null; error: Error | null }> {
    try {
      // Update each item with inspection results
      const itemUpdates = input.inspection_results.map((result) =>
        this.db
          .from('return_items')
          .update({
            condition_on_return: result.item_condition,
            condition_notes: result.inspection_notes,
            item_deduction_percentage: result.deduction_percentage,
            item_deduction_amount: result.deduction_amount,
            item_deduction_reason: result.quality_issue_description,
          })
          .eq('id', result.item_id)
      );

      const results = await Promise.all(itemUpdates);

      const hasError = results.some((r) => r.error);
      if (hasError) {
        console.error('Error updating items during inspection');
        const errorDetails = results.filter(r => r.error).map(r => r.error);
        console.error('Item update errors:', JSON.stringify(errorDetails, null, 2));
        return { data: null, error: new Error('Failed to update inspection results') };
      }

      // Calculate total refund amount
      const totalApprovedAmount = input.inspection_results.reduce(
        (sum, item) => sum + item.approved_return_amount,
        0
      );

      const totalDeductionAmount = input.inspection_results.reduce(
        (sum, item) => sum + item.deduction_amount,
        0
      );

      // Determine approval status based on items
      const allApproved = input.inspection_results.every(
        (item) => item.item_condition === 'excellent' || item.item_condition === 'good'
      );
      const allRejected = input.inspection_results.every(
        (item) => item.item_condition === 'not_received'
      );
      const hasDeductions = totalDeductionAmount > 0;

      let newStatus: ReturnRequestStatus;
      let inspectionStatus: 'passed' | 'failed' | 'partial_pass';
      
      if (allRejected) {
        newStatus = 'rejected';
        inspectionStatus = 'failed';
      } else if (allApproved && !hasDeductions) {
        newStatus = 'approved';
        inspectionStatus = 'passed';
      } else {
        newStatus = 'partially_approved';
        inspectionStatus = 'partial_pass';
      }

      // Update return request with inspection details
      const { data, error } = await this.db
        .from('return_requests')
        .update({
          status: newStatus,
          inspection_status: inspectionStatus,
          inspection_notes: input.inspection_notes,
          inspection_date: new Date().toISOString(),
          inspected_by: input.inspected_by,
          calculated_refund_amount: totalApprovedAmount,
          deduction_amount: totalDeductionAmount,
          decision_date: new Date().toISOString(),
          decision_by: input.inspected_by,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.return_request_id)
        .select(
          `
            *,
            return_items (*)
          `
        )
        .single();

      if (error) {
        console.error('Error updating return request after inspection:', error);
        return { data: null, error: new Error(error.message) };
      }

      // ✅ RESTORE INVENTORY: For items that are received and approved/partially approved
      // Only restore inventory for items that are NOT rejected (not_received)
      if (newStatus !== 'rejected') {
        try {
          await this.restoreInventoryForReturn(input);
        } catch (inventoryError) {
          console.error('Error restoring inventory after inspection:', inventoryError);
          // Don't fail the inspection if inventory update fails
          // This can be manually adjusted later if needed
        }
      }

      // Automatically send inspection complete email
      try {
        const success = await returnEmailService.sendReturnStatusChangeEmail(
          data as any,
          newStatus,
          {
            inspectionDate: new Date().toLocaleDateString(),
            inspectorNotes: input.inspection_notes
          }
        );
        
        if (!success) {
          console.error('Failed to send inspection complete email');
        }
      } catch (emailError) {
        console.error('Error sending inspection complete email:', emailError);
        // Don't fail the inspection if email fails
      }

      return { data: data as unknown as ReturnRequestWithItems, error: null };
    } catch (error) {
      console.error('Error in completeInspection:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  /**
   * Cancel return request (customer)
   */
  async cancelReturnRequest(
    id: string,
    customerId: string,
    reason?: string
  ): Promise<{ data: ReturnRequest | null; error: Error | null }> {
    try {
      // Verify the return belongs to this customer and can be cancelled
      const { data: existingReturn, error: fetchError } = await supabase
        .from('return_requests')
        .select('id, status, customer_id')
        .eq('id', id)
        .single();

      if (fetchError || !existingReturn) {
        return { data: null, error: new Error('Return request not found') };
      }

      if (existingReturn.customer_id !== customerId) {
        return { data: null, error: new Error('Unauthorized') };
      }

      // Can only cancel if not yet received
      if (!['pending_shipment', 'shipped_by_customer'].includes(existingReturn.status as string)) {
        return {
          data: null,
          error: new Error('Return cannot be cancelled at this stage'),
        };
      }

      const { data, error } = await supabase
        .from('return_requests')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error cancelling return:', error);
        return { data: null, error: new Error(error.message) };
      }

      // Add cancellation note
      if (reason) {
        await this.db.from('return_status_history').insert({
          return_request_id: id,
          notes: `Cancelled by customer: ${reason}`,
          metadata: { cancelled_by: 'customer' },
        });
      }

      return { data: data as unknown as ReturnRequest, error: null };
    } catch (error) {
      console.error('Error in cancelReturnRequest:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  /**
   * Calculate refund amount based on inspection results
   */
  calculateRefundAmount(
    items: Array<{
      unit_price: number;
      quantity_to_return: number;
      item_condition: ItemCondition;
    }>
  ): RefundCalculation {
    let totalOriginalAmount = 0;
    let totalDeductionAmount = 0;
    let totalApprovedAmount = 0;

    items.forEach((item) => {
      const originalAmount = item.unit_price * item.quantity_to_return;
      
      const deductionPercentage = this.getDeductionPercentage(item.item_condition);
      const deductionAmount = (originalAmount * deductionPercentage) / 100;
      const approvedAmount = originalAmount - deductionAmount;

      totalOriginalAmount += originalAmount;
      totalDeductionAmount += deductionAmount;
      totalApprovedAmount += approvedAmount;
    });

    return {
      originalAmount: totalOriginalAmount,
      deductionAmount: totalDeductionAmount,
      deductionBreakdown: [],
      shippingRefund: 0,
      finalRefundAmount: totalApprovedAmount,
      refundAmountInPaise: totalApprovedAmount * 100,
    };
  }

  /**
   * Get deduction percentage for item condition
   */
  private getDeductionPercentage(condition: ItemCondition): number {
    const deductionRates: Record<ItemCondition, number> = {
      excellent: 0,
      good: 5,
      fair: 15,
      poor: 30,
      damaged: 50,
      not_received: 100,
    };

    return deductionRates[condition] || 0;
  }

  /**
   * Get return statistics (admin)
   */
  async getReturnStatistics(dateFrom?: string, dateTo?: string) {
    try {
      // Use regular supabase client - RLS allows all operations
      let query = this.db.from('return_requests').select('status, final_refund_amount, calculated_refund_amount');

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching statistics:', error);
        return null;
      }

      // Calculate total refund amount - ONLY count completed refunds (status = 'refund_completed')
      // This ensures only confirmed/successful refunds are included in the total
      const totalRefundAmount = data?.reduce((sum: number, r: any) => {
        // Only include refunds that are completed (webhook confirmed)
        if (r.status === 'refund_completed') {
          const amount = (r.final_refund_amount as number) || (r.calculated_refund_amount as number) || 0;
          return sum + amount;
        }
        return sum;
      }, 0) || 0;

      const stats = {
        total_returns: data?.length || 0,
        pending: data?.filter((r) => r.status === 'pending_shipment').length || 0,
        in_transit: data?.filter((r) => r.status === 'shipped_by_customer').length || 0,
        received: data?.filter((r) => r.status === 'received').length || 0,
        under_inspection: data?.filter((r) => r.status === 'under_inspection').length || 0,
        approved: data?.filter((r) => r.status === 'approved').length || 0,
        partially_approved: data?.filter((r) => r.status === 'partially_approved').length || 0,
        rejected: data?.filter((r) => r.status === 'rejected').length || 0,
        refund_initiated: data?.filter((r) => r.status === 'refund_initiated').length || 0,
        completed: data?.filter((r) => r.status === 'refund_completed').length || 0,
        total_refund_amount: totalRefundAmount,
      };

      return stats;
    } catch (error) {
      console.error('Error in getReturnStatistics:', error);
      return null;
    }
  }

  /**
   * Update return address (Admin only)
   */
  async updateReturnAddress(
    returnRequestId: string,
    addressData: {
      return_address_line1: string;
      return_address_line2: string;
      return_address_city: string;
      return_address_state: string;
      return_address_postal_code: string;
      return_address_country: string;
    }
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.db
        .from('return_requests')
        .update(addressData)
        .eq('id', returnRequestId);

      if (error) {
        console.error('Error updating return address:', error);
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in updateReturnAddress:', error);
      return { error: error as Error };
    }
  }

  /**
   * Restore inventory for approved/partially approved returns
   * Only restores inventory for items that were received (not_received = rejected)
   */
  private async restoreInventoryForReturn(input: CompleteInspectionInput): Promise<void> {
    // Get the return items with product details
    const { data: returnItems, error: itemsError } = await this.db
      .from('return_items')
      .select('id, product_id, product_variant_id, quantity')
      .in('id', input.inspection_results.map(r => r.item_id));

    if (itemsError || !returnItems) {
      console.error('Failed to fetch return items for inventory restoration:', itemsError);
      throw new Error('Failed to fetch return items');
    }

    // Process each item
    for (let i = 0; i < returnItems.length; i++) {
      const item = returnItems[i] as { id: string; product_id: string; product_variant_id: string | null; quantity: number };
      const inspectionResult = input.inspection_results[i];

      // Skip items that were not received (rejected)
      if (inspectionResult.item_condition === 'not_received') {
        continue;
      }

      try {
        // Find inventory record for this product/variant
        let inventoryQuery = this.db
          .from('inventory')
          .select('id, quantity')
          .eq('product_id', item.product_id);

        if (item.product_variant_id) {
          inventoryQuery = inventoryQuery.eq('variant_id', item.product_variant_id);
        } else {
          inventoryQuery = inventoryQuery.is('variant_id', null);
        }

        const { data: inventoryRecords, error: inventoryError } = await inventoryQuery;

        if (inventoryError || !inventoryRecords || inventoryRecords.length === 0) {
          console.warn(`No inventory record found for product ${item.product_id}`);
          continue;
        }

        const inventoryRecord = inventoryRecords[0] as { id: string; quantity: number };
        const oldQuantity = inventoryRecord.quantity;
        const newQuantity = oldQuantity + item.quantity;

        // Update inventory quantity
        const { error: updateError } = await this.db
          .from('inventory')
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq('id', inventoryRecord.id);

        if (updateError) {
          console.error(`Failed to restore inventory for product ${item.product_id}:`, updateError);
          continue;
        }

        // Create inventory history record
        await this.db.from('inventory_history').insert({
          inventory_id: inventoryRecord.id,
          previous_quantity: oldQuantity,
          new_quantity: newQuantity,
          change_type: 'STOCK_IN',
          reason: `Return ${input.return_request_id} - Items Received (${inspectionResult.item_condition})`,
          created_by: input.inspected_by,
          created_at: new Date().toISOString()
        });
      } catch (itemError) {
        console.error(`Error restoring inventory for item ${item.id}:`, itemError);
        // Continue with other items even if one fails
      }
    }
  }

  /**
   * Delete a return request (Admin only)
   */
  async deleteReturnRequest(returnRequestId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.db
        .from('return_requests')
        .delete()
        .eq('id', returnRequestId);

      if (error) {
        console.error('Error deleting return request:', error);
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in deleteReturnRequest:', error);
      return { error: error as Error };
    }
  }
}

// Export singleton instance
export const returnService = new ReturnService();

// Export class for testing
export { ReturnService };
