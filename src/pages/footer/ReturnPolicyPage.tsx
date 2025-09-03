import React from 'react';
import { Helmet } from 'react-helmet-async';



const ReturnPolicyPage: React.FC = () => (
  <>
    <Helmet>
      <title>Return Policy - Nirchal</title>
      <meta name="description" content="Read Nirchal's return policy for information on returns, exchanges, and refunds." />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <section className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-xl shadow-lg p-6 md:p-8 mb-8 md:mb-10 text-center">
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Return & Refund Policy</h1>
          <p className="text-lg md:text-xl text-amber-100 mb-2">We want you to love your purchase. If you are not satisfied, you may return eligible items within 30 days of delivery.</p>
        </section>
        <section className="bg-white rounded-xl shadow p-6 md:p-8">
          <h2 className="font-semibold text-lg md:text-xl mb-2 text-primary-700">Return Conditions</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-4">
            <li>Items must be unused, unwashed, and in original packaging</li>
            <li>Custom-made or altered items are not eligible</li>
            <li>Return request must be initiated within 30 days</li>
          </ul>
          <h2 className="font-semibold text-lg md:text-xl mb-2 text-primary-700">How to Return</h2>
          <ul className="list-disc ml-6 text-gray-700 mb-4">
            <li>Log in to your account and select the order</li>
            <li>Choose the item(s) to return and follow the instructions</li>
            <li>Pack the item securely and ship to the provided address</li>
          </ul>
          <h2 className="font-semibold text-lg md:text-xl mb-2 text-primary-700">Refunds</h2>
          <p className="mb-4 text-gray-700">Refunds are processed within 7 business days after we receive and inspect your return. Refunds are issued to the original payment method.</p>
          <p className="mt-8 text-gray-600">For questions, contact us at <a href="mailto:returns@nirchal.com" className="text-primary-600 underline">returns@nirchal.com</a>.</p>
        </section>
      </div>
    </div>
  </>
);

export default ReturnPolicyPage;
