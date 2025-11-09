# 📧 Bulk Email Campaign Feature

Complete guide to the bulk email campaign system for sending newsletters and promotions.

---

## ✨ Overview

Send bulk emails to customers with:
- ✅ Rich HTML email editor
- ✅ Manual recipient selection or CSV import
- ✅ Email scheduling for later
- ✅ Draft saving and preview
- ✅ Delivery tracking and statistics
- ✅ Automatic retry on failures
- ✅ Complete audit logs

**Access**: Admin Panel → Bulk Email Campaigns (Super-Admin only)

---

## 📋 Features

### 1. Email Editor
- **Rich HTML Editor** using Quill
- Formatting: bold, italic, underline, strikethrough
- Lists, colors, backgrounds, links, images
- Real-time preview before sending
- Professional HTML output

### 2. Recipient Management
- **Manual Entry**: Add emails one-by-one with optional names
- **CSV Import**: Upload recipient list (format: `email,name`)
- **Bulk Operations**: Add/remove recipients before sending
- **Duplicate Prevention**: System prevents duplicate emails

### 3. Scheduling
- **Send Now**: Send immediately after creation
- **Schedule Later**: Pick date, time, and timezone
- **Automatic Scheduling**: System respects send time
- **Resend API Integration**: Seamless delivery

### 4. Retry & Reliability
- **Automatic Retries**: Up to 3 retries on failure (configurable)
- **Backoff Strategy**: 5-minute delay between retries
- **Manual Retry**: Retry failed emails anytime
- **Comprehensive Logs**: Track every send attempt

### 5. Analytics & Tracking
- **Delivery Stats**: Sent, failed, bounce counts
- **Engagement Metrics**: Open and click rates
- **Detailed Logs**: View status for each recipient
- **Campaign History**: Download stats and reports

### 6. Draft Saving
- Save campaigns as drafts without sending
- Edit drafts anytime
- Convert draft to scheduled or send immediately
- Never lose work in progress

---

## 🎯 Quick Start

### Creating Your First Campaign

#### Step 1: Navigate to Campaigns
```
Admin Dashboard → Bulk Email Campaigns → New Campaign
```

#### Step 2: Fill Basic Info
- **Title**: Give your campaign a name (e.g., "Summer Sale 2025")
- **Description**: Internal notes (not sent to customers)
- **Sender Email**: `noreply@nirchal.com` (verified Resend sender)
- **Sender Name**: `Nirchal` (appears in "From" field)
- **Subject**: Email subject line (visible in inbox)

#### Step 3: Create Email Content
```
Tab: Email Content → Use Rich HTML Editor

Options:
- Format text (bold, italic, etc.)
- Add links to your products
- Insert product images
- Use colors and backgrounds
- Create lists and tables
```

**Email Formatting Tips:**
```html
<!-- Example: Product Showcase -->
<h1>Summer Collection 2025</h1>
<p>Discover our latest ethnic wear...</p>

<img src="https://example.com/product.jpg" 
     alt="Product" 
     style="max-width: 100%; height: auto;">

<a href="https://nirchal.com/products/item-123" 
   style="background: #d97706; color: white; padding: 10px 20px; border-radius: 5px;">
  Shop Now
</a>
```

#### Step 4: Add Recipients
```
Tab: Recipients

Option A - Manual Entry:
1. Enter email: user@example.com
2. Optional: Add name: John Doe
3. Click "Add"
4. Repeat for each recipient

Option B - CSV Upload:
1. Prepare CSV: email,name
   - user@example.com,John Doe
   - admin@example.com,Admin
2. Click "Upload CSV file"
3. Select your file

Result: Recipients appear in list
```

#### Step 5: Schedule or Send
```
Tab: Schedule

Option A - Send Now:
- Select "Send immediately"
- Click "Send Campaign"

Option B - Schedule Later:
- Select "Schedule for later"
- Pick date and time
- Set max retries (default: 3)
- Click "Schedule Campaign"
```

#### Step 6: Preview & Send
```
Click "Preview" button

Review:
- From: (sender name and email)
- Subject: (email subject)
- Content: (full email preview)

If looks good:
- Click "Send" button
- Confirm action
- Campaign starts sending!
```

---

## 📊 Campaign Dashboard

