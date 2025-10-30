// Client-side email service that calls Cloudflare Functions
class CloudflareEmailService {
  private baseUrl: string;

  constructor() {
    // Service no longer used - migrated to Cloudflare Pages Functions
    this.baseUrl = '';
  }

  // Send contact form email
  async sendContactForm(formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/contact-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      return {
        success: true,
        message: result.message || 'Message sent successfully!',
      };
    } catch (error) {
      console.error('Contact form error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  // Send custom email
  async sendEmail(emailData: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    type?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      return {
        success: true,
        message: result.message || 'Email sent successfully!',
      };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  // Send order confirmation email
  async sendOrderConfirmation(orderData: {
    customerEmail: string;
    orderNumber: string;
    customerName: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    shippingAddress: string;
  }): Promise<{ success: boolean; message: string }> {
    const html = this.generateOrderConfirmationHTML(orderData);
    
    return this.sendEmail({
      to: orderData.customerEmail,
      subject: `Order Confirmation - #${orderData.orderNumber}`,
      html,
      type: 'order-confirmation',
    });
  }

  // Send password reset email
  async sendPasswordReset(resetData: {
    email: string;
    resetLink: string;
    customerName: string;
  }): Promise<{ success: boolean; message: string }> {
    const html = this.generatePasswordResetHTML(resetData);
    
    return this.sendEmail({
      to: resetData.email,
      subject: 'Password Reset Request',
      html,
      type: 'password-reset',
    });
  }

  // Generate order confirmation HTML
  private generateOrderConfirmationHTML(orderData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; border: 1px solid #dee2e6; border-top: none; border-radius: 0 0 8px 8px; padding: 30px; }
          .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee; }
          .item:last-child { border-bottom: none; }
          .total { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 18px; color: #28a745; display: flex; justify-content: space-between; }
          .address { background: #f1f3f4; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Thank you for your order, ${orderData.customerName}!</p>
          </div>
          
          <div class="content">
            <div class="order-info">
              <h2 style="margin-top: 0; color: #28a745;">Order #${orderData.orderNumber}</h2>
              <p style="margin: 0; color: #6c757d;">Order Date: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <h3>Items Ordered:</h3>
            ${orderData.items.map((item: any) => `
              <div class="item">
                <div>
                  <strong>${item.name}</strong><br>
                  <small style="color: #6c757d;">Quantity: ${item.quantity}</small>
                </div>
                <div style="font-weight: bold;">₹${item.price.toFixed(2)}</div>
              </div>
            `).join('')}
            
            <div class="total">
              <span>Total Amount:</span>
              <span>₹${orderData.total.toFixed(2)}</span>
            </div>
            
            <h3>Shipping Address:</h3>
            <div class="address">
              ${orderData.shippingAddress.replace(/\n/g, '<br>')}
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #1976d2;">What's Next?</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>We'll send you another email with tracking details when your order ships</li>
                <li>Contact us if you have any questions</li>
              </ul>
            </div>
            
            <p style="text-align: center; color: #6c757d; margin-top: 30px;">
              Thank you for shopping with us! 🛍️
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate password reset HTML
  private generatePasswordResetHTML(resetData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; border: 1px solid #dee2e6; border-top: none; border-radius: 0 0 8px 8px; padding: 30px; }
          .button { background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; text-align: center; font-weight: bold; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .security { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset</h1>
          </div>
          
          <div class="content">
            <p style="font-size: 18px;">Hello ${resetData.customerName},</p>
            
            <p>We received a request to reset your password for your account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetData.resetLink}" class="button">Reset Your Password</a>
            </div>
            
            <div class="warning">
              <strong>⏰ Important:</strong> This reset link will expire in 1 hour for security reasons.
            </div>
            
            <div class="security">
              <h4 style="margin-top: 0;">🛡️ Security Notice</h4>
              <ul style="margin-bottom: 0;">
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Your password will remain unchanged</li>
                <li>Consider changing your password if you suspect unauthorized access</li>
              </ul>
            </div>
            
            <p style="margin-top: 30px;">If you need help or have questions, please contact our support team.</p>
            
            <p>Best regards,<br><strong>The Support Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const netlifyEmailService = new CloudflareEmailService();
