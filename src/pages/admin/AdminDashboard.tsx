import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Crown,
  ArrowUpRight,
  Calendar,
  BarChart3
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Products',
      value: '124',
      change: '+12%',
      changeType: 'increase',
      icon: <Package className="h-8 w-8" />,
      onClick: () => navigate('/admin/products'),
      gradient: 'from-primary-500 to-primary-600'
    },
    {
      title: 'Orders Today',
      value: '12',
      change: '+8%',
      changeType: 'increase',
      icon: <ShoppingCart className="h-8 w-8" />,
      onClick: () => navigate('/admin/orders'),
      gradient: 'from-accent-500 to-accent-600'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+23%',
      changeType: 'increase',
      icon: <Users className="h-8 w-8" />,
      onClick: () => navigate('/admin/users'),
      gradient: 'from-secondary-500 to-secondary-600'
    },
    {
      title: 'Revenue',
      value: '₹1,24,500',
      change: '+15%',
      changeType: 'increase',
      icon: <DollarSign className="h-8 w-8" />,
      onClick: () => navigate('/admin/analytics'),
      gradient: 'from-green-500 to-green-600'
    }
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'Priya Sharma', amount: '₹2,499', status: 'Processing', time: '2 mins ago' },
    { id: '#ORD-002', customer: 'Arjun Patel', amount: '₹4,299', status: 'Shipped', time: '15 mins ago' },
    { id: '#ORD-003', customer: 'Meera Singh', amount: '₹1,899', status: 'Delivered', time: '1 hour ago' },
    { id: '#ORD-004', customer: 'Rohit Kumar', amount: '₹3,599', status: 'Processing', time: '2 hours ago' }
  ];

  const topProducts = [
    { name: 'Elegant Banarasi Saree', sales: 45, revenue: '₹1,12,455', trend: '+12%' },
    { name: 'Royal Lehenga Set', sales: 23, revenue: '₹1,05,777', trend: '+8%' },
    { name: 'Designer Anarkali', sales: 18, revenue: '₹28,782', trend: '+15%' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="px-6 py-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-accent-400 to-primary-500 rounded-xl">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-800 to-accent-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-neutral-600 font-accent">
                Welcome back! Here's what's happening with Nirchal today.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <button
              key={index}
              onClick={stat.onClick}
              className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-100 hover:border-accent-200 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <ArrowUpRight className="h-5 w-5 text-neutral-400 group-hover:text-accent-500 transition-colors duration-300" />
              </div>
              
              <div className="text-left">
                <p className="text-2xl font-bold text-primary-800 mb-1">{stat.value}</p>
                <p className="text-sm text-neutral-600 mb-2">{stat.title}</p>
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium text-green-600">{stat.change}</span>
                  <span className="text-xs text-neutral-500">vs last month</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-neutral-100">
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-semibold text-primary-800">Recent Orders</h2>
                <button 
                  onClick={() => navigate('/admin/orders')}
                  className="text-accent-600 hover:text-accent-700 font-accent font-medium text-sm transition-colors"
                >
                  View all
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-neutral-100">
              {recentOrders.map((order, index) => (
                <div key={index} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-accent font-semibold text-primary-800">{order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-neutral-600 text-sm">{order.customer}</p>
                      <p className="text-neutral-500 text-xs">{order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-800">{order.amount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-3xl shadow-lg border border-neutral-100">
            <div className="p-6 border-b border-neutral-100">
              <h2 className="text-xl font-display font-semibold text-primary-800">Top Products</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-transparent rounded-2xl">
                  <div className="flex-1">
                    <p className="font-accent font-semibold text-primary-800 text-sm mb-1">{product.name}</p>
                    <div className="flex items-center space-x-4 text-xs text-neutral-600">
                      <span>{product.sales} sales</span>
                      <span className="text-green-600 font-medium">{product.trend}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-800 text-sm">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate('/admin/products/create')}
            className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 group-hover:rotate-12 transition-transform duration-300" />
              <div className="text-left">
                <p className="font-display font-bold text-lg">Add Product</p>
                <p className="text-primary-100 text-sm">Create new product listing</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => navigate('/admin/analytics')}
            className="bg-gradient-to-br from-accent-500 to-accent-600 text-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-left">
                <p className="font-display font-bold text-lg">Analytics</p>
                <p className="text-accent-100 text-sm">View detailed reports</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => navigate('/admin/settings')}
            className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 group-hover:rotate-12 transition-transform duration-300" />
              <div className="text-left">
                <p className="font-display font-bold text-lg">Settings</p>
                <p className="text-secondary-100 text-sm">Manage your store</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
