// Return and Refund Management - TypeScript Types
// Generated based on database schema verification

// =============================================================================
// ENUMS AND CONSTANTS
// =============================================================================

/**
 * Return request status values
 */
export type ReturnRequestStatus =
  | 'pending_shipment'      // Customer needs to ship product
  | 'shipped_by_customer'   // Customer marked as shipped
  | 'received'              // Package received at warehouse
  | 'under_inspection'      // Being inspected
  | 'approved'              // Full refund approved (after inspection)
  | 'partially_approved'    // Partial refund with deductions (after inspection)
  | 'rejected'              // Return rejected, no refund
  | 'refund_initiated'      // Razorpay refund started
  | 'refund_completed';     // Refund successfully processed

/**
 * Type of return request
 */
export type ReturnRequestType = 'return_refund' | 'return_exchange';

/**
 * Reason for return
 */
export type ReturnReason =
  | 'defective'
  | 'wrong_item'
  | 'size_issue'
  | 'not_as_described'
  | 'quality_issue'
  | 'color_mismatch'
  | 'changed_mind'
  | 'other';

/**
 * Inspection status result
 */
export type InspectionStatus = 'passed' | 'failed' | 'partial_pass';

/**
 * Item condition upon return
 */
export type ItemCondition =
  | 'excellent'      // Like new (0% deduction)
  | 'good'          // Minor wear (5% deduction)
  | 'fair'          // Noticeable wear (15% deduction)
  | 'poor'          // Significant damage (30% deduction)
  | 'damaged'       // Severely damaged (50% deduction)
  | 'not_received'; // Item not in package (100% deduction)

/**
 * Refund transaction status
 */
export type RefundTransactionStatus =
  | 'pending'      // API call not yet made
  | 'initiated'    // API call made, waiting for confirmation
  | 'processed'    // Razorpay confirmed refund
  | 'failed';      // API call failed

/**
 * Role of person making change
 */
export type ChangeRole = 'customer' | 'admin' | 'system';

/**
 * Razorpay refund speed
 */
export type RazorpayRefundSpeed = 'normal' | 'optimum';

// Quality deduction rates by condition
export const QUALITY_DEDUCTION_RATES: Record<ItemCondition, number> = {
  excellent: 0,
  good: 5,
  fair: 15,
  poor: 30,
  damaged: 50,
  not_received: 100,
};

// =============================================================================
// DATABASE TABLE TYPES
// =============================================================================

/**
 * Return Request (Main Table)
 */
export interface ReturnRequest {
  id: string;
  order_id: string;
  customer_id: string; // References auth.users(id)
  
  // Request Details
  return_number: string;
  request_type: ReturnRequestType;
  reason: ReturnReason;
  reason_details: string;
  
  // Status Tracking
  status: ReturnRequestStatus;
  
  // Customer Shipping
  customer_shipped_date: string | null;
  customer_tracking_number: string | null;
  customer_courier_name: string | null;
  
  // Warehouse Receipt
  received_date: string | null;
  received_by: string | null; // References auth.users(id)
  received_notes: string | null;
  
  // Inspection
  inspection_date: string | null;
  inspection_status: InspectionStatus | null;
  inspection_notes: string | null;
  inspected_by: string | null; // References auth.users(id)
  
  // Approval/Rejection
  decision_date: string | null;
  decision_by: string | null; // References auth.users(id)
  decision_notes: string | null;
  rejection_reason: string | null;
  
  // Deductions
  deduction_amount: number;
  deduction_breakdown: DeductionBreakdown | null;
  
  // Financial
  original_order_amount: number;
  calculated_refund_amount: number | null;
  final_refund_amount: number | null;
  
  // Razorpay Refund
  razorpay_payment_id: string | null;
  razorpay_refund_id: string | null;
  razorpay_refund_status: string | null;
  refund_initiated_date: string | null;
  refund_completed_date: string | null;
  refund_failure_reason: string | null;
  
  // Exchange Details
  exchange_order_id: string | null;
  exchange_initiated_date: string | null;
  
  // Evidence
  customer_images: string[];
  customer_video_url: string | null;
  inspection_images: string[] | null;
  inspection_video_url: string | null;
  
  // Return Address
  return_address_line1: string;
  return_address_line2: string | null;
  return_address_city: string;
  return_address_state: string;
  return_address_postal_code: string;
  return_address_country: string;
  return_address_phone: string | null;
  
  // Metadata
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Return Item
 */
export interface ReturnItem {
  id: string;
  return_request_id: string;
  order_item_id: string;
  
  // Item Details (snapshot from order)
  product_id: string;
  product_name: string;
  product_variant_id: string | null;
  variant_size: string | null;
  variant_color: string | null;
  variant_material: string | null;
  product_sku: string | null;
  quantity: number;
  
  // Pricing
  unit_price: number;
  total_price: number;
  
