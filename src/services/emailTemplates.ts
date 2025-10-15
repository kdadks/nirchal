// Professional Email Templates for Nirchal E-commerce

interface EmailTemplateData {
  customerName?: string;
  customerEmail?: string;
  orderId?: string;
  orderTotal?: string;
  orderItems?: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  resetLink?: string;
  verificationLink?: string;
  orderStatus?: string;
  trackingNumber?: string;
  websiteUrl?: string;
}

export class EmailTemplates {
  private static readonly baseStyles = `
    <style>
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        line-height: 1.6; 
        color: #333; 
        max-width: 600px; 
        margin: 0 auto; 
        padding: 0; 
        background-color: #f9f9f9;
      }
      .container { 
        background: white; 
        border-radius: 12px; 
        overflow: hidden; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
        margin: 20px;
      }
      .header { 
        background: linear-gradient(135deg, #ea580c, #f97316); 
        color: white; 
        padding: 30px 20px; 
        text-align: center; 
      }
      .header h1 { 
        margin: 0; 
        font-size: 28px; 
        font-weight: 600; 
      }
      .content { 
        padding: 30px 20px; 
      }
      .footer { 
        background: #f8f9fa; 
        padding: 20px; 
        text-align: center; 
        border-top: 1px solid #e9ecef;
        color: #666;
        font-size: 14px;
      }
      .button { 
        display: inline-block; 
        background: #ea580c; 
        color: white; 
        padding: 12px 24px; 
        text-decoration: none; 
        border-radius: 6px; 
        font-weight: 600;
        margin: 15px 0;
      }
      .order-item {
        border-bottom: 1px solid #eee;
        padding: 10px 0;
        display: flex;
        justify-content: space-between;
      }
      .status-badge {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 12px;
        text-transform: uppercase;
      }
      .status-pending { background: #fff3cd; color: #856404; }
      .status-confirmed { background: #d1ecf1; color: #0c5460; }
      .status-processing { background: #d4edda; color: #155724; }
      .status-shipped { background: #cce5ff; color: #004085; }
      .status-delivered { background: #d1ecf1; color: #0c5460; }
      .status-cancelled { background: #f8d7da; color: #721c24; }
    </style>
  `;

  private static getFooterContent(websiteUrl: string): string {
    const displayUrl = websiteUrl.replace('https://', '').replace('http://', '');
    return `
      <div class="footer">
        <p><strong>Nirchal</strong> - Your Trusted Shopping Destination</p>
        <p>📧 Email: support@nirchal.com | 🌐 Website: <a href="${websiteUrl}" style="color: #ea580c;">${displayUrl}</a></p>
        <p><small>This is an automated email. Please do not reply directly to this message.</small></p>
      </div>
    `;
  }

  // Welcome Email Template
  static welcomeEmail(data: EmailTemplateData): { subject: string; html: string } {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Nirchal</title>
        ${this.baseStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Nirchal!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account has been created successfully</p>
          </div>
          
          <div class="content">
            <p><strong>Dear ${data.customerName},</strong></p>
            
            <p>Welcome to the <strong>Nirchal</strong> family! We're thrilled to have you join our community of happy shoppers.</p>
            
            <p>✅ <strong>Your account is now active and ready to use!</strong></p>
            
            <p>Here's what you can do with your new account:</p>
            <ul style="padding-left: 20px;">
              <li>🛍️ Browse our exclusive product collections</li>
              <li>💝 Add items to your wishlist</li>
              <li>📦 Track your orders in real-time</li>
              <li>👤 Manage your profile and addresses</li>
              <li>🎁 Get access to special offers and discounts</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.websiteUrl}" class="button">🛍️ Start Shopping Now</a>
            </div>
            
            <p>If you have any questions, our friendly customer support team is here to help!</p>
            
            <p style="margin-top: 30px;">
              <strong>Happy Shopping!</strong><br>
              <span style="color: #ea580c; font-weight: 600;">The Nirchal Team</span>
            </p>
          </div>
          
          ${this.getFooterContent(data.websiteUrl || 'https://nirchal.pages.dev')}
        </div>
      </body>
      </html>
    `;

    return {
      subject: '🎉 Welcome to Nirchal - Your account is ready!',
      html
    };
  }

  // Password Reset Email Template
  static passwordResetEmail(data: EmailTemplateData): { subject: string; html: string } {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password - Nirchal</title>
        ${this.baseStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Reset your account password</p>
          </div>
          
          <div class="content">
            <p><strong>Dear ${data.customerName},</strong></p>
            
            <p>We received a request to reset the password for your Nirchal account (${data.customerEmail}).</p>
            
            <p>🔐 <strong>Click the button below to reset your password:</strong></p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetLink}" class="button">🔑 Reset Password</a>
            </div>
            
            <p><strong>⚠️ Important security information:</strong></p>
            <ul style="padding-left: 20px;">
              <li>This link will expire in <strong>1 hour</strong></li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password will remain unchanged if you don't click the link</li>
              <li>For security, this link can only be used once</li>
            </ul>
            
            <p>If you're having trouble with the button above, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
              ${data.resetLink}
            </p>
            
            <p style="margin-top: 30px;">
              <strong>Stay secure!</strong><br>
              <span style="color: #ea580c; font-weight: 600;">The Nirchal Security Team</span>
            </p>
          </div>
          
          ${this.getFooterContent(data.websiteUrl || 'https://nirchal.pages.dev')}
        </div>
      </body>
      </html>
    `;

    return {
      subject: '🔒 Reset your Nirchal password - Action required',
      html
    };
  }

