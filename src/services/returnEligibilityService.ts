/**
 * Return Eligibility Service
 * Checks if an order is eligible for return based on business rules
 */

import { supabase } from '../config/supabase';
import type { ReturnEligibilityCheck } from '../types/return.types';

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  shipping_amount: number;
  discount_amount: number;
  subtotal: number;
  delivered_at: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_variant_id: string | null;
  variant_size: string | null;
  variant_color: string | null;
  variant_material: string | null;
  product_sku: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
}

interface ReturnSettings {
  return_enabled: boolean;
  return_window_days: number;
  min_order_amount: number;
  exclude_services: boolean;
}

class ReturnEligibilityService {
  /**
   * Check if an order is eligible for return
   */
  async checkOrderEligibility(orderId: string): Promise<ReturnEligibilityCheck> {
    try {
      // Fetch return settings
      const settings = await this.getReturnSettings();

      // Check if returns are globally enabled
      if (!settings.return_enabled) {
        return {
          isEligible: false,
          reasons: ['Return functionality is currently disabled'],
          eligibleItems: [],
          ineligibleItems: [],
          daysRemaining: 0,
        };
      }

      // Fetch order with items and product details
      const order = await this.getOrderWithItems(orderId);

      if (!order) {
        return {
          isEligible: false,
          reasons: ['Order not found'],
          eligibleItems: [],
          ineligibleItems: [],
          daysRemaining: 0,
        };
      }

      // Check order-level eligibility
      const orderChecks = this.checkOrderLevelEligibility(order, settings);

      if (!orderChecks.eligible) {
        return {
          isEligible: false,
          reasons: orderChecks.reasons,
          eligibleItems: [],
          ineligibleItems: order.order_items || [],
          daysRemaining: orderChecks.daysRemaining,
        };
      }

      // Check if order already has an active return request
      const hasActiveReturn = await this.hasActiveReturnRequest(orderId);

      if (hasActiveReturn) {
        return {
          isEligible: false,
          reasons: ['Return request already exists for this order'],
          eligibleItems: [],
          ineligibleItems: order.order_items || [],
          daysRemaining: orderChecks.daysRemaining,
        };
      }

      // Separate eligible and ineligible items
      const itemEligibility = this.checkItemsEligibility(
        order.order_items || [],
        settings
      );

      // Order is eligible if at least one item is eligible
      const isEligible = itemEligibility.eligibleItems.length > 0;

      if (!isEligible) {
        return {
          isEligible: false,
          reasons: ['No eligible items for return (all items are services or excluded)'],
          eligibleItems: [],
          ineligibleItems: itemEligibility.ineligibleItems,
          daysRemaining: orderChecks.daysRemaining,
        };
      }

      return {
        isEligible: true,
        reasons: [],
        eligibleItems: itemEligibility.eligibleItems,
        ineligibleItems: itemEligibility.ineligibleItems,
        daysRemaining: orderChecks.daysRemaining,
      };
    } catch (error) {
      console.error('Error checking return eligibility:', error);
      return {
        isEligible: false,
        reasons: ['Error checking eligibility. Please try again.'],
        eligibleItems: [],
        ineligibleItems: [],
        daysRemaining: 0,
      };
    }
  }

  /**
   * Get return settings from database
   */
  private async getReturnSettings(): Promise<ReturnSettings> {
    const { data: settingsData, error } = await supabase
      .from('settings')
      .select('key, value')
      .eq('category', 'returns')
      .in('key', [
        'return_enabled',
        'return_window_days',
        'min_order_amount',
        'exclude_services',
      ]);

    if (error) {
      console.error('Error fetching return settings:', error);
      // Return default settings - 2 days window, services excluded via variant_size
      return {
        return_enabled: true,
        return_window_days: 2,
        min_order_amount: 0,
        exclude_services: true,
      };
    }

    // Convert array to object
    const settingsMap: Record<string, string> = {};
    settingsData?.forEach((setting) => {
      const key = setting.key as string;
      const value = setting.value as string;
      settingsMap[key] = value;
    });

    return {
      return_enabled: settingsMap['return_enabled'] === 'true',
      return_window_days: parseInt(settingsMap['return_window_days'] || '2', 10),
      min_order_amount: parseFloat(settingsMap['min_order_amount'] || '0'),
      exclude_services: settingsMap['exclude_services'] !== 'false',
    };
  }

