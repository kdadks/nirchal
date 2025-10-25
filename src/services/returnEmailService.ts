/**
 * Browser-compatible Email Service for Return Management
 * 
 * This service prepares email data and sends it to the backend for processing.
 * Does NOT use nodemailer directly (that's server-side only).
 */

import { ReturnRequestWithItems, RazorpayRefundTransaction } from '../types/return.types';
import {
  generateReturnAddressEmail,
  generateReturnReceivedEmail,
  generateInspectionCompleteEmail,
  generateRefundProcessedEmail,
} from '../templates/emails';

/**
 * Return Email Service (Browser-compatible)
 */
class ReturnEmailService {
  /**
   * Check if running in development mode
   */
  private isDevelopment(): boolean {
    return import.meta.env.DEV || window.location.hostname === 'localhost';
  }

  /**
   * Send email via Cloudflare function (production) or log it (development)
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<boolean> {
    if (this.isDevelopment()) {
      console.log('📧 [DEV MODE] Email would be sent:', {
        to,
        subject,
        htmlLength: html.length,
        note: 'Emails are not sent in local development. Deploy to Cloudflare to test actual email delivery.'
      });
      return true;
    }

    try {
      const response = await fetch('/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          fromName: 'Nirchal Returns',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to send email:', errorText);
        return false;
      }

      const result = await response.json();
      console.log('✅ Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
  /**
   * Send return address email to customer
   */
  async sendReturnAddressEmail(
    returnRequest: ReturnRequestWithItems,
    customerEmail: string,
    customerName: string
  ): Promise<boolean> {
    try {
      const html = generateReturnAddressEmail({
        returnRequest,
        customerName,
      });

      const subject = `Return Shipping Address - Return #${returnRequest.return_number}`;

      return await this.sendEmail(customerEmail, subject, html);
    } catch (error) {
      console.error('Error sending return address email:', error);
      return false;
    }
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
    try {
      const html = generateReturnReceivedEmail({
        returnRequest,
        customerName,
        receivedBy,
        receivedDate,
      });

      const subject = `Return Package Received - Return #${returnRequest.return_number}`;

      return await this.sendEmail(customerEmail, subject, html);
    } catch (error) {
      console.error('Error sending return received email:', error);
      return false;
    }
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
    try {
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

      return await this.sendEmail(customerEmail, subject, html);
    } catch (error) {
      console.error('Error sending inspection complete email:', error);
      return false;
    }
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
    try {
      const html = generateRefundProcessedEmail({
        returnRequest,
        customerName,
        refundTransaction,
        refundDate,
      });

      const subject = `Refund Processed - ₹${refundTransaction.refund_amount.toFixed(2)} Credited`;

      return await this.sendEmail(customerEmail, subject, html);
    } catch (error) {
      console.error('Error sending refund processed email:', error);
      return false;
    }
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
      console.error('No customer email available');
      return false;
    }

    try {
      switch (newStatus) {
        case 'pending_shipment':
          // Send return address email (when admin adds address)
          if (returnRequest.return_address_line1) {
            return this.sendReturnAddressEmail(returnRequest, customerEmail, customerName);
          }
          console.error('Return address not set');
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
          console.error('Refund transaction data not provided');
          return false;

        default:
          // No email for this status
          return true;
      }
    } catch (error) {
      console.error('Error sending status change email:', error);
      return false;
    }
  }
}

// Export singleton instance
export const returnEmailService = new ReturnEmailService();

// Export class for testing/custom instances
export { ReturnEmailService };
