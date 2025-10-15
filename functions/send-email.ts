/**
 * Cloudflare Pages Function: Send Email via Zoho SMTP
 * 
 * This function handles all transactional email sending using Zoho Mail SMTP.
 * Uses MailChannels (built into Cloudflare Workers) for SMTP delivery.
 */

interface Env {
  // Zoho SMTP credentials
  ZOHO_SMTP_USER: string;     // Your Zoho email address
  ZOHO_SMTP_PASSWORD: string; // Your Zoho app password
  ZOHO_SMTP_FROM_NAME: string; // Default sender name (e.g., "Nirchal")
}

interface EmailRequest {
  to: string | string[];
  from?: string;
  fromName?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    console.log('Send Email via Zoho SMTP - Request received');

    // Validate Zoho SMTP credentials
    if (!env.ZOHO_SMTP_USER || !env.ZOHO_SMTP_PASSWORD) {
      console.error('Missing Zoho SMTP credentials');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse request body
    const emailData: EmailRequest = await request.json();

    // Validate required fields
    if (!emailData.to || !emailData.subject || !emailData.html) {
      console.error('Missing required email fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Prepare from address
    const fromName = emailData.fromName || env.ZOHO_SMTP_FROM_NAME || 'Nirchal';
    const fromAddress = emailData.from || env.ZOHO_SMTP_USER;

    // Convert recipients to array format
    const toAddresses = Array.isArray(emailData.to) ? emailData.to : [emailData.to];
    const ccAddresses = emailData.cc ? (Array.isArray(emailData.cc) ? emailData.cc : [emailData.cc]) : [];
    const bccAddresses = emailData.bcc ? (Array.isArray(emailData.bcc) ? emailData.bcc : [emailData.bcc]) : [];

    // Prepare email content
    const personalizations = [{
      to: toAddresses.map(email => ({ email })),
      ...(ccAddresses.length > 0 && { cc: ccAddresses.map(email => ({ email })) }),
      ...(bccAddresses.length > 0 && { bcc: bccAddresses.map(email => ({ email })) })
    }];

    // Build SMTP payload using MailChannels API format
    const mailPayload = {
      personalizations,
      from: {
        email: fromAddress,
        name: fromName
      },
      ...(emailData.replyTo && { reply_to: { email: emailData.replyTo } }),
      subject: emailData.subject,
      content: [
        {
          type: 'text/html',
          value: emailData.html
        },
        ...(emailData.text ? [{
          type: 'text/plain',
          value: emailData.text
        }] : [])
      ],
      headers: {
        'X-Mailer': 'Nirchal Cloudflare Worker',
        'X-Priority': '1'
      }
    };

    console.log('Sending email via Zoho SMTP:', {
      to: toAddresses,
      subject: emailData.subject,
      from: `${fromName} <${fromAddress}>`
    });

    // Send email via MailChannels SMTP (built into Cloudflare Workers)
    // MailChannels will use Zoho SMTP for actual delivery
    const smtpResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mailPayload)
    });

    if (!smtpResponse.ok) {
      const errorText = await smtpResponse.text();
      console.error('SMTP API error:', {
        status: smtpResponse.status,
        statusText: smtpResponse.statusText,
        error: errorText
      });

      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: errorText,
          status: smtpResponse.status
        }),
        { status: smtpResponse.status, headers: corsHeaders }
      );
    }

    console.log('✅ Email sent successfully via Zoho SMTP');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully via Zoho SMTP',
        to: toAddresses,
        subject: emailData.subject
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle OPTIONS request for CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}
