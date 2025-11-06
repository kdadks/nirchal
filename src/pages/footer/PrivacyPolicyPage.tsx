import React from 'react';
import { Shield, Eye, Lock, Users } from 'lucide-react';
import SEO from '../../components/SEO';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <SEO
        title="Privacy Policy - Nirchal | Data Protection"
        description="Learn about Nirchal's privacy policy and how we protect your personal information and data."
        canonical="/privacy"
      />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">

          {/* Privacy Overview */}
          <section className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Privacy Policy</h2>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Information We Collect */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 md:mr-4">
                    <Eye className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">Information We Collect</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Personal Details</span>
                    <span className="font-semibold text-gray-800">Name, Email, Address</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Order Data</span>
                    <span className="font-semibold text-gray-800">Purchase History</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Usage Data</span>
                    <span className="font-semibold text-gray-800">Browsing Patterns</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    We only collect information necessary to provide you with our services.
                  </p>
                </div>
              </div>

              {/* How We Use Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3 md:mr-4">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">How We Use Your Data</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Order Processing</span>
                    <span className="font-semibold text-gray-800">Essential Service</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Communication</span>
                    <span className="font-semibold text-gray-800">Updates & Support</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Improvements</span>
                    <span className="font-semibold text-gray-800">Service Enhancement</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    Your data helps us improve our services and provide better experiences.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Protection */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <Lock className="w-8 h-8 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Data Protection & Your Rights</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Secure Storage</h3>
                  <p className="text-sm text-gray-600">Industry-standard encryption and security measures</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Access Rights</h3>
                  <p className="text-sm text-gray-600">View, update, or delete your personal data</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Communication Control</h3>
                  <p className="text-sm text-gray-600">Opt out of marketing communications anytime</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Privacy Questions?</h2>
              <p className="text-gray-600 mb-6">
                Have questions about our privacy practices? Our team is here to help you understand how we protect your data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:support@nirchal.com"
                  className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Contact Privacy Team
                </a>
                <button className="border-2 border-primary-500 text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-500 hover:text-white transition-all duration-300">
                  Manage Data Preferences
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
