
import React, { useState } from 'react';
import { Ruler } from 'lucide-react';

interface SizeChart {
  category: string;
  measurements: string[];
  sizes: {
    [key: string]: string[];
  };
}

const SizeGuidePage: React.FC = () => {
  // Set default to first category for guaranteed match
  const [selectedCategory, setSelectedCategory] = useState('kurtis/suits/dresses');

  const sizeCharts: SizeChart[] = [
    {
      category: 'kurtis/suits/dresses',
      measurements: ['Bust', 'Waist', 'Hip'],
      sizes: {
        'XS': ['32', '26', '36'],
        'S': ['34', '28', '38'],
        'M': ['36', '30', '40'],
        'L': ['38', '32', '42'],
        'XL': ['40', '34', '44'],
        'XXL': ['42', '36', '46'],
        '3XL': ['44', '38', '48']
      }
    },
    {
      category: 'lehengas',
      measurements: ['Waist', 'Hip', 'Length'],
      sizes: {
        'XS': ['26', '36', '40'],
        'S': ['28', '38', '40'],
        'M': ['30', '40', '41'],
        'L': ['32', '42', '41'],
        'XL': ['34', '44', '42'],
        'XXL': ['36', '46', '42']
      }
    },
    {
      category: 'sarees',
      measurements: ['Saree Length', 'Blouse Fabric', 'Petticoat Waist'],
      sizes: {
        'Standard': ['5.5m–6m', '0.8m', '28–44" (adjustable)']
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <section className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-xl shadow-lg p-6 md:p-8 mb-8 md:mb-10 text-center">
          <div className="flex items-center gap-3 justify-center mb-4">
            <Ruler className="w-6 h-6 md:w-8 md:h-8 text-white" />
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold">Size Guide</h1>
          </div>
          <p className="text-lg md:text-xl text-amber-100 mb-2">Find your perfect fit with our detailed size guide</p>
        </section>
        <section className="bg-white rounded-xl shadow p-6 md:p-8 mb-6 md:mb-8">
          {/* Category Selection */}
          <div className="flex flex-wrap gap-2 mb-8">
            {sizeCharts.map(chart => {
              // Prettify category label for display
              let label = chart.category
                .replace('kurtis/suits/dresses', 'Kurtis / Suits / Dresses')
                .replace('lehengas', 'Lehengas')
                .replace('sarees', 'Sarees');
              return (
                <button
                  key={chart.category}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                    selectedCategory === chart.category
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCategory(chart.category)}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {selectedChart && (
            <div className="overflow-x-auto mb-6 md:mb-8">
              <table className="w-full text-left text-sm md:text-base">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900">Size</th>
                    {selectedChart.measurements.map(measurement => (
                      <th key={measurement} className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900">
                        {measurement}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(selectedChart.sizes).map(([size, measurements]) => (
                    <tr key={size} className="border-t border-gray-200">
                      <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-gray-900">{size}</td>
                      {measurements.map((measurement, index) => (
                        <td key={index} className="px-3 md:px-6 py-3 md:py-4 text-gray-600">
                          {measurement}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* How to Measure */}
          <div className="bg-primary-50 rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-primary-900 mb-4">How to Measure</h2>
            <div className="space-y-4">
              {howToMeasure.map(item => (
                <div key={item.measurement}>
                  <h3 className="font-medium text-primary-900 mb-1">{item.measurement}</h3>
                  <p className="text-primary-800">{item.instruction}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Additional Notes */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-primary-900 mb-2">Important Notes:</h2>
          <ul className="list-disc pl-5 text-primary-800 space-y-1">
            <li>All measurements are in inches unless specified otherwise</li>
            <li>For the best fit, get measured by a professional tailor</li>
            <li>If between sizes, choose the larger size</li>
            <li>Custom sizing available for select products</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default SizeGuidePage;