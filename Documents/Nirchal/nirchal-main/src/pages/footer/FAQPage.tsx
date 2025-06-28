import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, Search, HelpCircle, MessageCircle, Phone } from 'lucide-react';
import { useContent } from '../../hooks/useContent';

const FAQPage: React.FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { data: faqs, loading, error } = useContent('faqs');

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-zinc-200 rounded-lg w-1/3"></div>
              <div className="h-12 bg-zinc-200 rounded-lg w-full"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-soft">
                  <div className="h-6 bg-zinc-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-zinc-200 rounded w-full"></div>
                    <div className="h-4 bg-zinc-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">Something went wrong</h2>
          <p className="text-zinc-600">Error loading FAQs: {error}</p>
        </div>
      </div>
    );
  }

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));
  
  // Filter FAQs based on search term and selected category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedFaqs = selectedCategory === 'all'
    ? categories.reduce((acc, category) => {
        acc[category] = filteredFaqs.filter(faq => faq.category === category);
        return acc;
      }, {} as Record<string, typeof faqs>)
    : { [selectedCategory]: filteredFaqs };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Helmet>
        <title>Frequently Asked Questions - Nirchal</title>
        <meta name="description" content="Find answers to commonly asked questions about Nirchal's products and services" />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle size={32} className="text-white" />
            </div>
            <h1 className="font-display text-4xl lg:text-6xl font-bold mb-6">
              Frequently Asked <span className="text-orange-400">Questions</span>
            </h1>
            <p className="text-xl lg:text-2xl text-zinc-300 leading-relaxed max-w-3xl mx-auto">
              Find quick answers to common questions about our products, orders, and services.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Search and Filter */}
          <div className="bg-white rounded-2xl p-6 shadow-soft mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 min-w-[200px]"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="space-y-8">
            {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => {
              if (categoryFaqs.length === 0) return null;
              
              return (
                <div key={category}>
                  {selectedCategory === 'all' && (
                    <h2 className="font-display text-2xl font-bold text-zinc-900 mb-6">
                      {category}
                    </h2>
                  )}
                  
                  <div className="space-y-4">
                    {categoryFaqs
                      .sort((a, b) => a.order_num - b.order_num)
                      .map((faq) => {
                        const isOpen = openItem === faq.id;

                        return (
                          <div
                            key={faq.id}
                            className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-shadow duration-300"
                          >
                            <button
                              className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-50 transition-colors duration-200"
                              onClick={() => setOpenItem(isOpen ? null : faq.id)}
                            >
                              <span className="font-semibold text-zinc-900 text-lg pr-4">
                                {faq.question}
                              </span>
                              <div className={`w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                                isOpen ? 'rotate-180' : ''
                              }`}>
                                <ChevronDown size={16} className="text-orange-600" />
                              </div>
                            </button>
                            
                            {isOpen && (
                              <div className="px-6 pb-6 text-zinc-700 leading-relaxed border-t border-zinc-100">
                                <div className="pt-4">
                                  {faq.answer}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Results */}
          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-zinc-500" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-2">No FAQs found</h3>
              <p className="text-zinc-600">
                Try adjusting your search terms or browse all categories.
              </p>
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle size={32} className="text-white" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-4">
                Still have questions?
              </h2>
              <p className="text-orange-100 mb-8 text-lg max-w-2xl mx-auto">
                If you couldn't find the answer you were looking for, our support team is here to help you.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <a
                  href="mailto:support@nirchal.com"
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Email Support
                </a>
                <a
                  href="tel:+911234567890"
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Phone size={18} />
                  Call Us
                </a>
              </div>
              
              <div className="mt-6 text-orange-100 text-sm">
                <p>Email: support@nirchal.com</p>
                <p>Phone: +91 123 456 7890 (10 AM - 7 PM IST)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
