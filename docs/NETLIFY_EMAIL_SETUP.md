# Netlify Email Integration with Zoho SMTP

## Overview
Complete email functionality for your Netlify-deployed e-commerce site using Zoho Mail SMTP for sending and IMAP for receiving emails.

## 🚀 Features
- **SMTP Email Sending** via Zoho Mail (smtppro.zoho.in:465 SSL)
- **IMAP Email Receiving** via Zoho Mail (imappro.zoho.in:993 SSL) 
- **Netlify Functions** for serverless email processing
- **Admin Email Settings** page for configuration
- **Email Templates** for orders, contact forms, password resets
- **Auto-Reply** functionality for contact forms
- **Professional HTML Email** designs

## 📧 Email Types Supported
1. **Contact Form Emails** - Customer inquiries with auto-reply
2. **Order Confirmation** - Beautiful order receipt emails
3. **Password Reset** - Secure password reset links
4. **Welcome Emails** - New customer onboarding
5. **Order Status Updates** - Shipping and delivery notifications

## ⚙️ Setup Instructions

### 1. Environment Variables
Add these to your Netlify site environment variables:

```bash
# SMTP Configuration
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
SMTP_REPLY_TO=support@yourdomain.com

# App URL
VITE_APP_URL=https://your-site.netlify.app
```

### 2. Zoho Mail Setup
1. **Create Zoho Mail Account** at zoho.com/mail
2. **Configure Domain** (if using custom domain)
3. **Generate App Password**:
   - Go to Zoho Account Settings
   - Security → App Passwords
   - Generate password for "Mail"
   - Use this instead of your regular password

### 3. Database Setup
For new installations, email settings are automatically included.

For existing installations, add these settings:
```sql
INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) VALUES
('email', 'smtp_host', 'smtppro.zoho.in', 'string', 'string', 'SMTP server host', true, 'smtppro.zoho.in'),
('email', 'smtp_port', '465', 'number', 'number', 'SMTP server port', true, '465'),
('email', 'smtp_secure', 'true', 'boolean', 'boolean', 'Use SSL/TLS encryption', true, 'true'),
('email', 'smtp_user', '', 'string', 'string', 'SMTP username (email)', true, ''),
('email', 'smtp_password', '', 'string', 'string', 'SMTP password (encrypted)', true, ''),
('email', 'smtp_from', '', 'string', 'string', 'Default From email address', true, ''),
('email', 'smtp_reply_to', '', 'string', 'string', 'Default Reply-To email address', false, ''),
('email', 'imap_host', 'imappro.zoho.in', 'string', 'string', 'IMAP server host', false, 'imappro.zoho.in'),
('email', 'imap_port', '993', 'number', 'number', 'IMAP server port', false, '993'),
('email', 'imap_secure', 'true', 'boolean', 'boolean', 'Use SSL/TLS encryption for IMAP', false, 'true');
```

### 4. Admin Configuration
1. Go to **Admin Dashboard** → **Settings** → **Email Settings**
2. Fill in your Zoho email credentials
3. Test the configuration
4. Save settings

## 🛠️ Technical Implementation

### Netlify Functions
Two serverless functions handle email operations:

1. **`/.netlify/functions/send-email`** - Generic email sender
2. **`/.netlify/functions/contact-form`** - Contact form handler with auto-reply

### Client-Side Usage
```typescript
import { netlifyEmailService } from '../services/netlifyEmailService';

// Send contact form
const result = await netlifyEmailService.sendContactForm({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Question about products',
  message: 'I need help with...'
});

// Send order confirmation
await netlifyEmailService.sendOrderConfirmation({
  customerEmail: 'customer@example.com',
  orderNumber: 'ORD001',
  customerName: 'Jane Smith',
  items: [
    { name: 'Product Name', quantity: 2, price: 99.99 }
  ],
  total: 199.98,
  shippingAddress: '123 Main St, City, State'
});
```

### Server-Side Usage (Netlify Functions)
```typescript
// In your Netlify functions
const transporter = nodemailer.createTransport({
  host: 'smtppro.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});
```

## 📱 Email Templates

### Professional Designs
- **Responsive HTML** templates
- **Modern styling** with proper branding
- **Mobile-friendly** layouts
- **Consistent typography** and colors

### Customization
Templates can be customized in:
- `src/services/netlifyEmailService.ts` - Client-side templates
- `netlify/functions/` - Server-side templates

## 🔒 Security Features

### Password Protection
- **App Passwords** instead of account passwords
- **Environment variables** for sensitive data
- **SSL/TLS encryption** for all connections

### CORS Configuration
- **Proper CORS headers** in Netlify functions
- **Origin validation** for security
- **Content-Type restrictions**

## 🧪 Testing

### Local Development
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run: `netlify dev`
3. Test functions at: `http://localhost:8888/.netlify/functions/`

### Production Testing
1. Deploy to Netlify
2. Test contact form on live site
3. Check email delivery in Zoho Mail
4. Verify auto-reply functionality

## 📊 Monitoring

### Email Delivery
- Check Zoho Mail **Sent** folder
- Monitor **bounce rates**
- Track **delivery confirmations**

### Error Handling
- Function logs in Netlify dashboard
- Email failure notifications
- Automatic retry mechanisms

## 🔧 Troubleshooting

### Common Issues
1. **Authentication Failed**
   - Use app password instead of account password
   - Check username/email format
   - Verify Zoho account is active

2. **Connection Timeout**
   - Check SMTP settings (host: smtppro.zoho.in, port: 465)
   - Ensure SSL is enabled
   - Verify firewall/network settings

3. **Email Not Delivered**
   - Check spam/junk folders
   - Verify recipient email address
   - Check Zoho account sending limits

### Support
- Zoho Mail documentation: help.zoho.com/portal/en/kb/mail
- Netlify Functions: docs.netlify.com/functions
- Contact form testing tools in admin panel

## 🎯 Next Steps
1. **Set up email settings** in admin panel
2. **Configure Zoho credentials** in Netlify environment
3. **Test contact form** functionality
4. **Customize email templates** as needed
5. **Monitor email delivery** and performance
