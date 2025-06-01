import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useContent } from '../../hooks/useContent';
import { supabase } from '../../config/supabase';

const FAQPage: React.FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);
  const { data: faqs, loading, error } = useContent('faqs');

  useEffect(() => {
    // Direct test of Supabase connection
    async function testSupabase() {
      console.log('Testing Supabase connection...');
      try {
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .order('order_num');
        
        console.log('Direct Supabase test results:');
        console.log('Data:', data);
        console.log('Error:', error);
      } catch (e) {
        console.error('Supabase test error:', e);
      }
    }

    testSupabase();
  }, []);

  useEffect(() => {
    console.log('FAQPage data:', faqs);
    console.log('FAQPage loading:', loading);
    console.log('FAQPage error:', error);
  }, [faqs, loading, error]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-4">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
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
          <p className="text-red-600">Error loading FAQs: {error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!faqs || faqs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-600">No FAQs found. Data: {JSON.stringify(faqs)}</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Frequently Asked Questions - Nirchal</title>
        <meta name="description" content="Find answers to commonly asked questions about Nirchal's products and services" />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">
          Frequently Asked Questions
        </h1>

        <div className="space-y-8">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                {category}
              </h2>
              <div className="space-y-4">
                {faqs
                  .filter(faq => faq.category === category)
                  .sort((a, b) => a.order - b.order)
                  .map((faq) => {
                    const isOpen = openItem === faq.id;

                    return (
                      <div 
                        key={faq.id}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <button
                          className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50"
                          onClick={() => setOpenItem(isOpen ? null : faq.id)}
                        >
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        {isOpen && (
                          <div className="px-4 pb-4 text-gray-600">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-4">
            If you couldn't find the answer you were looking for, please contact our support team.
          </p>
          <div className="space-y-2">
            <p className="text-gray-600">
              Email:{' '}
              <a 
                href="mailto:support@nirchal.com" 
                className="text-primary-600 hover:text-primary-700"
              >
                support@nirchal.com
              </a>
            </p>
            <p className="text-gray-600">
              Phone: +91 123 456 7890 (10 AM - 7 PM IST)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
