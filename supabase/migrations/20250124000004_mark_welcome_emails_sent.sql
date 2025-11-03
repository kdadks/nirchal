-- Quick Fix: Mark Welcome Emails as Sent for Existing Customers
-- Run this after manually sending welcome emails

-- Update Deepika and Amit (registered users who should have received welcome emails)
UPDATE public.customers
SET 
  welcome_email_sent = true,
  welcome_email_sent_at = NOW()
WHERE id IN (
  '689f705d-9674-4c36-b1e9-5a7e57222b97', -- Deepika
  'b241040c-b73e-445c-ad04-75d2f4ce8152'  -- Amit
)
AND welcome_email_sent = false;

-- Convert Amol from guest to regular user (has phone number)
UPDATE public.customers
SET 
  is_guest = false
WHERE id = 'e7882ec8-0d5a-4170-aa46-612631a2085f'
AND phone IS NOT NULL;

-- Then mark Amol's welcome email as sent too
UPDATE public.customers
SET 
  welcome_email_sent = true,
  welcome_email_sent_at = NOW()
WHERE id = 'e7882ec8-0d5a-4170-aa46-612631a2085f'
AND welcome_email_sent = false;

-- Verify the changes
SELECT 
  first_name,
  last_name,
  email,
  welcome_email_sent,
  welcome_email_sent_at,
  is_guest,
  created_at
FROM public.customers
WHERE id IN (
  '689f705d-9674-4c36-b1e9-5a7e57222b97',
  'b241040c-b73e-445c-ad04-75d2f4ce8152',
  'e7882ec8-0d5a-4170-aa46-612631a2085f'
)
ORDER BY created_at;
