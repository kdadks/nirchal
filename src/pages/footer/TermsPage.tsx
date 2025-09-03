import React from 'react';
import { Helmet } from 'react-helmet-async';



const TermsPage: React.FC = () => (
  <>
    <Helmet>
      <title>Terms & Conditions - Nirchal</title>
      <meta name="description" content="Read Nirchal's terms and conditions for using our website and services." />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <section className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-xl shadow-lg p-6 md:p-8 mb-8 md:mb-10 text-center">
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-lg md:text-xl text-amber-100 mb-2">By using Nirchal, you agree to our terms and conditions. Please read them carefully before making a purchase.</p>
        </section>
        <section className="bg-white rounded-xl shadow p-6 md:p-8">
          <h2 className="font-semibold text-lg md:text-xl mb-2 text-primary-700">Use of Website</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-4">
            <li>All content is for personal, non-commercial use only</li>
            <li>Do not misuse or copy our content or images</li>
          </ul>
          <h2 className="font-semibold text-lg md:text-xl mb-2 text-primary-700">Orders & Payments</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-4">
            <li>Orders are subject to acceptance and availability</li>
            <li>We reserve the right to refuse or cancel orders</li>
          </ul>
          <h2 className="font-semibold text-lg md:text-xl mb-2 text-primary-700">Liability</h2>
          <p className="mb-4 text-gray-700">Nirchal is not liable for any indirect or consequential loss. Our liability is limited to the value of your order.</p>
          <p className="mt-8 text-gray-600">For questions, contact us at <a href="mailto:legal@nirchal.com" className="text-primary-600 underline">legal@nirchal.com</a>.</p>
        </section>
      </div>
    </div>
  </>
);

export default TermsPage;
