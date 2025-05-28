import React from 'react';
import HeroCarousel from '../components/home/HeroCarousel';
import FeaturedCategories from '../components/home/FeaturedCategories';
import TrendingProducts from '../components/home/TrendingProducts';
import { ShoppingBag, Truck, CreditCard, LifeBuoy } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroCarousel />
      
      <FeaturedCategories />
      
      <TrendingProducts />
      
      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Why Choose Nirchal
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience premium Indian ethnic wear with unmatched quality and service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={28} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Authentic Designs</h3>
              <p className="text-gray-600">
                Curated collection of authentic Indian ethnic wear with traditional craftsmanship
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck size={28} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Fast Shipping</h3>
              <p className="text-gray-600">
                Doorstep delivery across India within 3-5 business days
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard size={28} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Multiple secure payment options including COD, cards, UPI, and EMI
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LifeBuoy size={28} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Dedicated Support</h3>
              <p className="text-gray-600">
                Customer service available 7 days a week to assist with any queries
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from our satisfied customers about their Nirchal experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-4">
                "I ordered a Banarasi silk saree for my daughter's wedding and was amazed by the quality and craftsmanship. The vibrant colors and intricate work exceeded my expectations!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Priya Sharma</h4>
                  <p className="text-sm text-gray-500">Delhi</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-4">
                "The lehenga I purchased for my sister's engagement was stunning! The fit was perfect and everyone was asking where I got it from. Will definitely shop here again."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Anjali Patel</h4>
                  <p className="text-sm text-gray-500">Mumbai</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-4">
                "As someone who lives abroad, finding authentic Indian wear was difficult until I discovered Nirchal. Fast shipping, excellent packaging, and the quality is unmatched!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Kiran Malhotra</h4>
                  <p className="text-sm text-gray-500">NRI Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-white/90 mb-8">
              Subscribe to our newsletter for exclusive offers, new arrivals, and styling tips
            </p>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const email = form.email.value;
                if (email) {
                  // Here you would typically make an API call to subscribe the user
                  form.reset();
                  const successMsg = form.parentElement?.querySelector('.success-message');
                  if (successMsg) {
                    successMsg.classList.remove('hidden');
                    window.setTimeout(() => {
                      successMsg.classList.add('hidden');
                    }, 3000);
                  }
                }
              }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Your email address" 
                  className="flex-grow px-4 py-3 rounded-md focus:outline-none"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                />
                <button 
                  type="submit" 
                  className="bg-accent-500 text-white px-6 py-3 rounded-md font-medium hover:bg-accent-600 transition-colors"
                >
                  Subscribe
                </button>
              </div>
              <p className="success-message hidden text-white bg-green-500/20 py-2 px-4 rounded-md">
                Thank you for subscribing! We'll keep you updated with our latest offers.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
