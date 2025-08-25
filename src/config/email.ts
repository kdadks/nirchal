// Email configuration for Zoho SMTP
export const emailConfig = {
  smtp: {
    host: 'smtppro.zoho.in',
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.VITE_SMTP_USER, // Your Zoho email
      pass: process.env.VITE_SMTP_PASSWORD, // Your Zoho password or app password
    },
  },
  imap: {
    host: 'imappro.zoho.in',
    port: 993,
    secure: true, // SSL
    auth: {
      user: process.env.VITE_IMAP_USER, // Your Zoho email
      pass: process.env.VITE_IMAP_PASSWORD, // Your Zoho password or app password
    },
  },
  defaults: {
    from: process.env.VITE_SMTP_FROM || 'noreply@yourstore.com',
    replyTo: process.env.VITE_SMTP_REPLY_TO || 'support@yourstore.com',
  },
};

// Email templates
export const emailTemplates = {
  orderConfirmation: {
    subject: 'Order Confirmation - #{orderNumber}',
    template: 'order-confirmation',
  },
  orderShipped: {
    subject: 'Your Order Has Been Shipped - #{orderNumber}',
    template: 'order-shipped',
  },
  orderDelivered: {
    subject: 'Order Delivered - #{orderNumber}',
    template: 'order-delivered',
  },
  passwordReset: {
    subject: 'Password Reset Request',
    template: 'password-reset',
  },
  welcomeEmail: {
    subject: 'Welcome to Our Store!',
    template: 'welcome',
  },
  contactForm: {
    subject: 'New Contact Form Submission',
    template: 'contact-form',
  },
};
