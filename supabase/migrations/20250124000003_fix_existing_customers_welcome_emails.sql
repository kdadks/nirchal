-- Manual Script: Send Welcome Emails to Existing Customers
-- Run this ONCE to fix existing customers who never received welcome emails

-- This script will:
-- 1. Identify customers who haven't received welcome emails
-- 2. You can then trigger welcome emails for them manually
-- 3. Mark them as welcome_email_sent = true

-- Step 1: Identify customers needing welcome emails
SELECT 
  id,
  first_name,
  last_name,
  email,
  created_at,
  welcome_email_sent,
  is_guest,
  CASE 
    WHEN is_guest THEN 'Skip - Guest User'
    WHEN welcome_email_sent THEN 'Already Sent'
    ELSE 'Needs Welcome Email'
  END as action_needed
FROM public.customers
WHERE welcome_email_sent = false
  AND is_guest = false
ORDER BY created_at ASC;

-- Step 2: Mark specific customers as having received welcome email
-- (Run this AFTER manually sending welcome emails via admin panel)
-- UPDATE public.customers
-- SET 
--   welcome_email_sent = true,
--   welcome_email_sent_at = NOW()
-- WHERE id IN (
--   '689f705d-9674-4c36-b1e9-5a7e57222b97', -- Deepika
--   'b241040c-b73e-445c-ad04-75d2f4ce8152'  -- Amit
-- );

-- Step 3: Fix guest user who should be regular user
-- (If Amol has completed registration, mark as non-guest)
-- UPDATE public.customers
-- SET is_guest = false
-- WHERE id = 'e7882ec8-0d5a-4170-aa46-612631a2085f'
--   AND phone IS NOT NULL; -- Has phone = completed registration

-- Step 4: Verify the updates
SELECT 
  id,
  first_name,
  last_name,
  email,
  welcome_email_sent,
  welcome_email_sent_at,
  is_guest
FROM public.customers
WHERE id IN (
  '689f705d-9674-4c36-b1e9-5a7e57222b97',
  'b241040c-b73e-445c-ad04-75d2f4ce8152',
  'e7882ec8-0d5a-4170-aa46-612631a2085f'
);
