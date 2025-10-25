import { ReturnRequestWithItems } from '../../types/return.types';

interface ReturnAddressEmailData {
  returnRequest: ReturnRequestWithItems;
  customerName: string;
}

export const generateReturnAddressEmail = (data: ReturnAddressEmailData): string => {
  const { returnRequest, customerName } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Return Shipping Address - Nirchal</title>
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
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
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
    .info-box {
      background-color: #fef3c7;
      border-left: 4px solid #fbbf24;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .info-box h2 {
      margin: 0 0 10px 0;
      font-size: 16px;
      font-weight: 600;
      color: #92400e;
    }
    .info-box p {
      margin: 5px 0;
      font-size: 14px;
      color: #78350f;
    }
    .address-box {
      background-color: #f9fafb;
      border: 2px solid #e5e7eb;
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
    }
    .address-box h2 {
      margin: 0 0 15px 0;
      font-size: 18px;
      font-weight: 700;
      color: #111827;
    }
    .address-box .address-line {
      font-size: 16px;
      line-height: 1.8;
      color: #374151;
      margin: 5px 0;
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
    .instructions {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .instructions h3 {
      margin: 0 0 15px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e40af;
    }
    .instructions ol {
      margin: 0;
      padding-left: 20px;
    }
    .instructions li {
      margin: 10px 0;
      font-size: 14px;
      line-height: 1.6;
      color: #1e3a8a;
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
      color: #f59e0b;
      text-decoration: none;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #fbbf24;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      font-size: 16px;
    }
    .note {
      font-size: 13px;
      color: #6b7280;
      font-style: italic;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Return Shipping Address</h1>
    </div>

    <div class="content">
      <p class="greeting">Dear ${customerName},</p>

      <p class="message">
        Your return request <strong>#${returnRequest.return_number}</strong> for Order <strong>#${returnRequest.order_number}</strong> has been approved. Please use the address below to ship your return items.
      </p>

      <div class="info-box">
        <h2>📦 Return Request Details</h2>
        <p><strong>Return Number:</strong> ${returnRequest.return_number}</p>
        <p><strong>Order Number:</strong> ${returnRequest.order_number}</p>
        <p><strong>Status:</strong> Approved - Ready to Ship</p>
      </div>

      <div class="address-box">
        <h2>📍 Ship Your Return To:</h2>
        <div class="address-line"><strong>${returnRequest.return_address_line1 || 'N/A'}</strong></div>
        ${returnRequest.return_address_line2 ? `<div class="address-line">${returnRequest.return_address_line2}</div>` : ''}
        <div class="address-line">${returnRequest.return_address_city || 'N/A'}, ${returnRequest.return_address_state || 'N/A'} ${returnRequest.return_address_postal_code || 'N/A'}</div>
        <div class="address-line"><strong>${returnRequest.return_address_country || 'N/A'}</strong></div>
      </div>

      <div class="items-section">
        <h3>Items to Return:</h3>
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

      <div class="instructions">
        <h3>📋 Return Instructions:</h3>
        <ol>
          <li><strong>Package Securely:</strong> Pack items in their original packaging if possible. Ensure items are clean and unused with all tags attached.</li>
          <li><strong>Include Documentation:</strong> Print this email and include it inside the package along with your return number <strong>${returnRequest.return_number}</strong>.</li>
          <li><strong>Ship the Package:</strong> Use a trackable shipping method and keep your tracking number for reference.</li>
          <li><strong>Update Return Status:</strong> Once shipped, please update the return status in your account with the tracking number.</li>
          <li><strong>Inspection & Refund:</strong> After we receive and inspect your return, the refund will be processed within 5-7 business days.</li>
        </ol>
      </div>

      <p class="note">
        <strong>Important:</strong> Please ship the items within 7 days to avoid cancellation of your return request.
      </p>

      <center>
        <a href="${process.env.VITE_APP_URL || 'https://nirchal.com'}/account" class="button">
          View Return Status
        </a>
      </center>

      <p class="message">
        If you have any questions about your return, please don't hesitate to contact our support team.
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
