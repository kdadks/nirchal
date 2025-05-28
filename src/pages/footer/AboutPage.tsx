import React from 'react';
import { Helmet } from 'react-helmet-async';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>About Us - Nirchal</title>
        <meta name="description" content="Learn more about Nirchal - Your premier destination for Indian ethnic wear" />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">About Us</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-6">
            Welcome to Nirchal, your premier destination for exquisite Indian ethnic wear. 
            We are passionate about bringing the rich heritage of Indian craftsmanship to 
            the modern fashion landscape.
          </p>

          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-600 mb-6">
            Founded in 2020, Nirchal began with a vision to make authentic Indian ethnic wear 
            accessible to fashion enthusiasts worldwide. We work directly with artisans and 
            designers across India to bring you carefully curated collections that blend 
            traditional techniques with contemporary designs.
          </p>

          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            We strive to preserve and promote India's rich textile heritage while making it 
            relevant for the modern customer. Every piece in our collection is thoughtfully 
            designed to ensure both authenticity and wearability.
          </p>

          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Quality & Craftsmanship</h2>
          <p className="text-gray-600">
            Quality is at the heart of everything we do. Each garment is crafted with attention 
            to detail, using premium fabrics and traditional techniques. We maintain strict 
            quality control measures to ensure that every piece meets our high standards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;