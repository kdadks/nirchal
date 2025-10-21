import React, { useState, useEffect } from 'react';
import { 
  Store, 
  CreditCard, 
  Receipt, 
  Search,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  MessageCircle,
  Mail,
  CheckCircle,
  Settings as SettingsIcon
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { ImageCleanupPanel } from '../../components/admin/ImageCleanupPanel';

interface TabState {
  [key: string]: Record<string, any>;
}

interface TabChanges {
  [key: string]: boolean;
}

const SettingsPage: React.FC = React.memo(() => {
  const { 
    settings, 
    loading, 
    error, 
    updateMultipleSettings
  } = useSettings();
  
  const [activeTab, setActiveTab] = useState('shop');
  const [tabSettings, setTabSettings] = useState<TabState>({});
  const [tabChanges, setTabChanges] = useState<TabChanges>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [showSecrets, setShowSecrets] = useState({
    razorpay_key_secret: false,
    razorpay_webhook_secret: false,
    stripe_secret_key: false,
    paypal_client_secret: false,
    smtp_password: false,
  });

  const tabs = [
    { id: 'shop', label: 'Shop Settings', icon: <Store className="w-4 h-4" /> },
    { id: 'payment', label: 'Payment Gateway', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'email', label: 'Email Settings', icon: <Mail className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <Receipt className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO Settings', icon: <Search className="w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  // Initialize tab settings from database
  useEffect(() => {
    if (!loading && settings) {
      const newTabSettings: TabState = {};
      
      tabs.forEach(tab => {
        newTabSettings[tab.id] = {};
        if (settings[tab.id]) {
          Object.keys(settings[tab.id]).forEach(key => {
            newTabSettings[tab.id][key] = settings[tab.id][key]?.value || '';
          });
        }
      });
      
      setTabSettings(newTabSettings);
      setTabChanges({});
    }
  }, [loading, settings]);

  // Handle setting change for specific tab
  const handleTabSettingChange = (tabId: string, key: string, value: any) => {
    setTabSettings(prev => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        [key]: value
      }
    }));

    setTabChanges(prev => ({
      ...prev,
      [tabId]: true
    }));

    // Clear saved state when changes are made
    if (saved[tabId]) {
      setSaved(prev => ({
        ...prev,
        [tabId]: false
      }));
    }
  };

  // Save settings for specific tab
  const handleTabSave = async (tabId: string) => {
    if (!tabChanges[tabId] || saving[tabId]) return;

    setSaving(prev => ({ ...prev, [tabId]: true }));
    
    try {
      const updates: Array<{ category: string; key: string; value: string }> = [];
      const currentTabSettings = tabSettings[tabId] || {};
      
      Object.keys(currentTabSettings).forEach(key => {
        const originalValue = settings[tabId]?.[key]?.value || '';
        const newValue = currentTabSettings[key];
        
        if (originalValue !== newValue) {
          updates.push({
            category: tabId,
            key: key,
            value: String(newValue)
          });
        }
      });

      if (updates.length > 0) {
        await updateMultipleSettings(updates);
        setTabChanges(prev => ({ ...prev, [tabId]: false }));
        setSaved(prev => ({ ...prev, [tabId]: true }));
        
        // Clear saved indicator after 3 seconds
        setTimeout(() => {
          setSaved(prev => ({ ...prev, [tabId]: false }));
        }, 3000);
      }
    } catch (error) {
      console.error(`Failed to save ${tabId} settings:`, error);
    } finally {
      setSaving(prev => ({ ...prev, [tabId]: false }));
    }
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-center text-red-600 mb-4">
            <AlertCircle className="w-8 h-8 mr-3" />
            <span className="text-lg font-medium">Error loading settings</span>
          </div>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  const renderShopSettings = () => (
    <div className="space-y-8">
      {/* Store Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Store Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Name *</label>
            <input
              type="text"
              value={tabSettings.shop?.store_name || ''}
              onChange={(e) => handleTabSettingChange('shop', 'store_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter store name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Email *</label>
            <input
              type="email"
              value={tabSettings.shop?.store_email || ''}
              onChange={(e) => handleTabSettingChange('shop', 'store_email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="contact@yourstore.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Phone</label>
            <input
              type="tel"
              value={tabSettings.shop?.store_phone || ''}
              onChange={(e) => handleTabSettingChange('shop', 'store_phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="+91 98765 43210"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={tabSettings.shop?.currency || 'INR'}
              onChange={(e) => handleTabSettingChange('shop', 'currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
          <textarea
            value={tabSettings.shop?.store_address || ''}
            onChange={(e) => handleTabSettingChange('shop', 'store_address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
            placeholder="Enter your store address"
          />
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
          <textarea
            value={tabSettings.shop?.store_description || ''}
            onChange={(e) => handleTabSettingChange('shop', 'store_description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={4}
            placeholder="Brief description of your store"
          />
        </div>
      </div>

      {/* Social Media Links */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Social Media Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Facebook className="w-4 h-4 mr-2 text-blue-600" />
              Facebook URL
            </label>
            <input
              type="url"
              value={tabSettings.shop?.social_facebook_url || ''}
              onChange={(e) => handleTabSettingChange('shop', 'social_facebook_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Instagram className="w-4 h-4 mr-2 text-pink-600" />
              Instagram URL
            </label>
            <input
              type="url"
              value={tabSettings.shop?.social_instagram_url || ''}
              onChange={(e) => handleTabSettingChange('shop', 'social_instagram_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://instagram.com/yourprofile"
            />
          </div>
          
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Twitter className="w-4 h-4 mr-2 text-blue-400" />
              Twitter URL
            </label>
            <input
              type="url"
              value={tabSettings.shop?.social_twitter_url || ''}
              onChange={(e) => handleTabSettingChange('shop', 'social_twitter_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://twitter.com/yourprofile"
            />
          </div>
          
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Youtube className="w-4 h-4 mr-2 text-red-600" />
              YouTube URL
            </label>
            <input
              type="url"
              value={tabSettings.shop?.social_youtube_url || ''}
              onChange={(e) => handleTabSettingChange('shop', 'social_youtube_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://youtube.com/yourchannel"
            />
          </div>
          
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Linkedin className="w-4 h-4 mr-2 text-blue-700" />
              LinkedIn URL
            </label>
            <input
              type="url"
              value={tabSettings.shop?.social_linkedin_url || ''}
              onChange={(e) => handleTabSettingChange('shop', 'social_linkedin_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>
          
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={tabSettings.shop?.social_whatsapp_number || ''}
              onChange={(e) => handleTabSettingChange('shop', 'social_whatsapp_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="+919876543210"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-8">
      {/* Razorpay Settings */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Razorpay Configuration</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={tabSettings.payment?.razorpay_enabled === 'true'}
              onChange={(e) => handleTabSettingChange('payment', 'razorpay_enabled', e.target.checked ? 'true' : 'false')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">Enable Razorpay</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key ID</label>
            <input
              type="text"
              value={tabSettings.payment?.razorpay_key_id || ''}
              onChange={(e) => handleTabSettingChange('payment', 'razorpay_key_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="rzp_test_..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Secret</label>
            <div className="relative">
              <input
                type={showSecrets.razorpay_key_secret ? "text" : "password"}
                value={tabSettings.payment?.razorpay_key_secret || ''}
                onChange={(e) => handleTabSettingChange('payment', 'razorpay_key_secret', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter secret key"
              />
              <button
                type="button"
                onClick={() => toggleSecretVisibility('razorpay_key_secret')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showSecrets.razorpay_key_secret ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
            <select
              value={tabSettings.payment?.razorpay_environment || 'test'}
              onChange={(e) => handleTabSettingChange('payment', 'razorpay_environment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="test">Test Environment</option>
              <option value="live">Live Environment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={tabSettings.payment?.razorpay_currency || 'INR'}
              onChange={(e) => handleTabSettingChange('payment', 'razorpay_currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="INR">INR - Indian Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={tabSettings.payment?.razorpay_company_name || ''}
              onChange={(e) => handleTabSettingChange('payment', 'razorpay_company_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
            <input
              type="color"
              value={tabSettings.payment?.razorpay_theme_color || '#f59e0b'}
              onChange={(e) => handleTabSettingChange('payment', 'razorpay_theme_color', e.target.value)}
              className="w-full h-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Webhook Configuration</h4>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Webhook Setup Instructions:</p>
                <p className="mt-1">1. Copy the webhook URL below</p>
                <p>2. Go to Razorpay Dashboard → Settings → Webhooks</p>
                <p>3. Add webhook with events: payment.captured, payment.failed, order.paid</p>
                <p>4. Copy the webhook secret and paste it below</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL (Copy to Razorpay)</label>
              <div className="flex">
                <input
                  type="text"
                  value={`${window.location.origin}/razorpay-webhook`}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-md focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/razorpay-webhook`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Secret</label>
              <div className="relative">
                <input
                  type={showSecrets.razorpay_webhook_secret ? "text" : "password"}
                  value={tabSettings.payment?.razorpay_webhook_secret || ''}
                  onChange={(e) => handleTabSettingChange('payment', 'razorpay_webhook_secret', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Paste webhook secret from Razorpay"
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('razorpay_webhook_secret')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showSecrets.razorpay_webhook_secret ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Auto Capture Setting */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-semibold text-gray-900">Auto Capture Payments</h4>
              <p className="text-sm text-gray-600 mt-1">Automatically capture payments when authorized</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tabSettings.payment?.razorpay_auto_capture === 'true'}
                onChange={(e) => handleTabSettingChange('payment', 'razorpay_auto_capture', e.target.checked ? 'true' : 'false')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Cash on Delivery */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cash on Delivery</h3>
            <p className="text-sm text-gray-600 mt-1">Allow customers to pay upon delivery</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={tabSettings.payment?.cod_enabled === 'true'}
              onChange={(e) => handleTabSettingChange('payment', 'cod_enabled', e.target.checked ? 'true' : 'false')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">Enable COD</span>
          </label>
        </div>
      </div>

      {/* Stripe Settings */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Stripe Configuration</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={tabSettings.payment?.stripe_enabled === 'true'}
              onChange={(e) => handleTabSettingChange('payment', 'stripe_enabled', e.target.checked ? 'true' : 'false')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">Enable Stripe</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
            <input
              type="text"
              value={tabSettings.payment?.stripe_publishable_key || ''}
              onChange={(e) => handleTabSettingChange('payment', 'stripe_publishable_key', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="pk_test_..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
            <div className="relative">
              <input
                type={showSecrets.stripe_secret_key ? "text" : "password"}
                value={tabSettings.payment?.stripe_secret_key || ''}
                onChange={(e) => handleTabSettingChange('payment', 'stripe_secret_key', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="sk_test_..."
              />
              <button
                type="button"
                onClick={() => toggleSecretVisibility('stripe_secret_key')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showSecrets.stripe_secret_key ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PayPal Settings */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">PayPal Configuration</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={tabSettings.payment?.paypal_enabled === 'true'}
              onChange={(e) => handleTabSettingChange('payment', 'paypal_enabled', e.target.checked ? 'true' : 'false')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">Enable PayPal</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
            <input
              type="text"
              value={tabSettings.payment?.paypal_client_id || ''}
              onChange={(e) => handleTabSettingChange('payment', 'paypal_client_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="AXxxx..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
            <div className="relative">
              <input
                type={showSecrets.paypal_client_secret ? "text" : "password"}
                value={tabSettings.payment?.paypal_client_secret || ''}
                onChange={(e) => handleTabSettingChange('payment', 'paypal_client_secret', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="EXxxx..."
              />
              <button
                type="button"
                onClick={() => toggleSecretVisibility('paypal_client_secret')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showSecrets.paypal_client_secret ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-8">
      {/* SMTP Configuration */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">SMTP Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host *</label>
            <input
              type="text"
              value={tabSettings.email?.smtp_host || ''}
              onChange={(e) => handleTabSettingChange('email', 'smtp_host', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="smtppro.zoho.in"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port *</label>
            <input
              type="number"
              value={tabSettings.email?.smtp_port || ''}
              onChange={(e) => handleTabSettingChange('email', 'smtp_port', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="465"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username *</label>
            <input
              type="email"
              value={tabSettings.email?.smtp_user || ''}
              onChange={(e) => handleTabSettingChange('email', 'smtp_user', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="your-email@domain.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password *</label>
            <div className="relative">
              <input
                type={showSecrets.smtp_password ? "text" : "password"}
                value={tabSettings.email?.smtp_password || ''}
                onChange={(e) => handleTabSettingChange('email', 'smtp_password', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter SMTP password"
              />
              <button
                type="button"
                onClick={() => toggleSecretVisibility('smtp_password')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showSecrets.smtp_password ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Email *</label>
            <input
              type="email"
              value={tabSettings.email?.smtp_from || ''}
              onChange={(e) => handleTabSettingChange('email', 'smtp_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="noreply@yourdomain.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reply To Email</label>
            <input
              type="email"
              value={tabSettings.email?.smtp_reply_to || ''}
              onChange={(e) => handleTabSettingChange('email', 'smtp_reply_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="support@yourdomain.com"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={tabSettings.email?.smtp_secure === 'true'}
              onChange={(e) => handleTabSettingChange('email', 'smtp_secure', e.target.checked ? 'true' : 'false')}
              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Use SSL/TLS encryption</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-8">
      {/* Company Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
            <input
              type="text"
              value={tabSettings.billing?.company_name || ''}
              onChange={(e) => handleTabSettingChange('billing', 'company_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Your Company Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
            <input
              type="text"
              value={tabSettings.billing?.gst_number || ''}
              onChange={(e) => handleTabSettingChange('billing', 'gst_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
            <input
              type="text"
              value={tabSettings.billing?.pan_number || ''}
              onChange={(e) => handleTabSettingChange('billing', 'pan_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="ABCDE1234F"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
            <input
              type="number"
              value={tabSettings.billing?.tax_rate || ''}
              onChange={(e) => handleTabSettingChange('billing', 'tax_rate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="18"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address *</label>
          <textarea
            value={tabSettings.billing?.billing_address || ''}
            onChange={(e) => handleTabSettingChange('billing', 'billing_address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
            placeholder="Enter company billing address"
          />
        </div>
        
        <div className="mt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={tabSettings.billing?.enable_gst === 'true'}
              onChange={(e) => handleTabSettingChange('billing', 'enable_gst', e.target.checked ? 'true' : 'false')}
              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Enable GST on invoices</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSEOSettings = () => (
    <div className="space-y-8">
      {/* Basic SEO */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic SEO Settings</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Title *</label>
            <input
              type="text"
              value={tabSettings.seo?.site_title || ''}
              onChange={(e) => handleTabSettingChange('seo', 'site_title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Your Store - Premium Products Online"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
            <textarea
              value={tabSettings.seo?.meta_description || ''}
              onChange={(e) => handleTabSettingChange('seo', 'meta_description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              placeholder="Brief description of your store for search engines"
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
            <input
              type="text"
              value={tabSettings.seo?.meta_keywords || ''}
              onChange={(e) => handleTabSettingChange('seo', 'meta_keywords', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Analytics & Tracking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Analytics 4 ID
              <span className="ml-2 text-xs text-gray-500">(GA4)</span>
            </label>
            <input
              type="text"
              value={tabSettings.seo?.google_analytics_id || ''}
              onChange={(e) => handleTabSettingChange('seo', 'google_analytics_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-gray-500 mt-1">Get from Google Analytics 4</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook Pixel ID
              <span className="ml-2 text-xs text-gray-500">(Meta Pixel)</span>
            </label>
            <input
              type="text"
              value={tabSettings.seo?.facebook_pixel_id || ''}
              onChange={(e) => handleTabSettingChange('seo', 'facebook_pixel_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="123456789012345"
            />
            <p className="text-xs text-gray-500 mt-1">Get from Facebook Events Manager</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram Business ID
              <span className="ml-2 text-xs text-gray-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={tabSettings.seo?.instagram_business_id || ''}
              onChange={(e) => handleTabSettingChange('seo', 'instagram_business_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="17841XXXXXXXXXX"
            />
            <p className="text-xs text-gray-500 mt-1">Get from Instagram Business Account settings</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Auto-Publishing Setup</h4>
              <p className="text-sm text-blue-700 mb-2">
                To automatically publish products to Facebook and Instagram when created:
              </p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Add your Facebook Pixel ID above</li>
                <li>Connect your Facebook Business account in Meta Business Suite</li>
                <li>Set up Facebook Catalog with product feed</li>
                <li>Link Instagram Shopping to your Facebook Catalog</li>
                <li>Products will auto-sync via Facebook Catalog API</li>
              </ol>
              <p className="text-xs text-blue-600 mt-2">
                📘 <a href="https://developers.facebook.com/docs/marketing-api/catalog" target="_blank" rel="noopener noreferrer" className="underline">
                  Learn more about Facebook Catalog API
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-8">
      {/* Image Cleanup */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Image Management</h3>
        <div className="space-y-6">
          <ImageCleanupPanel />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'shop':
        return renderShopSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'email':
        return renderEmailSettings();
      case 'billing':
        return renderBillingSettings();
      case 'seo':
        return renderSEOSettings();
      case 'system':
        return renderSystemSettings();
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
                {tabChanges[tab.id] && (
                  <div className="ml-2 w-2 h-2 bg-orange-400 rounded-full"></div>
                )}
                {saved[tab.id] && (
                  <CheckCircle className="ml-2 w-4 h-4 text-green-500" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
          
          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {tabChanges[activeTab] ? (
                  <span className="text-orange-600">You have unsaved changes</span>
                ) : saved[activeTab] ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Settings saved successfully
                  </span>
                ) : (
                  <span>No changes</span>
                )}
              </div>
              
              <button
                onClick={() => handleTabSave(activeTab)}
                disabled={!tabChanges[activeTab] || saving[activeTab]}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors duration-200 ${
                  tabChanges[activeTab] && !saving[activeTab]
                    ? 'text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving[activeTab] ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SettingsPage.displayName = 'SettingsPage';

export default SettingsPage;
