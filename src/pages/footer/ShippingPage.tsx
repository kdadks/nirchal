import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Truck, Clock, Globe2, ShieldCheck } from 'lucide-react';

const ShippingPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Shipping Information - Nirchal</title>
        <meta name="description" content="Learn about Nirchal's shipping policies and delivery options" />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Shipping Information</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Truck className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Free Standard Shipping</h3>
            <p className="text-gray-600">On all orders above ₹2999</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Clock className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Express Delivery</h3>
            <p className="text-gray-600">2-3 business days nationwide</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <Globe2 className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">International Shipping</h3>
            <p className="text-gray-600">Available to select countries</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <ShieldCheck className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Secure Packaging</h3>
            <p className="text-gray-600">Safe and damage-free delivery</p>
          </div>
        </div>

        <div className="prose prose-lg">
          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Delivery Timeline</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Standard Delivery: 4-6 business days</li>
              <li>Express Delivery: 2-3 business days</li>
              <li>Same Day Delivery: Available in select cities</li>
              <li>International Shipping: 7-14 business days</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Shipping Costs</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Free standard shipping on orders above ₹2999</li>
              <li>Standard shipping: ₹99 for orders below ₹2999</li>
              <li>Express delivery: Additional ₹199</li>
              <li>International shipping: Calculated at checkout</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Order Tracking</h2>
            <p className="text-gray-600">
              Once your order is shipped, you will receive a tracking number via email and SMS. 
              You can track your order status through our website or the courier partner's 
              tracking portal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">International Shipping</h2>
            <p className="text-gray-600 mb-4">
              We currently ship to select countries worldwide. International orders may be 
              subject to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Custom duties and import taxes</li>
              <li>Extended delivery timelines</li>
              <li>Country-specific shipping restrictions</li>
              <li>Additional documentation requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Contact Support</h2>
            <p className="text-gray-600">
              For any shipping-related queries, please contact our support team at{' '}
              <a href="mailto:shipping@nirchal.com" className="text-primary-600 hover:text-primary-700">
                shipping@nirchal.com
              </a>
              {' '}or call us at +91 123 456 7890.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;