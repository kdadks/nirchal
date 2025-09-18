import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Clock, MapPin, Shield, Package } from 'lucide-react';

const ShippingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <Helmet>
        <title>Shipping Policy - Nirchal | Delivery Information</title>
        <meta name="description" content="Learn about Nirchal's shipping policy, delivery times, and shipping charges for domestic and international orders." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">

          {/* Shipping Options */}
          <section className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Shipping Options</h2>
            
            <div className="max-w-2xl mx-auto">
              {/* Domestic Shipping - Centered */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3 md:mr-4">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">Domestic Shipping</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Standard Delivery</span>
                    <span className="font-semibold text-gray-800">3-7 business days</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Express Delivery</span>
                    <span className="font-semibold text-gray-800">1-3 business days</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Free Shipping</span>
                    <span className="font-semibold text-green-600">Orders ₹2,999+</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>Free shipping</strong> on all orders above ₹2,999. For orders below this amount, standard shipping charge is ₹150.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Processing Time */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <Clock className="w-8 h-8 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Processing Time</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Ready-to-Ship</h3>
                  <p className="text-sm text-gray-600">Items processed within 1-2 business days</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Made-to-Order</h3>
                  <p className="text-sm text-gray-600">Custom items take 7-14 business days</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Quality Check</h3>
                  <p className="text-sm text-gray-600">All items inspected before dispatch</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Need Help?</h2>
              <p className="text-gray-600 mb-6">
                Have questions about your shipment? Our customer service team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                  Contact Support
                </button>
                <button className="border-2 border-primary-500 text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-500 hover:text-white transition-all duration-300">
                  Track Your Order
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
