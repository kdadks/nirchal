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
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About Nirchal</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Celebrating the rich heritage of Indian craftsmanship while bringing you contemporary designs that blend tradition with modern elegance.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Founded with a passion for preserving India's rich textile heritage, Nirchal began as a dream to make authentic ethnic wear accessible to women across the globe. Our journey started with a simple belief: every woman deserves to feel beautiful in clothes that celebrate her culture.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Today, we work directly with skilled artisans and weavers from different regions of India, ensuring that each piece in our collection tells a story of tradition, craftsmanship, and timeless beauty.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              These core principles guide everything we do at Nirchal, from sourcing to customer service.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Authenticity</h3>
              <p className="text-gray-600">
                Every piece is sourced directly from skilled artisans, ensuring genuine traditional craftsmanship.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quality</h3>
              <p className="text-gray-600">
                We maintain the highest standards of quality in fabrics, stitching, and finishing.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Community</h3>
              <p className="text-gray-600">
                Supporting local artisans and their communities is at the heart of our business model.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Service</h3>
              <p className="text-gray-600">
                Exceptional customer service and support throughout your shopping journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-primary-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-primary-100">Artisan Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-primary-100">Designs Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-primary-100">States Covered</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
