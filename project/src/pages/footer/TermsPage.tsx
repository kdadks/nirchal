import React from 'react';
import { Helmet } from 'react-helmet-async';

const TermsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Terms & Conditions - Nirchal</title>
        <meta name="description" content="Terms and conditions for using Nirchal's services" />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Terms & Conditions</h1>
        
        <div className="prose prose-lg">
          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using Nirchal's website and services, you accept and agree to be 
              bound by these Terms and Conditions. If you do not agree to these terms, please 
              do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">User Account</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>You must be at least 18 years old to create an account</li>
              <li>You are responsible for maintaining account security</li>
              <li>Provide accurate and complete information</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Product Information</h2>
            <p className="text-gray-600 mb-4">
              We strive to provide accurate product information, including prices and 
              availability. However, we reserve the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Modify prices without prior notice</li>
              <li>Limit order quantities of any product</li>
              <li>Refuse or cancel orders at our discretion</li>
              <li>Discontinue products without notice</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Order Acceptance</h2>
            <p className="text-gray-600">
              Your order is an offer to purchase our products. We reserve the right to accept 
              or decline your order for any reason, including product availability, errors in 
              pricing or product information, or suspected fraud.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Payment Terms</h2>
            <p className="text-gray-600">
              By placing an order, you agree to pay the full amount using an approved payment 
              method. All payments must be made in the specified currency, and you agree to 
              any applicable taxes or charges.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="text-gray-600">
              All content on our website, including text, graphics, logos, images, and 
              software, is our property and protected by applicable copyright laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-600">
              We shall not be liable for any indirect, special, incidental, or consequential 
              damages arising from your use of our services or any purchases made through 
              our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. Changes will be 
              effective immediately upon posting to our website. Your continued use of our 
              services constitutes acceptance of any modifications.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;