  // Order Confirmation Email Template
  static orderConfirmationEmail(data: EmailTemplateData): { subject: string; html: string } {
    const itemsHtml = data.orderItems?.map(item => `
      <div class="order-item">
        <div>
          <strong>${item.name}</strong><br>
          <small>Quantity: ${item.quantity}</small>
        </div>
        <div style="text-align: right;">
          <strong>₹${item.price}</strong>
        </div>
      </div>
    `).join('') || '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Nirchal</title>
        ${this.baseStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your purchase</p>
          </div>
          
          <div class="content">
            <p><strong>Dear ${data.customerName},</strong></p>
            
            <p>🎉 Great news! Your order has been successfully placed and confirmed.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #ea580c;">📋 Order Details</h3>
              <p><strong>Order ID:</strong> #${data.orderId}</p>
              <p><strong>Status:</strong> <span class="status-badge status-confirmed">Confirmed</span></p>
              <p><strong>Total Amount:</strong> <strong style="font-size: 18px; color: #ea580c;">₹${data.orderTotal}</strong></p>
            </div>
            
            <h3>🛍️ Items Ordered:</h3>
            <div style="border: 1px solid #eee; border-radius: 8px; padding: 15px; margin: 15px 0;">
              ${itemsHtml}
            </div>
            
            <p>✅ <strong>What happens next?</strong></p>
            <ul style="padding-left: 20px;">
              <li>We'll process your order within 24 hours</li>
              <li>You'll receive a shipping confirmation with tracking details</li>
              <li>Your order will be delivered within 3-7 business days</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.websiteUrl}/myaccount?tab=orders" class="button">📱 Track Your Order</a>
            </div>
            
            <p style="margin-top: 30px;">
              <strong>Thank you for choosing Nirchal!</strong><br>
              <span style="color: #ea580c; font-weight: 600;">The Nirchal Team</span>
            </p>
          </div>
          
          ${this.getFooterContent(data.websiteUrl || 'https://nirchal.pages.dev')}
        </div>
      </body>
      </html>
    `;

    return {
      subject: `📦 Order Confirmed #${data.orderId} - Thank you for your purchase!`,
      html
    };
  }

  // Order Status Update Email Template
  static orderStatusUpdateEmail(data: EmailTemplateData): { subject: string; html: string } {
    const statusConfig = {
      pending: { emoji: '⏳', title: 'Order Pending', message: 'We\'ve received your order and it\'s being reviewed.', color: 'status-pending' },
      confirmed: { emoji: '✅', title: 'Order Confirmed', message: 'Your order has been confirmed and is being prepared.', color: 'status-confirmed' },
      processing: { emoji: '🔄', title: 'Order Processing', message: 'Your order is being packed and prepared for shipment.', color: 'status-processing' },
      shipped: { emoji: '🚚', title: 'Order Shipped', message: 'Great news! Your order is on its way to you.', color: 'status-shipped' },
      delivered: { emoji: '📦', title: 'Order Delivered', message: 'Your order has been successfully delivered. We hope you love it!', color: 'status-delivered' },
      cancelled: { emoji: '❌', title: 'Order Cancelled', message: 'Your order has been cancelled as requested.', color: 'status-cancelled' }
    };

    const status = data.orderStatus?.toLowerCase() as keyof typeof statusConfig || 'pending';
    const config = statusConfig[status];

    const trackingHtml = data.trackingNumber ? `
      <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h4 style="margin: 0 0 10px 0; color: #0c5460;">📍 Tracking Information</h4>
        <p style="margin: 0; font-family: monospace; font-size: 16px; font-weight: bold;">${data.trackingNumber}</p>
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Update - Nirchal</title>
        ${this.baseStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${config.emoji} ${config.title}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Order #${data.orderId}</p>
          </div>
          
          <div class="content">
            <p><strong>Dear ${data.customerName},</strong></p>
            
            <p>${config.message}</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #ea580c;">📋 Order Information</h3>
              <p><strong>Order ID:</strong> #${data.orderId}</p>
              <p><strong>Status:</strong> <span class="status-badge ${config.color}">${config.title}</span></p>
              <p><strong>Total Amount:</strong> <strong style="font-size: 18px; color: #ea580c;">₹${data.orderTotal}</strong></p>
            </div>
            
            ${trackingHtml}
            
            ${status === 'shipped' ? `
              <p>📦 <strong>Delivery Information:</strong></p>
              <ul style="padding-left: 20px;">
                <li>Estimated delivery: 2-3 business days</li>
                <li>You'll receive SMS/email updates on delivery</li>
                <li>Please keep your phone handy for delivery coordination</li>
              </ul>
            ` : ''}
            
            ${status === 'delivered' ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.websiteUrl}" class="button">⭐ Rate Your Experience</a>
              </div>
            ` : `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.websiteUrl}/myaccount?tab=orders" class="button">📱 View Order Details</a>
              </div>
            `}
            
            <p style="margin-top: 30px;">
              <strong>Thank you for choosing Nirchal!</strong><br>
              <span style="color: #ea580c; font-weight: 600;">The Nirchal Team</span>
            </p>
          </div>
          
          ${this.getFooterContent(data.websiteUrl || 'https://nirchal.pages.dev')}
        </div>
      </body>
      </html>
    `;

    return {
      subject: `${config.emoji} Order #${data.orderId} - ${config.title}`,
      html
    };
  }

  // Password Change Confirmation Email Template
  static passwordChangeConfirmationEmail(data: EmailTemplateData): { subject: string; html: string } {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Changed - Nirchal</title>
        ${this.baseStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Updated</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your password has been changed successfully</p>
          </div>
          
          <div class="content">
            <p><strong>Dear ${data.customerName},</strong></p>
            
            <p>✅ Your password has been successfully updated for your Nirchal account (${data.customerEmail}).</p>
            
            <div style="background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h4 style="margin: 0 0 10px 0; color: #0c5460;">🔐 Security Information</h4>
              <p style="margin: 0;"><strong>Changed on:</strong> ${new Date().toLocaleString('en-IN', { 
                dateStyle: 'full', 
                timeStyle: 'short',
                timeZone: 'Asia/Kolkata'
              })}</p>
            </div>
            
            <p><strong>⚠️ If you didn't make this change:</strong></p>
            <ul style="padding-left: 20px; color: #dc3545;">
              <li>Please contact our support team immediately</li>
              <li>Your account security may be compromised</li>
              <li>We'll help you secure your account right away</li>
            </ul>
            
            <p>💡 <strong>Security Tips:</strong></p>
            <ul style="padding-left: 20px;">
              <li>Use a strong, unique password</li>
              <li>Don't share your password with anyone</li>
              <li>Consider using a password manager</li>
              <li>Enable two-factor authentication if available</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.websiteUrl}/myaccount" class="button">🔐 Manage Account</a>
            </div>
            
            <p style="margin-top: 30px;">
              <strong>Stay secure!</strong><br>
              <span style="color: #ea580c; font-weight: 600;">The Nirchal Security Team</span>
            </p>
          </div>
          
          ${this.getFooterContent(data.websiteUrl || 'https://nirchal.pages.dev')}
        </div>
      </body>
      </html>
    `;

    return {
      subject: '✅ Your Nirchal password has been updated',
      html
    };
  }
}
