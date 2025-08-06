import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <Helmet>
        <title>Contact Us - Nirchal</title>
        <meta name="description" content="Get in touch with Nirchal's customer service team for any questions or support." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            We're here to help! Reach out for support, feedback, or business inquiries.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Contact Info Cards */}
          <section className="mb-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h2>
                <div className="space-y-3">
                  <p className="text-gray-700"><b>Email:</b> info@nirchal.com</p>
                  <p className="text-gray-700"><b>Phone:</b> +91 98765 43210</p>
                  <p className="text-gray-700"><b>Address:</b> 123, Nirchal Store, Bengaluru, Karnataka, India</p>
                  <p className="text-gray-700"><b>Business Hours:</b> Mon-Sat, 10am - 7pm</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Support</h2>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Prompt customer support</li>
                  <li>Custom order queries</li>
                  <li>Bulk/wholesale inquiries</li>
                  <li>Feedback & suggestions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
              <form className="space-y-6" autoComplete="off">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 px-4 py-2"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 px-4 py-2"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 px-4 py-2"
                    placeholder="Subject (optional)"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 px-4 py-2"
                    placeholder="Type your message here..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition duration-200 shadow"
                >
                  Send Message
                </button>
              </form>
            </div>
          </section>

          {/* Google Map Embed */}
          <section>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="w-7 h-7 text-primary-600" /> Our Store Location
              </h2>
              <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200" style={{height:'350px', maxWidth:'100%'}}>
                <iframe
                  title="Nirchal Store Location"
                  src="https://www.google.com/maps?q=Nirchal%20Store%2C%20Bengaluru%2C%20Karnataka%2C%20India&output=embed"
                  width="100%"
                  height="350"
                  style={{border:0}}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
