import React from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Privacy Policy - Nirchal</title>
        <meta name="description" content="Nirchal's privacy policy and data protection practices" />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-6">
            At Nirchal, we take your privacy seriously. This policy outlines how we collect, 
            use, and protect your personal information.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Personal information (name, email, shipping address)</li>
              <li>Payment information (processed securely through our payment partners)</li>
              <li>Shopping preferences and history</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Communicate about your purchases</li>
              <li>Send promotional offers (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Prevent fraud and enhance security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We never sell your personal information to third parties. We only share your 
              information with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Shipping partners to deliver your orders</li>
              <li>Payment processors to handle transactions</li>
              <li>Service providers who assist our operations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate technical and organizational measures to protect your 
              personal information. However, no method of transmission over the internet is 
              100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-600 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about our privacy policy or practices, please contact 
              us at <a href="mailto:privacy@nirchal.com" className="text-primary-600 hover:text-primary-700">
              privacy@nirchal.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;