  /**
   * Fetch order with items and product details
   */
  private async getOrderWithItems(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        customer_id,
        status,
        payment_status,
        total_amount,
        shipping_amount,
        discount_amount,
        subtotal,
        delivered_at,
        created_at,
        order_items (
          id,
          order_id,
          product_id,
          product_name,
          product_variant_id,
          variant_size,
          variant_color,
          variant_material,
          product_sku,
          unit_price,
          quantity,
          total_price
        )
      `
      )
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    return data as unknown as Order;
  }

  /**
   * Check order-level eligibility rules
   */
  private checkOrderLevelEligibility(
    order: Order,
    settings: ReturnSettings
  ): { eligible: boolean; reasons: string[]; daysRemaining: number } {
    const reasons: string[] = [];
    let daysRemaining = 0;

    // 1. Order must be delivered
    if (order.status !== 'delivered') {
      reasons.push('Order must be delivered before requesting a return');
      return { eligible: false, reasons, daysRemaining };
    }

    // 2. Must have delivered_at date
    if (!order.delivered_at) {
      reasons.push('Delivery date not available');
      return { eligible: false, reasons, daysRemaining };
    }

    // 3. Check return window
    const deliveryDate = new Date(order.delivered_at);
    const today = new Date();
    const daysSinceDelivery = this.daysBetween(today, deliveryDate);
    daysRemaining = settings.return_window_days - daysSinceDelivery;

    if (daysSinceDelivery > settings.return_window_days) {
      reasons.push(
        `Return window expired. Returns are allowed within ${settings.return_window_days} days of delivery.`
      );
      return { eligible: false, reasons, daysRemaining: 0 };
    }

    // 4. Check minimum order amount
    if (order.total_amount < settings.min_order_amount) {
      reasons.push(
        `Order amount must be at least ₹${settings.min_order_amount} for returns`
      );
      return { eligible: false, reasons, daysRemaining };
    }

    // 5. Payment must be successful
    if (order.payment_status !== 'paid') {
      reasons.push('Payment must be completed before requesting a return');
      return { eligible: false, reasons, daysRemaining };
    }

    return { eligible: true, reasons: [], daysRemaining };
  }

  /**
   * Check if order has an active return request
   */
  private async hasActiveReturnRequest(orderId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('return_requests')
      .select('id')
      .eq('order_id', orderId)
      .not('status', 'in', '(refund_completed,rejected)')
      .limit(1);

    if (error) {
      console.error('Error checking active returns:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  }

  /**
   * Check items eligibility (separate products from services)
   */
  private checkItemsEligibility(
    items: OrderItem[],
    settings: ReturnSettings
  ): { eligibleItems: OrderItem[]; ineligibleItems: OrderItem[] } {
    const eligibleItems: OrderItem[] = [];
    const ineligibleItems: OrderItem[] = [];

    items.forEach((item) => {
      const isService = this.isServiceItem(item, settings);

      if (isService && settings.exclude_services) {
        ineligibleItems.push(item);
      } else {
        eligibleItems.push(item);
      }
    });

    return { eligibleItems, ineligibleItems };
  }

  /**
   * Check if an item is a service
   * Services are identified by variant_size = "Service" or "Custom"
   */
  private isServiceItem(item: OrderItem, _settings: ReturnSettings): boolean {
    // Check variant_size field for service indicators
    if (item.variant_size) {
      const variantSize = item.variant_size.toLowerCase().trim();
      if (variantSize === 'service' || variantSize === 'custom') {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate days between two dates
   */
  private daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date1.getTime() - date2.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get days remaining in return window
   */
  async getDaysRemaining(orderId: string): Promise<number> {
    try {
      const settings = await this.getReturnSettings();
      const order = await this.getOrderWithItems(orderId);

      if (!order || !order.delivered_at) {
        return 0;
      }

      const deliveryDate = new Date(order.delivered_at);
      const today = new Date();
      const daysSinceDelivery = this.daysBetween(today, deliveryDate);

      return Math.max(0, settings.return_window_days - daysSinceDelivery);
    } catch {
      return 0;
    }
  }

  /**
   * Check if specific items from an order are eligible
   */
  async checkItemsEligibilityForOrder(
    orderId: string,
    itemIds: string[]
  ): Promise<{ eligible: boolean; reasons: string[] }> {
    try {
      const eligibility = await this.checkOrderEligibility(orderId);

      if (!eligibility.isEligible) {
        return {
          eligible: false,
          reasons: eligibility.reasons,
        };
      }

      // Check if all requested items are in the eligible list
      const eligibleItemIds = eligibility.eligibleItems.map((item) => item.id);
      const allItemsEligible = itemIds.every((id) => eligibleItemIds.includes(id));

      if (!allItemsEligible) {
        return {
          eligible: false,
          reasons: ['One or more selected items are not eligible for return'],
        };
      }

      return {
        eligible: true,
        reasons: [],
      };
    } catch (error) {
      console.error('Error checking items eligibility:', error);
      return {
        eligible: false,
        reasons: ['Error checking items eligibility'],
      };
    }
  }
}

// Export singleton instance
export const returnEligibilityService = new ReturnEligibilityService();

// Export class for testing
export { ReturnEligibilityService };
