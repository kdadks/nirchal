// Razorpay Refund Service Types
// Types for Razorpay API integration

// =============================================================================
// RAZORPAY API REQUEST TYPES
// =============================================================================

/**
 * Razorpay Refund Create Request
 */
export interface RazorpayRefundCreateRequest {
  amount: number; // Amount in paise (multiply by 100)
  speed?: 'normal' | 'optimum'; // Default: normal
  notes?: {
    return_request_id?: string;
    transaction_number?: string;
    reason?: string;
    [key: string]: string | undefined;
  };
  receipt?: string;
}

/**
 * Razorpay Refund Fetch Request
 */
export interface RazorpayRefundFetchRequest {
  payment_id: string;
  refund_id: string;
}

// =============================================================================
// RAZORPAY API RESPONSE TYPES
// =============================================================================

/**
 * Razorpay Refund Response (from API)
 */
export interface RazorpayRefundResponse {
  id: string; // Refund ID (e.g., rfnd_ABC123XYZ)
  entity: 'refund';
  amount: number; // Amount in paise
  currency: string; // e.g., 'INR'
  payment_id: string;
  notes: Record<string, string>;
  receipt: string | null;
  acquirer_data: {
    arn: string | null;
  };
  created_at: number; // Unix timestamp
  batch_id: string | null;
  status: 'pending' | 'processed' | 'failed';
  speed_processed: 'normal' | 'optimum';
  speed_requested: 'normal' | 'optimum';
}

/**
 * Razorpay Error Response
 */
export interface RazorpayError {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: Record<string, any>;
  };
}

/**
 * Razorpay Payment Details (for reference)
 */
export interface RazorpayPayment {
  id: string;
  entity: 'payment';
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  captured: boolean;
  email: string;
  contact: string;
  created_at: number;
}

// =============================================================================
// SERVICE TYPES
// =============================================================================

/**
 * Refund Service Request
 */
export interface RefundServiceRequest {
  returnRequestId: string;
  razorpayPaymentId: string;
  amount: number; // Amount in rupees (will be converted to paise)
  notes?: string;
}

/**
 * Refund Service Response
 */
export interface RefundServiceResponse {
  success: boolean;
  refundId?: string;
  transactionNumber?: string;
  razorpayResponse?: RazorpayRefundResponse;
  error?: string;
  errorDetails?: RazorpayError;
}

/**
 * Refund Status Check Response
 */
export interface RefundStatusCheckResponse {
  success: boolean;
  status?: 'pending' | 'processed' | 'failed';
  data?: RazorpayRefundResponse;
  error?: string;
}

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

/**
 * Razorpay Webhook Event
 */
export interface RazorpayWebhookEvent {
  entity: string;
  account_id: string;
  event: string; // e.g., 'refund.processed', 'refund.failed'
  contains: string[];
  payload: {
    refund: {
      entity: RazorpayRefundResponse;
    };
    payment?: {
      entity: RazorpayPayment;
    };
  };
  created_at: number;
}

/**
 * Webhook Handler Response
 */
export interface WebhookHandlerResponse {
  success: boolean;
  processed: boolean;
  error?: string;
}

// =============================================================================
// RAZORPAY CONFIG
// =============================================================================

/**
 * Razorpay Configuration
 */
export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
}

/**
 * Razorpay Instance Options
 */
export interface RazorpayOptions {
  key_id: string;
  key_secret: string;
}
