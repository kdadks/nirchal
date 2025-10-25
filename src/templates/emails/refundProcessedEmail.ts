import { ReturnRequestWithItems, RazorpayRefundTransaction } from '../../types/return.types';

interface RefundProcessedEmailData {
  returnRequest: ReturnRequestWithItems;
  customerName: string;
  refundTransaction: RazorpayRefundTransaction;
  refundDate: string;
}

export const generateRefundProcessedEmail = (data: RefundProcessedEmailData): string => {
  const { returnRequest, customerName, refundTransaction, refundDate } = data;

  const refundAmount = refundTransaction.refund_amount;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refund Processed - Nirchal</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
    }
    .header .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #111827;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #4b5563;
      margin-bottom: 30px;
    }
    .success-box {
      background-color: #e9d5ff;
      border-left: 4px solid #8b5cf6;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .success-box h2 {
      margin: 0 0 10px 0;
      font-size: 16px;
      font-weight: 600;
      color: #5b21b6;
    }
    .success-box p {
      margin: 5px 0;
      font-size: 14px;
      color: #6b21a8;
    }
    .refund-amount-box {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 30px;
      margin: 30px 0;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .refund-amount-label {
      font-size: 14px;
      color: #d1fae5;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .refund-amount-value {
      font-size: 48px;
      font-weight: 700;
      color: #ffffff;
      margin: 10px 0;
    }
    .refund-amount-note {
      font-size: 13px;
      color: #d1fae5;
      margin-top: 10px;
    }
    .transaction-details {
      background-color: #f9fafb;
      border: 2px solid #e5e7eb;
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
    }
    .transaction-details h3 {
      margin: 0 0 20px 0;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-size: 14px;
      color: #6b7280;
    }
    .detail-value {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      text-align: right;
    }
    .info-box {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .info-box h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      font-weight: 600;
      color: #1e40af;
    }
    .info-box p {
      margin: 5px 0;
      font-size: 14px;
      line-height: 1.6;
      color: #1e3a8a;
    }
    .info-box ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .info-box li {
      margin: 8px 0;
      font-size: 14px;
      color: #1e3a8a;
    }
    .timeline-complete {
      background-color: #f9fafb;
      border: 2px solid #e5e7eb;
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
    }
    .timeline-complete h3 {
      margin: 0 0 20px 0;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      text-align: center;
    }
    .timeline-item {
      position: relative;
      padding-left: 30px;
      margin-bottom: 15px;
    }
    .timeline-item:last-child {
      margin-bottom: 0;
    }
    .timeline-item::before {
      content: '✓';
      position: absolute;
      left: 0;
      top: 0;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #10b981;
      color: #ffffff;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .timeline-item .timeline-title {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 3px;
    }
    .timeline-item .timeline-time {
      font-size: 12px;
      color: #6b7280;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
      font-size: 14px;
      color: #6b7280;
    }
    .footer a {
      color: #8b5cf6;
      text-decoration: none;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #8b5cf6;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">💰</div>
      <h1>Refund Processed Successfully</h1>
    </div>

    <div class="content">
      <p class="greeting">Dear ${customerName},</p>

      <p class="message">
        Great news! Your refund has been successfully processed for return request <strong>#${returnRequest.return_number}</strong>.
      </p>

      <div class="refund-amount-box">
        <div class="refund-amount-label">Refund Amount</div>
        <div class="refund-amount-value">₹${refundAmount.toFixed(2)}</div>
        <div class="refund-amount-note">Credited to Original Payment Method</div>
      </div>

      <div class="success-box">
        <h2>✓ Refund Completed</h2>
        <p><strong>Transaction ID:</strong> ${refundTransaction.transaction_number}</p>
        <p><strong>Razorpay Refund ID:</strong> ${refundTransaction.razorpay_refund_id || 'Processing'}</p>
        <p><strong>Processed Date:</strong> ${refundDate}</p>
        <p><strong>Return Number:</strong> ${returnRequest.return_number}</p>
        <p><strong>Order Number:</strong> ${returnRequest.order_number}</p>
      </div>

      <div class="transaction-details">
        <h3>Transaction Details</h3>
        <div class="detail-row">
          <span class="detail-label">Original Order Amount</span>
          <span class="detail-value">₹${returnRequest.original_order_amount?.toFixed(2) || '0.00'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Return Items Amount</span>
          <span class="detail-value">₹${returnRequest.return_items.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Deductions</span>
          <span class="detail-value" style="color: ${returnRequest.return_items.some(item => (item.item_deduction_amount || 0) > 0) ? '#dc2626' : '#6b7280'};">
            ${returnRequest.return_items.some(item => (item.item_deduction_amount || 0) > 0) ? '- ' : ''}₹${returnRequest.return_items.reduce((sum, item) => sum + (item.item_deduction_amount || 0), 0).toFixed(2)}
          </span>
        </div>
        <div class="detail-row" style="border-top: 2px solid #111827; padding-top: 15px; margin-top: 10px;">
          <span class="detail-label" style="font-size: 16px; font-weight: 600; color: #111827;">Total Refund Amount</span>
          <span class="detail-value" style="font-size: 18px; font-weight: 700; color: #10b981;">₹${refundAmount.toFixed(2)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Refund Method</span>
          <span class="detail-value">Original Payment Method</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Refund Status</span>
          <span class="detail-value" style="color: #10b981;">✓ Processed</span>
        </div>
      </div>

      <div class="timeline-complete">
        <h3>✓ Return Journey Complete</h3>
        <div class="timeline-item">
          <div class="timeline-title">Return Initiated</div>
          <div class="timeline-time">You submitted your return request</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-title">Package Shipped</div>
          <div class="timeline-time">You shipped the items to us</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-title">Package Received</div>
          <div class="timeline-time">We received and inspected your return</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-title">Refund Processed</div>
          <div class="timeline-time">Amount credited - ${refundDate}</div>
        </div>
      </div>

      <div class="info-box">
        <h3>ℹ️ When Will I Receive the Money?</h3>
        <p>The refund has been initiated from our end. Depending on your payment method and bank, it may take:</p>
        <ul>
          <li><strong>Credit/Debit Cards:</strong> 5-7 business days</li>
          <li><strong>UPI/Wallet:</strong> 2-3 business days</li>
          <li><strong>Net Banking:</strong> 3-5 business days</li>
        </ul>
        <p>The amount will be credited to the same payment method used during purchase.</p>
      </div>

      <center>
        <a href="${process.env.VITE_APP_URL || 'https://nirchal.com'}/account" class="button">
          View Order History
        </a>
      </center>

      <p class="message" style="font-size: 14px; color: #6b7280;">
        Thank you for shopping with Nirchal. We hope to serve you again soon!
      </p>
    </div>

    <div class="footer">
      <p><strong>Nirchal</strong></p>
      <p>Premium Fashion & Lifestyle</p>
      <p>
        <a href="${process.env.VITE_APP_URL || 'https://nirchal.com'}/contact">Contact Support</a> •
        <a href="${process.env.VITE_APP_URL || 'https://nirchal.com'}/return-policy">Return Policy</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px;">
        This email was sent regarding your refund transaction. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};
