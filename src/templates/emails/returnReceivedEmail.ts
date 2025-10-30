import { ReturnRequestWithItems } from '../../types/return.types';

interface ReturnReceivedEmailData {
  returnRequest: ReturnRequestWithItems;
  customerName: string;
  receivedBy: string;
  receivedDate: string;
}

export const generateReturnReceivedEmail = (data: ReturnReceivedEmailData): string => {
  const { returnRequest, customerName, receivedBy, receivedDate } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Return Received - Nirchal</title>
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
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
      background-color: #d1fae5;
      border-left: 4px solid #10b981;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .success-box h2 {
      margin: 0 0 10px 0;
      font-size: 16px;
      font-weight: 600;
      color: #065f46;
    }
    .success-box p {
      margin: 5px 0;
      font-size: 14px;
      color: #047857;
    }
    .timeline-box {
      background-color: #f9fafb;
      border: 2px solid #e5e7eb;
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
    }
    .timeline-box h3 {
      margin: 0 0 20px 0;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }
    .timeline-item {
      position: relative;
      padding-left: 30px;
      margin-bottom: 20px;
    }
    .timeline-item:last-child {
      margin-bottom: 0;
    }
    .timeline-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 5px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #10b981;
    }
    .timeline-item.pending::before {
      background-color: #d1d5db;
    }
    .timeline-item .timeline-title {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 3px;
    }
    .timeline-item.pending .timeline-title {
      color: #6b7280;
    }
    .timeline-item .timeline-desc {
      font-size: 13px;
      color: #6b7280;
    }
    .items-section {
      margin: 30px 0;
    }
    .items-section h3 {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 15px;
    }
    .item {
      padding: 15px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .item:last-child {
      border-bottom: none;
    }
    .item-details {
      flex: 1;
    }
    .item-name {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
    }
    .item-specs {
      font-size: 13px;
      color: #6b7280;
    }
    .item-qty {
      font-size: 14px;
      color: #6b7280;
      margin-left: 20px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 20px 0;
    }
    .info-item {
      padding: 15px;
      background-color: #f9fafb;
      border-radius: 6px;
    }
    .info-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
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
      color: #10b981;
      text-decoration: none;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #10b981;
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
      <div class="icon">✓</div>
      <h1>Return Package Received</h1>
    </div>

    <div class="content">
      <p class="greeting">Dear ${customerName},</p>

      <p class="message">
        Great news! We have received your return package for return request <strong>#${returnRequest.return_number}</strong>. Your items are now being inspected by our quality team.
      </p>

      <div class="success-box">
        <h2>✓ Package Successfully Received</h2>
        <p><strong>Received Date:</strong> ${receivedDate}</p>
        <p><strong>Received By:</strong> ${receivedBy}</p>
        <p><strong>Return Number:</strong> ${returnRequest.return_number}</p>
        <p><strong>Order Number:</strong> ${returnRequest.order_number}</p>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Items Received</div>
          <div class="info-value">${returnRequest.return_items.length} ${returnRequest.return_items.length === 1 ? 'Item' : 'Items'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Return Status</div>
          <div class="info-value">Under Inspection</div>
        </div>
      </div>

      <div class="items-section">
        <h3>Received Items:</h3>
        ${returnRequest.return_items
          .map(
            (item) => `
        <div class="item">
          <div class="item-details">
            <div class="item-name">${item.product_name}</div>
            <div class="item-specs">
              ${item.variant_size ? `Size: ${item.variant_size}` : ''}
              ${item.variant_color ? ` • Color: ${item.variant_color}` : ''}
              ${item.variant_material ? ` • Material: ${item.variant_material}` : ''}
            </div>
          </div>
          <div class="item-qty">Qty: ${item.quantity}</div>
        </div>
        `
          )
          .join('')}
      </div>

      <div class="timeline-box">
        <h3>What Happens Next:</h3>
        <div class="timeline-item">
          <div class="timeline-title">✓ Return Initiated</div>
          <div class="timeline-desc">You submitted your return request</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-title">✓ Package Shipped</div>
          <div class="timeline-desc">You shipped the items to us</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-title">✓ Package Received</div>
          <div class="timeline-desc">We received your return package</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-title">⟳ Quality Inspection</div>
          <div class="timeline-desc">Our team is inspecting the items (1-2 business days)</div>
        </div>
        <div class="timeline-item pending">
          <div class="timeline-title">⧗ Refund Processing</div>
          <div class="timeline-desc">Refund will be initiated after approval</div>
        </div>
        <div class="timeline-item pending">
          <div class="timeline-title">⧗ Refund Complete</div>
          <div class="timeline-desc">Amount credited to your original payment method</div>
        </div>
      </div>

      <p class="message">
        Our quality team will inspect the items within <strong>1-2 business days</strong>. You will receive an email with the inspection results and refund details once the process is complete.
      </p>

      <center>
        <a href="https://nirchal.com/myaccount" class="button">
          Track Return Status
        </a>
      </center>

      <p class="message" style="font-size: 14px; color: #6b7280;">
        Thank you for your patience. We'll process your return as quickly as possible!
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
        This email was sent regarding your return request. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};
