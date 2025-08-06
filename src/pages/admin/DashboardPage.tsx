import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Total Orders</h2>
          <div className="text-2xl font-bold">--</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Total Revenue</h2>
          <div className="text-2xl font-bold">--</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Top Product</h2>
          <div className="text-2xl font-bold">--</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="text-gray-500">(Order list placeholder)</div>
      </div>
    </div>
  );
};

export default DashboardPage;
