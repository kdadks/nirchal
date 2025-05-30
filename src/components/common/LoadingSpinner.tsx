import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        <div className="mt-4 text-gray-600">Loading...</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;