/**
 * Email Template Generator for Outlook Compatibility
 * 
 * This utility creates email templates that are compatible with all major email clients,
 * especially Microsoft Outlook, which has strict HTML rendering limitations.
 * 
 * Key Outlook Compatibility Features:
 * - Table-based layout instead of div/CSS grid
 * - Inline styles instead of CSS classes
 * - No CSS3 features (gradients, border-radius, box-shadow)
 * - MSO conditional comments for Outlook-specific fixes
 * - Arial/Helvetica fonts for universal compatibility
 * - Proper cellpadding/cellspacing/border attributes
 */

interface OutlookCompatibleEmailData {
  title: string;
  headerText: string;
  subHeaderText?: string;
  customerName: string;
  content: string[];
  ctaText?: string;
  ctaUrl?: string;
  footerText: string;
  websiteUrl: string;
}

export class OutlookCompatibleEmailTemplate {
  static generate(data: OutlookCompatibleEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
        <!--[if mso]>
        <style type="text/css">
          table { border-collapse: collapse; }
          .fallback-font { font-family: Arial, sans-serif !important; }
          .mso-only { display: block !important; }
          .mso-hide { display: none !important; }
        </style>
        <![endif]-->
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
        
        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" valign="top" style="padding: 20px;">
              
              <!-- Email Content -->
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; max-width: 600px; width: 100%; border: 1px solid #e0e0e0;">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #ea580c; padding: 30px 20px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 28px; font-weight: bold; line-height: 1.2; text-align: center;">
                          ${data.headerText}
                        </td>
                      </tr>
                      ${data.subHeaderText ? `
                      <tr>
                        <td style="color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.4; padding-top: 10px; text-align: center;">
                          ${data.subHeaderText}
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      
                      <!-- Customer Name -->
                      <tr>
                        <td style="color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; padding-bottom: 20px;">
                          <strong>Dear ${data.customerName},</strong>
                        </td>
                      </tr>
                      
                      <!-- Content Paragraphs -->
                      ${data.content.map(paragraph => `
                      <tr>
                        <td style="color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; padding-bottom: 15px;">
                          ${paragraph}
                        </td>
                      </tr>
                      `).join('')}
                      
                      <!-- CTA Button (if provided) -->
                      ${data.ctaText && data.ctaUrl ? `
                      <tr>
                        <td align="center" style="padding: 25px 0;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="background-color: #ea580c; padding: 12px 24px; text-align: center;">
                                <a href="${data.ctaUrl}" style="color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block;">
                                  ${data.ctaText}
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ` : ''}
                      
                      <!-- Signature -->
                      <tr>
                        <td style="color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; padding-top: 20px;">
                          <strong>Warm regards,</strong><br>
                          <span style="color: #ea580c; font-weight: bold;">The Nirchal Team</span>
                        </td>
                      </tr>
                      
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="color: #666666; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; text-align: center;">
                          <strong style="color: #ea580c;">Nirchal</strong> - ${data.footerText}<br>
                          📧 support@nirchal.com | 🌐 <a href="${data.websiteUrl}" style="color: #ea580c; text-decoration: none;">nirchal.netlify.app</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
              </table>
              
            </td>
          </tr>
        </table>
        
      </body>
      </html>
    `;
  }
}

// Usage examples:

export const outlookCompatibleWelcomeEmail = (customerName: string, websiteUrl: string) => {
  return OutlookCompatibleEmailTemplate.generate({
    title: 'Welcome to Nirchal',
    headerText: '🎉 Welcome to Nirchal!',
    subHeaderText: 'Your account has been created successfully',
    customerName,
    content: [
      'Welcome to the <strong style="color: #ea580c;">Nirchal</strong> family! We\'re thrilled to have you join our community of fashion enthusiasts who appreciate authentic, high-quality ethnic wear.',
      '<strong>🛍️ What you can do now:</strong><br>✨ Browse our exclusive collection of sarees, lehengas, and more<br>💝 Save your favorite items to your wishlist<br>🏠 Manage your addresses for quick checkout<br>📦 Track your orders in real-time<br>💬 Get personalized recommendations',
      'Need help getting started? Our customer support team is here to assist you every step of the way.'
    ],
    ctaText: '🛍️ Start Shopping Now',
    ctaUrl: websiteUrl,
    footerText: 'Authentic Ethnic Fashion',
    websiteUrl
  });
};

export const outlookCompatibleOrderConfirmationEmail = (customerName: string, orderNumber: string, orderTotal: string, websiteUrl: string) => {
  return OutlookCompatibleEmailTemplate.generate({
    title: 'Order Confirmation',
    headerText: '✅ Order Confirmed!',
    subHeaderText: `Order #${orderNumber}`,
    customerName,
    content: [
      `Thank you for your order! We're excited to confirm that your order <strong>#${orderNumber}</strong> has been successfully placed.`,
      `<strong>Order Total:</strong> ₹${orderTotal}`,
      '<strong>📦 What happens next?</strong><br>• We\'ll process your order within 24 hours<br>• You\'ll receive tracking information once shipped<br>• Estimated delivery: 3-7 business days',
      'We appreciate your business and look forward to serving you again!'
    ],
    ctaText: '📦 Track Your Order',
    ctaUrl: `${websiteUrl}/myaccount`,
    footerText: 'Your Trusted Shopping Destination',
    websiteUrl
  });
};

export const outlookCompatiblePasswordResetEmail = (customerName: string, resetUrl: string, websiteUrl: string) => {
  return OutlookCompatibleEmailTemplate.generate({
    title: 'Password Reset Request',
    headerText: '🔒 Password Reset',
    subHeaderText: 'Reset your account password',
    customerName,
    content: [
      'We received a request to reset your password for your Nirchal account.',
      'Click the button below to create a new password. This link will expire in 24 hours for security reasons.',
      '<strong>⚠️ Important:</strong> If you didn\'t request this password reset, please ignore this email and your password will remain unchanged.'
    ],
    ctaText: '🔑 Reset Password',
    ctaUrl: resetUrl,
    footerText: 'Secure Shopping Experience',
    websiteUrl
  });
};

export const outlookCompatibleOrderStatusEmail = (customerName: string, orderNumber: string, status: string, trackingNumber: string | undefined, websiteUrl: string) => {
  const statusMessages = {
    processing: 'Your order is being prepared for shipment.',
    shipped: 'Great news! Your order is on its way to you.',
    delivered: 'Your order has been successfully delivered!',
    cancelled: 'Your order has been cancelled as requested.'
  };

  return OutlookCompatibleEmailTemplate.generate({
    title: 'Order Status Update',
    headerText: '📦 Order Update',
    subHeaderText: `Order #${orderNumber}`,
    customerName,
    content: [
      `We wanted to let you know that your order <strong>#${orderNumber}</strong> status has been updated to: <strong style="color: #ea580c;">${status.toUpperCase()}</strong>`,
      statusMessages[status as keyof typeof statusMessages] || 'Your order status has been updated.',
      trackingNumber ? `<strong>📍 Tracking Number:</strong> ${trackingNumber}` : '',
      'You can track your order anytime by visiting your account dashboard.'
    ].filter(Boolean),
    ctaText: '📱 Track Order',
    ctaUrl: `${websiteUrl}/myaccount`,
    footerText: 'Reliable Delivery Service',
    websiteUrl
  });
};

export const outlookCompatiblePasswordChangeEmail = (customerName: string, websiteUrl: string) => {
  return OutlookCompatibleEmailTemplate.generate({
    title: 'Password Changed Successfully',
    headerText: '✅ Password Updated',
    subHeaderText: 'Your password has been changed',
    customerName,
    content: [
      'This email confirms that your password has been successfully updated for your Nirchal account.',
      'Your account is now secured with your new password.',
      '<strong>🔒 Security Tip:</strong> Keep your password safe and don\'t share it with anyone.',
      'If you didn\'t make this change, please contact our support team immediately.'
    ],
    ctaText: '🏠 Go to Dashboard',
    ctaUrl: `${websiteUrl}/myaccount`,
    footerText: 'Account Security Team',
    websiteUrl
  });
};
