import React from 'react';
import Layout from '../../components/layout/Layout';

const ReturnPolicyPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
            Return & Exchange Policy
          </h1>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Return Policy Overview
              </h2>
              <p className="text-gray-600 mb-4">
                We want you to be completely satisfied with your purchase. If you are not entirely happy with your order, we accept returns within 14 days of delivery.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Return Conditions
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Items must be unused, unworn, and in their original packaging</li>
                <li>All tags and labels must be intact</li>
                <li>Items must not be damaged or soiled</li>
                <li>Original invoice/receipt must be included</li>
                <li>Sale items are final sale and cannot be returned</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Exchange Process
              </h2>
              <p className="text-gray-600 mb-4">
                To initiate an exchange:
              </p>
              <ol className="list-decimal pl-6 text-gray-600 space-y-2">
                <li>Contact our customer service within 48 hours of receiving your order</li>
                <li>Fill out the return form included with your order</li>
                <li>Pack the item securely in its original packaging</li>
                <li>Ship the item back using our return shipping label</li>
                <li>Once received, we will process your exchange within 3-5 business days</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Refund Process
              </h2>
              <p className="text-gray-600 mb-4">
                Once we receive your return:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>We will inspect the item to ensure it meets return conditions</li>
                <li>Refund will be processed within 5-7 business days</li>
                <li>You will receive an email confirmation when refund is processed</li>
                <li>Refund will be credited to your original payment method</li>
                <li>Shipping charges are non-refundable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Non-Returnable Items
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Customized or personalized items</li>
                <li>Sale items marked as final sale</li>
                <li>Intimate wear and accessories</li>
                <li>Items damaged due to customer misuse</li>
                <li>Items without original packaging or tags</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-600">
                If you have any questions about our return policy, please contact our customer service:
              </p>
              <ul className="text-gray-600 mt-2">
                <li>Email: returns@nirchal.com</li>
                <li>Phone: +91 123 456 7890</li>
                <li>Hours: 10 AM - 7 PM IST (Mon-Sat)</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReturnPolicyPage;