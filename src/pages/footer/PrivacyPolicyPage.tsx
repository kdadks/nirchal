import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../../hooks/useContent';

const PrivacyPolicyPage: React.FC = () => {
  const { data: sections, loading, error } = useContent('privacy');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
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
        <meta name="description" content="Nirchal's privacy policy and data protection practices" />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-lg">
          {sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <section key={section.id} className="mb-8">
                {section.title && (
                  <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                )}
                <div className="text-gray-600">
                  <p className="mb-4">{section.content}</p>
                  {section.list_items && section.list_items.length > 0 && (
                    <ul className="list-disc pl-6 space-y-2">
                      {section.list_items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;