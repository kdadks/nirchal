import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../../hooks/useContent';
import { Truck, Clock, Globe, Box, AlertCircle } from 'lucide-react';

const ShippingPage: React.FC = () => {
  const { data: shippingInfo, loading, error } = useContent('shipping');

  const getIconForTitle = (title: string) => {
    if (title.toLowerCase().includes('delivery')) return <Truck className="w-8 h-8 text-primary-600" />;
    if (title.toLowerCase().includes('tracking')) return <Box className="w-8 h-8 text-primary-600" />;
    if (title.toLowerCase().includes('standard')) return <Clock className="w-8 h-8 text-primary-600" />;
    if (title.toLowerCase().includes('international')) return <Globe className="w-8 h-8 text-primary-600" />;
    return <AlertCircle className="w-8 h-8 text-primary-600" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-red-600">Error loading shipping information. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Shipping Information - Nirchal</title>
        <meta name="description" content="Learn about Nirchal's shipping policies, delivery times, and tracking information." />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
          Shipping Information
        </h1>

        <div className="space-y-8">
          {shippingInfo
            .sort((a, b) => a.order_num - b.order_num)
            .map((info) => (
              <div key={info.id} className="flex space-x-6">
                {getIconForTitle(info.title)}
                <div>
                  <h2 className="text-xl font-serif font-semibold text-gray-900 mb-2">
                    {info.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {info.content}
                  </p>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-12 p-6 bg-primary-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Need Help with Shipping?
          </h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about shipping or need assistance tracking your order, our customer service team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition duration-200"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
