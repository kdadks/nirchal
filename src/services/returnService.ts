/**
 * Return Service
 * Handles CRUD operations for return requests and items
 */

import { supabase, supabaseAdmin } from '../config/supabase';
// Removed returnEmailService - emails are now manually triggered by admin
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
  // Use admin client to bypass RLS for return operations
  private get db() {
    return supabaseAdmin || supabase;
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
        console.error('Error fetching all returns:', error);
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

      // Manual email sending - admin will trigger via email button
      // No automatic email on status change

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

      // Manual email sending - admin will trigger via email button
      // No automatic email on inspection complete

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
      let query = supabase.from('return_requests').select('status, final_refund_amount');

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

      const stats = {
        total_returns: data?.length || 0,
        pending: data?.filter((r) => r.status === 'pending_shipment').length || 0,
        in_transit: data?.filter((r) => r.status === 'shipped_by_customer').length || 0,
        under_inspection: data?.filter((r) => r.status === 'under_inspection').length || 0,
        approved: data?.filter((r) => r.status === 'approved').length || 0,
        rejected: data?.filter((r) => r.status === 'rejected').length || 0,
        completed: data?.filter((r) => r.status === 'refund_completed').length || 0,
        total_refund_amount:
          data?.reduce((sum: number, r: any) => sum + ((r.final_refund_amount as number) || 0), 0) || 0,
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
