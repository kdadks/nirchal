/**
 * Cloudflare Pages Function: Contact Form Handler
 * 
 * This function handles contact form submissions via Resend API.
 * Sends the contact message to support and an auto-reply to the customer.
 */

interface Env {
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  EMAIL_FROM_NAME: string;
  SUPPORT_EMAIL: string; // Where contact form messages go
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    const data: ContactFormData = await request.json();
    const { name, email, subject, message } = data;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Email to support team
    const supportEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #ea580c; margin: 0 0 10px 0;">📧 New Contact Form Submission</h1>
          <p style="margin: 0; color: #666;">You have received a new message through your website contact form.</p>
        </div>
        
        <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #dee2e6; border-radius: 4px;">
          <div style="font-weight: bold; color: #495057; margin-bottom: 5px;">Name:</div>
          <div style="color: #212529;">${name}</div>
        </div>
        
        <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #dee2e6; border-radius: 4px;">
          <div style="font-weight: bold; color: #495057; margin-bottom: 5px;">Email:</div>
          <div style="color: #212529;">${email}</div>
        </div>
        
        <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #dee2e6; border-radius: 4px;">
          <div style="font-weight: bold; color: #495057; margin-bottom: 5px;">Subject:</div>
          <div style="color: #212529;">${subject}</div>
        </div>
        
        <div style="margin-bottom: 15px; padding: 15px; border: 1px solid #dee2e6; border-radius: 4px;">
          <div style="font-weight: bold; color: #495057; margin-bottom: 5px;">Message:</div>
          <div style="color: #212529;">${message.replace(/\n/g, '<br>')}</div>
        </div>
        
        <div style="background: #e7f3ff; padding: 15px; border-radius: 4px; margin-top: 20px;">
          <p style="margin: 0; color: #0066cc; font-size: 14px;">
            <strong>Reply to:</strong> ${email}
          </p>
        </div>
      </body>
      </html>
    `;

    // Auto-reply email to customer
    const autoReplyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank you for contacting Nirchal</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; min-height: 100vh;">
          <tr>
            <td align="center" valign="top" style="padding: 20px;">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; max-width: 600px; width: 100%;">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #ea580c; padding: 30px 20px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0;">🙏 Thank You!</h1>
                    <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0; opacity: 0.95;">We've received your message</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px 20px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                      <strong>Dear ${name},</strong>
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                      Thank you for reaching out to <strong style="color: #ea580c;">Nirchal</strong>! We truly appreciate you taking the time to contact us.
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                      <strong>📨 Your message:</strong>
                    </p>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #ea580c; padding: 15px; margin: 0 0 20px 0;">
                      <p style="color: #333333; font-size: 14px; margin: 0 0 10px 0;">
                        <strong>Subject:</strong> ${subject || 'General Inquiry'}
                      </p>
                      <p style="color: #333333; font-size: 14px; font-style: italic; margin: 0;">
                        ${message.replace(/\n/g, '<br>')}
                      </p>
                    </div>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                      ✅ <strong>What happens next?</strong>
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                      • Our team will review your message carefully<br>
                      • We'll respond within <strong>24 hours</strong> (usually much sooner!)<br>
                      • You'll receive a personalized response to address your needs
                    </p>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                      <strong>Warm regards,</strong><br>
                      <span style="color: #ea580c; font-weight: bold;">The Nirchal Team</span>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                      <strong style="color: #ea580c;">Nirchal</strong> - Your Trusted Shopping Destination
                    </p>
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      This is an automated response. Please do not reply to this email.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send email to support (support@nirchal.com configured in Cloudflare)
    const supportEmail = env.SUPPORT_EMAIL || 'support@nirchal.com';
    
    const supportResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${env.EMAIL_FROM_NAME || 'Nirchal'} <${env.EMAIL_FROM}>`,
        to: supportEmail,
        reply_to: email,
        subject: `Contact Form: ${subject}`,
        html: supportEmailHtml
      })
    });

    if (!supportResponse.ok) {
      const error = await supportResponse.text();
      console.error('Failed to send support email:', error);
      throw new Error('Failed to send message to support');
    }

    // Send auto-reply to customer
    const autoReplyResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${env.EMAIL_FROM_NAME || 'Nirchal'} <${env.EMAIL_FROM}>`,
        to: email,
        subject: '🙏 Thank you for contacting Nirchal - We\'ll be in touch soon!',
        html: autoReplyHtml
      })
    });

    if (!autoReplyResponse.ok) {
      console.error('Failed to send auto-reply email');
      // Don't fail the whole request if auto-reply fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Message sent successfully! We will get back to you soon.'
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to send message. Please try again later.'
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
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  });
}
