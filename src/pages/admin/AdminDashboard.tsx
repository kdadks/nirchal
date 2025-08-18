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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Plus,
  RefreshCw,
  Download
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Products',
      value: '124',
      change: '+12%',
      changeType: 'increase',
      icon: <Package className="h-6 w-6" />,
      onClick: () => navigate('/admin/products'),
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Active listings'
    },
    {
      title: 'Orders Today',
      value: '12',
      change: '+8%',
      changeType: 'increase',
      icon: <ShoppingCart className="h-6 w-6" />,
      onClick: () => navigate('/admin/orders'),
      gradient: 'from-blue-500 to-cyan-600',
      description: 'New orders received'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+23%',
      changeType: 'increase',
      icon: <Users className="h-6 w-6" />,
      onClick: () => navigate('/admin/users'),
      gradient: 'from-violet-500 to-purple-600',
      description: 'Monthly active users'
    },
    {
      title: 'Revenue',
      value: '₹1,24,500',
      change: '+15%',
      changeType: 'increase',
      icon: <DollarSign className="h-6 w-6" />,
      onClick: () => navigate('/admin/analytics'),
      gradient: 'from-amber-500 to-orange-600',
      description: 'This month'
    }
  ];

  const recentOrders = [
    { 
      id: '#ORD-001', 
      customer: 'Priya Sharma', 
      amount: '₹2,499', 
      status: 'Processing', 
      time: '2 mins ago',
      avatar: 'PS'
    },
    { 
      id: '#ORD-002', 
      customer: 'Arjun Patel', 
      amount: '₹4,299', 
      status: 'Shipped', 
      time: '15 mins ago',
      avatar: 'AP'
    },
    { 
      id: '#ORD-003', 
      customer: 'Meera Singh', 
      amount: '₹1,899', 
      status: 'Delivered', 
      time: '1 hour ago',
      avatar: 'MS'
    },
    { 
      id: '#ORD-004', 
      customer: 'Rohit Kumar', 
      amount: '₹3,599', 
      status: 'Processing', 
      time: '2 hours ago',
      avatar: 'RK'
    }
  ];

  const topProducts = [
    { 
      name: 'Elegant Banarasi Saree', 
      sales: 45, 
      revenue: '₹1,12,455', 
      trend: '+12%',
      image: '/api/placeholder/48/48'
    },
    { 
      name: 'Royal Lehenga Set', 
      sales: 23, 
      revenue: '₹1,05,777', 
      trend: '+8%',
      image: '/api/placeholder/48/48'
    },
    { 
      name: 'Designer Anarkali', 
      sales: 18, 
      revenue: '₹28,782', 
      trend: '+15%',
      image: '/api/placeholder/48/48'
    },
  ];

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Create new product listing',
      icon: <Plus className="h-6 w-6" />,
      onClick: () => navigate('/admin/products/create'),
      gradient: 'from-primary-500 to-primary-600',
      color: 'primary'
    },
    {
      title: 'View Analytics',
      description: 'Check detailed reports',
      icon: <BarChart3 className="h-6 w-6" />,
      onClick: () => navigate('/admin/analytics'),
      gradient: 'from-blue-500 to-blue-600',
      color: 'blue'
    },
    {
      title: 'Export Data',
      description: 'Download reports',
      icon: <Download className="h-6 w-6" />,
      onClick: () => console.log('Export data'),
      gradient: 'from-green-500 to-green-600',
      color: 'green'
    },
    {
      title: 'Manage Settings',
      description: 'Store configuration',
      icon: <Calendar className="h-6 w-6" />,
      onClick: () => navigate('/admin/settings'),
      gradient: 'from-purple-500 to-purple-600',
      color: 'purple'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="mb-6 lg:mb-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl blur opacity-40"></div>
              <div className="relative bg-gradient-to-r from-primary-500 to-accent-500 p-3 rounded-2xl">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary-800 to-accent-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-neutral-600 font-accent text-lg">
                Welcome back! Here's what's happening with your store today.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
          >
            <RefreshCw className="h-4 w-4 text-neutral-600 group-hover:text-primary-600 group-hover:rotate-180 transition-all duration-300" />
            <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-700">Refresh</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 group">
            <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">View Store</span>
          </button>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <button
            key={index}
            onClick={stat.onClick}
            className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-neutral-200/50 hover:shadow-2xl hover:border-primary-200 transition-all duration-300 hover:-translate-y-2"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-neutral-50/50 to-primary-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-bold text-emerald-600">{stat.change}</span>
                </div>
              </div>
              
              <div className="text-left">
                <p className="text-3xl font-display font-bold text-primary-800 mb-1 group-hover:text-primary-600 transition-colors">
                  {stat.value}
                </p>
                <p className="text-sm font-accent font-medium text-neutral-600 mb-1">{stat.title}</p>
                <p className="text-xs text-neutral-500">{stat.description}</p>
              </div>
              
              <ArrowUpRight className="absolute top-4 right-4 h-5 w-5 text-neutral-400 group-hover:text-accent-500 group-hover:scale-110 transition-all duration-300" />
            </div>
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders - Large Card */}
        <div className="lg:col-span-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-neutral-200/50 overflow-hidden">
          <div className="p-6 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50/50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-primary-800">Recent Orders</h2>
                  <p className="text-sm text-neutral-600">Latest customer orders</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/admin/orders')}
                className="text-accent-600 hover:text-accent-700 font-accent font-medium text-sm transition-colors flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-neutral-100">
            {recentOrders.map((order, index) => (
              <div key={index} className="p-6 hover:bg-neutral-50/50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {order.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-accent font-bold text-primary-800">{order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-neutral-700 font-medium">{order.customer}</p>
                      <p className="text-neutral-500 text-sm">{order.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-xl text-primary-800">{order.amount}</p>
                    <button className="text-accent-600 hover:text-accent-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products - Sidebar */}
        <div className="lg:col-span-4 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-neutral-200/50">
          <div className="p-6 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50/50 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-primary-800">Top Products</h2>
                <p className="text-sm text-neutral-600">Best performing items</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="group p-4 rounded-2xl bg-gradient-to-r from-neutral-50/50 to-transparent hover:from-primary-50/50 hover:to-accent-50/30 transition-all duration-200 border border-transparent hover:border-primary-200">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-neutral-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-accent font-bold text-primary-800 text-sm mb-1 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-600">{product.sales} sales</span>
                      <span className="text-emerald-600 font-bold flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {product.trend}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <p className="font-display font-bold text-primary-800">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <button 
            key={index}
            onClick={action.onClick}
            className="group relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-neutral-200/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            <div className="relative">
              <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${action.gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {action.icon}
              </div>
              <div className="text-left">
                <p className="font-display font-bold text-lg text-primary-800 mb-1 group-hover:text-primary-600 transition-colors">
                  {action.title}
                </p>
                <p className="text-sm text-neutral-600">{action.description}</p>
              </div>
              <ArrowUpRight className="absolute top-4 right-4 h-5 w-5 text-neutral-400 group-hover:text-accent-500 group-hover:scale-110 transition-all duration-300" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
