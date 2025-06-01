import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../../hooks/useContent';

const AboutPage: React.FC = () => {
  const { data: sections, loading, error } = useContent('about');

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
          <p className="text-red-600">Error loading about content. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>About Us - Nirchal</title>
        <meta name="description" content="Learn about Nirchal's journey, mission, and commitment to authentic Indian ethnic wear." />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
          About Nirchal
        </h1>

        <div className="space-y-8">
          {sections
            .sort((a, b) => a.order_num - b.order_num)
            .map((section) => (
              <div key={section.id} className="prose max-w-none">
                <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
