import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { netlifyEmailService } from '../../services/netlifyEmailService';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await netlifyEmailService.sendContactForm(formData);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <Helmet>
        <title>Contact Us - Nirchal</title>
        <meta name="description" content="Get in touch with Nirchal's customer service team for any questions or support." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white py-12 md:py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <MapPin className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg md:text-xl text-amber-100 max-w-2xl mx-auto">
            We're here to help! Reach out for support, feedback, or business inquiries.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Contact Info Cards */}
          <section className="mb-8 md:mb-12">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Contact Information</h2>
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm md:text-base"><b>Email:</b> support@nirchal.com</p>
                  <p className="text-gray-700 text-sm md:text-base"><b>Business Hours:</b> Mon-Sat, 10am - 7pm</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Quick Support</h2>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm md:text-base">
                  <li>Prompt customer support</li>
                  <li>Custom order queries</li>
                  <li>Bulk/wholesale inquiries</li>
                  <li>Feedback & suggestions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="mb-8 md:mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6" autoComplete="off">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 px-4 py-3 text-base"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 px-4 py-3 text-base"
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
                    value={formData.subject}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 px-4 py-3 text-base"
                    placeholder="Subject (optional)"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 px-4 py-3 text-base"
                    placeholder="Type your message here..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-4 rounded-lg font-semibold text-lg transition duration-200 shadow ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
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
