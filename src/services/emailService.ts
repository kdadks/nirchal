import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email';
import { ReturnRequestWithItems, RazorpayRefundTransaction } from '../types/return.types';
import {
  generateReturnAddressEmail,
  generateReturnReceivedEmail,
  generateInspectionCompleteEmail,
  generateRefundProcessedEmail,
} from '../templates/emails';

// Email service for sending emails via Zoho SMTP
class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: emailConfig.smtp.host,
      port: emailConfig.smtp.port,
      secure: emailConfig.smtp.secure,
      auth: emailConfig.smtp.auth,
    });
  }

  // Verify SMTP connection
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();

      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }

  // Send email
  async sendEmail(options: {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: Array<{
      filename: string;
      path?: string;
      content?: Buffer;
      contentType?: string;
    }>;
  }): Promise<boolean> {
    try {
      const mailOptions = {
        from: emailConfig.defaults.from,
        replyTo: emailConfig.defaults.replyTo,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      };

      await this.transporter.sendMail(mailOptions);

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Send order confirmation email
  async sendOrderConfirmation(
    customerEmail: string,
    orderData: {
      orderNumber: string;
      customerName: string;
      items: Array<{
        name: string;
        quantity: number;
        price: number;
      }>;
      total: number;
      shippingAddress: string;
    }
  ): Promise<boolean> {
    const html = this.generateOrderConfirmationHTML(orderData);
    
    return this.sendEmail({
      to: customerEmail,
      subject: `Order Confirmation - #${orderData.orderNumber}`,
      html,
    });
  }

  // Send password reset email
  async sendPasswordReset(
    email: string,
    resetData: {
      resetLink: string;
      customerName: string;
    }
  ): Promise<boolean> {
    const html = this.generatePasswordResetHTML(resetData);
    
    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html,
    });
  }

  // Send contact form email
  async sendContactForm(
    formData: {
      name: string;
      email: string;
      subject: string;
      message: string;
    }
  ): Promise<boolean> {
    const html = this.generateContactFormHTML(formData);
    
    return this.sendEmail({
      to: emailConfig.defaults.replyTo,
      subject: `New Contact: ${formData.subject}`,
      html,
    });
  }

  // Send welcome email
  async sendWelcomeEmail(
    email: string,
    customerData: {
      name: string;
    }
  ): Promise<boolean> {
    const html = this.generateWelcomeHTML(customerData);
    
    return this.sendEmail({
      to: email,
      subject: 'Welcome to Our Store!',
      html,
    });
  }

  // Send order status update
  async sendOrderStatusUpdate(
    customerEmail: string,
    orderData: {
      orderNumber: string;
      customerName: string;
      status: string;
      trackingNumber?: string;
    }
  ): Promise<boolean> {
    const html = this.generateOrderStatusHTML(orderData);
    
    return this.sendEmail({
      to: customerEmail,
      subject: `Order Update - #${orderData.orderNumber}`,
      html,
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .order-details { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-weight: bold; font-size: 18px; color: #28a745; }
          .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order, ${orderData.customerName}!</p>
          </div>
          
          <div class="order-details">
            <h2>Order #${orderData.orderNumber}</h2>
            
            <h3>Items Ordered:</h3>
            ${orderData.items.map((item: any) => `
              <div class="item">
                <span>${item.name} (x${item.quantity})</span>
                <span>₹${item.price.toFixed(2)}</span>
              </div>
            `).join('')}
            
            <div class="item total">
              <span>Total:</span>
              <span>₹${orderData.total.toFixed(2)}</span>
            </div>
            
            <h3>Shipping Address:</h3>
            <p>${orderData.shippingAddress}</p>
            
            <p>We'll send you another email when your order ships!</p>
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; }
          .button { background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          
          <div class="content">
            <p>Hello ${resetData.customerName},</p>
            
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            
            <a href="${resetData.resetLink}" class="button">Reset Password</a>
            
            <div class="warning">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            
            <p>If you didn't request this password reset, please ignore this email.</p>
            
            <p>Best regards,<br>The Support Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate contact form HTML
  private generateContactFormHTML(formData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #666; }
          .value { margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>New Contact Form Submission</h1>
          
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${formData.name}</div>
          </div>
          
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${formData.email}</div>
          </div>
          
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${formData.subject}</div>
          </div>
          
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${formData.message}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate welcome email HTML
  private generateWelcomeHTML(customerData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
          .content { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; }
          .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Our Store!</h1>
          </div>
          
          <div class="content">
            <p>Hello ${customerData.name},</p>
            
            <p>Welcome to our store! We're excited to have you as a customer.</p>
            
            <p>Here's what you can do with your account:</p>
            <ul>
              <li>Track your orders</li>
              <li>Manage your addresses</li>
              <li>View your order history</li>
              <li>Save items to your wishlist</li>
            </ul>
            
            <a href="${process.env.VITE_APP_URL}/account" class="button">Visit Your Account</a>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <p>Happy shopping!<br>The Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate order status update HTML
  private generateOrderStatusHTML(orderData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .status { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center; font-weight: bold; }
          .tracking { background: #e7f3ff; border: 1px solid #b3d7ff; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Update</h1>
            <p>Hello ${orderData.customerName},</p>
          </div>
          
          <div class="status">
            Order #${orderData.orderNumber} is now: ${orderData.status.toUpperCase()}
          </div>
          
          ${orderData.trackingNumber ? `
            <div class="tracking">
              <strong>Tracking Number:</strong> ${orderData.trackingNumber}
            </div>
          ` : ''}
          
          <p>Thank you for your business!</p>
        </div>
      </body>
      </html>
    `;
  }

  // ============================================================================
  // RETURN MANAGEMENT EMAILS
  // ============================================================================

  /**
   * Send return address email to customer
   */
  async sendReturnAddressEmail(
    returnRequest: ReturnRequestWithItems,
    customerEmail: string,
    customerName: string
  ): Promise<boolean> {
    const html = generateReturnAddressEmail({
      returnRequest,
      customerName,
    });

    return this.sendEmail({
      to: customerEmail,
      subject: `Return Shipping Address - Return #${returnRequest.return_number}`,
      html,
    });
  }

  /**
   * Send return received confirmation email
   */
  async sendReturnReceivedEmail(
    returnRequest: ReturnRequestWithItems,
    customerEmail: string,
    customerName: string,
    receivedBy: string,
    receivedDate: string
  ): Promise<boolean> {
    const html = generateReturnReceivedEmail({
      returnRequest,
      customerName,
      receivedBy,
      receivedDate,
    });

    return this.sendEmail({
      to: customerEmail,
      subject: `Return Package Received - Return #${returnRequest.return_number}`,
      html,
    });
  }

  /**
   * Send inspection complete email with refund details
   */
  async sendInspectionCompleteEmail(
    returnRequest: ReturnRequestWithItems,
    customerEmail: string,
    customerName: string,
    inspectionDate: string,
    inspectorNotes?: string
  ): Promise<boolean> {
    const html = generateInspectionCompleteEmail({
      returnRequest,
      customerName,
      inspectionDate,
      inspectorNotes,
    });

    const isApproved = returnRequest.status === 'approved';
    const subject = isApproved
      ? `Return Approved - Refund Processing - Return #${returnRequest.return_number}`
      : `Inspection Complete - Return #${returnRequest.return_number}`;

    return this.sendEmail({
      to: customerEmail,
      subject,
      html,
    });
  }

  /**
   * Send refund processed confirmation email
   */
  async sendRefundProcessedEmail(
    returnRequest: ReturnRequestWithItems,
    customerEmail: string,
    customerName: string,
    refundTransaction: RazorpayRefundTransaction,
    refundDate: string
  ): Promise<boolean> {
    const html = generateRefundProcessedEmail({
      returnRequest,
      customerName,
      refundTransaction,
      refundDate,
    });

    return this.sendEmail({
      to: customerEmail,
      subject: `Refund Processed - ₹${refundTransaction.refund_amount.toFixed(2)} Credited`,
      html,
    });
  }

  /**
   * Helper: Send email for a specific return status change
   * Automatically determines which email to send based on status
   */
  async sendReturnStatusChangeEmail(
    returnRequest: ReturnRequestWithItems,
    newStatus: string,
    additionalData?: {
      receivedBy?: string;
      receivedDate?: string;
      inspectionDate?: string;
      inspectorNotes?: string;
      refundTransaction?: RazorpayRefundTransaction;
      refundDate?: string;
    }
  ): Promise<boolean> {
    const customerEmail = returnRequest.customer_email || '';
    const customerName = `${returnRequest.customer_first_name || ''} ${returnRequest.customer_last_name || ''}`.trim() || 'Customer';

    if (!customerEmail) {
      console.error('No customer email available for return notification');
      return false;
    }

    try {
      switch (newStatus) {
        case 'pending_shipment':
          // Send return address email (when admin adds address)
          if (returnRequest.return_address_line1) {
            return this.sendReturnAddressEmail(returnRequest, customerEmail, customerName);
          }
          console.warn('Return address not set, skipping email');
          return false;

        case 'received':
          // Send received confirmation
          return this.sendReturnReceivedEmail(
            returnRequest,
            customerEmail,
            customerName,
            additionalData?.receivedBy || 'Warehouse Team',
            additionalData?.receivedDate || new Date().toLocaleDateString()
          );

        case 'approved':
        case 'partially_approved':
        case 'rejected':
          // Send inspection results
          return this.sendInspectionCompleteEmail(
            returnRequest,
            customerEmail,
            customerName,
            additionalData?.inspectionDate || new Date().toLocaleDateString(),
            additionalData?.inspectorNotes
          );

        case 'refund_completed':
          // Send refund confirmation
          if (additionalData?.refundTransaction) {
            return this.sendRefundProcessedEmail(
              returnRequest,
              customerEmail,
              customerName,
              additionalData.refundTransaction,
              additionalData?.refundDate || new Date().toLocaleDateString()
            );
          }
          console.warn('Refund transaction data not provided, skipping email');
          return false;

        default:
          // No email for this status
          return true;
      }
    } catch (error) {
      console.error('Error sending return status change email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
