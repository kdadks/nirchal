import { ReturnRequestWithItems } from '../../types/return.types';

interface InspectionCompleteEmailData {
  returnRequest: ReturnRequestWithItems;
  customerName: string;
  inspectionDate: string;
  inspectorNotes?: string;
}

export const generateInspectionCompleteEmail = (data: InspectionCompleteEmailData): string => {
  const { returnRequest, customerName, inspectionDate, inspectorNotes } = data;

  const totalRefund = returnRequest.final_refund_amount || returnRequest.calculated_refund_amount || 0;
  const deductions = returnRequest.return_items.reduce((sum, item) => sum + (item.item_deduction_amount || 0), 0);
  const isApproved = returnRequest.status === 'approved';

  // Count approved items (items with minimal deductions)
  const approvedItems = returnRequest.return_items.filter(item => 
    item.condition_on_return === 'excellent' || item.condition_on_return === 'good'
  );
  const rejectedItems = returnRequest.return_items.filter(item => 
    item.condition_on_return === 'damaged' || item.condition_on_return === 'not_received'
  );

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inspection Complete - Nirchal</title>
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
      background: ${isApproved ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'};
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
    .status-box {
      background-color: ${isApproved ? '#d1fae5' : '#fef3c7'};
      border-left: 4px solid ${isApproved ? '#10b981' : '#f59e0b'};
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .status-box h2 {
      margin: 0 0 10px 0;
      font-size: 16px;
      font-weight: 600;
      color: ${isApproved ? '#065f46' : '#92400e'};
    }
    .status-box p {
      margin: 5px 0;
      font-size: 14px;
      color: ${isApproved ? '#047857' : '#78350f'};
    }
    .refund-summary {
      background-color: #f9fafb;
      border: 2px solid #e5e7eb;
      padding: 25px;
      margin: 30px 0;
      border-radius: 8px;
    }
    .refund-summary h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 700;
      color: #111827;
    }
    .refund-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .refund-row:last-child {
      border-bottom: none;
    }
    .refund-label {
      font-size: 14px;
      color: #6b7280;
    }
    .refund-value {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
    }
    .refund-total {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 2px solid #111827;
    }
    .refund-total .refund-label {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }
    .refund-total .refund-value {
      font-size: 20px;
      font-weight: 700;
      color: #10b981;
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
      background-color: #ffffff;
    }
    .item:last-child {
      border-bottom: none;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .item-name {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
    }
    .item-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .item-status.approved {
      background-color: #d1fae5;
      color: #065f46;
    }
    .item-status.rejected {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .item-status.partial {
      background-color: #fef3c7;
      color: #92400e;
    }
    .item-specs {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .item-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #f3f4f6;
    }
    .item-detail {
      font-size: 13px;
    }
    .item-detail-label {
      color: #6b7280;
      margin-bottom: 2px;
    }
    .item-detail-value {
      font-weight: 600;
      color: #111827;
    }
    .item-notes {
      margin-top: 10px;
      padding: 10px;
      background-color: #fef3c7;
      border-radius: 4px;
      font-size: 13px;
      color: #78350f;
    }
    .notes-box {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .notes-box h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      font-weight: 600;
      color: #1e40af;
    }
    .notes-box p {
      margin: 0;
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
      <div class="icon">${isApproved ? '✓' : '⚠'}</div>
      <h1>Inspection Complete</h1>
    </div>

    <div class="content">
      <p class="greeting">Dear ${customerName},</p>

      <p class="message">
        We have completed the inspection of your return request <strong>#${returnRequest.return_number}</strong>. Please find the detailed results below.
      </p>

      <div class="status-box">
        <h2>${isApproved ? '✓ Return Approved' : '⚠ Return Partially Approved'}</h2>
        <p><strong>Inspection Date:</strong> ${inspectionDate}</p>
        <p><strong>Return Number:</strong> ${returnRequest.return_number}</p>
        <p><strong>Order Number:</strong> ${returnRequest.order_number}</p>
        <p><strong>Items Approved:</strong> ${approvedItems.length} of ${returnRequest.return_items.length}</p>
      </div>

      <div class="refund-summary">
        <h3>💰 Refund Summary</h3>
        <div class="refund-row">
          <span class="refund-label">Return Amount</span>
          <span class="refund-value">₹${returnRequest.return_items.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)}</span>
        </div>
        ${deductions > 0 ? `
        <div class="refund-row">
          <span class="refund-label">Deductions</span>
          <span class="refund-value" style="color: #dc2626;">- ₹${deductions.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="refund-row refund-total">
          <span class="refund-label">Total Refund Amount</span>
          <span class="refund-value">₹${totalRefund.toFixed(2)}</span>
        </div>
      </div>

      ${deductions > 0 ? `
      <div class="notes-box">
        <h3>ℹ️ About Deductions</h3>
        <p>Deductions may include items that did not meet our return quality standards, restocking fees, or shipping charges for rejected items.</p>
      </div>
      ` : ''}

      <div class="items-section">
        <h3>Inspection Results:</h3>
        ${returnRequest.return_items
          .map(
            (item) => {
              const isItemApproved = item.condition_on_return === 'excellent' || item.condition_on_return === 'good';
              const statusLabel = isItemApproved ? 'Approved' : 'Rejected';
              const statusClass = isItemApproved ? 'approved' : 'rejected';
              
              return `
        <div class="item">
          <div class="item-header">
            <div class="item-name">${item.product_name}</div>
            <span class="item-status ${statusClass}">${statusLabel}</span>
          </div>
          <div class="item-specs">
            ${item.variant_size ? `Size: ${item.variant_size}` : ''}
            ${item.variant_color ? ` • Color: ${item.variant_color}` : ''}
            ${item.variant_material ? ` • Material: ${item.variant_material}` : ''}
          </div>
          <div class="item-details">
            <div class="item-detail">
              <div class="item-detail-label">Quantity</div>
              <div class="item-detail-value">${item.quantity}</div>
            </div>
            <div class="item-detail">
              <div class="item-detail-label">Condition</div>
              <div class="item-detail-value">${item.condition_on_return ? item.condition_on_return.charAt(0).toUpperCase() + item.condition_on_return.slice(1).replace('_', ' ') : 'N/A'}</div>
            </div>
            <div class="item-detail">
              <div class="item-detail-label">Item Amount</div>
              <div class="item-detail-value">₹${item.total_price.toFixed(2)}</div>
            </div>
            <div class="item-detail">
              <div class="item-detail-label">Refund</div>
              <div class="item-detail-value" style="color: ${isItemApproved ? '#10b981' : '#dc2626'};">
                ${isItemApproved ? `₹${(item.total_price - (item.item_deduction_amount || 0)).toFixed(2)}` : '₹0.00'}
              </div>
            </div>
          </div>
          ${item.condition_notes ? `
          <div class="item-notes">
            <strong>Inspector Notes:</strong> ${item.condition_notes}
          </div>
          ` : ''}
        </div>
        `;
            }
          )
          .join('')}
      </div>

      ${inspectorNotes ? `
      <div class="notes-box">
        <h3>📝 Inspector's Notes</h3>
        <p>${inspectorNotes}</p>
      </div>
      ` : ''}

      <p class="message">
        ${isApproved 
          ? `Your refund of <strong>₹${totalRefund.toFixed(2)}</strong> will be processed within 5-7 business days and credited to your original payment method.`
          : rejectedItems.length === returnRequest.return_items.length
            ? `Unfortunately, none of the items met our return quality standards. Please contact our support team if you have any questions.`
            : `A partial refund of <strong>₹${totalRefund.toFixed(2)}</strong> will be processed within 5-7 business days. Items that did not meet our quality standards have been noted above.`
        }
      </p>

      <center>
        <a href="https://nirchal.com/myaccount" class="button">
          View Return Details
        </a>
      </center>

      <p class="message" style="font-size: 14px; color: #6b7280;">
        If you have any questions about the inspection results, please don't hesitate to contact our support team.
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
