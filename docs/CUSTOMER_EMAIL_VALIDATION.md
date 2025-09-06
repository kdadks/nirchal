# Customer Validation and Welcome Email Logic

## Overview
This document explains the comprehensive customer validation system and welcome email logic implemented to ensure each customer gets only **one welcome email** and proper temp password handling.

## Customer Registration Flows

### 1. Self-Registration through Sign Up Modal
**When:** Customer uses the "Sign Up" button and creates account with their own password
**Process:**
- Customer provides email, password, name, phone
- Account created using `register_customer` RPC function with user-chosen password
- Welcome email sent immediately (without temp password)
- `welcome_email_sent` field marked as `true` in database
- Customer redirected to account dashboard

**Email:** Standard welcome email without login credentials

### 2. Direct Checkout Registration (New Customer)
**When:** Customer goes directly to checkout page without account and places order
**Process:**
- Customer provides email, name, phone during checkout
- System calls `create_checkout_customer` RPC function
- If email doesn't exist: Creates new customer with auto-generated temp password
- Returns: `{ id, temp_password, existing_customer: false, needs_welcome_email: true }`
- Welcome email sent with temp password included
- Order confirmation email sent 30 seconds later
- `welcome_email_sent` field marked as `true` in database

**Email:** Welcome email WITH temp password and login instructions

### 3. Existing Customer Checkout
**When:** Customer with existing account (but never received welcome email) places order
**Process:**
- System calls `create_checkout_customer` RPC function
- Email exists: Updates customer info, no temp password generated
- Returns: `{ id, temp_password: null, existing_customer: true, needs_welcome_email: !welcome_email_sent }`
- If `needs_welcome_email` is true: Send welcome email (without temp password)
- Order confirmation email sent immediately
- `welcome_email_sent` field marked as `true` in database

**Email:** Standard welcome email without temp password (if never received before)

## Database Schema Changes

### New Fields Added to `customers` Table:
```sql
-- Track if welcome email has been sent
welcome_email_sent BOOLEAN DEFAULT false

-- Track when welcome email was sent
welcome_email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
```

## Database Functions

### 1. `create_checkout_customer(p_email, p_first_name, p_last_name, p_phone)`
**Purpose:** Handle customer creation during checkout with proper temp password logic
**Returns:**
```json
{
  "id": "customer_id",
  "temp_password": "ABC12345" | null,
  "existing_customer": boolean,
  "needs_welcome_email": boolean
}
```

### 2. `mark_welcome_email_sent(customer_id)`
**Purpose:** Mark that welcome email has been successfully sent
**Returns:** boolean (success/failure)

## Email Template Updates

### Welcome Email Template Enhanced
- **Standard Version:** For self-registered users (no temp password)
- **Temp Password Version:** For checkout customers with auto-generated credentials
- Includes security warning about changing temp password
- Different CTA buttons: "Start Shopping" vs "Login to Account"

### Template Features:
- Outlook-compatible HTML structure
- Clear temp password display with styling
- Security instructions for temp password users
- Professional branding and formatting

## Flow Logic Implementation

### Checkout Page Logic:
```typescript
// 1. Create/update customer
const customerRes = await upsertCustomerByEmail(supabase, customerData);

// 2. Determine email sending strategy
const shouldSendWelcomeEmail = customerRes?.needsWelcomeEmail || false;
const tempPassword = customerRes?.tempPassword || null;

// 3. Send appropriate emails
if (shouldSendWelcomeEmail) {
  // Send welcome email (with or without temp password)
  await transactionalEmailService.sendWelcomeEmail({
    first_name,
    last_name,
    email,
    temp_password: tempPassword
  });
  
  // Mark as sent in database
  await markWelcomeEmailSent(supabase, customerId);
  
  // Handle order confirmation timing
  if (tempPassword) {
    // New customer with temp password: 30-second delay
    setTimeout(() => sendOrderConfirmation(), 30000);
  } else {
    // Existing customer: immediate order confirmation
    await sendOrderConfirmation();
  }
} else {
  // Customer already received welcome email: immediate order confirmation
  await sendOrderConfirmation();
}
```

### Auth Modal Logic:
```typescript
// Self-registration through modal
const result = await signUp(email, password, firstName, lastName, phone);
if (result.success) {
  // Send welcome email without temp password
  await transactionalEmailService.sendWelcomeEmail({
    first_name: firstName,
    last_name: lastName,
    email: email
    // No temp_password field
  });
  
  // Mark as sent in database
  if (customer?.id) {
    await markWelcomeEmailSent(supabase, customer.id);
  }
}
```

## Customer Journey Examples

### Example 1: First-time Checkout Customer
1. User visits website, adds items to cart
2. Goes to checkout, enters email: `john@example.com`
3. `create_checkout_customer` creates new account with temp password: `ABC12345`
4. Welcome email sent with temp password and login instructions
5. 30 seconds later: Order confirmation email sent
6. User can login with `john@example.com` / `ABC12345`
7. System prompts to change password on first login

### Example 2: Self-Registered Customer
1. User clicks "Sign Up" and creates account with email: `jane@example.com`, password: `mypassword123`
2. Welcome email sent immediately (without temp password)
3. User can immediately login and shop
4. If they place order later: Only order confirmation email sent (no duplicate welcome)

### Example 3: Existing Customer (No Welcome Email Yet)
1. Customer exists from old system migration but never received welcome email
2. Places order with email: `bob@example.com`
3. System detects: existing customer, `welcome_email_sent = false`
4. Sends welcome email (without temp password) + immediate order confirmation
5. Future orders: Only order confirmation emails

## Security Features

### Temp Password Security:
- 8-character alphanumeric temp passwords
- Auto-generated using secure random function
- Clearly marked in email as temporary
- Users warned to change password immediately
- Temp password cleared from session after password change

### Email Validation:
- Database-level tracking prevents duplicate welcome emails
- Atomic operations ensure consistency
- Graceful fallback if RPC functions fail

## Testing Scenarios

### Test Case 1: New Checkout Customer
- Email: `new@test.com`
- Expected: Welcome email with temp password + delayed order confirmation

### Test Case 2: Existing Customer Order
- Email: `existing@test.com` (already has `welcome_email_sent = true`)
- Expected: Only order confirmation email

### Test Case 3: Self Registration
- Email: `signup@test.com`
- Expected: Welcome email without temp password + immediate access

## Monitoring and Logs

### Console Logging:
- `"Welcome email sent successfully with temp password"`
- `"Welcome email sent successfully for existing customer"`
- `"Order confirmation email sent successfully (after welcome email delay)"`
- `"Order confirmation email sent successfully"`

### Error Handling:
- Email failures don't block checkout process
- Temp password generation failures fall back to regular customer creation
- Database marking failures logged but don't affect user experience

## Files Modified

### Core Files:
1. `src/services/outlookCompatibleEmailTemplates.ts` - Enhanced welcome email template
2. `src/services/transactionalEmailService.ts` - Added temp password support
3. `src/pages/CheckoutPage.tsx` - Comprehensive email flow logic
4. `src/components/auth/CustomerAuthModal.tsx` - Self-registration email handling
5. `src/utils/orders.ts` - Customer creation and email tracking utilities

### Database Files:
1. `src/db/create_checkout_customer.sql` - Checkout customer creation function
2. `src/db/add_welcome_email_tracking.sql` - Welcome email tracking schema

This implementation ensures that every customer receives exactly one welcome email, with appropriate content based on their registration method, and proper temp password handling for checkout customers.
