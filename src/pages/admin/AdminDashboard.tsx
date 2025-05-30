import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Users } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Products',
      value: '124',
      icon: <Package className="h-6 w-6" />,
      onClick: () => navigate('/admin/products'),
      color: 'bg-blue-500'
    },
    {
      title: 'Orders Today',
      value: '12',
      icon: <ShoppingCart className="h-6 w-6" />,
      onClick: () => navigate('/admin/orders'),
      color: 'bg-green-500'
    },
    {
      title: 'Active Users',
      value: '1,234',
      icon: <Users className="h-6 w-6" />,
      onClick: () => navigate('/admin/users'),
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <button
            key={index}
            onClick={stat.onClick}
            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <span className="text-white">{stat.icon}</span>
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-medium text-gray-900">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => navigate('/admin/products/create')}
            className="p-4 text-left border rounded-lg hover:bg-gray-50"
          >
            <h3 className="font-medium text-gray-900">Add New Product</h3>
            <p className="text-sm text-gray-500">Create a new product listing</p>
          </button>
          <button
            onClick={() => navigate('/admin/settings')}
            className="p-4 text-left border rounded-lg hover:bg-gray-50"
          >
            <h3 className="font-medium text-gray-900">Settings</h3>
            <p className="text-sm text-gray-500">Manage store settings</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;