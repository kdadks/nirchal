import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Palette, 
  Bell, 
  Shield, 
  Globe, 
  Mail,
  Save,
  User,
  Database,
  Key,
  Monitor,
  Smartphone,
  CreditCard,
  Package,
  Truck,
  RefreshCw
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    storeName: 'Nirchal',
    storeEmail: 'contact@nirchal.com',
    storePhone: '+91 98765 43210',
    storeAddress: 'Mumbai, Maharashtra, India',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    enableNotifications: true,
    enableSMS: false,
    enableAnalytics: true,
    maintenanceMode: false,
    allowGuestCheckout: true,
    autoApproveReviews: false,
    lowStockThreshold: 10,
    orderPrefix: 'ORD',
    enableInventoryTracking: true,
  });

  const tabs = [
    { id: 'general', label: 'General', icon: <Store className="h-5 w-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-5 w-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-5 w-5" /> },
    { id: 'integrations', label: 'Integrations', icon: <Globe className="h-5 w-5" /> },
    { id: 'advanced', label: 'Advanced', icon: <Database className="h-5 w-5" /> },
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
    // Show success message
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
          {activeTab === 'general' && (
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
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <h3 className="text-xl font-display font-bold text-primary-800">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-blue-50/30 rounded-2xl border border-neutral-200/50">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-primary-800">Email Notifications</p>
                      <p className="text-sm text-neutral-600">Receive notifications about orders and updates</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableNotifications}
                      onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-green-50/30 rounded-2xl border border-neutral-200/50">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-primary-800">SMS Notifications</p>
                      <p className="text-sm text-neutral-600">Send SMS updates to customers</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableSMS}
                      onChange={(e) => handleSettingChange('enableSMS', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-8">
              <h3 className="text-xl font-display font-bold text-primary-800">Theme & Appearance</h3>
              <div className="text-center py-12">
                <Palette className="h-16 w-16 mx-auto text-neutral-400 mb-4" />
                <p className="text-neutral-600">Theme customization coming soon!</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <h3 className="text-xl font-display font-bold text-primary-800">Security Settings</h3>
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50/30 rounded-2xl border border-red-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="h-6 w-6 text-red-600" />
                    <h4 className="font-bold text-red-800">Two-Factor Authentication</h4>
                  </div>
                  <p className="text-sm text-red-700 mb-4">
                    Add an extra layer of security to your admin account
                  </p>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors">
                    Enable 2FA
                  </button>
                </div>

                <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50/30 rounded-2xl border border-yellow-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <Key className="h-6 w-6 text-yellow-600" />
                    <h4 className="font-bold text-yellow-800">API Keys</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mb-4">
                    Manage API keys for integrations and third-party services
                  </p>
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded-xl hover:bg-yellow-700 transition-colors">
                    Manage Keys
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-8">
              <h3 className="text-xl font-display font-bold text-primary-800">Third-party Integrations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50/30 rounded-2xl border border-blue-200/50">
                  <CreditCard className="h-8 w-8 text-blue-600 mb-3" />
                  <h4 className="font-bold text-blue-800 mb-2">Payment Gateways</h4>
                  <p className="text-sm text-blue-700 mb-4">Configure Razorpay, Stripe, and other payment methods</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm">
                    Configure
                  </button>
                </div>

                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50/30 rounded-2xl border border-green-200/50">
                  <Truck className="h-8 w-8 text-green-600 mb-3" />
                  <h4 className="font-bold text-green-800 mb-2">Shipping Partners</h4>
                  <p className="text-sm text-green-700 mb-4">Connect with delivery services and logistics providers</p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors text-sm">
                    Setup
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-8">
              <h3 className="text-xl font-display font-bold text-primary-800">Advanced Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-red-50/30 rounded-2xl border border-neutral-200/50">
                  <div className="flex items-center space-x-3">
                    <Monitor className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-primary-800">Maintenance Mode</p>
                      <p className="text-sm text-neutral-600">Temporarily disable the store for maintenance</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="p-6 bg-gradient-to-r from-purple-50 to-violet-50/30 rounded-2xl border border-purple-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <RefreshCw className="h-6 w-6 text-purple-600" />
                    <h4 className="font-bold text-purple-800">Cache Management</h4>
                  </div>
                  <p className="text-sm text-purple-700 mb-4">
                    Clear cache to improve performance and apply changes
                  </p>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors">
                    Clear Cache
                  </button>
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