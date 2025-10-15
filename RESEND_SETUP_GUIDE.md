# Resend Email Setup for Nirchal

## Why Resend?

Resend is the **best email service for Cloudflare Workers** with:
- ✅ **Simple API** - Works perfectly with Cloudflare Pages Functions
- ✅ **Custom Domain** - Use `support@nirchal.com` as sender
- ✅ **High Deliverability** - 99%+ delivery rate
- ✅ **Free Tier** - 3,000 emails/month free
- ✅ **Easy Setup** - 5 minutes to get started
- ✅ **Analytics** - Track opens, clicks, bounces
- ✅ **No SMTP Hassle** - No ports, no authentication complexity

## Pricing

| Plan | Emails/Month | Price |
|------|--------------|-------|
| **Free** | 3,000 | $0 |
| **Pro** | 50,000 | $20 |
| **Business** | 100,000 | $80 |

**For Nirchal**: Start with **Free tier** (3,000 emails = ~100 orders/day)

## Setup Steps

### Step 1: Create Resend Account

1. Go to: https://resend.com/
2. Click **"Sign Up"**
3. Sign up with email or GitHub
4. Verify your email address

### Step 2: Add Your Domain

1. Go to: https://resend.com/domains
2. Click **"Add Domain"**
3. Enter: `nirchal.com`
4. Click **"Add"**

### Step 3: Configure DNS Records

Resend will show you DNS records to add. Go to your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare DNS) and add these records:

#### SPF Record
```
Type: TXT
Name: @ (or root domain)
Value: v=spf1 include:_spf.resend.com ~all
```

**If you already have an SPF record** with Zoho:
```
v=spf1 include:_spf.zoho.in include:_spf.resend.com ~all
```

#### DKIM Record
```
Type: TXT
Name: resend._domainkey
Value: [provided by Resend - copy exactly]
```

Example:
```
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

#### DMARC Record (Optional but Recommended)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@nirchal.com
```

### Step 4: Verify Domain

1. After adding DNS records, wait 1-5 minutes for propagation
2. Click **"Verify"** in Resend dashboard
3. Status should change to **"Verified" ✅**

### Step 5: Get API Key

1. Go to: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Name: `Nirchal Production`
4. Permission: **"Sending access"**
5. Click **"Add"**
6. **Copy the API key** (starts with `re_...`)
7. ⚠️ **Save it securely** - you won't see it again!

### Step 6: Add Environment Variables to Cloudflare

1. Go to: https://dash.cloudflare.com/
2. Navigate to: **Pages** → **nirchal** → **Settings** → **Environment Variables**
3. Click **"Add variable"** for **Production**:

| Variable Name | Value | Type | Example |
|--------------|-------|------|---------|
| `RESEND_API_KEY` | Your API key | 🔒 **Encrypted** | `re_123abc...` |
| `EMAIL_FROM` | Your email | Plain text | `support@nirchal.com` |
| `EMAIL_FROM_NAME` | Sender name | Plain text | `Nirchal` |

**Important**: 
- Use **"Encrypt"** option for `RESEND_API_KEY`
- Click **"Save"** after adding all variables

### Step 7: Deploy & Test

```powershell
# Commit the changes
git add functions/send-email.ts
git commit -m "feat: Switch to Resend for email sending"
git push origin uat
```

Wait 2-3 minutes for deployment to complete.

### Step 8: Test Email Sending

Open browser console on your site and run:

```javascript
const response = await fetch('https://nirchal.pages.dev/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'your-email@example.com',
    subject: 'Test from Nirchal via Resend',
    html: '<h1>Hello!</h1><p>This is a test email from Nirchal.</p>'
  })
});

const result = await response.json();
console.log(result);
```

You should receive the email within seconds!

## Environment Variables Summary

```bash
# Required Variables (add to Cloudflare Pages → Production)
RESEND_API_KEY=re_abc123xyz... (encrypted)
EMAIL_FROM=support@nirchal.com
EMAIL_FROM_NAME=Nirchal
```

## Email Types Sent by Nirchal

| Email Type | Sent To | Trigger |
|-----------|---------|---------|
| Welcome Email | Customer | New account created |
| Order Received | Customer | Order placed (payment pending) |
| Order Confirmation | Customer | Payment successful |
| Order Notification | support@nirchal.com | New order received |
| Order Status Update | Customer | Admin changes order status |
| Shipping Update | Customer | Order shipped |
| Password Reset | Customer | User requests password reset |
| Password Changed | Customer | Password successfully changed |

## Monitoring & Analytics

### Resend Dashboard

View email stats at: https://resend.com/emails

You can see:
- 📊 Emails sent, delivered, bounced
- 📧 Individual email details
- 🔍 Search by recipient or subject
- 📈 Delivery rate over time

### Check Email Deliverability

Use these tools to test:

1. **Mail Tester**: https://www.mail-tester.com/
   - Send test email to provided address
   - Get spam score (aim for 9/10 or 10/10)

