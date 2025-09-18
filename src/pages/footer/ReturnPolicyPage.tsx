import React from 'react';
import { Helmet } from 'react-helmet-async';
import { RotateCcw, Shield, Clock } from 'lucide-react';

const ReturnPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <Helmet>
        <title>Return Policy - Nirchal | Returns & Refunds</title>
        <meta name="description" content="Learn about Nirchal's return policy, including return conditions, process, and refund information." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">

          {/* Return Options */}
          <section className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Return & Refund Policy</h2>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Return Conditions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mr-3 md:mr-4">
                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">Return Conditions</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Item Condition</span>
                    <span className="font-semibold text-gray-800">Unused & Original</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Return Window</span>
                    <span className="font-semibold text-gray-800">2 days</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Return Charge</span>
                    <span className="font-semibold text-orange-600">₹150</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Custom Items</span>
                    <span className="font-semibold text-red-600">Not Eligible</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Important:</strong> Items must be unused, unwashed, and in original packaging with tags attached. A return processing fee of ₹150 will be deducted from your refund amount.
                  </p>
                </div>
              </div>

              {/* Return Process */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 md:mr-4">
                    <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">How to Return</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Step 1</span>
                    <span className="font-semibold text-gray-800">Login & Select Order</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Step 2</span>
                    <span className="font-semibold text-gray-800">Choose Items</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Step 3</span>
                    <span className="font-semibold text-gray-800">Pack & Ship</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Follow the return instructions provided and pack items securely for shipment.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Refund Information */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <Clock className="w-8 h-8 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Refund Information</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RotateCcw className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Processing Time</h3>
                  <p className="text-sm text-gray-600">Refunds processed within 7 business days</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Original Method</h3>
                  <p className="text-sm text-gray-600">Refunded to original payment method</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Quality Check</h3>
                  <p className="text-sm text-gray-600">Items inspected upon receipt</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Need Help with Returns?</h2>
              <p className="text-gray-600 mb-6">
                Have questions about returns or refunds? Our customer service team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:support@nirchal.com"
                  className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Contact Support
                </a>
                <button className="border-2 border-primary-500 text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-500 hover:text-white transition-all duration-300">
                  Track Your Return
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;
