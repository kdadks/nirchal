import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Store, 
  CreditCard, 
  Receipt, 
  Search,
  Save,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

const SettingsPage: React.FC = React.memo(() => {
  const { 
    categories, 
    settings, 
    loading, 
    error, 
    updateMultipleSettings,
    getSetting
  } = useSettings();
  
  const [activeTab, setActiveTab] = useState('shop');
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState({
    razorpaySecret: false,
    stripeSecret: false,
    paypalSecret: false,
  });

  // Sync database settings with local state
  useEffect(() => {
    if (!loading && settings) {
      const allSettings: Record<string, any> = {};
      Object.keys(settings).forEach(category => {
        Object.keys(settings[category]).forEach(key => {
          const cleanKey = key.startsWith(`${category}_`) ? key.substring(category.length + 1) : key;
          allSettings[`${category}_${cleanKey}`] = getSetting(category, key);
        });
      });
      setLocalSettings(allSettings);
      setHasChanges(false);
    }
  }, [settings, loading]);

  // Create tabs from database categories
  const tabs = categories.map(category => ({
    id: category.name,
    label: category.label,
    icon: getIconComponent(category.icon)
  }));

  function getIconComponent(iconName: string) {
    const icons: Record<string, React.ReactNode> = {
      'Store': <Store className="admin-icon" />,
      'CreditCard': <CreditCard className="admin-icon" />,
      'Receipt': <Receipt className="admin-icon" />,
      'Search': <Search className="admin-icon" />
    };
    return icons[iconName] || <Settings className="admin-icon" />;
  }

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: Array<{ category: string; key: string; value: string }> = [];
      
      Object.keys(localSettings).forEach(settingKey => {
        const [category, ...keyParts] = settingKey.split('_');
        const cleanKey = keyParts.join('_');
        const dbKey = `${category}_${cleanKey}`;
        
        let originalValue = null;
        if (settings[category] && settings[category][dbKey]) {
          originalValue = getSetting(category, dbKey);
        }
        
        const newValue = localSettings[settingKey];
        
        if (originalValue !== newValue) {
          updates.push({
            category,
            key: dbKey,
            value: String(newValue)
          });
        }
      });

      if (updates.length > 0) {
        await updateMultipleSettings(updates);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="admin-card">
          <div className="admin-card-content">
            <div className="admin-loading">Loading settings...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="admin-card">
          <div className="admin-card-content">
            <div className="admin-error">
              <AlertCircle className="admin-icon" />
              <span>Error loading settings: {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Settings Content */}
      <div className="admin-card">
        {/* Tab Navigation */}
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="admin-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="admin-btn admin-btn-primary admin-btn-sm"
              >
                <Save className="admin-icon" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        {/* Settings Content */}
        <div className="admin-card-content">
          {activeTab === 'shop' && (
            <div className="admin-settings-section">
              {/* Store Information */}
              <div className="admin-settings-group">
                <h3 className="admin-settings-title">Store Information</h3>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label className="admin-label">Store Name</label>
                    <input
                      type="text"
                      value={localSettings.shop_name || ''}
                      onChange={(e) => handleSettingChange('shop_name', e.target.value)}
                      className="admin-input"
                      placeholder="Enter store name"
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-label">Store Email</label>
                    <input
                      type="email"
                      value={localSettings.shop_email || ''}
                      onChange={(e) => handleSettingChange('shop_email', e.target.value)}
                      className="admin-input"
                      placeholder="contact@yourstore.com"
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-label">Store Phone</label>
                    <input
                      type="tel"
                      value={localSettings.shop_phone || ''}
                      onChange={(e) => handleSettingChange('shop_phone', e.target.value)}
                      className="admin-input"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-label">Currency</label>
                    <select
                      value={localSettings.shop_currency || 'INR'}
                      onChange={(e) => handleSettingChange('shop_currency', e.target.value)}
                      className="admin-input"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-label">Store Address</label>
                  <textarea
                    value={localSettings.shop_address || ''}
                    onChange={(e) => handleSettingChange('shop_address', e.target.value)}
                    className="admin-textarea"
                    rows={3}
                    placeholder="Enter your store address"
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-label">Store Description</label>
                  <textarea
                    value={localSettings.shop_description || ''}
                    onChange={(e) => handleSettingChange('shop_description', e.target.value)}
                    className="admin-textarea"
                    rows={4}
                    placeholder="Brief description of your store"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="admin-settings-section">
              {/* Payment Gateways */}
              <div className="admin-settings-group">
                <h3 className="admin-settings-title">Payment Gateways</h3>
                
                {/* Razorpay */}
                <div className="admin-gateway-card">
                  <div className="admin-gateway-header">
                    <div className="admin-gateway-info">
                      <h4 className="admin-gateway-name">Razorpay</h4>
                      <p className="admin-gateway-desc">Accept payments via UPI, cards, netbanking & more</p>
                    </div>
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={localSettings.payment_razorpay_enabled || false}
                        onChange={(e) => handleSettingChange('payment_razorpay_enabled', e.target.checked)}
                      />
                      <span className="admin-toggle-slider"></span>
                    </label>
                  </div>
                  
                  {localSettings.payment_razorpay_enabled && (
                    <div className="admin-gateway-settings">
                      <div className="admin-form-grid">
                        <div className="admin-form-group">
                          <label className="admin-label">Key ID</label>
                          <input
                            type="text"
                            value={localSettings.payment_razorpay_key_id || ''}
                            onChange={(e) => handleSettingChange('payment_razorpay_key_id', e.target.value)}
                            className="admin-input"
                            placeholder="rzp_test_..."
                          />
                        </div>
                        
                        <div className="admin-form-group">
                          <label className="admin-label">Key Secret</label>
                          <div className="admin-input-group">
                            <input
                              type={showSecrets.razorpaySecret ? 'text' : 'password'}
                              value={localSettings.payment_razorpay_key_secret || ''}
                              onChange={(e) => handleSettingChange('payment_razorpay_key_secret', e.target.value)}
                              className="admin-input"
                              placeholder="Enter key secret"
                            />
                            <button
                              type="button"
                              onClick={() => toggleSecret('razorpaySecret')}
                              className="admin-input-action"
                            >
                              {showSecrets.razorpaySecret ? <EyeOff className="admin-icon" /> : <Eye className="admin-icon" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <div className="admin-gateway-card">
                  <div className="admin-gateway-header">
                    <div className="admin-gateway-info">
                      <h4 className="admin-gateway-name">Cash on Delivery</h4>
                      <p className="admin-gateway-desc">Allow customers to pay upon delivery</p>
                    </div>
                    <label className="admin-toggle">
                      <input
                        type="checkbox"
                        checked={localSettings.payment_cod_enabled || false}
                        onChange={(e) => handleSettingChange('payment_cod_enabled', e.target.checked)}
                      />
                      <span className="admin-toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="admin-settings-section">
              {/* Tax & Billing */}
              <div className="admin-settings-group">
                <h3 className="admin-settings-title">Tax & Billing Information</h3>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label className="admin-label">GST Number</label>
                    <input
                      type="text"
                      value={localSettings.billing_gst_number || ''}
                      onChange={(e) => handleSettingChange('billing_gst_number', e.target.value)}
                      className="admin-input"
                      placeholder="Enter GST number"
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-label">PAN Number</label>
                    <input
                      type="text"
                      value={localSettings.billing_pan_number || ''}
                      onChange={(e) => handleSettingChange('billing_pan_number', e.target.value)}
                      className="admin-input"
                      placeholder="Enter PAN number"
                    />
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-label">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={localSettings.billing_tax_rate || ''}
                      onChange={(e) => handleSettingChange('billing_tax_rate', parseFloat(e.target.value) || 0)}
                      className="admin-input"
                      placeholder="18"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="admin-settings-section">
              {/* SEO Settings */}
              <div className="admin-settings-group">
                <h3 className="admin-settings-title">SEO & Meta Information</h3>
                <div className="admin-form-group">
                  <label className="admin-label">Site Title</label>
                  <input
                    type="text"
                    value={localSettings.seo_site_title || ''}
                    onChange={(e) => handleSettingChange('seo_site_title', e.target.value)}
                    className="admin-input"
                    placeholder="Your Store Name - Tagline"
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-label">Meta Description</label>
                  <textarea
                    value={localSettings.seo_meta_description || ''}
                    onChange={(e) => handleSettingChange('seo_meta_description', e.target.value)}
                    className="admin-textarea"
                    rows={3}
                    placeholder="Brief description of your store for search engines"
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-label">Meta Keywords</label>
                  <input
                    type="text"
                    value={localSettings.seo_meta_keywords || ''}
                    onChange={(e) => handleSettingChange('seo_meta_keywords', e.target.value)}
                    className="admin-input"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default SettingsPage;
