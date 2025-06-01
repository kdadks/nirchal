import { supabase } from '../config/supabase';

const faqs = [
  {
    category: 'Orders & Shipping',
    question: 'How can I track my order?',
    answer: 'Once your order is shipped, you\'ll receive a tracking number via email and SMS. You can use this number to track your order through our website or the courier partner\'s tracking portal.',
    order_num: 1
  },
  {
    category: 'Orders & Shipping',
    question: 'What are the shipping charges?',
    answer: 'We offer free standard shipping on orders above ₹2999. For orders below this amount, a flat shipping fee of ₹99 applies. Express delivery is available at an additional cost of ₹199.',
    order_num: 2
  },
  {
    category: 'Returns & Refunds',
    question: 'What is your return policy?',
    answer: 'We accept returns within 30 days of delivery. Items must be unworn, unused, and in their original packaging with all tags attached. Some items like intimate wear and customized products are not eligible for return.',
    order_num: 3
  },
  {
    category: 'Returns & Refunds',
    question: 'How long does it take to process a refund?',
    answer: 'Once we receive your return, refunds are processed within 5-7 business days. The amount will be credited to your original payment method.',
    order_num: 4
  },
  {
    category: 'Product & Sizing',
    question: 'How do I find my correct size?',
    answer: 'You can refer to our detailed size guide available on each product page. We also have a comprehensive size guide section that provides measurements for all our categories.',
    order_num: 5
  }
];

async function initFAQs() {
  try {
    const { error } = await supabase
      .from('faqs')
      .upsert(faqs, { onConflict: 'order_num' });

    if (error) throw error;
    console.log('FAQs initialized successfully!');
  } catch (error) {
    console.error('Error initializing FAQs:', error);
  }
}

initFAQs();
