import React, { useState } from 'react';
import { cleanupProblematicImages } from '../../utils/imageCleanup';

/**
 * Admin component for cleaning up problematic images
 */
export const ImageCleanupPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    success: boolean;
    message: string;
    results?: Array<{ filePath: string; success: boolean; error?: string }>;
  } | null>(null);

  const handleCleanup = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      const result = await cleanupProblematicImages();
      setResults(result);
    } catch (error) {
      setResults({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Image Cleanup Utility
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          This utility will delete problematic images from the GitHub repository that have 
          malformed filenames (double timestamps, query parameters, etc.).
        </p>
        <p className="text-sm text-yellow-600">
          ⚠️ This action cannot be undone. Make sure you want to proceed.
        </p>
      </div>

      <button
        onClick={handleCleanup}
        disabled={isLoading}
        className={`
          px-4 py-2 rounded-md text-sm font-medium
          ${isLoading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'
          }
        `}
      >
        {isLoading ? 'Cleaning up...' : 'Clean Up Problematic Images'}
      </button>

      {results && (
        <div className="mt-6">
          <div className={`
            p-4 rounded-md
            ${results.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
            }
          `}>
            <div className="flex">
              <div className="flex-shrink-0">
                {results.success ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h4 className={`text-sm font-medium ${results.success ? 'text-green-800' : 'text-red-800'}`}>
                  {results.success ? 'Cleanup Completed' : 'Cleanup Failed'}
                </h4>
                <p className={`mt-1 text-sm ${results.success ? 'text-green-700' : 'text-red-700'}`}>
                  {results.message}
                </p>
              </div>
            </div>
          </div>

          {results.results && results.results.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Detailed Results:</h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.results.map((result, index) => (
                  <div
                    key={index}
                    className={`
                      text-xs p-2 rounded
                      ${result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }
                    `}
                  >
                    <div className="font-mono break-all">
                      {result.success ? '✅' : '❌'} {result.filePath}
                    </div>
                    {result.error && (
                      <div className="mt-1 text-red-600">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
