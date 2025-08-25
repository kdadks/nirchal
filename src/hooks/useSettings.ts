import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

export interface Setting {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  data_type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  is_required: boolean;
  default_value: string;
  is_encrypted?: boolean;
}

export interface SettingsCategory {
  id: string;
  name: string;
  label: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

export const useSettings = () => {
  const [categories, setCategories] = useState<SettingsCategory[]>([]);
  const [settings, setSettings] = useState<Record<string, Record<string, Setting>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all settings categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('settings_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching settings categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    }
  };

  // Fetch settings for a specific category
  const fetchSettingsByCategory = async (category: string) => {
    try {
      const { data, error } = await supabase.rpc('get_settings_by_category', {
        category_name: category
      });

      if (error) throw error;

      const categorySettings: Record<string, Setting> = {};
      data?.forEach((setting: Setting) => {
        categorySettings[setting.key] = setting;
      });

      setSettings(prev => ({
        ...prev,
        [category]: categorySettings
      }));
    } catch (err) {
      console.error(`Error fetching settings for category ${category}:`, err);
      setError(err instanceof Error ? err.message : `Failed to fetch ${category} settings`);
    }
  };

  // Fetch all settings for all categories
  const fetchAllSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      // First fetch categories
      await fetchCategories();

      // Then fetch settings for each category
      const { data: allSettings, error } = await supabase
        .from('settings')
        .select('*')
        .order('category, key');

      if (error) throw error;

      const groupedSettings: Record<string, Record<string, Setting>> = {};
      allSettings?.forEach((setting) => {
        if (!groupedSettings[setting.category]) {
          groupedSettings[setting.category] = {};
        }
        groupedSettings[setting.category][setting.key] = {
          key: setting.key,
          value: setting.value,
          type: setting.type || setting.data_type,
          data_type: setting.data_type || setting.type,
          description: setting.description,
          is_required: setting.is_required,
          default_value: setting.default_value,
          is_encrypted: setting.is_encrypted
        };
      });

      setSettings(groupedSettings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  // Update a specific setting using the unique key
  const updateSetting = async (category: string, key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          category,
          key,
          value: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'category,key'
        });

      if (error) throw error;

      // Update local state
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: {
            ...prev[category][key],
            value
          }
        }
      }));

      return true;
    } catch (err) {
      console.error('Error updating setting:', err);
      setError(err instanceof Error ? err.message : 'Failed to update setting');
      return false;
    }
  };

  // Batch update multiple settings
  const updateMultipleSettings = async (updates: Array<{ category: string; key: string; value: string }>) => {
    try {
      const promises = updates.map(update => 
        supabase
          .from('settings')
          .upsert({ 
            category: update.category,
            key: update.key,
            value: update.value,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'category,key'
          })
      );

      const results = await Promise.all(promises);
      const hasError = results.some(result => result.error);

      if (hasError) {
        const errors = results.filter(r => r.error).map(r => r.error?.message).join(', ');
        throw new Error(`Some settings failed to update: ${errors}`);
      }

      // Update local state
      const newSettings = { ...settings };
      updates.forEach(update => {
        if (!newSettings[update.category]) {
          newSettings[update.category] = {};
        }
        if (newSettings[update.category][update.key]) {
          newSettings[update.category][update.key].value = update.value;
        }
      });
      setSettings(newSettings);

      return true;
    } catch (err) {
      console.error('Error updating multiple settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    }
  };

  // Get a specific setting value with type conversion
  const getSetting = useCallback((category: string, key: string): any => {
    const setting = settings[category]?.[key];
    if (!setting) return null;

    switch (setting.data_type) {
      case 'boolean':
        return setting.value === 'true';
      case 'number':
        return parseFloat(setting.value) || 0;
      case 'json':
        try {
          return JSON.parse(setting.value);
        } catch {
          return null;
        }
      default:
        return setting.value;
    }
  }, [settings]);

  // Get settings for a category as a formatted object
  const getCategorySettings = useCallback((category: string): Record<string, any> => {
    const categorySettings = settings[category] || {};
    const formattedSettings: Record<string, any> = {};

    Object.keys(categorySettings).forEach((key) => {
      formattedSettings[key] = getSetting(category, key);
    });

    return formattedSettings;
  }, [settings, getSetting]);

  useEffect(() => {
    fetchAllSettings();
  }, []);

  return {
    categories,
    settings,
    loading,
    error,
    fetchAllSettings,
    fetchSettingsByCategory,
    updateSetting,
    updateMultipleSettings,
    getSetting,
    getCategorySettings
  };
};
