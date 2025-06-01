import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../../hooks/useContent';
import { RefreshCcw, Clock, PackageX, CreditCard, Award } from 'lucide-react';

const ReturnPolicyPage: React.FC = () => {
  const { data: returnInfo, loading, error } = useContent('return');

  const getIconForTitle = (title: string) => {
    if (title.toLowerCase().includes('window')) return <Clock className="w-8 h-8 text-primary-600" />;
    if (title.toLowerCase().includes('process')) return <RefreshCcw className="w-8 h-8 text-primary-600" />;
    if (title.toLowerCase().includes('refund')) return <CreditCard className="w-8 h-8 text-primary-600" />;
    if (title.toLowerCase().includes('exchange')) return <Award className="w-8 h-8 text-primary-600" />;
    return <PackageX className="w-8 h-8 text-primary-600" />;
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
          <p className="text-red-600">Error loading return policy information. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Return Policy - Nirchal</title>
        <meta name="description" content="Learn about Nirchal's return and exchange policies, refund process, and more." />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
          Return Policy
        </h1>

        <div className="space-y-8">
          {returnInfo
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
            Need Help with Returns?
          </h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about returns or need to initiate a return, our customer service team is here to help.
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

export default ReturnPolicyPage;
