# Settings System Documentation

## Overview

The Nirchal e-commerce platform now includes a comprehensive, database-driven settings management system. This system replaces all hardcoded configuration values with a flexible, secure, and maintainable database-driven approach.

## Architecture

### Database Schema

The settings system consists of two main tables:

1. **`settings_categories`** - Defines the different categories of settings
2. **`settings`** - Stores individual setting key-value pairs

### Features

- **Flexible Data Types**: Support for string, number, boolean, and JSON data types
- **Security**: Built-in encryption for sensitive values like API keys
- **Validation**: Required fields and validation rules
- **User-Friendly**: Admin interface with organized tabs and modern UI
- **Real-time Updates**: Changes are immediately reflected in the application

## Setup Instructions

### 1. Database Initialization

First, ensure your Supabase database is set up and you have the connection details in your `.env` file:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Run Settings Migration

Execute the settings initialization script:

```bash
npm run init-settings
```

This script will:
- Create the necessary database tables and functions
- Set up security policies (RLS)
- Insert default settings categories
- Populate initial configuration values

### 3. Manual Setup (Alternative)

If the automated script fails, you can manually run the SQL files in your Supabase dashboard:

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `src/db/settings_schema.sql`
3. Execute the SQL
4. Copy and paste the contents of `src/db/init_settings.sql`
5. Execute the SQL

## Settings Categories

### Shop Settings
- Store name, email, phone, address
- Business configuration
- Inventory tracking settings
- Order prefixes and thresholds

### Payment Gateway
- Razorpay configuration
- Stripe configuration
- PayPal configuration
- Cash on Delivery settings

### Billing & Tax
- Company information
- GST and PAN details
- Tax rates and billing address

### SEO Settings
- Meta titles and descriptions
- Analytics tracking IDs
- Social media optimization
- Search engine settings

## Usage

### Admin Interface

Navigate to `/admin/settings` in your application to access the settings management interface. The interface provides:

- **Tabbed Navigation**: Organized by category
- **Real-time Validation**: Immediate feedback on changes
- **Secure Password Fields**: Hidden sensitive information
- **Batch Updates**: Save multiple changes at once
- **Change Tracking**: Visual indicators for unsaved changes

### Programmatic Access

Use the `useSettings` hook in your React components:

```typescript
import { useSettings } from '../hooks/useSettings';

function MyComponent() {
  const { getSetting, updateSetting } = useSettings();
  
  // Get a setting value
  const storeName = getSetting('shop', 'store_name');
  
  // Update a setting
  const handleUpdate = async () => {
    await updateSetting('shop', 'store_name', 'New Store Name');
  };
  
  return <div>{storeName}</div>;
}
```

### Direct Database Access

You can also access settings directly through Supabase queries:

```typescript
// Get all settings for a category
const { data } = await supabase
  .from('settings')
  .select('*')
  .eq('category', 'shop');

// Update a specific setting
await supabase.rpc('update_setting', {
  p_category: 'shop',
  p_key: 'store_name',
  p_value: 'New Store Name'
});
```

## Security Features

### Row Level Security (RLS)

All settings tables are protected with RLS policies that ensure:
- Only authenticated users can read settings
- Only admin users can modify settings
- Sensitive settings are encrypted automatically

### Encryption

Sensitive settings (like API keys) are automatically encrypted when stored and decrypted when retrieved. Settings with keys containing:
- `secret`
- `key`
- `password`
- `token`

Are automatically flagged for encryption.

## Extending the System

### Adding New Categories

1. Insert a new category in the database:
```sql
INSERT INTO settings_categories (name, label, description, icon, display_order) 
VALUES ('new_category', 'New Category', 'Description', 'IconName', 5);
```

2. Add settings for the category:
```sql
INSERT INTO settings (category, key, value, data_type, description, is_required, default_value)
VALUES ('new_category', 'setting_key', 'default_value', 'string', 'Description', false, 'default_value');
```

3. Update the SettingsPage component to include the new tab

### Adding New Settings

Use the admin interface or insert directly:

```sql
INSERT INTO settings (category, key, value, data_type, description, is_required, default_value)
VALUES ('existing_category', 'new_setting', 'value', 'string', 'Description', false, 'default');
```

## Troubleshooting

### Common Issues

1. **Settings not loading**: Check Supabase connection and RLS policies
2. **Permission denied**: Ensure user has admin privileges
3. **Migration failed**: Run SQL files manually in Supabase dashboard

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'settings');
```

### Reset Settings

To reset all settings to defaults:
```sql
UPDATE settings SET value = default_value WHERE default_value != '';
```

## Best Practices

1. **Always use the hook**: Use `useSettings` for React components
2. **Validate input**: Check required fields and data types
3. **Handle errors**: Implement proper error handling for setting updates
4. **Cache wisely**: Settings are cached locally for performance
5. **Backup regularly**: Export settings before major changes

## API Reference

### useSettings Hook

```typescript
interface UseSettingsReturn {
  categories: SettingsCategory[];
  settings: Record<string, Record<string, Setting>>;
  loading: boolean;
  error: string | null;
  updateSetting: (category: string, key: string, value: string) => Promise<boolean>;
  updateMultipleSettings: (updates: Array<{category: string; key: string; value: string}>) => Promise<boolean>;
  getSetting: (category: string, key: string) => any;
  getCategorySettings: (category: string) => Record<string, any>;
}
```

### Database Functions

- `get_settings_by_category(category_name)` - Get all settings for a category
- `update_setting(p_category, p_key, p_value)` - Update a single setting
- `encrypt_sensitive_setting(setting_value)` - Encrypt sensitive values
- `decrypt_sensitive_setting(encrypted_value)` - Decrypt sensitive values

---

This settings system provides a robust foundation for managing your e-commerce platform configuration. For additional support or feature requests, please refer to the project documentation or create an issue.