  // Inspection Results
  received_quantity: number | null;
  condition_on_return: ItemCondition | null;
  condition_notes: string | null;
  item_deduction_amount: number;
  item_deduction_percentage: number;
  item_deduction_reason: string | null;
  
  // Restocking
  is_resaleable: boolean;
  restocked: boolean;
  restocked_date: string | null;
  restocked_quantity: number | null;
  restocked_by: string | null; // References auth.users(id)
  
  // Exchange Item
  exchange_product_id: string | null;
  exchange_variant_id: string | null;
  exchange_product_name: string | null;
  exchange_variant_size: string | null;
  exchange_variant_color: string | null;
  exchange_variant_material: string | null;
  exchange_quantity: number | null;
  exchange_unit_price: number | null;
  price_difference: number | null;
  
  created_at: string;
}

/**
 * Return Status History (Audit Trail)
 */
export interface ReturnStatusHistory {
  id: string;
  return_request_id: string;
  
  from_status: ReturnRequestStatus | null;
  to_status: ReturnRequestStatus;
  
  changed_by: string | null; // References auth.users(id)
  changed_by_role: ChangeRole | null;
  
  notes: string | null;
  metadata: Record<string, any> | null;
  
  created_at: string;
}

/**
 * Razorpay Refund Transaction
 */
export interface RazorpayRefundTransaction {
  id: string;
  return_request_id: string;
  order_id: string;
  
  // Transaction Details
  transaction_number: string;
  refund_amount: number;
  
  // Razorpay Details
  razorpay_payment_id: string;
  razorpay_refund_id: string | null;
  razorpay_order_id: string | null;
  
  // Status
  status: RefundTransactionStatus;
  
  // API Response
  razorpay_response: Record<string, any> | null;
  razorpay_speed: RazorpayRefundSpeed | null;
  razorpay_status: string | null;
  
  // Timeline
  initiated_at: string | null;
  processed_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  
  // Admin
  initiated_by: string | null; // References auth.users(id)
  
  // Breakdown
  original_amount: number;
  deduction_amount: number;
  deduction_details: DeductionDetails | null;
  
  // Metadata
  notes: string | null;
  created_at: string;
}

// =============================================================================
// JOINED/EXTENDED TYPES
// =============================================================================

/**
 * Return Request with Items (for details view)
 */
export interface ReturnRequestWithItems extends ReturnRequest {
  return_items: ReturnItem[];
  order_number?: string; // Direct access to order number
  order?: {
    order_number: string;
    total_amount: number;
    shipping_amount: number;
    discount_amount: number;
    subtotal: number;
  };
  // Customer data joined from customers table
  customer_first_name?: string;
  customer_last_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

/**
 * Return Request with History (for timeline view)
 */
export interface ReturnRequestWithHistory extends ReturnRequest {
  return_status_history: ReturnStatusHistory[];
}

/**
 * Complete Return Request (all relations)
 */
export interface ReturnRequestComplete extends ReturnRequest {
  return_items: ReturnItem[];
  return_status_history: ReturnStatusHistory[];
  refund_transactions: RazorpayRefundTransaction[];
  order?: any; // Full order object if needed
}

// =============================================================================
// INPUT/FORM TYPES
// =============================================================================

/**
 * Create Return Request Input
 */
export interface CreateReturnRequestInput {
  order_id: string;
  customer_id: string; // From auth user
  request_type: ReturnRequestType;
  return_reason: ReturnReason; // Changed from reason to match DB
  reason_description: string; // Changed from reason_details to match DB
  pickup_address: string; // Return shipping address
  customer_images: string[]; // Image URLs after upload
  customer_video_url?: string;
  items: CreateReturnItemInput[];
}

/**
 * Create Return Item Input
 */
export interface CreateReturnItemInput {
  order_item_id: string;
  product_id: string;
  product_name: string;
  product_variant_id?: string;
  variant_size?: string;
  variant_color?: string;
  variant_material?: string;
  product_sku?: string;
  quantity_ordered: number; // Changed from quantity
  quantity_to_return: number; // How many to return
  unit_price: number;
  total_price: number;
  customer_notes?: string;
  image_urls?: string[];
  
