// Email Campaign Types

export interface EmailCampaign {
  id: string;
  title: string;
  description?: string;
  subject: string;
  html_content: string;
  sender_email: string;
  sender_name?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  max_retries: number;
  retry_delay_minutes: number;
  resend_campaign_id?: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  bounce_count: number;
  open_count: number;
  click_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaignRecipient {
  id: string;
  campaign_id: string;
  email: string;
  name?: string;
  user_id?: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced' | 'complained' | 'unsubscribed';
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;
  bounce_at?: string;
  error_message?: string;
  retry_count: number;
  last_retry_at?: string;
  opened_at?: string;
  clicked_at?: string;
  unsubscribed_at?: string;
  resend_message_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaignLog {
  id: string;
  campaign_id: string;
  recipient_id?: string;
  event_type: 'created' | 'scheduled' | 'started' | 'sent' | 'delivered' | 'bounced' | 'complained' | 'opened' | 'clicked' | 'failed' | 'retry' | 'unsubscribed';
  event_details?: Record<string, any>;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  title: string;
  description?: string;
  html_content: string;
  category?: string;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignRequest {
  title: string;
  description?: string;
  subject: string;
  html_content: string;
  sender_email: string;
  sender_name?: string;
  recipients: Array<{ email: string; name?: string }>;
  scheduled_at?: string;
  max_retries?: number;
  retry_delay_minutes?: number;
}

export interface UpdateCampaignRequest {
  title?: string;
  description?: string;
  subject?: string;
  html_content?: string;
  sender_email?: string;
  sender_name?: string;
  scheduled_at?: string;
  status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  max_retries?: number;
  retry_delay_minutes?: number;
}

export interface SendCampaignRequest {
  campaign_id: string;
  immediately?: boolean;
}

export interface CampaignStatistics {
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  bounce_count: number;
  open_count: number;
  click_count: number;
  pending_count: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}
