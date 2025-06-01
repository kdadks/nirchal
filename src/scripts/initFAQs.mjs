import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tazrvokohjfzicdzzxia.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhenJ2b2tvaGpmemljZHp6eGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MDQ3MzcsImV4cCI6MjA2NDE4MDczN30.veEaE0AicfPqYFug_1EXlpnsICUsXf-T0VW7dD0ijUc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    // First sign in as an admin user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: process.env.SUPABASE_ADMIN_EMAIL,
      password: process.env.SUPABASE_ADMIN_PASSWORD
    });

    if (signInError) throw signInError;

    // First delete any existing FAQs
    const { error: deleteError } = await supabase
      .from('faqs')
      .delete()
      .gte('id', 0);

    if (deleteError) throw deleteError;

    // Then insert new FAQs
    const { error: insertError } = await supabase
      .from('faqs')
      .insert(faqs);

    if (insertError) throw insertError;
    console.log('FAQs initialized successfully!');
  } catch (error) {
    console.error('Error initializing FAQs:', error);
  }
}

initFAQs();
