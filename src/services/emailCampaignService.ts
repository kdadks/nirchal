import { supabase } from '../config/supabase';
import type { 
  EmailCampaign, 
  EmailCampaignRecipient, 
  CreateCampaignRequest,
  UpdateCampaignRequest 
} from '../types/emailCampaign';

export const emailCampaignService = {
  // Create a new campaign
  async createCampaign(data: CreateCampaignRequest): Promise<EmailCampaign> {
    const { recipients, ...campaignData } = data;
    
    // Insert campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .insert({
        ...campaignData,
        total_recipients: recipients.length,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (campaignError) throw campaignError;
    if (!campaign) throw new Error('Failed to create campaign');

    // Insert recipients
    const recipientRecords = recipients.map(r => ({
      campaign_id: campaign.id,
      email: r.email,
      name: r.name || null,
    }));

    const { error: recipientsError } = await supabase
      .from('email_campaign_recipients')
      .insert(recipientRecords);

    if (recipientsError) throw recipientsError;

    return campaign as unknown as EmailCampaign;
  },

  // Get campaign by ID
  async getCampaignById(campaignId: string): Promise<EmailCampaign | null> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data as unknown as EmailCampaign;
  },

  // List all campaigns
  async listCampaigns(limit = 50, offset = 0) {
    const { data, error, count } = await supabase
      .from('email_campaigns')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data, total: count || 0 };
  },

  // Update campaign
  async updateCampaign(campaignId: string, data: UpdateCampaignRequest): Promise<EmailCampaign> {
    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (error) throw error;
    if (!campaign) throw new Error('Campaign not found');

    return campaign as unknown as EmailCampaign;
  },

  // Delete campaign
  async deleteCampaign(campaignId: string): Promise<void> {
    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', campaignId);

    if (error) throw error;
  },

  // Get campaign recipients
  async getCampaignRecipients(campaignId: string): Promise<EmailCampaignRecipient[]> {
    const { data, error } = await supabase
      .from('email_campaign_recipients')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []) as unknown as EmailCampaignRecipient[];
  },

  // Add recipient to campaign
  async addRecipient(
    campaignId: string, 
    email: string, 
    name?: string
  ): Promise<EmailCampaignRecipient> {
    const { data, error } = await supabase
      .from('email_campaign_recipients')
      .insert({
        campaign_id: campaignId,
        email,
        name: name || null,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to add recipient');

    return data as unknown as EmailCampaignRecipient;
  },

  // Remove recipient from campaign
  async removeRecipient(recipientId: string): Promise<void> {
    const { error } = await supabase
      .from('email_campaign_recipients')
      .delete()
      .eq('id', recipientId);

    if (error) throw error;
  },

  // Send campaign (initiate sending)
  async sendCampaign(campaignId: string): Promise<void> {
    try {
      // Call Edge Function to send campaign
      const { error } = await supabase.functions.invoke('send-email-campaign', {
        body: { campaign_id: campaignId }
      });

      if (error) throw error;

      // Update campaign status to 'sending'
      await this.updateCampaign(campaignId, {
        status: 'sending',
      });

      // Log the event
      await this.logCampaignEvent(campaignId, 'started', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sending campaign:', error);
      throw error;
    }
  },

  // Schedule campaign
  async scheduleCampaign(campaignId: string, scheduledAt: string): Promise<EmailCampaign> {
    return this.updateCampaign(campaignId, {
      status: 'scheduled',
      scheduled_at: scheduledAt,
    });
  },

  // Log campaign event
  async logCampaignEvent(
    campaignId: string,
    eventType: string,
    eventDetails?: Record<string, any>,
    recipientId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('email_campaign_logs')
      .insert({
        campaign_id: campaignId,
        recipient_id: recipientId || null,
        event_type: eventType,
        event_details: eventDetails || {},
      });

    if (error) {
      console.error('Error logging campaign event:', error);
    }
  },

  // Get campaign statistics
  async getCampaignStats(campaignId: string) {
    const campaign = await this.getCampaignById(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    return {
      total_recipients: campaign.total_recipients,
      sent_count: campaign.sent_count,
      failed_count: campaign.failed_count,
      bounce_count: campaign.bounce_count,
      open_count: campaign.open_count,
      click_count: campaign.click_count,
      pending_count: campaign.total_recipients - campaign.sent_count - campaign.failed_count,
      delivery_rate: campaign.total_recipients > 0 
        ? ((campaign.sent_count - campaign.bounce_count) / campaign.total_recipients * 100).toFixed(2)
        : 0,
      open_rate: campaign.sent_count > 0 
        ? (campaign.open_count / campaign.sent_count * 100).toFixed(2)
        : 0,
      click_rate: campaign.sent_count > 0 
        ? (campaign.click_count / campaign.sent_count * 100).toFixed(2)
        : 0,
    };
  },

  // Retry failed emails
  async retryFailedEmails(campaignId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('retry-failed-emails', {
        body: { campaign_id: campaignId }
      });

      if (error) throw error;

      await this.logCampaignEvent(campaignId, 'retry', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error retrying failed emails:', error);
      throw error;
    }
  },
};
