import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { transactionalEmailService } from '../services/transactionalEmailService';
import toast from 'react-hot-toast';

const EmailTestPage: React.FC = () => {
  const [testing, setTesting] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: boolean }>({});

  const testEmail = async (emailType: string, emailData: any) => {
    setTesting(emailType);
    try {
      let success = false;
      
      switch (emailType) {
        case 'welcome':
          success = await transactionalEmailService.sendWelcomeEmail(emailData);
          break;
        case 'orderConfirmation':
          success = await transactionalEmailService.sendOrderConfirmationEmail(emailData);
          break;
        case 'orderStatus':
          success = await transactionalEmailService.sendOrderStatusUpdateEmail(emailData);
          break;
        case 'passwordReset':
          success = await transactionalEmailService.sendPasswordResetEmail(emailData.customer, emailData.resetLink);
          break;
        case 'passwordChange':
          success = await transactionalEmailService.sendPasswordChangeConfirmation(emailData);
          break;
        default:
          throw new Error('Unknown email type');
      }
      
      setResults(prev => ({ ...prev, [emailType]: success }));
      
      if (success) {
        toast.success(`${emailType} email sent successfully!`);
      } else {
        toast.error(`Failed to send ${emailType} email`);
      }
    } catch (error) {
      console.error(`Error testing ${emailType} email:`, error);
      setResults(prev => ({ ...prev, [emailType]: false }));
      toast.error(`Error sending ${emailType} email`);
    } finally {
      setTesting(null);
    }
  };

  const mockData = {
    welcome: {
      first_name: 'Test',
      last_name: 'Customer',
      email: 'test@example.com'
    },
    orderConfirmation: {
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      order_number: 'ORD-TEST-001',
      order_total: 2499.99,
      order_date: new Date().toISOString(),
      items: [
        {
          name: 'Elegant Banarasi Saree',
          quantity: 1,
          price: '2499.99'
        }
      ]
    },
    orderStatus: {
      id: 'ORD-TEST-001',
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      total_amount: 2499.99,
      status: 'shipped',
      tracking_number: 'TRK001234567890'
    },
    passwordReset: {
      customer: {
        first_name: 'Test',
        last_name: 'Customer',
        email: 'test@example.com'
      },
      resetLink: 'https://nirchal.netlify.app/reset-password?token=test-token'
    },
    passwordChange: {
      first_name: 'Test',
      last_name: 'Customer',
      email: 'test@example.com'
    }
  };

  const emailTests = [
    {
      type: 'welcome',
      title: 'Welcome Email',
      description: 'Sent when a new customer registers',
      data: mockData.welcome,
      icon: <Mail className="h-5 w-5" />
    },
    {
      type: 'orderConfirmation',
      title: 'Order Confirmation',
      description: 'Sent when an order is successfully placed',
      data: mockData.orderConfirmation,
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      type: 'orderStatus',
      title: 'Order Status Update',
      description: 'Sent when order status changes (processing, shipped, delivered)',
      data: mockData.orderStatus,
      icon: <Send className="h-5 w-5" />
    },
    {
      type: 'passwordReset',
      title: 'Password Reset',
      description: 'Sent when customer requests password reset',
      data: mockData.passwordReset,
      icon: <AlertCircle className="h-5 w-5" />
    },
    {
      type: 'passwordChange',
      title: 'Password Change Confirmation',
      description: 'Sent when customer successfully changes password',
      data: mockData.passwordChange,
      icon: <CheckCircle className="h-5 w-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email System Test</h1>
          <p className="text-gray-600">Test all transactional email templates and delivery system</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📧 Outlook-Compatible Email System</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-800 font-medium">✅ Table-Based Layout</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-800 font-medium">✅ Inline CSS Styles</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-800 font-medium">✅ Outlook MSO Comments</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-800 font-medium">✅ Universal Font Support</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>✨ Enhanced for Outlook:</strong> All email templates now use table-based layouts with inline CSS for maximum compatibility with Outlook, Gmail, Apple Mail, and other major email clients.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {emailTests.map((test) => (
            <div key={test.type} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg text-blue-600">
                    {test.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
                    <p className="text-sm text-gray-600">{test.description}</p>
                  </div>
                </div>
                {results[test.type] !== undefined && (
                  <div className={`p-1 rounded ${results[test.type] ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {results[test.type] ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <details className="group">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                    View test data →
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </details>
              </div>

              <button
                onClick={() => testEmail(test.type, test.data)}
                disabled={testing === test.type}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  testing === test.type
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {testing === test.type ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Test Email</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Testing Instructions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All emails will be sent to test@example.com (update as needed)</li>
            <li>• Check your email provider's logs for delivery status</li>
            <li>• Emails are sent via Zoho SMTP through Netlify Functions</li>
            <li>• Contact form auto-replies are tested separately on the contact page</li>
            <li>• Production emails will use real customer email addresses</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailTestPage;
