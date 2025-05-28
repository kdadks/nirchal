import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: "Orders & Shipping",
      question: "How can I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can use this number to track your order through our website or the courier partner's tracking portal."
    },
    {
      category: "Orders & Shipping",
      question: "What are the shipping charges?",
      answer: "We offer free standard shipping on orders above ₹2999. For orders below this amount, a flat shipping fee of ₹99 applies. Express delivery is available at an additional cost of ₹199."
    },
    {
      category: "Returns & Refunds",
      question: "What is your return policy?",
      answer: "We accept returns within 30 days of delivery. Items must be unworn, unused, and in their original packaging with all tags attached. Some items like intimate wear and customized products are not eligible for return."
    },
    {
      category: "Returns & Refunds",
      question: "How long does it take to process a refund?",
      answer: "Once we receive your return, refunds are processed within 5-7 business days. The amount will be credited to your original payment method."
    },
    {
      category: "Product & Sizing",
      question: "How do I find my correct size?",
      answer: "You can refer to our detailed size guide available on each product page. We also have a comprehensive size guide section that provides measurements for all our categories."
    },
    {
      category: "Product & Sizing",
      question: "Can I customize my order?",
      answer: "Yes, we offer customization options for select products. Look for the 'Customize' option on the product page. Please note that customized items are not eligible for return or exchange."
    },
    {
      category: "Account & Payment",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, UPI, net banking, and popular digital wallets. We also offer Cash on Delivery (COD) for select locations."
    },
    {
      category: "Account & Payment",
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page. Enter your registered email address, and we'll send you a link to reset your password."
    }
  ];

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Frequently Asked Questions - Nirchal</title>
        <meta name="description" content="Find answers to commonly asked questions about Nirchal's products and services" />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>

        <div className="space-y-8">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">{category}</h2>
              <div className="space-y-4">
                {faqs
                  .filter(faq => faq.category === category)
                  .map((faq, index) => {
                    const itemIndex = categoryIndex * 100 + index;
                    const isOpen = openItem === itemIndex;

                    return (
                      <div 
                        key={itemIndex}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <button
                          className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50"
                          onClick={() => setOpenItem(isOpen ? null : itemIndex)}
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-4">
            If you couldn't find the answer you were looking for, please contact our support team.
          </p>
          <div className="space-y-2">
            <p className="text-gray-600">
              Email: <a href="mailto:support@nirchal.com" className="text-primary-600 hover:text-primary-700">
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