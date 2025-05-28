import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Contact Us - Nirchal</title>
        <meta name="description" content="Get in touch with Nirchal customer support" />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-primary-600 mt-1 mr-3" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:support@nirchal.com" className="text-gray-600 hover:text-primary-600">
                    support@nirchal.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-primary-600 mt-1 mr-3" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a href="tel:+91-1234567890" className="text-gray-600 hover:text-primary-600">
                    +91 123 456 7890
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-primary-600 mt-1 mr-3" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">
                    123 Fashion Street<br />
                    Mumbai, Maharashtra 400001<br />
                    India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Send us a Message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;