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
        <title>Thank you for contacting Nirchal</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f9f9f9;
          }
          .container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { 
            background: linear-gradient(135deg, #ea580c, #f97316); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 30px 20px; }
          .message-box { 
            background: #f8f9fa; 
            border-left: 4px solid #ea580c; 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 4px;
            font-style: italic;
          }
          .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            border-top: 1px solid #e9ecef;
          }
          .website-link { 
            display: inline-block; 
            background: #ea580c; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 600;
            margin: 15px 0;
          }
          .social-info { color: #666; font-size: 14px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🙏 Thank You!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">We've received your message</p>
          </div>
          
          <div class="content">
            <p><strong>Dear ${name},</strong></p>
            
            <p>Thank you for reaching out to <strong>Nirchal</strong>! We truly appreciate you taking the time to contact us.</p>
            
            <p><strong>📨 Your message:</strong></p>
            <div class="message-box">
              <strong>Subject:</strong> ${subject || 'General Inquiry'}<br><br>
              ${message.replace(/\n/g, '<br>')}
            </div>
            
            <p>✅ <strong>What happens next?</strong></p>
            <ul style="padding-left: 20px;">
              <li>Our team will review your message carefully</li>
              <li>We'll respond within <strong>24 hours</strong> (usually much sooner!)</li>
              <li>You'll receive a personalized response to address your needs</li>
            </ul>
            
            <p>While you wait, feel free to explore our latest collections and offers:</p>
            
            <div style="text-align: center;">
              <a href="https://nirchal.netlify.app" class="website-link">🛍️ Visit Our Store</a>
            </div>
            
            <p>We're here to serve you and make your shopping experience delightful. Thank you for choosing Nirchal!</p>
            
            <p style="margin-top: 30px;">
              <strong>Warm regards,</strong><br>
              <span style="color: #ea580c; font-weight: 600;">The Nirchal Team</span><br>
              <small>Customer Support & Service</small>
            </p>
          </div>
          
          <div class="footer">
            <div class="social-info">
              <p><strong>Nirchal</strong> - Your Trusted Shopping Destination</p>
              <p>📧 Email: support@nirchal.com | 🌐 Website: <a href="https://nirchal.netlify.app" style="color: #ea580c;">nirchal.netlify.app</a></p>
              <p><small>This is an automated response. Please do not reply to this email.</small></p>
            </div>
          </div>
        </div>
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
