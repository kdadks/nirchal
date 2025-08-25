import { Handler, HandlerResponse } from '@netlify/functions';
import nodemailer from 'nodemailer';

const handler: Handler = async (event, context): Promise<HandlerResponse> => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { to, subject, html, text, type } = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: to, subject, and html/text' }),
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

    // Verify connection
    await transporter.verify();

    // Send email
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      replyTo: process.env.SMTP_REPLY_TO || process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
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
        messageId: result.messageId,
        message: 'Email sent successfully',
      }),
    };
  } catch (error) {
    console.error('Email send error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
