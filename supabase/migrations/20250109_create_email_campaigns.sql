-- Bulk Email Campaign Feature
-- Tables for managing email campaigns, recipients, and delivery tracking

-- Email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    
    -- Status: draft, scheduled, sending, sent, failed
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Retry settings
    max_retries INT DEFAULT 3,
    retry_delay_minutes INT DEFAULT 5,
    
    -- Resend API
    resend_campaign_id VARCHAR(255),
    
    -- Statistics
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    bounce_count INT DEFAULT 0,
    open_count INT DEFAULT 0,
    click_count INT DEFAULT 0,
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT status_check CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed'))
);

-- Email campaign recipients table
CREATE TABLE IF NOT EXISTS email_campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    user_id UUID REFERENCES auth.users(id),
    
    -- Delivery tracking
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    bounce_at TIMESTAMP WITH TIME ZONE,
    
    -- Error tracking
    error_message TEXT,
    retry_count INT DEFAULT 0,
    last_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Engagement tracking
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    
    -- Resend tracking
    resend_message_id VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT delivery_status_check CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'bounced', 'complained', 'unsubscribed')),
    UNIQUE(campaign_id, email)
);

-- Email campaign history/logs table
CREATE TABLE IF NOT EXISTS email_campaign_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES email_campaign_recipients(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT event_type_check CHECK (event_type IN ('created', 'scheduled', 'started', 'sent', 'delivered', 'bounced', 'complained', 'opened', 'clicked', 'failed', 'retry', 'unsubscribed'))
);

-- Email templates table (optional - for reusable templates)
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    html_content TEXT NOT NULL,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_at ON email_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_by ON email_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_campaign_id ON email_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_status ON email_campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_email ON email_campaign_recipients(email);
CREATE INDEX IF NOT EXISTS idx_email_campaign_logs_campaign_id ON email_campaign_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_logs_event_type ON email_campaign_logs(event_type);

-- RLS Policies
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Only authenticated admin users can create and manage email campaigns
-- Admin users are identified by being in auth.users (not customers table)
CREATE POLICY "admin_campaigns_full_access"
    ON email_campaigns
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated admin users can manage recipients
CREATE POLICY "admin_recipients_full_access"
    ON email_campaign_recipients
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated admin users can view logs
CREATE POLICY "admin_logs_full_access"
    ON email_campaign_logs
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated admin users can manage templates
CREATE POLICY "admin_templates_full_access"
    ON email_templates
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
