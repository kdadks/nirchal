// Transactional Email Service for automated emails
import { 
  outlookCompatibleWelcomeEmail,
  outlookCompatibleOrderConfirmationEmail,
  outlookCompatiblePasswordResetEmail,
  outlookCompatibleOrderStatusEmail,
  outlookCompatiblePasswordChangeEmail
} from './outlookCompatibleEmailTemplates';

interface OrderData {
  id: string;
  order_number?: string; // Add order_number field
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  tracking_number?: string;
}

interface CustomerData {
  first_name: string;
  last_name: string;
  email: string;
  temp_password?: string; // Add temp_password field for checkout customers
}

export class TransactionalEmailService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? '/.netlify/functions' 
      : 'http://localhost:8888/.netlify/functions';
  }

  // Send welcome email when user signs up
  async sendWelcomeEmail(customer: CustomerData): Promise<boolean> {
    try {
      const html = outlookCompatibleWelcomeEmail(
        `${customer.first_name} ${customer.last_name}`,
        'https://nirchal.netlify.app',
        customer.temp_password // Pass temp password if available
      );

      const subjectSuffix = customer.temp_password ? ' - Login Details Included' : '';
      const response = await fetch(`${this.baseUrl}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customer.email,
          subject: `🎉 Welcome to Nirchal, ${customer.first_name}!${subjectSuffix}`,
          html
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(customer: CustomerData, resetLink: string): Promise<boolean> {
    try {
      const html = outlookCompatiblePasswordResetEmail(
        `${customer.first_name} ${customer.last_name}`,
        resetLink,
        'https://nirchal.netlify.app'
      );

      const response = await fetch(`${this.baseUrl}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customer.email,
          subject: '🔒 Password Reset Request - Nirchal',
          html
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  // Send password change confirmation
  async sendPasswordChangeConfirmation(customer: CustomerData): Promise<boolean> {
    try {
      const html = outlookCompatiblePasswordChangeEmail(
        `${customer.first_name} ${customer.last_name}`,
        'https://nirchal.netlify.app'
      );

      const response = await fetch(`${this.baseUrl}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customer.email,
          subject: '✅ Password Updated Successfully - Nirchal',
          html
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send password change confirmation:', error);
      return false;
    }
  }

  // Send order confirmation email
  async sendOrderConfirmationEmail(order: OrderData): Promise<boolean> {
    try {
      const orderNumber = order.order_number || `ORD${order.id}`;
      const html = outlookCompatibleOrderConfirmationEmail(
        order.customer_name,
        orderNumber,
        (order.total_amount || 0).toString(),
        'https://nirchal.netlify.app'
      );

      const response = await fetch(`${this.baseUrl}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: order.customer_email,
          subject: `✅ Order Confirmed ${orderNumber} - Nirchal`,
          html
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      return false;
    }
  }

  // Send order status update email
  async sendOrderStatusUpdateEmail(order: OrderData): Promise<boolean> {
    try {
      const orderNumber = order.order_number || `ORD${order.id}`;
      const html = outlookCompatibleOrderStatusEmail(
        order.customer_name,
        orderNumber,
        order.status,
        order.tracking_number,
        'https://nirchal.netlify.app'
      );

      const response = await fetch(`${this.baseUrl}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: order.customer_email,
          subject: `📦 Order Update ${orderNumber} - ${order.status.toUpperCase()} - Nirchal`,
          html
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send order status update email:', error);
      return false;
    }
  }
}

// Export singleton instance
export const transactionalEmailService = new TransactionalEmailService();
