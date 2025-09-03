import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Heart, Award, Users, Truck } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <Helmet>
        <title>About Us - Nirchal | Premium Indian Ethnic Wear</title>
        <meta name="description" content="Discover the story behind Nirchal - India's premier destination for authentic ethnic wear, celebrating tradition with modern elegance." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white py-12 md:py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">About Nirchal</h1>
          <p className="text-lg md:text-xl text-amber-100 max-w-3xl mx-auto">
            Celebrating the rich heritage of Indian craftsmanship while bringing you contemporary designs that blend tradition with modern elegance.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 md:mb-6">Our Story</h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-4 md:mb-6">
                Founded with a passion for preserving India's rich textile heritage, Nirchal began as a dream to make authentic ethnic wear accessible to women across the globe. Our journey started with a simple belief: every woman deserves to feel beautiful in clothes that celebrate her culture.
              </p>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-4 md:mb-6">
                Today, we work directly with skilled artisans and weavers from different regions of India, ensuring that each piece in our collection tells a story of tradition, craftsmanship, and timeless beauty.
              </p>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                From the vibrant silks of South India to the intricate embroideries of North India, every garment at Nirchal is carefully curated to bring you the finest in Indian ethnic wear.
              </p>
            </div>
            <div className="relative">
              <img
                src="/heroimage1.png"
                alt="Woman in ethnic saree outfit"
                className="rounded-2xl shadow-2xl w-full h-auto max-h-96 object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
              These core principles guide everything we do at Nirchal, from sourcing to customer service.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Authenticity</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Every piece is sourced directly from skilled artisans, ensuring genuine traditional craftsmanship.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Quality</h3>
              <p className="text-gray-600 text-sm md:text-base">
                We maintain the highest standards of quality in fabrics, stitching, and finishing.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Community</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Supporting local artisans and their communities is at the heart of our business model.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Service</h3>
              <p className="text-gray-600 text-sm md:text-base">
                Exceptional customer service and support throughout your shopping journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 text-center">
            <div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">50K+</div>
              <div className="text-primary-100 text-sm md:text-base">Happy Customers</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">200+</div>
              <div className="text-primary-100 text-sm md:text-base">Artisan Partners</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">1000+</div>
              <div className="text-primary-100 text-sm md:text-base">Designs Available</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">15+</div>
              <div className="text-primary-100 text-sm md:text-base">States Covered</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
