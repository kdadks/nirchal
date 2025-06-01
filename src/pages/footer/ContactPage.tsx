import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../../hooks/useContent';
import { Mail, Phone, Clock, MapPin } from 'lucide-react';

const ContactPage: React.FC = () => {
  const { data: contactInfo, loading, error } = useContent('contact');

  const getIconForType = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-6 h-6 text-primary-600" />;
      case 'phone':
        return <Phone className="w-6 h-6 text-primary-600" />;
      case 'business_hours':
        return <Clock className="w-6 h-6 text-primary-600" />;
      case 'address':
        return <MapPin className="w-6 h-6 text-primary-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-red-600">Error loading contact information. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Contact Us - Nirchal</title>
        <meta name="description" content="Get in touch with Nirchal's customer service team for any questions or support." />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
          Contact Us
        </h1>

        <div className="grid gap-8 md:grid-cols-2">
          {contactInfo
            .sort((a, b) => a.order_num - b.order_num)
            .map((info) => (
              <div key={info.id} className="flex space-x-4 items-start">
                {getIconForType(info.type)}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 capitalize mb-2">
                    {info.type.replace('_', ' ')}
                  </h2>
                  <p className="text-gray-600">{info.value}</p>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-6">
            Send us a Message
          </h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition duration-200"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
