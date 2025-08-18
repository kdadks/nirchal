import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  Users,
  BarChart3,
  FileText,
  Bell,
  Search,
  Crown,
  Sparkles
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
      badge: null,
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: <Package className="h-5 w-5" />,
      badge: '124',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: <ShoppingBag className="h-5 w-5" />,
      badge: null,
      gradient: 'from-orange-500 to-red-600'
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: <FileText className="h-5 w-5" />,
      badge: '12',
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      badge: null,
      gradient: 'from-indigo-500 to-blue-600'
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      badge: null,
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
      badge: null,
      gradient: 'from-gray-500 to-slate-600'
    }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      {/* Modern Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex h-full flex-col bg-white/80 backdrop-blur-xl border-r border-neutral-200/50 shadow-2xl">
          {/* Logo Section */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-neutral-200/50">
            {!isCollapsed && (
              <Link to="/admin" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-primary-500 to-accent-500 p-2 rounded-xl">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary-800 to-accent-600 bg-clip-text text-transparent">
                    Nirchal
                  </h1>
                  <p className="text-xs text-neutral-500 font-accent">Admin Console</p>
                </div>
              </Link>
            )}
            
            {/* Collapse Toggle - Desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-neutral-600" />
            </button>
            
            {/* Close Button - Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5 text-neutral-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                      : 'text-neutral-600 hover:bg-neutral-100/80 hover:text-primary-700'
                  } ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className={`relative ${isCollapsed ? '' : 'mr-3'}`}>
                    {item.icon}
                    {item.badge && !isCollapsed && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-accent font-medium">{item.name}</span>
                      {item.badge && (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-neutral-200 text-neutral-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-neutral-200/50 p-4">
            {!isCollapsed ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-neutral-50 to-primary-50/50">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary-800 truncate">
                      {user?.email || 'Admin User'}
                    </p>
                    <p className="text-xs text-neutral-500">Administrator</p>
                  </div>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-neutral-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                >
                  <LogOut className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="h-10 w-10 mx-auto rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center p-2 text-neutral-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        {/* Modern Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-neutral-600" />
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search products, orders, customers..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-neutral-100 transition-colors group">
                <Bell className="h-5 w-5 text-neutral-600 group-hover:text-primary-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-accent-500 rounded-full animate-pulse"></span>
              </button>

              {/* Premium Badge */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-accent-100 to-primary-100 border border-accent-200">
                <Sparkles className="h-4 w-4 text-accent-600" />
                <span className="text-sm font-medium text-accent-700">Pro Plan</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;