// Return and Refund Management - Type Exports
// Central export point for all return/refund related types

// Re-export all return types
export * from './return.types';

// Re-export all Razorpay refund types
export * from './razorpay-refund.types';

// Type guards and utility functions
import type {
  ReturnRequestStatus,
  ItemCondition,
  ReturnReason,
} from './return.types';

/**
 * Check if return request is in a final state
 */
export function isReturnFinalState(status: ReturnRequestStatus): boolean {
  return ['refund_completed', 'rejected'].includes(status);
}

/**
 * Check if return request can be cancelled by customer
 */
export function canCustomerCancelReturn(status: ReturnRequestStatus): boolean {
  return ['pending_shipment', 'shipped_by_customer'].includes(status);
}

/**
 * Check if return request is awaiting admin action
 */
export function isAwaitingAdminAction(status: ReturnRequestStatus): boolean {
  return ['received', 'under_inspection'].includes(status);
}

/**
 * Check if return request is awaiting customer action
 */
export function isAwaitingCustomerAction(status: ReturnRequestStatus): boolean {
  return status === 'pending_shipment';
}

/**
 * Check if item condition requires deduction
 */
export function requiresDeduction(condition: ItemCondition): boolean {
  return condition !== 'excellent';
}

/**
 * Get deduction percentage for condition
 */
export function getDeductionPercentage(condition: ItemCondition): number {
  const rates: Record<ItemCondition, number> = {
    excellent: 0,
    good: 5,
    fair: 15,
    poor: 30,
    damaged: 50,
    not_received: 100,
  };
  return rates[condition];
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: ReturnRequestStatus): string {
  const labels: Record<ReturnRequestStatus, string> = {
    pending_shipment: 'Pending Shipment',
    shipped_by_customer: 'Shipped by Customer',
    received: 'Received at Warehouse',
    under_inspection: 'Under Inspection',
    approved: 'Approved - Full Refund',
    partially_approved: 'Approved - Partial Refund',
    rejected: 'Rejected',
    refund_initiated: 'Refund Initiated',
    refund_completed: 'Refund Completed',
  };
  return labels[status] || status;
}

/**
 * Get human-readable reason label
 */
export function getReasonLabel(reason: ReturnReason): string {
  const labels: Record<ReturnReason, string> = {
    defective: 'Defective/Damaged Product',
    wrong_item: 'Wrong Item Received',
    size_issue: 'Size/Fit Issue',
    not_as_described: 'Not as Described',
    quality_issue: 'Quality Issue',
    color_mismatch: 'Color Mismatch',
    changed_mind: 'Changed Mind',
    other: 'Other',
  };
  return labels[reason] || reason;
}

/**
 * Get human-readable condition label
 */
export function getConditionLabel(condition: ItemCondition): string {
  const labels: Record<ItemCondition, string> = {
    excellent: 'Excellent - Like New',
    good: 'Good - Minor Wear',
    fair: 'Fair - Noticeable Wear',
    poor: 'Poor - Significant Damage',
    damaged: 'Damaged - Severely Damaged',
    not_received: 'Not Received',
  };
  return labels[condition] || condition;
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: ReturnRequestStatus): string {
  const colors: Record<ReturnRequestStatus, string> = {
    pending_shipment: 'yellow',
    shipped_by_customer: 'blue',
    received: 'purple',
    under_inspection: 'purple',
    approved: 'green',
    partially_approved: 'orange',
    rejected: 'red',
    refund_initiated: 'blue',
    refund_completed: 'green',
  };
  return colors[status] || 'gray';
}

/**
 * Type guard: Check if value is a valid ReturnRequestStatus
 */
export function isReturnRequestStatus(value: any): value is ReturnRequestStatus {
  return [
    'pending_shipment',
    'shipped_by_customer',
    'received',
    'under_inspection',
    'approved',
    'partially_approved',
    'rejected',
    'refund_initiated',
    'refund_completed',
  ].includes(value);
}

/**
 * Type guard: Check if value is a valid ItemCondition
 */
export function isItemCondition(value: any): value is ItemCondition {
  return ['excellent', 'good', 'fair', 'poor', 'damaged', 'not_received'].includes(value);
}

/**
 * Type guard: Check if value is a valid ReturnReason
 */
export function isReturnReason(value: any): value is ReturnReason {
  return [
    'defective',
    'wrong_item',
    'size_issue',
    'not_as_described',
    'quality_issue',
    'color_mismatch',
    'other',
  ].includes(value);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert rupees to paise for Razorpay
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees from Razorpay
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate days between dates
 */
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is within return window
 */
export function isWithinReturnWindow(deliveryDate: string | Date, windowDays: number): boolean {
  const today = new Date();
  const delivered = new Date(deliveryDate);
  const daysSince = daysBetween(today, delivered);
  return daysSince <= windowDays;
}
