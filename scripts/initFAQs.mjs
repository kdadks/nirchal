import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

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
    answer: 'We offer FREE shipping on all orders across India with no minimum order value! For international orders, shipping charges are calculated based on the destination country and delivery address at checkout.',
    order_num: 2
  },
  {
    category: 'Returns & Refunds',
    question: 'What is your return policy?',
    answer: 'We accept returns within 2 days of delivery. Items must be unworn, unused, and in their original packaging with all tags attached. Some items like intimate wear and customized products are not eligible for return.',
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
