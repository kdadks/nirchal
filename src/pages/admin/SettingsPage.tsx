import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  CreditCard, 
  Receipt, 
  Search,
  Mail,
  Save,
  User,
  Smartphone,
  Package,
  Truck,
  Eye,
  EyeOff,
  ExternalLink
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('shop');
  const [settings, setSettings] = useState({
    // Shop Settings
    storeName: 'Nirchal',
    storeEmail: 'contact@nirchal.com',
    storePhone: '+91 98765 43210',
    storeAddress: 'Mumbai, Maharashtra, India',
    storeDescription: 'Premium Indian ethnic wear for the modern woman',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    allowGuestCheckout: true,
    autoApproveReviews: false,
    lowStockThreshold: 10,
    orderPrefix: 'ORD',
    enableInventoryTracking: true,
    
    // Payment Gateway Settings
    razorpayEnabled: true,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    stripeEnabled: false,
    stripePublishableKey: '',
    stripeSecretKey: '',
    paypalEnabled: false,
    paypalClientId: '',
    paypalClientSecret: '',
    codEnabled: true,
    
    // Billing Settings
    gstNumber: '',
    panNumber: '',
    companyName: 'Nirchal Fashion Pvt Ltd',
    billingAddress: 'Mumbai, Maharashtra, India',
    invoicePrefix: 'INV',
    taxRate: 18,
    enableGST: true,
    
    // SEO Settings
    siteTitle: 'Nirchal - Premium Indian Ethnic Wear',
    metaDescription: 'Discover exquisite Indian ethnic wear at Nirchal. Premium sarees, lehengas, and traditional outfits for the modern woman.',
    metaKeywords: 'indian ethnic wear, sarees, lehengas, traditional clothing, ethnic fashion',
    ogTitle: 'Nirchal - Premium Indian Ethnic Wear',
    ogDescription: 'Discover exquisite Indian ethnic wear at Nirchal',
    ogImage: '',
    twitterCard: 'summary_large_image',
    canonicalUrl: 'https://nirchal.com',
    robotsIndex: true,
    robotsFollow: true,
    enableSitemap: true,
    googleAnalyticsId: '',
    facebookPixelId: '',
  });

  const [showSecrets, setShowSecrets] = useState({
    razorpaySecret: false,
    stripeSecret: false,
    paypalSecret: false,
  });

  const tabs = [
    { id: 'shop', label: 'Shop Settings', icon: <Store className="h-5 w-5" /> },
    { id: 'payment', label: 'Payment Gateway', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'billing', label: 'Billing', icon: <Receipt className="h-5 w-5" /> },
    { id: 'seo', label: 'SEO Settings', icon: <Search className="h-5 w-5" /> },
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
    // Show success message
    alert('Settings saved successfully!');
  };

  const toggleSecret = (field: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-6 lg:mb-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-slate-500 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-gradient-to-r from-gray-500 to-slate-500 p-3 rounded-2xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-800 to-accent-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-neutral-600 font-accent">
                Configure your store and preferences
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-200 group"
        >
          <Save className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">Save Changes</span>
        </button>
      </div>

      {/* Settings Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-neutral-200/50 overflow-hidden">
        <div className="border-b border-neutral-200/50">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="p-8">
          {activeTab === 'shop' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-display font-bold text-primary-800 mb-6">Store Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => handleSettingChange('storeName', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                      Contact Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        type="email"
                        value={settings.storeEmail}
                        onChange={(e) => handleSettingChange('storeEmail', e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                      <input
                        type="tel"
                        value={settings.storePhone}
                        onChange={(e) => handleSettingChange('storePhone', e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleSettingChange('currency', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                    Store Address
                  </label>
                  <textarea
                    value={settings.storeAddress}
                    onChange={(e) => handleSettingChange('storeAddress', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                    Store Description
                  </label>
                  <textarea
                    value={settings.storeDescription}
                    onChange={(e) => handleSettingChange('storeDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="Brief description of your store"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-display font-bold text-primary-800 mb-6">Business Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-primary-50/30 rounded-2xl border border-neutral-200/50">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-primary-800">Allow Guest Checkout</p>
                        <p className="text-sm text-neutral-600">Let customers checkout without creating an account</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.allowGuestCheckout}
                        onChange={(e) => handleSettingChange('allowGuestCheckout', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-primary-50/30 rounded-2xl border border-neutral-200/50">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-primary-800">Enable Inventory Tracking</p>
                        <p className="text-sm text-neutral-600">Track product stock levels automatically</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableInventoryTracking}
                        onChange={(e) => handleSettingChange('enableInventoryTracking', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                        Low Stock Threshold
                      </label>
                      <input
                        type="number"
                        value={settings.lowStockThreshold}
                        onChange={(e) => handleSettingChange('lowStockThreshold', parseInt(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                        Order Prefix
                      </label>
                      <input
                        type="text"
                        value={settings.orderPrefix}
                        onChange={(e) => handleSettingChange('orderPrefix', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                        placeholder="ORD"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-8">
              <h3 className="text-xl font-display font-bold text-primary-800">Payment Gateway Configuration</h3>
              
              {/* Razorpay */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50/30 rounded-2xl border border-blue-200/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-xl">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-800">Razorpay</h4>
                      <p className="text-sm text-blue-600">Accept payments in India</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.razorpayEnabled}
                      onChange={(e) => handleSettingChange('razorpayEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                {settings.razorpayEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Key ID
                      </label>
                      <input
                        type="text"
                        value={settings.razorpayKeyId}
                        onChange={(e) => handleSettingChange('razorpayKeyId', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        placeholder="rzp_live_xxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Key Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.razorpaySecret ? 'text' : 'password'}
                          value={settings.razorpayKeySecret}
                          onChange={(e) => handleSettingChange('razorpayKeySecret', e.target.value)}
                          className="w-full px-4 py-3 pr-10 rounded-xl border border-blue-200 bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                          placeholder="••••••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret('razorpaySecret')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
                        >
                          {showSecrets.razorpaySecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stripe */}
              <div className="p-6 bg-gradient-to-r from-purple-50 to-violet-50/30 rounded-2xl border border-purple-200/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-600 rounded-xl">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-800">Stripe</h4>
                      <p className="text-sm text-purple-600">Accept international payments</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.stripeEnabled}
                      onChange={(e) => handleSettingChange('stripeEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                {settings.stripeEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-2">
                        Publishable Key
                      </label>
                      <input
                        type="text"
                        value={settings.stripePublishableKey}
                        onChange={(e) => handleSettingChange('stripePublishableKey', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-purple-200 bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                        placeholder="pk_live_xxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-2">
                        Secret Key
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.stripeSecret ? 'text' : 'password'}
                          value={settings.stripeSecretKey}
                          onChange={(e) => handleSettingChange('stripeSecretKey', e.target.value)}
                          className="w-full px-4 py-3 pr-10 rounded-xl border border-purple-200 bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                          placeholder="••••••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecret('stripeSecret')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600"
                        >
                          {showSecrets.stripeSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cash on Delivery */}
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50/30 rounded-2xl border border-green-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-600 rounded-xl">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800">Cash on Delivery</h4>
                      <p className="text-sm text-green-600">Accept cash payments on delivery</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.codEnabled}
                      onChange={(e) => handleSettingChange('codEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-8">
              <h3 className="text-xl font-display font-bold text-primary-800">Billing & Tax Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => handleSettingChange('companyName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={settings.gstNumber}
                    onChange={(e) => handleSettingChange('gstNumber', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={settings.panNumber}
                    onChange={(e) => handleSettingChange('panNumber', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="AAAAA0000A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                  Billing Address
                </label>
                <textarea
                  value={settings.billingAddress}
                  onChange={(e) => handleSettingChange('billingAddress', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-amber-50/30 rounded-2xl border border-neutral-200/50">
                <div className="flex items-center space-x-3">
                  <Receipt className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-primary-800">Enable GST</p>
                    <p className="text-sm text-neutral-600">Apply GST to invoices and receipts</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableGST}
                    onChange={(e) => handleSettingChange('enableGST', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-8">
              <h3 className="text-xl font-display font-bold text-primary-800">SEO Configuration</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                    Site Title
                  </label>
                  <input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) => handleSettingChange('siteTitle', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="Your store title for search engines"
                  />
                </div>

                <div>
                  <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={settings.metaDescription}
                    onChange={(e) => handleSettingChange('metaDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="Brief description for search engines (150-160 characters)"
                    maxLength={160}
                  />
                  <p className="text-xs text-neutral-500 mt-1">{settings.metaDescription.length}/160 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={settings.metaKeywords}
                    onChange={(e) => handleSettingChange('metaKeywords', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      value={settings.googleAnalyticsId}
                      onChange={(e) => handleSettingChange('googleAnalyticsId', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                      Facebook Pixel ID
                    </label>
                    <input
                      type="text"
                      value={settings.facebookPixelId}
                      onChange={(e) => handleSettingChange('facebookPixelId', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                      placeholder="123456789012345"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-accent font-medium text-neutral-700 mb-2">
                    Canonical URL
                  </label>
                  <input
                    type="url"
                    value={settings.canonicalUrl}
                    onChange={(e) => handleSettingChange('canonicalUrl', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="https://yourstore.com"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-green-50/30 rounded-2xl border border-neutral-200/50">
                    <div className="flex items-center space-x-3">
                      <Search className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-primary-800">Allow Search Engine Indexing</p>
                        <p className="text-sm text-neutral-600">Let search engines index your site</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.robotsIndex}
                        onChange={(e) => handleSettingChange('robotsIndex', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-blue-50/30 rounded-2xl border border-neutral-200/50">
                    <div className="flex items-center space-x-3">
                      <ExternalLink className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-primary-800">Enable Sitemap Generation</p>
                        <p className="text-sm text-neutral-600">Automatically generate XML sitemap</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableSitemap}
                        onChange={(e) => handleSettingChange('enableSitemap', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;