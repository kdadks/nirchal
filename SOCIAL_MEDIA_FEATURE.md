# Social Media Settings Feature

## Overview
Added comprehensive social media link management to the admin settings page under the "Shop Settings" tab.

## Features
- **8 Social Media Platforms**: Facebook, Instagram, Twitter, YouTube, LinkedIn, Pinterest, WhatsApp, Telegram
- **Database Integration**: All settings stored in the existing `settings` table under `shop` category
- **Professional UI**: Clean form layout with social media icons and responsive design
- **Validation**: URL validation and helper text for proper input formatting

## Database Setup
The social media settings are automatically included in the `init_settings.sql` file for new installations.

### For Existing Installations
Add these settings to your `settings` table:

```sql
INSERT INTO settings (category, key, value, type, data_type, description, is_required, default_value) VALUES
('shop', 'social_facebook_url', '', 'string', 'string', 'Facebook page URL', false, ''),
('shop', 'social_instagram_url', '', 'string', 'string', 'Instagram profile URL', false, ''),
('shop', 'social_twitter_url', '', 'string', 'string', 'Twitter profile URL', false, ''),
('shop', 'social_youtube_url', '', 'string', 'string', 'YouTube channel URL', false, ''),
('shop', 'social_linkedin_url', '', 'string', 'string', 'LinkedIn profile URL', false, ''),
('shop', 'social_pinterest_url', '', 'string', 'string', 'Pinterest profile URL', false, ''),
('shop', 'social_whatsapp_number', '', 'string', 'string', 'WhatsApp business number (with country code)', false, ''),
('shop', 'social_telegram_url', '', 'string', 'string', 'Telegram channel URL', false, '');
```

## Usage
1. Navigate to **Admin Dashboard** → **Settings** → **Shop Settings**
2. Scroll to **Social Media Links** section
3. Fill in your social media URLs and WhatsApp number
4. Click **Save Changes**

## Code Integration
Access settings using the existing `useSettings` hook:

```typescript
const { getSetting } = useSettings();
const facebookUrl = getSetting('shop', 'social_facebook_url');
const whatsappNumber = getSetting('shop', 'social_whatsapp_number');
```
