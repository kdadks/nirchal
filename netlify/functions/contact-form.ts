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
        <title>Thank you for contacting us</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Thank You!</h1>
        </div>
        
        <div class="content">
          <p>Hi ${name},</p>
          
          <p>Thank you for contacting us! We have received your message and will get back to you as soon as possible.</p>
          
          <p><strong>Your message:</strong></p>
          <p style="font-style: italic; border-left: 3px solid #28a745; padding-left: 15px;">${message}</p>
          
          <p>We typically respond within 24 hours.</p>
          
          <p>Best regards,<br>The Support Team</p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Thank you for contacting us',
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
