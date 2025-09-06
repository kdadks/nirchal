// Transactional Email Service for automated emails
import { 
  outlookCompatibleWelcomeEmail,
  outlookCompatibleOrderConfirmationEmail,
  outlookCompatiblePasswordResetEmail,
  outlookCompatibleOrderStatusEmail,
  outlookCompatiblePasswordChangeEmail,
  outlookCompatiblePaymentSuccessEmail,
  outlookCompatiblePaymentFailedEmail
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
      console.log('TransactionalEmailService: Preparing welcome email for:', customer.email);
      console.log('TransactionalEmailService: Base URL:', this.baseUrl);
      
      const html = outlookCompatibleWelcomeEmail(
        `${customer.first_name} ${customer.last_name}`,
        'https://nirchal.netlify.app',
        customer.temp_password // Pass temp password if available
      );

      const subjectSuffix = customer.temp_password ? ' - Login Details Included' : '';
      const emailPayload = {
        to: customer.email,
        subject: `🎉 Welcome to Nirchal, ${customer.first_name}!${subjectSuffix}`,
        html
      };
      
      console.log('TransactionalEmailService: Sending welcome email with payload:', {
        to: emailPayload.to,
        subject: emailPayload.subject,
        hasHtml: !!emailPayload.html,
        htmlLength: emailPayload.html.length
      });
      
      const response = await fetch(`${this.baseUrl}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });

      console.log('TransactionalEmailService: Welcome email response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TransactionalEmailService: Welcome email failed with response:', errorText);
      }

      return response.ok;
    } catch (error) {
      console.error('TransactionalEmailService: Failed to send welcome email:', error);
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
      console.log('TransactionalEmailService: Preparing order confirmation email for:', order.customer_email);
      console.log('TransactionalEmailService: Order data:', {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        total_amount: order.total_amount,
        status: order.status
      });
      
      const orderNumber = order.order_number || `ORD${order.id}`;
      const html = outlookCompatibleOrderConfirmationEmail(
        order.customer_name,
        orderNumber,
        (order.total_amount || 0).toString(),
        'https://nirchal.netlify.app'
      );

      const emailPayload = {
        to: order.customer_email,
        subject: `✅ Order Confirmed ${orderNumber} - Nirchal`,
        html
      };
      
      console.log('TransactionalEmailService: Sending order confirmation email with payload:', {
        to: emailPayload.to,
        subject: emailPayload.subject,
        hasHtml: !!emailPayload.html,
        htmlLength: emailPayload.html.length
      });

      const response = await fetch(`${this.baseUrl}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });

      console.log('TransactionalEmailService: Order confirmation email response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TransactionalEmailService: Order confirmation email failed with response:', errorText);
      }

      return response.ok;
    } catch (error) {
      console.error('TransactionalEmailService: Failed to send order confirmation email:', error);
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

  // Send payment success email
  async sendPaymentSuccessEmail(paymentData: {
    customer_name: string;
    customer_email: string;
    order_number: string;
    amount: number;
    payment_id: string;
  }): Promise<boolean> {
    try {
      console.log('TransactionalEmailService: Preparing payment success email for:', paymentData.customer_email);
      
      const html = outlookCompatiblePaymentSuccessEmail(
        paymentData.customer_name,
        paymentData.order_number,
        paymentData.amount.toString(),
        paymentData.payment_id,
        'https://nirchal.netlify.app'
      );

      const emailPayload = {
        to: paymentData.customer_email,
        subject: `✅ Payment Successful - Order ${paymentData.order_number} - Nirchal`,
        html
      };
      
      console.log('TransactionalEmailService: Sending payment success email with payload:', {
        to: emailPayload.to,
        subject: emailPayload.subject,
        hasHtml: !!emailPayload.html
      });

      const response = await fetch(`${this.baseUrl}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });

      console.log('TransactionalEmailService: Payment success email response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TransactionalEmailService: Payment success email failed with response:', errorText);
      }

      return response.ok;
    } catch (error) {
      console.error('TransactionalEmailService: Failed to send payment success email:', error);
      return false;
    }
  }

  // Send payment failure email
  async sendPaymentFailureEmail(paymentData: {
    customer_name: string;
    customer_email: string;
    order_number: string;
    amount: number;
    error_reason: string;
  }): Promise<boolean> {
    try {
      console.log('TransactionalEmailService: Preparing payment failure email for:', paymentData.customer_email);
      
      const html = outlookCompatiblePaymentFailedEmail(
        paymentData.customer_name,
        paymentData.order_number,
        paymentData.amount.toString(),
        paymentData.error_reason,
        'https://nirchal.netlify.app'
      );

      const emailPayload = {
        to: paymentData.customer_email,
        subject: `❌ Payment Failed - Order ${paymentData.order_number} - Nirchal`,
        html
      };
      
      console.log('TransactionalEmailService: Sending payment failure email with payload:', {
        to: emailPayload.to,
        subject: emailPayload.subject,
        hasHtml: !!emailPayload.html
      });

      const response = await fetch(`${this.baseUrl}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });

      console.log('TransactionalEmailService: Payment failure email response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TransactionalEmailService: Payment failure email failed with response:', errorText);
      }

      return response.ok;
    } catch (error) {
      console.error('TransactionalEmailService: Failed to send payment failure email:', error);
      return false;
    }
  }

  // Send order notification to support team
  async sendOrderNotificationToSupport(orderData: {
    order_number: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    items_count: number;
    payment_method: string;
  }): Promise<boolean> {
    try {
      console.log('TransactionalEmailService: Preparing order notification email for support');
      
      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">🎉 New Order Received!</h1>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff;">
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Order Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Order Number:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${orderData.order_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Customer:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${orderData.customer_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${orderData.customer_email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Total Amount:</td>
                  <td style="padding: 8px 0; color: #10b981; font-weight: 700; font-size: 18px;">₹${orderData.total_amount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Items Count:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${orderData.items_count} item(s)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Payment Method:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${orderData.payment_method}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                Please process this order promptly and update the customer with shipping details.
              </p>
            </div>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              This is an automated notification from Nirchal e-commerce system.
            </p>
          </div>
        </div>
      `;

      const emailPayload = {
        to: 'support@nirchal.com',
        subject: `🛍️ New Order #${orderData.order_number} - ₹${orderData.total_amount.toLocaleString()} - Nirchal`,
        html
      };
      
      console.log('TransactionalEmailService: Sending order notification email with payload:', {
        to: emailPayload.to,
        subject: emailPayload.subject,
        hasHtml: !!emailPayload.html
      });

      const response = await fetch(`${this.baseUrl}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });

      console.log('TransactionalEmailService: Order notification email response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TransactionalEmailService: Order notification email failed with response:', errorText);
      }

      return response.ok;
    } catch (error) {
      console.error('TransactionalEmailService: Failed to send order notification email:', error);
      return false;
    }
  }

  // Send signup notification to support team
  async sendSignupNotificationToSupport(customerData: {
    customer_name: string;
    customer_email: string;
    phone?: string;
    signup_date: string;
  }): Promise<boolean> {
    try {
      console.log('TransactionalEmailService: Preparing signup notification email for support');
      
      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">🎊 New Customer Signup!</h1>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff;">
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Customer Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Name:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${customerData.customer_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${customerData.customer_email}</td>
                </tr>
                ${customerData.phone ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Phone:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${customerData.phone}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Signup Date:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${customerData.signup_date}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                A new customer has joined Nirchal! Consider sending them a welcome offer or checking if they need assistance.
              </p>
            </div>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              This is an automated notification from Nirchal e-commerce system.
            </p>
          </div>
        </div>
      `;

      const emailPayload = {
        to: 'support@nirchal.com',
        subject: `👋 New Customer Signup - ${customerData.customer_name} - Nirchal`,
        html
      };
      
      console.log('TransactionalEmailService: Sending signup notification email with payload:', {
        to: emailPayload.to,
        subject: emailPayload.subject,
        hasHtml: !!emailPayload.html
      });

      const response = await fetch(`${this.baseUrl}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });

      console.log('TransactionalEmailService: Signup notification email response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TransactionalEmailService: Signup notification email failed with response:', errorText);
      }

      return response.ok;
    } catch (error) {
      console.error('TransactionalEmailService: Failed to send signup notification email:', error);
      return false;
    }
  }
}

// Export singleton instance
export const transactionalEmailService = new TransactionalEmailService();
