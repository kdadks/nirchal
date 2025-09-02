import { Handler, HandlerResponse } from '@netlify/functions';
import nodemailer from 'nodemailer';

const handler: Handler = async (event, context): Promise<HandlerResponse> => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { name, email, subject, message } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'All fields are required' }),
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtppro.zoho.in',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email HTML template
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .field { margin-bottom: 15px; padding: 15px; border: 1px solid #dee2e6; border-radius: 4px; }
          .label { font-weight: bold; color: #495057; margin-bottom: 5px; }
          .value { color: #212529; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>New Contact Form Submission</h1>
          <p>You have received a new message through your website contact form.</p>
        </div>
        
        <div class="field">
          <div class="label">Name:</div>
          <div class="value">${name}</div>
        </div>
        
        <div class="field">
          <div class="label">Email:</div>
          <div class="value">${email}</div>
        </div>
        
        <div class="field">
          <div class="label">Subject:</div>
          <div class="value">${subject}</div>
        </div>
        
        <div class="field">
          <div class="label">Message:</div>
          <div class="value">${message.replace(/\n/g, '<br>')}</div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      replyTo: email, // Reply to the customer's email
      to: process.env.SMTP_REPLY_TO || process.env.SMTP_USER,
      subject: `Contact Form: ${subject}`,
      html,
    });

    // Send auto-reply to customer
    const autoReplyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank you for contacting Nirchal</title>
        <!--[if mso]>
        <style type="text/css">
          table { border-collapse: collapse; }
          .fallback-font { font-family: Arial, sans-serif !important; }
        </style>
        <![endif]-->
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
        
        <!-- Main Container Table -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; min-height: 100vh;">
          <tr>
            <td align="center" valign="top" style="padding: 20px;">
              
              <!-- Email Content Table -->
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; max-width: 600px; width: 100%;">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #ea580c; padding: 30px 20px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 28px; font-weight: bold; line-height: 1.2; margin: 0; padding: 0;">
                          🙏 Thank You!
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.4; margin: 0; padding: 10px 0 0 0; opacity: 0.95;">
                          We've received your message
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 30px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      
                      <!-- Greeting -->
                      <tr>
                        <td style="color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; padding-bottom: 15px;">
                          <strong>Dear ${name},</strong>
                        </td>
                      </tr>
                      
                      <!-- Thank you message -->
                      <tr>
                        <td style="color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; padding-bottom: 15px;">
                          Thank you for reaching out to <strong style="color: #ea580c;">Nirchal</strong>! We truly appreciate you taking the time to contact us.
                        </td>
                      </tr>
                      
                      <!-- Your message header -->
                      <tr>
                        <td style="color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; padding-bottom: 10px;">
                          <strong>📨 Your message:</strong>
                        </td>
                      </tr>
                      
                      <!-- Message box -->
                      <tr>
                        <td style="background-color: #f8f9fa; border-left: 4px solid #ea580c; padding: 15px; margin: 0 0 20px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6;">
                                <strong>Subject:</strong> ${subject || 'General Inquiry'}
                              </td>
                            </tr>
                            <tr>
                              <td style="color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; padding-top: 10px; font-style: italic;">
                                ${message.replace(/\n/g, '<br>')}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- What happens next -->
                      <tr>
                        <td style="color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; padding: 20px 0 10px 0;">
                          ✅ <strong>What happens next?</strong>
                        </td>
                      </tr>
                      
                      <!-- List -->
                      <tr>
                        <td style="color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; padding-bottom: 15px;">
                          • Our team will review your message carefully<br>
                          • We'll respond within <strong>24 hours</strong> (usually much sooner!)<br>
                          • You'll receive a personalized response to address your needs
                        </td>
                      </tr>
                      
                      <!-- Explore invitation -->
                      <tr>
                        <td style="color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; padding-bottom: 20px;">
                          While you wait, feel free to explore our latest collections and offers:
                        </td>
                      </tr>
                      
                      <!-- CTA Button -->
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="background-color: #ea580c; padding: 12px 24px; text-align: center;">
                                <a href="https://nirchal.netlify.app" style="color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block;">
                                  🛍️ Visit Our Store
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Closing message -->
                      <tr>
                        <td style="color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6; padding-bottom: 30px;">
                          We're here to serve you and make your shopping experience delightful. Thank you for choosing Nirchal!
                        </td>
                      </tr>
                      
                      <!-- Signature -->
                      <tr>
                        <td style="color: #333333; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.6;">
                          <strong>Warm regards,</strong><br>
                          <span style="color: #ea580c; font-weight: bold;">The Nirchal Team</span><br>
                          <small style="color: #666666;">Customer Support & Service</small>
                        </td>
                      </tr>
                      
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="color: #666666; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; padding-bottom: 10px;">
                          <strong style="color: #ea580c;">Nirchal</strong> - Your Trusted Shopping Destination
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; padding-bottom: 10px;">
                          📧 Email: support@nirchal.com | 🌐 Website: <a href="https://nirchal.netlify.app" style="color: #ea580c; text-decoration: none;">nirchal.netlify.app</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #999999; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.4;">
                          This is an automated response. Please do not reply to this email.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
              </table>
              
            </td>
          </tr>
        </table>
        
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: '🙏 Thank you for contacting Nirchal - We\'ll be in touch soon!',
      html: autoReplyHtml,
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        success: true,
        message: 'Message sent successfully! We will get back to you soon.',
      }),
    };
  } catch (error) {
    console.error('Contact form error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to send message. Please try again later.',
      }),
    };
  }
};

export { handler };
