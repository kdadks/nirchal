/* global HTMLElement */
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp, Search, HelpCircle, Package, CreditCard, Truck, RefreshCw } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: 'general' | 'orders' | 'shipping' | 'returns' | 'payments';
}

const faqs: FAQ[] = [
  {
    id: 1,
    category: 'general',
    question: 'What is Nirchal?',
    answer: 'Nirchal is a premium Indian ethnic wear boutique offering authentic traditional and contemporary designs. We specialize in sarees, lehengas, gowns, and other ethnic wear crafted by skilled artisans from across India.'
  },
  {
    id: 2,
    category: 'orders',
    question: 'How do I place an order?',
    answer: 'You can place an order by browsing our collection, selecting your desired items, choosing the right size, and adding them to your cart. Proceed to checkout, fill in your shipping details, and complete the payment.'
  },
  {
    id: 3,
    category: 'orders',
    question: 'Can I modify or cancel my order?',
    answer: 'Orders can be modified or cancelled within 2 hours of placing them. After that, the order goes into processing and cannot be changed. Please contact our customer support team immediately if you need to make changes.'
  },
  {
    id: 4,
    category: 'shipping',
    question: 'What are your shipping charges?',
    answer: 'We offer free shipping on orders above ₹2,999. For orders below this amount, shipping charges are ₹99 within India. Express delivery is available for an additional ₹199.'
  },
  {
    id: 5,
    category: 'shipping',
    question: 'How long does delivery take?',
    answer: 'Standard delivery takes 3-7 business days within India. Express delivery takes 1-3 business days. International shipping takes 7-14 business days depending on the destination.'
  },
  {
    id: 6,
    category: 'returns',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy from the date of delivery. Items must be unused, with original tags and packaging. Custom-made or altered items cannot be returned.'
  },
  {
    id: 7,
    category: 'returns',
    question: 'How do I return an item?',
    answer: 'Log into your account, go to "My Orders", select the item you want to return, and follow the return process. You can also contact our customer support for assistance.'
  },
  {
    id: 8,
    category: 'payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, net banking, UPI, digital wallets like Paytm, PhonePe, Google Pay, and cash on delivery (COD) for eligible orders.'
  },
  {
    id: 9,
    category: 'payments',
    question: 'Is my payment information secure?',
    answer: 'Yes, all payments are processed through secure, encrypted gateways. We do not store your payment information on our servers. All transactions are PCI DSS compliant.'
  },
  {
    id: 10,
    category: 'general',
    question: 'Do you offer custom sizing?',
    answer: 'Yes, we offer custom sizing for most of our products. During checkout, select "Custom Size" and provide your measurements. Custom-sized items take 7-10 additional days to process.'
  }
];

const categories = [
  { key: 'all', label: 'All', icon: HelpCircle },
  { key: 'general', label: 'General', icon: HelpCircle },
  { key: 'orders', label: 'Orders', icon: Package },
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'returns', label: 'Returns', icon: RefreshCw },
  { key: 'payments', label: 'Payments', icon: CreditCard }
];

const FAQPage: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions - Nirchal</title>
        <meta
          name="description"
          content="Find answers to common questions about Nirchal's ethnic wear collection, shipping, returns, and more."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Search and Filter Section */}
          <section className="mb-8 md:mb-10">
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Search frequently asked questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 rounded-full text-gray-900 text-base md:text-lg focus:outline-none focus:ring-4 focus:ring-orange-200 shadow"
              />
            </div>
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                      selectedCategory === category.key
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* FAQ Content */}
          <section className="mb-8 md:mb-10">
            <div>
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12 md:py-16">
                  <HelpCircle className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-600 mb-2">No FAQs Found</h3>
                  <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <button
                        onClick={() => toggleExpanded(faq.id)}
                        className="w-full px-4 md:px-6 py-4 md:py-5 text-left focus:outline-none focus:ring-4 focus:ring-orange-200 hover:bg-orange-50 transition-colors duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 text-base md:text-lg pr-4">
                            {faq.question}
                          </h3>
                          {expandedItems.includes(faq.id) ? (
                            <ChevronUp className="w-5 h-5 text-primary-600 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      {expandedItems.includes(faq.id) && (
                        <div className="px-4 md:px-6 pb-4 md:pb-5">
                          <div className="h-px bg-gradient-to-r from-orange-200 to-pink-200 mb-4"></div>
                          <p className="text-gray-600 leading-relaxed text-sm md:text-base">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-white rounded-xl shadow p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">Still have questions?</h2>
            <p className="text-lg text-gray-600 mb-8">Our customer support team is here to help you with any questions or concerns.</p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-8 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Email Support</h3>
                <p className="text-gray-600 mb-4">Get detailed help via email</p>
                <a
                  href="mailto:support@nirchal.com"
                  className="inline-block bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Send Email
                </a>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Live Chat</h3>
                <p className="text-gray-600 mb-4">Chat with our AI assistant</p>
                <button
                  onClick={() => {
                    // This would trigger the AI chatbot
                    const chatbot = document.querySelector('[data-chatbot-trigger]') as HTMLElement;
                    if (chatbot) chatbot.click();
                  }}
                  className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Start Chat
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default FAQPage;