  // For exchanges
  exchange_product_id?: string;
  exchange_variant_id?: string;
  exchange_product_name?: string;
  exchange_variant_size?: string;
  exchange_variant_color?: string;
  exchange_variant_material?: string;
  exchange_quantity?: number;
  exchange_unit_price?: number;
  price_difference?: number;
}

/**
 * Update Tracking Info Input
 */
export interface UpdateTrackingInfoInput {
  customer_tracking_number: string;
  customer_courier_name: string;
  customer_shipped_date?: string;
}

/**
 * Inspection Result Input (per item)
 */
export interface InspectionResultInput {
  item_id: string; // return_item_id
  item_condition: ItemCondition;
  inspection_notes?: string;
  quality_issue_description?: string;
  deduction_percentage: number;
  deduction_amount: number;
  approved_return_amount: number;
  inspection_image_urls?: string[];
}

/**
 * Complete Inspection Input
 */
export interface CompleteInspectionInput {
  return_request_id: string;
  inspection_results: InspectionResultInput[];
  inspection_notes?: string;
  inspected_by: string; // admin user ID
  overall_status: 'approved' | 'partially_approved' | 'rejected';
}

// =============================================================================
// HELPER/UTILITY TYPES
// =============================================================================

/**
 * Deduction Item Detail
 */
export interface DeductionItem {
  itemId: string;
  itemName: string;
  condition: ItemCondition | 'discount';
  deductionPercentage: number;
  deductionAmount: number;
  reason: string;
}

/**
 * Deduction Breakdown (stored in JSONB)
 */
export interface DeductionBreakdown {
  items: DeductionItem[];
}

/**
 * Deduction Details (for refund transaction)
 */
export interface DeductionDetails {
  items: DeductionItem[];
  totalDeduction: number;
}

/**
 * Refund Calculation Result
 */
export interface RefundCalculation {
  originalAmount: number;
  deductionAmount: number;
  deductionBreakdown: DeductionItem[];
  shippingRefund: number;
  finalRefundAmount: number;
  refundAmountInPaise: number; // For Razorpay API
}

/**
 * Return Eligibility Check Result
 */
export interface ReturnEligibilityCheck {
  isEligible: boolean;
  reasons: string[];
  eligibleItems: any[]; // OrderItem[]
  ineligibleItems: any[]; // OrderItem[]
  daysRemaining: number;
}

/**
 * Return Settings (from database)
 */
export interface ReturnSettings {
  return_enabled: boolean;
  return_window_days: number;
  exchange_enabled: boolean;
  min_order_amount: number;
  exclude_services: boolean;
  service_category_ids: string[];
  service_category_slugs: string[];
  exclude_final_sale: boolean;
  require_images: boolean;
  min_images_required: number;
  max_images_allowed: number;
  allow_video: boolean;
  max_video_size_mb: number;
  return_address_line1: string;
  return_address_line2: string;
  return_address_city: string;
  return_address_state: string;
  return_address_postal_code: string;
  return_address_country: string;
  return_address_phone: string;
  auto_approve_enabled: boolean;
  auto_approve_max_amount: number;
  inspection_required_days: number;
  refund_processing_days: number;
  restocking_fee_enabled: boolean;
  restocking_fee_percentage: number;
  quality_deduction_rates: Record<ItemCondition, number>;
  return_reasons: ReturnReason[];
  notify_customer_on_approval: boolean;
  notify_customer_on_receipt: boolean;
  notify_customer_on_inspection: boolean;
  notify_customer_on_refund: boolean;
  notify_admin_new_return: boolean;
  notify_admin_shipped: boolean;
  razorpay_refund_speed: RazorpayRefundSpeed;
  razorpay_auto_refund: boolean;
  auto_restock_enabled: boolean;
  restock_conditions: ItemCondition[];
}

/**
 * Return Analytics Data
 */
export interface ReturnAnalytics {
  totalReturns: number;
  pendingApproval: number;
  underInspection: number;
  refunded: number;
  rejected: number;
  returnRate: number;
  averageProcessingTime: number;
  totalRefundAmount: number;
  topReturnReasons: Array<{
    reason: ReturnReason;
    count: number;
    percentage: number;
  }>;
  inspectionPassRate: number;
  productReturnRates: Array<{
    productId: string;
    productName: string;
    returnCount: number;
    returnRate: number;
  }>;
}

/**
 * Return Status Timeline Item (for UI)
 */
export interface ReturnTimelineItem {
  status: ReturnRequestStatus;
  label: string;
  date: string | null;
  completed: boolean;
  active: boolean;
  notes?: string;
  icon?: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Generic API Response
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Return Request List Response
 */
export type ReturnRequestListResponse = PaginatedResponse<ReturnRequest>;

/**
 * Return Request Details Response
 */
export type ReturnRequestDetailsResponse = ApiResponse<ReturnRequestWithItems>;

/**
 * Refund Initiation Response
 */
export interface RefundInitiationResponse {
  success: boolean;
  refundId?: string;
  transactionNumber?: string;
  razorpayResponse?: any;
  error?: string;
}

// =============================================================================
// FILTER/QUERY TYPES
// =============================================================================

/**
 * Return Request Filters (for admin dashboard)
 */
export interface ReturnRequestFilters {
  status?: ReturnRequestStatus[];
  request_type?: ReturnRequestType[];
  reason?: ReturnReason[];
  customer_id?: string;
  order_id?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string; // Search by return_number, order_number, customer name
}

/**
 * Return Request Sort Options
 */
export interface ReturnRequestSort {
  field: keyof ReturnRequest;
  order: 'asc' | 'desc';
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

/**
 * Validation Error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Return Request Validation Result
 */
export interface ReturnRequestValidation {
  valid: boolean;
  errors: ValidationError[];
}
