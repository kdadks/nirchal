import React from 'react';
import { FileText, ShoppingCart, Shield, Scale } from 'lucide-react';
import SEO from '../../components/SEO';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <SEO
        title="Terms & Conditions - Nirchal | Legal Terms"
        description="Read Nirchal's terms and conditions for using our website and services."
        canonical="/terms"
      />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">

          {/* Terms Overview */}
          <section className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Terms & Conditions</h2>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Website Usage */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3 md:mr-4">
                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">Website Usage</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Content Use</span>
                    <span className="font-semibold text-gray-800">Personal Only</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Commercial Use</span>
                    <span className="font-semibold text-red-600">Prohibited</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Content Copying</span>
                    <span className="font-semibold text-red-600">Not Allowed</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700">
                    All content is protected by copyright and for personal use only.
                  </p>
                </div>
              </div>

              {/* Orders & Payments */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-3 md:mr-4">
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">Orders & Payments</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Order Acceptance</span>
                    <span className="font-semibold text-gray-800">Subject to Availability</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Order Cancellation</span>
                    <span className="font-semibold text-gray-800">Reserved Right</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Payment Security</span>
                    <span className="font-semibold text-green-600">Guaranteed</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-700">
                    Orders are confirmed upon payment and availability verification.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Information */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <Scale className="w-8 h-8 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Legal Information</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Liability Limitation</h3>
                  <p className="text-sm text-gray-600">Limited to order value for direct damages</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Agreement Binding</h3>
                  <p className="text-sm text-gray-600">Terms accepted upon website use</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Scale className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Governing Law</h3>
                  <p className="text-sm text-gray-600">Indian jurisdiction applies</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Legal Questions?</h2>
              <p className="text-gray-600 mb-6">
                Have questions about our terms and conditions? Our legal team is available to help clarify any concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:support@nirchal.com"
                  className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Contact Legal Team
                </a>
                <button className="border-2 border-primary-500 text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-500 hover:text-white transition-all duration-300">
                  Download Terms
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsPage;
