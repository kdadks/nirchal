import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Ruler } from 'lucide-react';

interface SizeChart {
  category: string;
  measurements: string[];
  sizes: {
    [key: string]: string[];
  };
}

const SizeGuidePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('sarees');

  const sizeCharts: SizeChart[] = [
    {
      category: 'sarees',
      measurements: ['Length', 'Width', 'Blouse Size'],
      sizes: {
        'Standard': ['5.5m', '1.1m', '0.8m'],
        'Extra Long': ['6m', '1.1m', '0.8m'],
        'Half Saree': ['4m', '1.1m', '0.8m']
      }
    },
    {
      category: 'lehengas',
      measurements: ['Bust', 'Waist', 'Hip', 'Length'],
      sizes: {
        'XS': ['32"', '26"', '35"', '40"'],
        'S': ['34"', '28"', '37"', '40"'],
        'M': ['36"', '30"', '39"', '40"'],
        'L': ['38"', '32"', '41"', '40"'],
        'XL': ['40"', '34"', '43"', '40"'],
        'XXL': ['42"', '36"', '45"', '40"']
      }
    },
    {
      category: 'kurtis',
      measurements: ['Bust', 'Waist', 'Hip', 'Length'],
      sizes: {
        'XS': ['34"', '28"', '36"', '38"'],
        'S': ['36"', '30"', '38"', '38"'],
        'M': ['38"', '32"', '40"', '39"'],
        'L': ['40"', '34"', '42"', '39"'],
        'XL': ['42"', '36"', '44"', '40"'],
        'XXL': ['44"', '38"', '46"', '40"']
      }
    },
    {
      category: 'suits',
      measurements: ['Bust', 'Waist', 'Hip', 'Length', 'Sleeve'],
      sizes: {
        'XS': ['34"', '28"', '36"', '44"', '22"'],
        'S': ['36"', '30"', '38"', '44"', '22"'],
        'M': ['38"', '32"', '40"', '45"', '22"'],
        'L': ['40"', '34"', '42"', '45"', '23"'],
        'XL': ['42"', '36"', '44"', '46"', '23"'],
        'XXL': ['44"', '38"', '46"', '46"', '23"']
      }
    }
  ];

  const howToMeasure = [
    {
      measurement: 'Bust',
      instruction: 'Measure around the fullest part of your bust, keeping the measuring tape parallel to the ground.'
    },
    {
      measurement: 'Waist',
      instruction: 'Measure around your natural waistline, keeping the tape comfortably loose.'
    },
    {
      measurement: 'Hip',
      instruction: 'Measure around the fullest part of your hips, usually about 8" below your waist.'
    },
    {
      measurement: 'Length',
      instruction: 'For tops/kurtis: Measure from shoulder point to desired length. For bottoms: Measure from waist to ankle.'
    }
  ];

  const selectedChart = sizeCharts.find(chart => chart.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Helmet>
        <title>Size Guide - Nirchal</title>
        <meta name="description" content="Find your perfect fit with our detailed size guide" />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Ruler className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-serif font-bold text-gray-900">Size Guide</h1>
        </div>

        {/* Category Selection */}
        <div className="flex flex-wrap gap-2 mb-8">
          {sizeCharts.map(chart => (
            <button
              key={chart.category}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                selectedCategory === chart.category
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedCategory(chart.category)}
            >
              {chart.category}
            </button>
          ))}
        </div>

        {selectedChart && (
          <>
            {/* Size Chart */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 font-semibold text-gray-900">Size</th>
                      {selectedChart.measurements.map(measurement => (
                        <th key={measurement} className="px-6 py-4 font-semibold text-gray-900">
                          {measurement}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedChart.sizes).map(([size, measurements]) => (
                      <tr key={size} className="border-t border-gray-200">
                        <td className="px-6 py-4 font-medium text-gray-900">{size}</td>
                        {measurements.map((measurement, index) => (
                          <td key={index} className="px-6 py-4 text-gray-600">
                            {measurement}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* How to Measure */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Measure</h2>
              <div className="space-y-4">
                {howToMeasure.map(item => (
                  <div key={item.measurement}>
                    <h3 className="font-medium text-gray-900 mb-1">{item.measurement}</h3>
                    <p className="text-gray-600">{item.instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Additional Notes */}
        <div className="mt-8 p-4 bg-primary-50 rounded-lg">
          <h2 className="text-lg font-semibold text-primary-900 mb-2">Important Notes:</h2>
          <ul className="list-disc pl-5 text-primary-800 space-y-1">
            <li>All measurements are in inches unless specified otherwise</li>
            <li>For the best fit, get measured by a professional tailor</li>
            <li>If between sizes, choose the larger size</li>
            <li>Custom sizing available for select products</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SizeGuidePage;