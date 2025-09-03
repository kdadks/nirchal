import React from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicyPage: React.FC = () => (
  <>
    <Helmet>
      <title>Privacy Policy - Nirchal</title>
      <meta name="description" content="Read Nirchal's privacy policy for information on how we protect your data and privacy." />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <section className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-xl shadow-lg p-6 md:p-8 mb-8 md:mb-10 text-center">
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg md:text-xl text-amber-100 mb-2">Your privacy is important to us. This policy explains how Nirchal collects, uses, and protects your personal information.</p>
        </section>
        <section className="bg-white rounded-xl shadow p-6 md:p-8">
          <h2 className="font-semibold text-lg md:text-xl mb-2 text-primary-700">Information We Collect</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-4">
            <li>Personal details (name, email, address, phone)</li>
            <li>Order and payment information</li>
            <li>Browsing and usage data</li>
          </ul>
          <h2 className="font-semibold text-lg md:text-xl mb-2 text-primary-700">How We Use Your Information</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-4">
            <li>To process orders and provide services</li>
            <li>To improve our website and offerings</li>
            <li>To communicate with you about your orders and offers</li>
          </ul>
          <h2 className="font-semibold text-lg md:text-xl mb-2 text-primary-700">Data Security</h2>
          <p className="mb-4 text-gray-700">We use industry-standard security measures to protect your data. Your payment information is encrypted and never stored on our servers.</p>
          <h2 className="font-semibold text-lg md:text-xl mb-2 text-primary-700">Your Rights</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-4">
            <li>Access, update, or delete your personal data</li>
            <li>Opt out of marketing communications</li>
          </ul>
          <p className="mt-8 text-gray-600">For questions, contact us at <a href="mailto:privacy@nirchal.com" className="text-primary-600 underline">privacy@nirchal.com</a>.</p>
        </section>
      </div>
    </div>
  </>
);

export default PrivacyPolicyPage;
