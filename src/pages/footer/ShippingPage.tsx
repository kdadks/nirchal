import React from 'react';

const ShippingPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
            Shipping Policy
          </h1>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Delivery Areas
              </h2>
              <p className="text-gray-600 mb-4">
                We currently deliver to all major cities and towns across India. International shipping is available for select countries.
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>All metro cities - 3-5 business days</li>
                <li>Tier 2 cities - 4-6 business days</li>
                <li>Other locations - 5-8 business days</li>
                <li>International shipping - 10-15 business days</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Shipping Charges
              </h2>
              <p className="text-gray-600 mb-4">
                We offer free shipping on all domestic orders above ₹2,999. For orders below this amount, shipping charges are calculated based on the delivery location and order weight.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Standard Shipping Rates
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li>Metro Cities: ₹99</li>
                  <li>Tier 2 Cities: ₹149</li>
                  <li>Other Locations: ₹199</li>
                  <li>International: Calculated at checkout</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Order Tracking
              </h2>
              <p className="text-gray-600 mb-4">
                Once your order is shipped, you will receive a tracking number via email and SMS. You can track your order status using:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Your account dashboard</li>
                <li>Tracking link in shipping confirmation email</li>
                <li>Customer support</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Shipping Partners
              </h2>
              <p className="text-gray-600 mb-4">
                We work with reliable courier partners to ensure safe and timely delivery of your orders:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>BlueDart</li>
                <li>DTDC</li>
                <li>Delhivery</li>
                <li>FedEx (International)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Important Notes
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Delivery times are estimates and may vary based on location and other factors</li>
                <li>Orders placed after 2 PM will be processed the next business day</li>
                <li>We do not ship on Sundays and national holidays</li>
                <li>Some remote locations may have extended delivery times</li>
                <li>COD service is available for orders up to ₹10,000</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-600">
                For any shipping-related queries, please contact our customer support:
              </p>
              <ul className="text-gray-600 mt-2">
                <li>Email: shipping@nirchal.com</li>
                <li>Phone: +91 123 456 7890</li>
                <li>Hours: 10 AM - 7 PM IST (Mon-Sat)</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
  );
};

export default ShippingPage;