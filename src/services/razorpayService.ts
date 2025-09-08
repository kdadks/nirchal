import { supabase } from '../config/supabase';

// Types for Razorpay integration
interface RazorpayOrderOptions {
  amount: number; // in paise (1 INR = 100 paise)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

interface RazorpaySettings {
  key_id: string;
  key_secret: string;
  environment: 'test' | 'live';
  enabled: boolean;
  company_name: string;
  company_logo?: string;
  theme_color: string;
  currency: string;
  auto_capture: boolean;
  webhook_secret?: string;
  description: string;
  timeout: number;
}

interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface OrderCreationData {
  order_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  items: any[];
  billing_address: any;
  delivery_address: any;
}

class RazorpayService {
  private settings: RazorpaySettings | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Load Razorpay settings from database with caching
   */
  private async loadSettings(): Promise<RazorpaySettings> {
    const now = Date.now();
    
    // Check if cache is still valid
    if (this.settings && now < this.cacheExpiry) {
      return this.settings;
    }

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value, data_type')
        .eq('category', 'payment')
        .like('key', 'razorpay_%');

      if (error) {
        throw new Error(`Failed to load Razorpay settings: ${error.message}`);
      }

      // Convert array to object
      const settingsMap: { [key: string]: any } = {};
      data?.forEach(setting => {
        const key = setting.key.replace('razorpay_', '');
        let value = setting.value;
        
        // Convert based on data type
        if (setting.data_type === 'boolean') {
          value = value === 'true';
        } else if (setting.data_type === 'number') {
          value = parseInt(value, 10);
        }
        
        settingsMap[key] = value;
      });

      // Validate required settings
      if (!settingsMap.enabled) {
        throw new Error('Razorpay payment gateway is disabled');
      }

      const environment = settingsMap.environment as 'test' | 'live';
      const keyId = settingsMap.key_id;
      const keySecret = settingsMap.key_secret;

      if (!keyId || !keySecret) {
        throw new Error(`Razorpay ${environment} credentials not configured`);
      }

      this.settings = {
        key_id: keyId,
        key_secret: keySecret,
        environment,
        enabled: settingsMap.enabled,
        company_name: settingsMap.company_name || 'Nirchal',
        company_logo: settingsMap.company_logo,
        theme_color: settingsMap.theme_color || '#f59e0b',
        currency: settingsMap.currency || 'INR',
        auto_capture: settingsMap.auto_capture !== false,
        webhook_secret: settingsMap.webhook_secret,
        description: settingsMap.description || 'Payment for Nirchal order',
        timeout: settingsMap.timeout || 900
      };

      // Update cache
      this.cacheExpiry = now + this.CACHE_DURATION;

      return this.settings;
    } catch (error) {
      console.error('Error loading Razorpay settings:', error);
      throw error;
    }
  }

