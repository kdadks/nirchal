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
                  {/* Standard Delivery */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">Standard Delivery</h4>
                        <p className="text-sm text-gray-600 mt-1">Regular shipping for all orders</p>
                      </div>
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">FREE</span>
                    </div>
                    <div className="flex items-center text-gray-700 mt-3">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="font-medium">3-7 business days</span>
                    </div>
                  </div>

                  {/* Express Delivery */}
                  <div className="border border-orange-200 rounded-lg p-4 bg-gradient-to-r from-orange-50 to-amber-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg flex items-center">
                          Express Delivery 
                          <span className="ml-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 rounded text-xs font-semibold">PREMIUM</span>
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">Priority processing and faster delivery</p>
                      </div>
                      <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">₹250</span>
                    </div>
                    <div className="flex items-center text-gray-700 mt-3 mb-3">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="font-medium">1-3 business days</span>
                    </div>
                    <div className="bg-white/50 rounded p-3 text-sm text-gray-700">
                      <p className="font-medium mb-1">Why Express Delivery?</p>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Priority processing</strong> - Your order gets packed first</li>
                        <li>• <strong>Premium courier</strong> - Dedicated express logistics partners</li>
                        <li>• <strong>Faster delivery</strong> - Get your order in 1-3 days instead of 3-7 days</li>
                        <li>• <strong>Real-time tracking</strong> - Enhanced tracking with SMS updates</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-700">
                    <strong>📦 Shipping Information:</strong> Standard delivery is <strong>100% FREE</strong> on all orders across India with no minimum order value. Choose Express Delivery at checkout for faster service. International shipping charges calculated based on destination.
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