### Status Overview
- **Draft**: Saved but not sent
- **Scheduled**: Waiting to send at specified time
- **Sending**: Currently delivering emails
- **Sent**: Complete (check analytics)
- **Failed**: Delivery issues (can retry)

### Filter & Search
- Filter by status: All, Draft, Scheduled, Sending, Sent, Failed
- View created date and recipient count
- Sort by date, status, or performance

### Actions Menu (per campaign)
| Icon | Action | When Available |
|------|--------|-----------------|
| 👁️ | Preview | Always |
| ✏️ | Edit | Draft/Scheduled |
| ▶️ | Send Now | Draft only |
| ⬇️ | Export Stats | Sent/Failed |
| 🗑️ | Delete | Draft only |

---

## 🔧 Configuration

### Resend API Setup
1. Get Resend API key from `.env`
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```
2. Verify sender email in Resend dashboard
3. System uses Resend for delivery

### Retry Settings
```typescript
Default Settings:
- max_retries: 3
- retry_delay_minutes: 5
- Retry status: Automatic (or manual "Retry" button)

Custom Settings:
- Edit during campaign creation
- Adjust per campaign basis
- Maximum 10 retries recommended
```

### Email Limits
```
Resend Free Plan:
- 100 emails/day
- Monitor usage in Resend dashboard

Pro Plan:
- Unlimited emails
- Contact Resend for pricing
```

---

## 📈 Analytics & Reporting

### View Campaign Stats
1. Go to Campaigns list
2. Click campaign (sent status)
3. View statistics panel:
   ```
   Total Recipients: 1,000
   Sent: 950
   Failed: 30
   Bounced: 20
   
   Delivery Rate: 95%
   Open Rate: 12%
   Click Rate: 2.3%
   ```

### Recipient Details
- Click campaign → Recipients tab
- See individual recipient status:
  - ✅ Sent
  - ❌ Failed (with error message)
  - ⏳ Pending (if retrying)
  - 📬 Delivered
  - 🚫 Bounced

### Export Stats
- Click campaign → "Export Stats"
- Download CSV with:
  - All recipient emails and status
  - Send/delivery timestamps
  - Open/click data
  - Error messages

---

## ⚠️ Troubleshooting

### Email Not Sending

**Problem**: Campaign stuck in "sending" state
```
Solution:
1. Wait 5+ minutes for current batch
2. Check Resend dashboard for errors
3. Try "Retry" button
4. Check recipient emails are valid
```

**Problem**: Emails go to spam
```
Solution:
1. Use verified sender email
2. Add proper HTML formatting
3. Include unsubscribe link (recommended)
4. Keep HTML under 100KB
5. Avoid spam trigger words
```

### High Bounce Rate

**Problem**: Many emails bouncing
```
Solution:
1. Verify recipient email list
2. Remove invalid/old emails
3. Check database has correct customer emails
4. Use manual entry for testing first
```

### Rate Limiting

**Problem**: Getting rate limit errors
```
Solution:
1. Check daily limit (Resend plan)
2. Wait until next day
3. Upgrade Resend plan if needed
4. Split campaign into smaller batches
```

---

## 🗂️ Database Tables

### email_campaigns
```sql
Column          | Type      | Purpose
----------------|-----------|---------------------------
id              | UUID      | Campaign identifier
title           | VARCHAR   | Campaign name
subject         | VARCHAR   | Email subject line
html_content    | TEXT      | Email HTML body
sender_email    | VARCHAR   | From address
status          | VARCHAR   | draft|scheduled|sending|sent|failed
scheduled_at    | TIMESTAMP | When to send
sent_count      | INT       | Emails sent successfully
failed_count    | INT       | Emails failed
open_count      | INT       | Unique opens
click_count     | INT       | Unique clicks
created_by      | UUID      | Super-admin who created
created_at      | TIMESTAMP | Creation time
```

### email_campaign_recipients
```sql
Column          | Type      | Purpose
----------------|-----------|---------------------------
id              | UUID      | Recipient identifier
campaign_id     | UUID      | Foreign key to campaign
email           | VARCHAR   | Recipient email
name            | VARCHAR   | Recipient name (optional)
status          | VARCHAR   | pending|sent|failed|delivered|bounced
sent_at         | TIMESTAMP | When email sent
error_message   | TEXT      | Failure reason
retry_count     | INT       | Number of retries
resend_message_id| VARCHAR  | Resend tracking ID
opened_at       | TIMESTAMP | When opened
clicked_at      | TIMESTAMP | When clicked
```

### email_campaign_logs
```sql
Column          | Type      | Purpose
----------------|-----------|---------------------------
id              | UUID      | Log entry ID
campaign_id     | UUID      | Campaign being logged
recipient_id    | UUID      | Recipient being logged
event_type      | VARCHAR   | Event (sent|failed|opened|clicked|retry)
event_details   | JSONB     | Event metadata
created_at      | TIMESTAMP | When event occurred
```

---

## 🔐 Security & Permissions

### Access Control
- ✅ **Super-Admin Only**: Create, edit, send campaigns
- ✅ **RLS Policies**: Row-level security enforced
- ✅ **Audit Logs**: All actions logged
- ✅ **User Tracking**: `created_by` tracks creator

### Data Protection
- Emails encrypted in database
- Resend handles GDPR compliance
- Bounce/complaint handling automatic
- Unsubscribe respected

---

## 📝 API Reference

### Service Methods

```typescript
// Create campaign
await emailCampaignService.createCampaign({
  title: "Summer Sale",
  subject: "Special Offer Inside",
  html_content: "<h1>Sale!</h1>",
  sender_email: "noreply@nirchal.com",
  recipients: [
    { email: "user@example.com", name: "John" }
  ]
});

