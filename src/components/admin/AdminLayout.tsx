import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminContext } from '../../contexts/AdminContext';
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
  User,
  RefreshCw,
  Truck,
  Shield
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get counts from AdminContext
  const { counts, refreshCounts } = useAdminContext();

  const navigationItems = useMemo(() => [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <LayoutDashboard className="admin-nav-icon" />,
      badge: null
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: <Package className="admin-nav-icon" />,
      badge: counts.products?.toString() || '0'
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: <ShoppingBag className="admin-nav-icon" />,
      badge: counts.categories?.toString() || '0'
    },
    {
      name: 'Vendors',
      path: '/admin/vendors',
      icon: <Truck className="admin-nav-icon" />,
      badge: counts.vendors?.toString() || '0'
    },
    {
      name: 'Logistics',
      path: '/admin/logistics-partners',
      icon: <RefreshCw className="admin-nav-icon" />,
      badge: counts.logisticsPartners?.toString() || '0'
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: <FileText className="admin-nav-icon" />,
      badge: counts.orders?.toString() || '0'
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: <BarChart3 className="admin-nav-icon" />,
      badge: null
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <Users className="admin-nav-icon" />,
      badge: counts.users?.toString() || '0'
    },
    {
      name: 'Security',
      path: '/admin/security',
      icon: <Shield className="admin-nav-icon" />,
      badge: null
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: <Settings className="admin-nav-icon" />,
      badge: null
    }
  ], [counts]);

  // Get current page context for dynamic top navigation
  const getCurrentPageContext = () => {
    const path = location.pathname;
    if (path.includes('/products')) return 'products';
    if (path.includes('/categories')) return 'categories';
    if (path.includes('/vendors')) return 'vendors';
    if (path.includes('/logistics-partners')) return 'logistics';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/users')) return 'users';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/security')) return 'security';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const currentPage = getCurrentPageContext();

  // Smart refresh function that refreshes data based on current page
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simply refresh all counts since we have the AdminContext
      await refreshCounts();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Log the error but don't prevent logout navigation
      console.error('Error signing out:', error);
    } finally {
      // Always navigate to login page regardless of signOut success
      navigate('/admin/login');
    }
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-logo">
            Nirchal Admin
          </Link>
          
          {/* Close Button - Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-nav">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
              {item.badge && (
                <span className="admin-nav-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--admin-border)' }}>
          <div className="admin-nav-item" style={{ marginBottom: '8px' }}>
            <User className="admin-nav-icon" />
            <span className="admin-text-sm">{user?.email || 'Admin'}</span>
          </div>
          
          <button
            onClick={handleSignOut}
            className="admin-nav-item admin-text-sm"
            style={{ 
              width: '100%', 
              color: 'var(--admin-danger)',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              textAlign: 'left'
            }}
          >
            <LogOut className="admin-nav-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Bar - Dynamic placeholder */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${currentPage === 'products' ? 'products...' : 
                             currentPage === 'categories' ? 'categories...' : 
                             currentPage === 'orders' ? 'orders...' : 
                             currentPage === 'users' ? 'users...' : 
                             'products, orders, customers...'}`}
                className="admin-search pl-10"
              />
            </div>
          </div>

          <div className="admin-header-right">
            {/* Dynamic Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="admin-btn admin-btn-secondary admin-btn-sm"
                title="Refresh Data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Notifications */}
            <button className="p-2 relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-2 text-sm admin-text-secondary">
              <span>Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
