import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
            Terms & Conditions
          </h1>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Acceptance of Terms
              </h2>
              <p className="text-gray-600 mb-4">
                By accessing and using our website, you accept and agree to be bound by the terms and conditions. These terms apply to all visitors, users, and others who access or use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Use License
              </h2>
              <ol className="list-decimal pl-6 text-gray-600 space-y-2">
                <li>
                  Permission is granted to temporarily download one copy of the materials (information or software) on Nirchal's website for personal, non-commercial transitory viewing only.
                </li>
                <li>
                  This is the grant of a license, not a transfer of title, and under this license you may not:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose</li>
                    <li>Attempt to decompile or reverse engineer any software</li>
                    <li>Remove any copyright or other proprietary notations</li>
                    <li>Transfer the materials to another person</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Account Terms
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>You must be 18 years or older to use this service</li>
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>We reserve the right to refuse service to anyone at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Payment Terms
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>All prices are in Indian Rupees (INR)</li>
                <li>Prices are subject to change without notice</li>
                <li>We accept major credit cards, UPI, and other payment methods as specified</li>
                <li>Payment information is always encrypted and secure</li>
                <li>Orders are subject to verification and acceptance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Disclaimer
              </h2>
              <p className="text-gray-600 mb-4">
                The materials on Nirchal's website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Limitations
              </h2>
              <p className="text-gray-600 mb-4">
                In no event shall Nirchal or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Governing Law
              </h2>
              <p className="text-gray-600">
                These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                Contact Information
              </h2>
              <p className="text-gray-600">
                For any questions regarding these terms, please contact us:
              </p>
              <ul className="text-gray-600 mt-2">
                <li>Email: legal@nirchal.com</li>
                <li>Phone: +91 123 456 7890</li>
                <li>Address: [Your Business Address]</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
  );
};

export default TermsPage;