// Send campaign
await emailCampaignService.sendCampaign(campaignId);

// Schedule campaign
await emailCampaignService.scheduleCampaign(
  campaignId, 
  "2025-01-15T10:00:00Z"
);

// Retry failed emails
await emailCampaignService.retryFailedEmails(campaignId);

// Get statistics
const stats = await emailCampaignService.getCampaignStats(campaignId);
```

---

## 🎨 Email Templates (Advanced)

### Save as Template
Templates coming soon! Planned features:
- Save successful campaigns as templates
- Reuse with different recipients
- Pre-designed template library
- Variables for personalization

### Planned Template Variables
```html
<p>Hello {{recipient_name}},</p>
<p>Based on your interest in {{category}}, check out:</p>
```

---

## 📞 Support & FAQ

### Q: Can I send to all customers automatically?
**A**: Not yet - currently manual selection. Future: auto-segment by category/purchase history.

### Q: Can I personalize emails?
**A**: Currently no variables. Future: Support for {{name}}, {{category}}, etc.

### Q: What's the maximum recipients per campaign?
**A**: Unlimited (depends on Resend plan). System processes in batches.

### Q: Can I edit after sending?
**A**: No - campaigns are immutable after sending. Create a new campaign.

### Q: Are there email templates?
**A**: Coming soon! For now, use the rich editor.

### Q: How long does sending take?
**A**: Depends on recipient count. Generally: 100 emails ≈ 1-2 minutes.

---

## 🚀 Best Practices

1. **Always Preview**: Click "Preview" before sending
2. **Test First**: Send to 5-10 emails first, then full list
3. **Use Descriptive Titles**: Name campaigns clearly (e.g., "Summer2025_Sale_V2")
4. **Monitor Stats**: Check open/click rates after sending
5. **Segment Sending**: Large lists in smaller campaigns
6. **Avoid Spam**: No ALL CAPS, excessive links, or suspicious formatting
7. **Mobile Friendly**: Test emails on mobile devices
8. **Include Unsubscribe**: Best practice (future feature)

---

## 📚 Related Documentation

- [Resend Email Service Setup](./RESEND_SETUP_GUIDE.md)
- [Email Service Integration](./EMAIL_SERVICE_INTEGRATION.md)
- [Admin Panel Guide](./ADMIN_GUIDE.md)

---

## ✅ Implementation Checklist

- ✅ Database tables created with RLS
- ✅ Admin UI for campaign management
- ✅ Email editor with rich HTML support
- ✅ Recipient import (manual + CSV)
- ✅ Campaign scheduling
- ✅ Resend integration for sending
- ✅ Delivery tracking & retries
- ✅ Analytics & statistics
- ✅ Comprehensive audit logging
- ⏳ Email templates (planned)
- ⏳ Auto-segmentation (planned)
- ⏳ Email personalization variables (planned)

---

**Version**: 1.0  
**Last Updated**: November 9, 2025  
**Status**: Production Ready ✅  
**Maintained By**: Development Team
