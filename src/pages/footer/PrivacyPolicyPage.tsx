import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../../hooks/useContent';

const PrivacyPolicyPage: React.FC = () => {
  const { data: sections, loading, error } = useContent('privacy');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
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
          <p className="text-red-600">Error loading privacy policy. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Privacy Policy - Nirchal</title>
        <meta name="description" content="Learn about how Nirchal protects and handles your personal information." />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>

        <div className="space-y-8">
          {sections
            .sort((a, b) => a.order_num - b.order_num)
            .map((section) => (
              <div key={section.id} className="prose max-w-none">
                {section.title && (
                  <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                )}
                <p className="text-gray-600 leading-relaxed mb-4">
                  {section.content}
                </p>
                {section.list_items && section.list_items.length > 0 && (
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {section.list_items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