2. **MX Toolbox**: https://mxtoolbox.com/SuperTool.aspx
   - Check SPF: `mxtoolbox.com/spf.aspx?domain=nirchal.com`
   - Check DKIM: `mxtoolbox.com/dkim.aspx?domain=nirchal.com`

## Troubleshooting

### Domain Not Verified

**Problem**: Domain shows "Pending" in Resend

**Solution**:
```bash
# Check DNS propagation
nslookup -type=txt nirchal.com
nslookup -type=txt resend._domainkey.nirchal.com

# Or use online tool
https://dnschecker.org/
```

Wait up to 24 hours for DNS propagation (usually 5-10 minutes).

### Emails Going to Spam

**Problem**: Emails landing in spam folder

**Solutions**:
1. ✅ Verify domain in Resend
2. ✅ Add SPF record
3. ✅ Add DKIM record
4. ✅ Add DMARC record
5. ✅ Test with mail-tester.com
6. ✅ Use proper "From" name (not generic)
7. ✅ Include unsubscribe link in marketing emails

### API Key Invalid

**Problem**: `401 Unauthorized` error

**Solution**:
1. Check API key starts with `re_`
2. Verify it's added to Cloudflare environment variables
3. Make sure it's for the correct domain
4. Regenerate API key if needed

### Rate Limit Exceeded

**Problem**: `429 Too Many Requests`

**Solution**:
- Free tier: 3,000 emails/month
- Upgrade to Pro for 50,000 emails/month
- Check for email loops (sending same email repeatedly)

## Resend API Reference

### Send Email Endpoint

```typescript
POST https://api.resend.com/emails

Headers:
  Authorization: Bearer {RESEND_API_KEY}
  Content-Type: application/json

Body:
{
  "from": "Nirchal <support@nirchal.com>",
  "to": ["customer@example.com"],
  "subject": "Your order confirmation",
  "html": "<h1>Thank you!</h1>",
  "text": "Thank you!",
  "reply_to": "orders@nirchal.com",
  "cc": ["manager@nirchal.com"],
  "bcc": ["archive@nirchal.com"]
}

Response:
{
  "id": "email_12345",
  "from": "support@nirchal.com",
  "to": ["customer@example.com"],
  "created_at": "2025-10-15T12:00:00.000Z"
}
```

### Check Email Status

```typescript
GET https://api.resend.com/emails/{email_id}

Headers:
  Authorization: Bearer {RESEND_API_KEY}

Response:
{
  "id": "email_12345",
  "status": "delivered", // delivered, bounced, opened, clicked
  "last_event": "delivered",
  "from": "support@nirchal.com",
  "to": ["customer@example.com"],
  "subject": "Your order confirmation",
  "created_at": "2025-10-15T12:00:00.000Z"
}
```

## Migration from Zoho

### Old Netlify Setup (Zoho Direct SMTP)
```typescript
// ❌ No longer works (Netlify Functions with nodemailer)
nodemailer.createTransport({
  host: 'smtppro.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: 'support@nirchal.com',
    pass: 'zoho-password'
  }
});
```

### New Cloudflare Setup (Resend API)
```typescript
// ✅ Works perfectly with Cloudflare Pages Functions
await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'Nirchal <support@nirchal.com>',
    to: 'customer@example.com',
    subject: 'Your order confirmation',
    html: '<html>...</html>'
  })
});
```

## Best Practices

### 1. Use Descriptive From Names
```typescript
// ❌ Bad
from: "noreply@nirchal.com"

// ✅ Good
from: "Nirchal <support@nirchal.com>"
from: "Nirchal Orders <orders@nirchal.com>"
```

### 2. Include Plain Text Version
```typescript
{
  html: "<h1>Hello!</h1><p>Your order...</p>",
  text: "Hello! Your order..." // Fallback for old email clients
}
```

### 3. Set Reply-To for Better UX
```typescript
{
  from: "Nirchal <noreply@nirchal.com>",
  reply_to: "support@nirchal.com" // Customers can reply here
}
```

### 4. Handle Errors Gracefully
```typescript
try {
  await sendEmail(...);
} catch (error) {
  console.error('Email failed:', error);
  // Don't block checkout if email fails
}
```

## Support & Resources

- **Documentation**: https://resend.com/docs
- **API Reference**: https://resend.com/docs/api-reference
- **Status Page**: https://status.resend.com
- **Support**: https://resend.com/support

## Next Steps

- [x] Create Resend account
- [x] Add domain to Resend
- [ ] Configure DNS records (SPF, DKIM, DMARC)
- [ ] Verify domain in Resend dashboard
- [ ] Generate API key
- [ ] Add environment variables to Cloudflare
- [ ] Deploy updated code
- [ ] Test email sending with real order
- [ ] Monitor deliverability in Resend dashboard

## Cost Estimate for Nirchal

Assuming average e-commerce store:
- 5-10 orders/day = 150-300 orders/month
- 3-4 emails per order (welcome, order received, confirmation, shipping)
- **Total**: ~1,000 emails/month

**Recommendation**: Start with **Free tier** (3,000 emails/month). Upgrade to Pro ($20/month) when you exceed 3,000 emails.
