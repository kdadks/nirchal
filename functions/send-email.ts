/**
 * Cloudflare Pages Function: Send Email via Resend
 * 
 * This function sends emails using Resend API - the best email service for Cloudflare Workers.
 * Resend offers excellent deliverability, simple API, and works perfectly with custom domains.
 * 
 * Environment Variables Required:
 * - RESEND_API_KEY: Your Resend API key (get from resend.com/api-keys)
 * - EMAIL_FROM: From email address (e.g., support@nirchal.com)
 * - EMAIL_FROM_NAME: Sender name (e.g., Nirchal)
 * 
 * Pricing:
 * - Free: 3,000 emails/month
 * - Pro: $20/month for 50,000 emails
 */

interface Env {
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  EMAIL_FROM_NAME: string;
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
    console.log('Send Email via Resend - Request received');

    // Validate Resend API key
    if (!env.RESEND_API_KEY) {
      console.error('Missing Resend API key');
      return new Response(
        JSON.stringify({ error: 'Email service not configured - missing RESEND_API_KEY' }),
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
    const fromName = emailData.fromName || env.EMAIL_FROM_NAME || 'Nirchal';
    const fromAddress = emailData.from || env.EMAIL_FROM;

    // Format from field
    const fromField = `${fromName} <${fromAddress}>`;

    // Convert recipients to array format (Resend accepts strings or arrays)
    const toAddresses = Array.isArray(emailData.to) ? emailData.to : [emailData.to];
    const ccAddresses = emailData.cc ? (Array.isArray(emailData.cc) ? emailData.cc : [emailData.cc]) : undefined;
    const bccAddresses = emailData.bcc ? (Array.isArray(emailData.bcc) ? emailData.bcc : [emailData.bcc]) : undefined;

    console.log('Sending email via Resend:', {
      to: toAddresses,
      subject: emailData.subject,
      from: fromField
    });

    // Build Resend API payload
    const resendPayload: any = {
      from: fromField,
      to: toAddresses,
      subject: emailData.subject,
      html: emailData.html
    };

    // Add optional fields
    if (emailData.text) resendPayload.text = emailData.text;
    if (emailData.replyTo) resendPayload.reply_to = emailData.replyTo;
    if (ccAddresses && ccAddresses.length > 0) resendPayload.cc = ccAddresses;
    if (bccAddresses && bccAddresses.length > 0) resendPayload.bcc = bccAddresses;

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resendPayload)
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Resend API error:', {
        status: resendResponse.status,
        statusText: resendResponse.statusText,
        error: errorText
      });

      return new Response(
        JSON.stringify({
          error: 'Failed to send email via Resend',
          details: errorText,
          status: resendResponse.status
        }),
        { status: resendResponse.status, headers: corsHeaders }
      );
    }

    const resendResult = await resendResponse.json();
    console.log('✅ Email sent successfully via Resend:', resendResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully via Resend',
        id: resendResult.id,
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
