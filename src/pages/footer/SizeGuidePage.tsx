
import React, { useState } from 'react';
import { Ruler, Info, Shirt } from 'lucide-react';
import SEO from '../../components/SEO';

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
    },
    {
      category: 'blouses',
      measurements: ['Bust', 'Waist', 'Shoulder', 'Sleeve Length', 'Blouse Length'],
      sizes: {
        'XS': ['30', '24', '12', '15', '16'],
        'S': ['32', '26', '12.5', '15.5', '17'],
        'M': ['34', '28', '13', '16', '18'],
        'L': ['36', '30', '13.5', '16.5', '19'],
        'XL': ['38', '32', '14', '17', '20'],
        'XXL': ['40', '34', '14.5', '17.5', '21'],
        '3XL': ['42', '36', '15', '18', '22']
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
    },
    {
      measurement: 'Shoulder',
      instruction: 'For blouses: Measure across the back from one shoulder bone to the other. Keep the tape straight across the back.'
    },
    {
      measurement: 'Sleeve Length',
      instruction: 'For blouses: Measure from the center back neck, across shoulder, down to your wrist bone with arm bent at 90 degrees.'
    },
    {
      measurement: 'Blouse Length',
      instruction: 'For blouses: Measure from the highest point of the shoulder down to your desired blouse length (typically to hip level).'
    }
  ];

  const selectedChart = sizeCharts.find(chart => chart.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <SEO
        title="Size Guide - Nirchal | Perfect Fit Guide"
        description="Find your perfect fit with Nirchal's detailed size guide for kurtis, lehengas, sarees and more."
        canonical="/size-guide"
      />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">

          {/* Size Guide Header */}
          <section className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Size Guide</h2>
            
            {/* Category Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6 md:mb-8">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mr-3 md:mr-4">
                  <Shirt className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">Select Category</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {sizeCharts.map(chart => {
                  let label = chart.category
                    .replace('kurtis/suits/dresses', 'Kurtis / Suits / Dresses')
                    .replace('lehengas', 'Lehengas')
                    .replace('sarees', 'Sarees')
                    .replace('blouses', 'Blouses');
                  return (
                    <button
                      key={chart.category}
                      className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                        selectedCategory === chart.category
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedCategory(chart.category)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Size Chart Table */}
              {selectedChart && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm md:text-base border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900 border-r border-gray-200">Size</th>
                        {selectedChart.measurements.map(measurement => (
                          <th key={measurement} className="px-3 md:px-6 py-3 md:py-4 font-semibold text-gray-900 border-r last:border-r-0 border-gray-200">
                            {measurement} (inches)
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(selectedChart.sizes).map(([size, measurements]) => (
                        <tr key={size} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-gray-900 border-r border-gray-200 bg-gray-50">{size}</td>
                          {measurements.map((measurement, index) => (
                            <td key={index} className="px-3 md:px-6 py-3 md:py-4 text-gray-600 border-r last:border-r-0 border-gray-200">
                              {measurement}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Blouse Reference Image - Only for Blouse Category */}
              {selectedCategory === 'blouses' && (
                <div className="mt-8 flex justify-center">
                  <img
                    src="https://pub-def558ac10b64a6bb80dc1beedeafe2c.r2.dev/categories/blouse.webp"
                    alt="Blouse Size Guide Reference"
                    className="max-w-full h-auto"
                    style={{ maxWidth: '600px' }}
                  />
                </div>
              )}
            </div>
          </section>

          {/* How to Measure - Only for Blouse Category */}
          {selectedCategory === 'blouses' && (
            <section className="mb-12">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                  <Ruler className="w-8 h-8 text-primary-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">How to Measure</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {howToMeasure.map((item, index) => (
                    <div key={item.measurement} className="bg-gradient-to-r from-primary-50 to-accent-50 p-4 rounded-lg border border-primary-100">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <h3 className="font-semibold text-primary-900">{item.measurement}</h3>
                      </div>
                      <p className="text-primary-800 text-sm leading-relaxed ml-11">{item.instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Important Notes */}
          <section>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <Info className="w-8 h-8 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Important Notes</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">All measurements are in inches unless specified otherwise</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">For the best fit, get measured by a professional tailor</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">If between sizes, choose the larger size</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">Custom sizing available for select products</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">Need help finding your size?</p>
                <a 
                  href="mailto:support@nirchal.com"
                  className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Contact Size Expert
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SizeGuidePage;