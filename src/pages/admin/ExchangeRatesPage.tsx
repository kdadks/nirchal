import React, { useState, useEffect } from 'react';
import { DollarSign, Euro, Save, RefreshCw, Clock, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';

interface DBExchangeRate {
  currency: string;
  rate: number | string;
  updated_at: string;
  source?: string;
}

const ExchangeRatesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usdRate, setUsdRate] = useState('88.00');
  const [eurRate, setEurRate] = useState('102.00');
  const [lastUpdated, setLastUpdated] = useState<{ usd: string; eur: string }>({ usd: '', eur: '' });
  const [sources, setSources] = useState<{ usd: string; eur: string }>({ usd: 'manual', eur: 'manual' });

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('currency');

      if (error) throw error;

      if (data) {
        const typedData = data as unknown as DBExchangeRate[];
        const usd = typedData.find(r => r.currency === 'USD');
        const eur = typedData.find(r => r.currency === 'EUR');
        
        if (usd) {
          setUsdRate(usd.rate.toString());
          setLastUpdated(prev => ({ ...prev, usd: usd.updated_at }));
          setSources(prev => ({ ...prev, usd: usd.source || 'manual' }));
        }
        if (eur) {
          setEurRate(eur.rate.toString());
          setLastUpdated(prev => ({ ...prev, eur: eur.updated_at }));
          setSources(prev => ({ ...prev, eur: eur.source || 'manual' }));
        }
      }
    } catch (error: any) {
      console.error('Error fetching exchange rates:', error);
      toast.error('Failed to load exchange rates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const usdValue = parseFloat(usdRate);
      const eurValue = parseFloat(eurRate);

      if (isNaN(usdValue) || usdValue <= 0) {
        toast.error('USD rate must be a valid positive number');
        return;
      }

      if (isNaN(eurValue) || eurValue <= 0) {
        toast.error('EUR rate must be a valid positive number');
        return;
      }

      // Update USD rate
      const { error: usdError } = await supabase.rpc('update_exchange_rate', {
        p_currency: 'USD',
        p_rate: usdValue,
        p_source: 'manual'
      });

      if (usdError) throw usdError;

      // Update EUR rate
      const { error: eurError } = await supabase.rpc('update_exchange_rate', {
        p_currency: 'EUR',
        p_rate: eurValue,
        p_source: 'manual'
      });

      if (eurError) throw eurError;

      toast.success('Exchange rates updated successfully');
      await fetchExchangeRates();
    } catch (error: any) {
      console.error('Error saving exchange rates:', error);
      toast.error('Failed to update exchange rates');
    } finally {
      setSaving(false);
    }
  };

  const handleFetchFromCron = async () => {
    try {
      setSaving(true);
      toast.loading('Fetching latest rates...', { id: 'fetch-rates' });

      // Try to call the edge function first
      try {
        const { error } = await supabase.functions.invoke('fetch-exchange-rates');
        
        if (!error) {
          toast.success('Exchange rates fetched and updated successfully', { id: 'fetch-rates' });
          await fetchExchangeRates();
          return;
        }
      } catch (edgeFunctionError) {
        console.log('Edge function not available, fetching directly...', edgeFunctionError);
      }

      // Fallback: Fetch rates directly from API
      console.log('Fetching rates directly from API...');
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates from API');
      }

      const data = await response.json();
      
      if (!data.rates || !data.rates.USD || !data.rates.EUR) {
        throw new Error('Invalid response format from API');
      }

      // Convert from INR to foreign currency to foreign currency to INR
      const usdRate = 1 / data.rates.USD; // INR per USD
      const eurRate = 1 / data.rates.EUR; // INR per EUR

      // Round to 2 decimal places
      const finalUsdRate = Math.round(usdRate * 100) / 100;
      const finalEurRate = Math.round(eurRate * 100) / 100;

      // Update USD rate
      const { error: usdError } = await supabase.rpc('update_exchange_rate', {
        p_currency: 'USD',
        p_rate: finalUsdRate,
        p_source: 'xe.com'
      });

      if (usdError) throw usdError;

      // Update EUR rate
      const { error: eurError } = await supabase.rpc('update_exchange_rate', {
        p_currency: 'EUR',
        p_rate: finalEurRate,
        p_source: 'xe.com'
      });

      if (eurError) throw eurError;

      toast.success('Exchange rates fetched and updated successfully', { id: 'fetch-rates' });
      await fetchExchangeRates();
    } catch (error: any) {
      console.error('Error fetching rates:', error);
      toast.error(error.message || 'Failed to fetch rates', { id: 'fetch-rates' });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getSourceBadge = (source: string) => {
    const colors = {
      manual: 'bg-blue-100 text-blue-700',
      'xe.com': 'bg-green-100 text-green-700',
      cron: 'bg-purple-100 text-purple-700',
    };
    return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary-600" />
          Exchange Rates Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage currency exchange rates for INR to USD and EUR conversions
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Set base exchange rates manually or fetch from live API</li>
            <li>Formula: <code className="bg-blue-100 px-1 py-0.5 rounded">(INR / (rate - 5)) × multiplier</code></li>
            <li>Multipliers: USD = 2x, EUR = 1.5x</li>
            <li>Optional: Set up cron job for automatic daily updates</li>
          </ul>
        </div>
      </div>

      {/* Exchange Rates Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* USD Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">USD Rate</h3>
                <p className="text-sm text-gray-500">1 USD = ? INR</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getSourceBadge(sources.usd)}`}>
              {sources.usd}
            </span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exchange Rate (INR per USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={usdRate}
              onChange={(e) => setUsdRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="88.00"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Last updated: {formatDate(lastUpdated.usd)}</span>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Example Conversion:</p>
            <p className="text-sm font-medium text-gray-900">
              ₹1,000 = ${((1000 / (parseFloat(usdRate) - 5)) * 2).toFixed(2)}
            </p>
          </div>
        </div>

        {/* EUR Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Euro className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">EUR Rate</h3>
                <p className="text-sm text-gray-500">1 EUR = ? INR</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getSourceBadge(sources.eur)}`}>
              {sources.eur}
            </span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exchange Rate (INR per EUR)
            </label>
            <input
              type="number"
              step="0.01"
              value={eurRate}
              onChange={(e) => setEurRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="102.00"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Last updated: {formatDate(lastUpdated.eur)}</span>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Example Conversion:</p>
            <p className="text-sm font-medium text-gray-900">
              ₹1,000 = €{((1000 / (parseFloat(eurRate) - 5)) * 1.5).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Exchange Rates
            </>
          )}
        </button>

        <button
          onClick={handleFetchFromCron}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Fetching...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Fetch Latest Rates
            </>
          )}
        </button>
      </div>

      {/* Current Rates Summary */}
      <div className="mt-8 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary-600" />
          Current Active Rates
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">USD Exchange Rate</p>
            <p className="text-2xl font-bold text-gray-900">₹{parseFloat(usdRate).toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">per 1 USD</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">EUR Exchange Rate</p>
            <p className="text-2xl font-bold text-gray-900">₹{parseFloat(eurRate).toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">per 1 EUR</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRatesPage;