  /**
   * Create a Razorpay order
   */
  async createOrder(options: RazorpayOrderOptions): Promise<any> {
    const settings = await this.loadSettings();
    
    try {
      // For now, we'll use fetch to make the API call
      // In production, you might want to use the official Razorpay Node.js SDK
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${settings.key_id}:${settings.key_secret}`)}`
        },
        body: JSON.stringify({
          amount: options.amount,
          currency: options.currency,
          receipt: options.receipt,
          notes: options.notes || {},
          payment_capture: settings.auto_capture ? 1 : 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Razorpay API Error: ${errorData.error?.description || 'Unknown error'}`);
      }

      const order = await response.json();
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  /**
   * Verify payment signature
   */
  async verifyPayment(data: PaymentVerificationData): Promise<boolean> {
    const settings = await this.loadSettings();
    
    try {
      // Import crypto for signature verification
      const crypto = await import('crypto');
      
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
      
      // Create expected signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', settings.key_secret)
        .update(body.toString())
        .digest('hex');

      // Compare signatures
      return expectedSignature === razorpay_signature;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  /**
   * Get payment details from Razorpay
   */
  async getPaymentDetails(paymentId: string): Promise<any> {
    const settings = await this.loadSettings();
    
    try {
      const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${settings.key_id}:${settings.key_secret}`)}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Razorpay API Error: ${errorData.error?.description || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  }

  /**
   * Get order details from Razorpay
   */
  async getOrderDetails(orderId: string): Promise<any> {
    const settings = await this.loadSettings();
    
    try {
      const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
        headers: {
          'Authorization': `Basic ${btoa(`${settings.key_id}:${settings.key_secret}`)}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Razorpay API Error: ${errorData.error?.description || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  /**
   * Get checkout configuration for frontend
   */
  async getCheckoutConfig(orderId: string, customerEmail: string, customerPhone: string): Promise<any> {
    const settings = await this.loadSettings();
    
    return {
      key: settings.key_id,
      order_id: orderId,
      currency: settings.currency,
      name: settings.company_name,
      description: settings.description,
      image: settings.company_logo,
      prefill: {
        email: customerEmail,
        contact: customerPhone
      },
      theme: {
        color: settings.theme_color
      },
      timeout: settings.timeout,
      modal: {
        ondismiss: function() {
          // Payment dismissed by user - no logging needed in production
        }
      }
    };
  }

  /**
   * Process successful payment and update order
   */
  async processSuccessfulPayment(
    orderData: OrderCreationData,
    paymentData: PaymentVerificationData
  ): Promise<any> {
    try {
      // Verify payment signature first
      const isValid = await this.verifyPayment(paymentData);
      if (!isValid) {
        throw new Error('Invalid payment signature');
      }

      // Get payment details from Razorpay
      const paymentDetails = await this.getPaymentDetails(paymentData.razorpay_payment_id);
      
      // Update order in database with payment information
      const { data: updatedOrder, error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          payment_details: paymentDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderData.order_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update order: ${error.message}`);
      }

      return updatedOrder;
    } catch (error) {
      console.error('Error processing successful payment:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment
   */
  async processFailedPayment(orderId: string, errorDetails: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          payment_error: errorDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        throw new Error(`Failed to update order: ${error.message}`);
      }
    } catch (error) {
      console.error('Error processing failed payment:', error);
      throw error;
    }
  }

  /**
   * Validate webhook signature
   */
  async validateWebhookSignature(body: string, signature: string): Promise<boolean> {
    const settings = await this.loadSettings();
    
    if (!settings.webhook_secret) {
      console.warn('Webhook secret not configured');
      return false;
    }

    try {
      const crypto = await import('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', settings.webhook_secret)
        .update(body)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Error validating webhook signature:', error);
      return false;
    }
  }

  /**
   * Get current settings (for admin panel)
   */
  async getSettings(): Promise<RazorpaySettings> {
    return await this.loadSettings();
  }

  /**
   * Update settings (for admin panel)
   */
  async updateSettings(updates: Partial<RazorpaySettings>): Promise<void> {
    try {
      const updatePromises = Object.entries(updates).map(([key, value]) => {
        const settingKey = `razorpay_${key}`;
        return supabase
          .from('settings')
          .update({ value: String(value) })
          .eq('category', 'payment')
          .eq('key', settingKey);
      });

      await Promise.all(updatePromises);
      
      // Clear cache to force reload
      this.settings = null;
      this.cacheExpiry = 0;
    } catch (error) {
      console.error('Error updating Razorpay settings:', error);
      throw error;
    }
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const settings = await this.loadSettings();
      
      // Try to fetch a dummy order to test credentials
      const response = await fetch('https://api.razorpay.com/v1/orders?count=1', {
        headers: {
          'Authorization': `Basic ${btoa(`${settings.key_id}:${settings.key_secret}`)}`
        }
      });

      if (response.ok) {
        return { 
          success: true, 
          message: `Successfully connected to Razorpay ${settings.environment} environment` 
        };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          message: `Connection failed: ${errorData.error?.description || 'Unknown error'}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// Export singleton instance
export const razorpayService = new RazorpayService();
export default razorpayService;
