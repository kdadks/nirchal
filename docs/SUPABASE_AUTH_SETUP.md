# Supabase Authentication Setup Guide

## Issue Resolution: Unable to Login with Supabase User

### Fixed Issues:
1. **Missing signIn function** - Added `signIn` method to AuthContext
2. **Hardcoded authentication** - Fixed App.tsx to properly check auth state
3. **Missing auth wrapper** - Created AdminWrapper component
4. **Improved error handling** - Added detailed error messages and logging

### Setup Steps:

#### 1. Environment Variables
Create a `.env` file in the project root with your Supabase credentials:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Other Environment Variables
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Nirchal
```

#### 2. Supabase Project Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Enable Authentication**:
   - Go to Authentication > Settings
   - Enable email authentication
   - Configure any additional providers if needed

3. **Create Admin User**:
   ```sql
   -- In Supabase SQL Editor, create an admin user:
   INSERT INTO auth.users (
     email,
     encrypted_password,
     email_confirmed_at,
     created_at,
     updated_at,
     raw_app_meta_data,
     raw_user_meta_data
   ) VALUES (
     'support@nirchal.com',
     crypt('your-secure-password', gen_salt('bf')),
     now(),
     now(),
     now(),
     '{"provider":"email","providers":["email"]}',
     '{"role":"admin"}'
   );
   ```

   **OR** use the Supabase Dashboard:
   - Go to Authentication > Users
   - Click "Add User"
   - Enter email and password
   - Click "Create User"

#### 3. Test the Login

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to admin login**:
   ```
   http://localhost:5173/admin/login
   ```

3. **Use your admin credentials**:
   - Email: `support@nirchal.com` (or the email you created)
   - Password: Your chosen password

#### 4. Debugging Steps

If login still fails, check the browser console for errors:

1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Look for error messages** starting with:
   - `[Supabase Config]`
   - `AuthContext:`
   - `Attempting login with:`

#### 5. Common Issues & Solutions

**Issue**: Environment variables not loaded
- **Solution**: Ensure `.env` file is in project root and restart dev server

**Issue**: Supabase URL or key incorrect
- **Solution**: Double-check values in Supabase dashboard under Settings > API

**Issue**: User doesn't exist
- **Solution**: Create user via Supabase dashboard or SQL command above

**Issue**: Authentication disabled
- **Solution**: Enable email auth in Supabase dashboard under Authentication > Settings

**Issue**: CORS errors
- **Solution**: Check if your domain is allowed in Supabase dashboard under Authentication > Settings

#### 6. Security Notes

- Never commit `.env` file to version control
- Use strong passwords for admin accounts
- Consider enabling 2FA in production
- Regularly rotate API keys

#### 7. Updated Components

The following components have been updated to fix the login issue:

1. **AuthContext.tsx** - Added signIn method with proper error handling
2. **LoginPage.tsx** - Modernized UI and fixed form submission
3. **AdminWrapper.tsx** - New component for proper authentication checking
4. **App.tsx** - Fixed routing to use proper authentication

### Test Credentials

For development/testing, you can create a test admin user:
- Email: `support@nirchal.com`
- Password: `Admin123!` (or your preferred secure password)

### Next Steps

1. Set up your `.env` file with correct Supabase credentials
2. Create an admin user in Supabase
3. Test the login functionality
4. Set up proper user roles and permissions for production

The admin console now features a modern, secure login system with proper error handling and user feedback.
