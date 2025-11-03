-- Fix mark_welcome_email_sent function to accept UUID instead of bigint
-- This was causing welcome emails to not be marked as sent

-- Drop the old function
DROP FUNCTION IF EXISTS public.mark_welcome_email_sent(bigint);

-- Recreate with correct UUID parameter type
CREATE OR REPLACE FUNCTION public.mark_welcome_email_sent(customer_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
    UPDATE public.customers 
    SET 
        welcome_email_sent = true,
        welcome_email_sent_at = NOW(),
        updated_at = NOW()
    WHERE id = customer_id;
    
    RETURN FOUND;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.mark_welcome_email_sent(uuid) TO anon, authenticated;

-- Add comment
COMMENT ON FUNCTION public.mark_welcome_email_sent(uuid) IS 'Mark that welcome email has been sent to customer (fixed to use UUID)';
