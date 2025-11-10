/**
 * Cookie Policy Page
 * 
 * Comprehensive information about cookies, tracking, and data collection
 * Linked from: Cookie Banner, Settings, Footer
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Cookie, Shield, Eye, Lock, AlertCircle, HelpCircle } from 'lucide-react';

const CookiePolicyPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Cookie Policy - Nirchal</title>
        <meta
          name="description"
          content="Learn about the cookies and tracking technologies used on Nirchal.com"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Cookie Policy</h1>
            </div>
            <p className="text-lg text-gray-600">
              Last updated: November 2025
            </p>
          </div>

          {/* Quick Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
            <div className="flex gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-blue-900">Quick Summary</h2>
            </div>
            <ul className="space-y-2 text-blue-800">
              <li>✓ We use cookies to improve your experience and analyze site usage</li>
              <li>✓ You have full control over which cookies we can use</li>
              <li>✓ Essential cookies cannot be disabled (required for the site to work)</li>
              <li>✓ All non-essential cookies require your explicit consent</li>
              <li>✓ We comply with GDPR and DPDP Act regulations</li>
              <li>✓ You can change your preferences anytime in Cookie Settings</li>
            </ul>
          </div>

          {/* What Are Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are stored on your device when you visit a website.
              They serve various purposes including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Remembering your preferences and login information</li>
              <li>Tracking how you interact with our website</li>
              <li>Personalizing your experience</li>
              <li>Measuring website performance</li>
              <li>Displaying targeted advertisements</li>
            </ul>
          </section>

          {/* Our Cookie Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookie Categories</h2>
            <div className="space-y-6">
              {/* Essential */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
                    <Lock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Essential Cookies</h3>
                    <p className="text-sm text-gray-600">Always Enabled</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  These cookies are required for the website to function properly. They enable
                  core functionality such as:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                  <li><strong>Session Management:</strong> Keep you logged in and maintain your session</li>
                  <li><strong>Security:</strong> Prevent unauthorized access and protect your account</li>
                  <li><strong>Functionality:</strong> Enable form submission and cart operations</li>
                  <li><strong>Visitor Tracking:</strong> Generate unique visitor ID for analytics</li>
                </ul>
              </div>

              {/* Analytics */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Analytics Cookies</h3>
                    <p className="text-sm text-gray-600">Requires Consent</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  These cookies help us understand how visitors use our website so we can improve
                  the user experience. They collect data about:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                  <li>Pages visited and time spent on each page</li>
                  <li>User journey and navigation patterns</li>
                  <li>Device and browser information</li>
                  <li>Geographic location (approximate)</li>
                  <li>User interactions (clicks, scrolls, searches)</li>
                </ul>
                <div className="mt-4 bg-gray-50 rounded p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Services Used:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      <strong>Google Analytics:</strong> Tracks visitor behavior and site metrics.
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        Privacy Policy →
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Marketing */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Marketing Cookies</h3>
                    <p className="text-sm text-gray-600">Requires Consent</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  These cookies are used for targeted advertising and conversion tracking. They
                  enable us to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                  <li>Show you relevant ads based on your interests</li>
                  <li>Track conversions and measure advertising ROI</li>
                  <li>Retarget users who visited our site</li>
                  <li>Build audience segments for ad campaigns</li>
                </ul>
                <div className="mt-4 bg-gray-50 rounded p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Services Used:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      <strong>Facebook Pixel:</strong> Conversion tracking and audience targeting.
                      <a
                        href="https://www.facebook.com/policies/cookies/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        Policy →
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Performance */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-orange-100 rounded-full p-3 flex-shrink-0">
                    <HelpCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Performance Cookies</h3>
                    <p className="text-sm text-gray-600">Requires Consent</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  These cookies help improve the technical performance and user experience of our
                  website by:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                  <li>Caching static assets for faster loading</li>
                  <li>Storing your preferences (language, theme)</li>
                  <li>Optimizing page performance</li>
                  <li>Measuring load times and performance issues</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Rights & Choices</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-600">
                <h3 className="font-semibold text-gray-900 mb-2">✓ Change Your Preferences</h3>
                <p className="text-gray-700">
                  You can change your cookie preferences anytime by visiting our
                  <a href="/settings/cookies" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 hover:underline font-medium">
                    Cookie Settings page
                  </a>
                  or clicking "Cookie Settings" in the banner.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-600">
                <h3 className="font-semibold text-gray-900 mb-2">✓ Download Your Data</h3>
                <p className="text-gray-700">
                  You can download your consent data for your records. Visit Cookie Settings and
                  click "Download Consent" to get a JSON file with all your data.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-600">
                <h3 className="font-semibold text-gray-900 mb-2">✓ Browser Controls</h3>
                <p className="text-gray-700">
                  Most browsers allow you to refuse cookies or alert you when cookies are being sent.
                  For more information, visit:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2">
                  <li>
                    <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Chrome Cookie Settings
                    </a>
                  </li>
                  <li>
                    <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Firefox Cookie Settings
                    </a>
                  </li>
                  <li>
                    <a href="https://support.apple.com/en-us/HT201265" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Safari Cookie Settings
                    </a>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-600">
                <h3 className="font-semibold text-gray-900 mb-2">✓ Do Not Track</h3>
                <p className="text-gray-700">
                  If you have enabled "Do Not Track" (DNT) in your browser, we respect this preference
                  and will not enable marketing or analytics cookies.
                </p>
              </div>
            </div>
          </section>

          {/* GDPR & DPDP Compliance */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal Compliance</h2>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                GDPR Compliance (EU)
              </h3>
              <p className="text-gray-700 mb-4">
                We comply with the General Data Protection Regulation (GDPR) by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                <li>Requiring explicit opt-in before setting non-essential cookies</li>
                <li>Providing clear information about what data we collect</li>
                <li>Allowing you to access and download your data</li>
                <li>Enabling you to revoke consent at any time</li>
                <li>Implementing appropriate security measures</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                DPDP Act Compliance (India)
              </h3>
              <p className="text-gray-700 mb-4">
                We comply with the Digital Personal Data Protection (DPDP) Act by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                <li>Obtaining clear consent before collecting personal data</li>
                <li>Storing consent records for compliance audits</li>
                <li>Allowing users to access and delete their data</li>
                <li>Implementing data minimization practices</li>
                <li>Maintaining privacy by design principles</li>
              </ul>
            </div>
          </section>

          {/* Cookie Retention */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Retention</h2>
            <p className="text-gray-700 mb-4">
              Your consent preferences are stored locally on your device and expire after 365 days.
              After expiration, you will be asked to confirm your preferences again.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                <strong>Note:</strong> Essential cookies may persist longer as they are necessary for
                website functionality. Session cookies are deleted when you close your browser.
              </p>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              We use the following third-party services that may set their own cookies:
            </p>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Supabase (Database)</h3>
                <p className="text-gray-700 text-sm mb-2">Authentication and data storage</p>
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                  Privacy Policy →
                </a>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Cloudflare (CDN)</h3>
                <p className="text-gray-700 text-sm mb-2">Content delivery and security</p>
                <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                  Privacy Policy →
                </a>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Razorpay (Payments)</h3>
                <p className="text-gray-700 text-sm mb-2">Payment processing</p>
                <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                  Privacy Policy →
                </a>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Cookies?</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this cookie policy or our use of cookies, please
              contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@nirchal.com" className="text-blue-600 hover:underline">
                  privacy@nirchal.com
                </a>
              </p>
              <p>
                <strong>Address:</strong> Nirchal, India
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Manage Your Cookie Preferences</h2>
            <p className="mb-6 text-blue-100">
              You can change your cookie preferences anytime in your settings.
            </p>
            <a
              href="/settings/cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Go to Cookie Settings
            </a>
          </section>
        </div>
      </div>
    </>
  );
};

export default CookiePolicyPage;
