import React from 'react';
import { Helmet } from 'react-helmet-async';
import { RefreshCw, Package, CreditCard, MessageCircle } from 'lucide-react';

const ReturnPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Return Policy - Nirchal</title>
        <meta name="description" content="Learn about Nirchal's return, refund, and exchange policies" />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Return Policy</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <RefreshCw className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Easy Returns</h3>
            <p className="text-gray-600">30-day return window for most items</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Package className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Free Return Shipping</h3>
            <p className="text-gray-600">For all eligible returns</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <CreditCard className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quick Refunds</h3>
            <p className="text-gray-600">Processed within 5-7 business days</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <MessageCircle className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600">Assistance with returns & exchanges</p>
          </div>
        </div>

        <div className="prose prose-lg">
          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Return Eligibility</h2>
            <p className="text-gray-600 mb-4">
              Items must be:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Returned within 30 days of delivery</li>
              <li>Unworn, unused, and in original condition</li>
              <li>Include all original tags and packaging</li>
              <li>Accompanied by the original invoice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Non-Returnable Items</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Customized or personalized items</li>
              <li>Intimate wear and jewelry</li>
              <li>Sale items marked as 'Final Sale'</li>
              <li>Items without original packaging or tags</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Return Process</h2>
            <ol className="list-decimal pl-6 text-gray-600 space-y-2">
              <li>Initiate return through your account or contact support</li>
              <li>Receive return shipping label via email</li>
              <li>Pack items securely with all original tags</li>
              <li>Drop off package at nearest courier location</li>
              <li>Track return status through your account</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Refund Information</h2>
            <p className="text-gray-600 mb-4">
              Once we receive and inspect your return:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Refund processed to original payment method</li>
              <li>Processing time: 5-7 business days</li>
              <li>Shipping charges refunded for damaged/incorrect items</li>
              <li>Store credit option available for faster processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-gray-600">
              For assistance with returns or exchanges, contact our support team at{' '}
              <a href="mailto:returns@nirchal.com" className="text-primary-600 hover:text-primary-700">
                returns@nirchal.com
              </a>
              {' '}or call us at +91 123 456 7890.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;