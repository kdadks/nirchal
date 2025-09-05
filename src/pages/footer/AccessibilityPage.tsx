import React from 'react';
import { Helmet } from 'react-helmet-async';

const AccessibilityPage: React.FC = () => (
  <>
    <Helmet>
      <title>Accessibility - Nirchal</title>
      <meta name="description" content="Read about Nirchal's commitment to accessibility for all users." />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-3xl bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-primary-700">Accessibility Statement</h1>
        <p className="mb-4 text-gray-700 text-sm md:text-base">Nirchal is committed to making our website accessible to everyone, including people with disabilities.</p>
        <h2 className="font-semibold text-lg md:text-xl mt-6 md:mt-8 mb-2">Our Commitment</h2>
        <ul className="list-disc ml-6 text-gray-700 mb-4 text-sm md:text-base">
          <li>We strive to meet WCAG 2.1 accessibility standards</li>
          <li>We regularly test and improve our website for accessibility</li>
        </ul>
        <h2 className="font-semibold text-lg md:text-xl mt-6 md:mt-8 mb-2">Feedback</h2>
        <p className="mb-4 text-gray-700 text-sm md:text-base">If you encounter any accessibility barriers, please let us know so we can address them promptly.</p>
        <p className="mt-6 md:mt-8 text-gray-600 text-sm md:text-base">Contact us at <a href="mailto:support@nirchal.com" className="text-primary-600 underline">support@nirchal.com</a>.</p>
      </div>
    </div>
  </>
);

export default AccessibilityPage;
