import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Settings</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Placeholder for settings sections */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-medium mb-4">General Settings</h2>
            <p className="text-gray-600">Settings page under construction. More options will be available soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;