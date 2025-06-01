import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../../hooks/useContent';
import { Scale, UserCheck, ShoppingBag, AlertCircle, Copyright } from 'lucide-react';

const TermsPage: React.FC = () => {
  const { data: terms, loading, error } = useContent('terms');

  const getIconForTitle = (title: string) => {
    if (title.toLowerCase().includes('accept')) return <Scale className="w-8 h-8 text-primary-600" />;
    if (title.toLowerCase().includes('account')) return <UserCheck className="w-8 h-8 text-primary-600" />;
    if (title.toLowerCase().includes('product')) return <ShoppingBag className="w-8 h-8 text-primary-600" />;
    if (title.toLowerCase().includes('intellectual')) return <Copyright className="w-8 h-8 text-primary-600" />;
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
          <p className="text-red-600">Error loading terms of service. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Terms of Service - Nirchal</title>
        <meta name="description" content="Read Nirchal's terms of service and user agreement." />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
          Terms of Service
        </h1>

        <div className="prose max-w-none text-gray-600 mb-8">
          <p>
            Please read these terms of service carefully before using our website or services. 
            By using Nirchal, you agree to be bound by the following terms and conditions.
          </p>
        </div>

        <div className="space-y-8">
          {terms
            .sort((a, b) => a.order_num - b.order_num)
            .map((section) => (
              <div key={section.id} className="flex space-x-6">
                {getIconForTitle(section.title)}
                <div>
                  <h2 className="text-xl font-serif font-semibold text-gray-900 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-12 p-6 bg-primary-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Questions About Our Terms?
          </h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about our terms of service, please don't hesitate to contact our customer service team.
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

export default TermsPage;
