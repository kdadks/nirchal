# Email Testing Guide for Nirchal E-commerce

## 🧪 Testing Email Functionality

### 1. Local Development Setup

#### Prerequisites:
- Install Netlify CLI: `npm install -g netlify-cli`
- Configure environment variables
- Set up Zoho Mail account with app password

#### Environment Variables (.env or Netlify site settings):
```bash
# SMTP Configuration
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-zoho-app-password
SMTP_FROM=noreply@yourdomain.com
SMTP_REPLY_TO=support@yourdomain.com

# App Configuration
VITE_APP_URL=http://localhost:5173
```

#### Local Testing Steps:
```bash
# 1. Start development server
npm run dev

# 2. In another terminal, start Netlify functions
netlify dev

# 3. Access your app at http://localhost:8888
# Functions will be available at: http://localhost:8888/.netlify/functions/
```

### 2. Testing Contact Form

#### Test Contact Form Submission:
1. Navigate to `/contact` page
2. Fill out the contact form:
   - Name: Test User
   - Email: your-test-email@gmail.com
   - Subject: Test Email Functionality
   - Message: This is a test message to verify email functionality

3. Submit the form
4. Check browser console for any errors
5. Check your Zoho Mail sent folder
6. Check the recipient's inbox

#### Manual Function Testing:
```bash
# Test contact form function directly
curl -X POST http://localhost:8888/.netlify/functions/contact-form \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "subject": "Test Subject",
    "message": "Test message content"
  }'
```

### 3. Database Email Settings Testing

#### Access Admin Panel:
1. Go to `/admin/settings`
2. Navigate to "Email Settings" tab
3. Verify all SMTP settings are configured:
   - SMTP Host: smtppro.zoho.in
   - SMTP Port: 465
   - SMTP Secure: true
   - SMTP User: your-email@domain.com
   - SMTP Password: [encrypted]

#### Test Email Settings:
Add a test button in your admin panel to verify email configuration:

```typescript
// In SettingsPage.tsx, add this test function
const testEmailConfiguration = async () => {
  try {
    const testResult = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'your-test-email@gmail.com',
        subject: 'Email Configuration Test',
        html: '<h1>✅ Email Configuration Working!</h1><p>This is a test email from your Nirchal application.</p>'
      })
    });
    
    const result = await testResult.json();
    if (result.success) {
      alert('✅ Email test successful! Check your inbox.');
    } else {
      alert('❌ Email test failed: ' + result.error);
    }
  } catch (error) {
    alert('❌ Email test error: ' + error.message);
  }
};
```

### 4. Production Testing

#### Pre-Production Checklist:
- [ ] Zoho Mail account active and verified
- [ ] App password generated (not regular password)
- [ ] Domain email configured (if using custom domain)
- [ ] Environment variables set in Netlify dashboard
- [ ] SMTP settings match in database
- [ ] SSL certificates valid for your domain

#### Production Environment Variables:
```bash
# In Netlify Site Settings > Environment Variables
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-zoho-app-password  
SMTP_FROM=noreply@yourdomain.com
SMTP_REPLY_TO=support@yourdomain.com
VITE_APP_URL=https://your-site.netlify.app
```

#### Production Testing Steps:
1. **Deploy to Netlify**
2. **Test contact form on live site**
3. **Monitor function logs in Netlify dashboard**
4. **Check email delivery and auto-replies**
5. **Test from different email providers (Gmail, Outlook, Yahoo)**

### 5. Monitoring & Debugging

#### Netlify Function Logs:
- Access: Netlify Dashboard > Functions > [function-name] > View logs
- Look for authentication errors, timeouts, or delivery failures

#### Common Issues & Solutions:

**Authentication Failed:**
```bash
# Issue: Invalid credentials
# Solution: Use app password, not account password
# Check: SMTP_USER format (full email address)
```

**Connection Timeout:**
```bash
# Issue: Network/firewall blocking SMTP
# Solution: Verify SMTP settings
# Check: host=smtppro.zoho.in, port=465, secure=true
```

**Email Not Delivered:**
```bash
# Check: Spam/junk folders
# Verify: Recipient email address
# Monitor: Zoho account sending limits
```

#### Email Delivery Monitoring:
```typescript
// Add delivery tracking to your email functions
const mailOptions = {
  from: process.env.SMTP_FROM,
  to: recipientEmail,
  subject: emailSubject,
  html: emailContent,
  // Add delivery tracking
  headers: {
    'X-Mailer': 'Nirchal E-commerce',
    'X-Priority': '3',
  }
};

// Log email attempts
console.log('Sending email to:', recipientEmail);
console.log('Email subject:', emailSubject);
```

### 6. Order Email Testing

Test order confirmation emails:
1. **Place a test order** on your site
2. **Complete checkout process**
3. **Check for order confirmation email**
4. **Verify email template formatting**
5. **Test on mobile devices**

### 7. Performance & Limits

#### Zoho Mail Limits:
- **Free accounts**: 5,000 emails/day
- **Paid accounts**: Higher limits based on plan
- **Rate limiting**: Monitor sending frequency

#### Function Timeout:
- **Netlify timeout**: 10 seconds for free, 15 seconds for paid
- **Email timeout**: Configure appropriate timeouts in your functions

### 8. Security Best Practices

- ✅ Use app passwords instead of account passwords
- ✅ Store sensitive data in environment variables
- ✅ Validate email inputs to prevent injection
- ✅ Implement rate limiting for contact forms
- ✅ Use HTTPS for all email communications

### 9. Backup Email Strategy

Consider implementing a backup email service:
```typescript
// Fallback to SendGrid or other providers if Zoho fails
const sendEmailWithFallback = async (emailData) => {
  try {
    // Try Zoho first
    return await sendViaZoho(emailData);
  } catch (error) {
    console.warn('Zoho failed, trying fallback service');
    return await sendViaFallback(emailData);
  }
};
```

## ✅ Production Readiness Checklist

- [ ] Email settings configured in database
- [ ] Environment variables set in Netlify
- [ ] Zoho Mail account verified
- [ ] App password generated
- [ ] Contact form tested locally
- [ ] Contact form tested in production
- [ ] Order emails tested
- [ ] Auto-reply functionality verified
- [ ] Email templates mobile-responsive
- [ ] Function logs monitoring set up
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] SSL/TLS encryption verified

## 🚀 Ready for Production!

Once all tests pass and the checklist is complete, your email functionality will work reliably in production.
