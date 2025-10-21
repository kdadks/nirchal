import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminContext } from '../../contexts/AdminContext';
import { useAdminSearch } from '../../contexts/AdminSearchContext';
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
  Shield,
  Boxes,
  Image,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Receipt
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
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({ orders: true, users: true });
  
  // Get search context
  const { searchTerm, setSearchTerm, setCurrentPage } = useAdminSearch();
  
  // Get counts from AdminContext
  const { counts, refreshCounts } = useAdminContext();

  const toggleSubmenu = (menuKey: string) => {
    setExpandedMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  const navigationItems = useMemo(() => [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <LayoutDashboard className="admin-nav-icon" />,
      badge: null
    },
    {
      name: 'Hero Slides',
      path: '/admin/hero-slides',
      icon: <Image className="admin-nav-icon" />,
      badge: null
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: <Package className="admin-nav-icon" />,
      badge: counts.products?.toString() || '0'
    },
    {
      name: 'Inventory',
      path: '/admin/inventory',
      icon: <Boxes className="admin-nav-icon" />,
      badge: null
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
      badge: counts.orders?.toString() || '0',
      submenu: [
        {
          name: 'All Orders',
          path: '/admin/orders',
          icon: <FileText className="admin-nav-icon" />,
          badge: counts.orders?.toString() || '0'
        },
        {
          name: 'Abandoned Carts',
          path: '/admin/abandoned-carts',
          icon: <ShoppingCart className="admin-nav-icon" />,
        }
      ]
    },
    {
      name: 'Invoices',
      path: '/admin/invoices',
      icon: <Receipt className="admin-nav-icon" />,
      badge: null
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
      badge: counts.users?.toString() || '0',
      submenu: [
        {
          name: 'All Users',
          path: '/admin/users',
          icon: <Users className="admin-nav-icon" />,
          badge: counts.users?.toString() || '0'
        },
        {
          name: 'Guest Visitors',
          path: '/admin/guest-visitors',
          icon: <UserCheck className="admin-nav-icon" />,
        }
      ]
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
    if (path.includes('/inventory')) return 'inventory';
    if (path.includes('/categories')) return 'categories';
    if (path.includes('/vendors')) return 'vendors';
    if (path.includes('/logistics-partners')) return 'logistics';
    if (path.includes('/abandoned-carts')) return 'abandoned-carts';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/guest-visitors')) return 'guest-visitors';
    if (path.includes('/users')) return 'users';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/security')) return 'security';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const currentPage = getCurrentPageContext();

  // Update search context when page changes
  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage, setCurrentPage]);

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
            <div key={item.path}>
              {item.submenu ? (
                // Parent item with submenu
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.path)}
                    className={`admin-nav-item ${isActive(item.path) ? 'active' : ''} w-full`}
                    style={{ cursor: 'pointer', border: 'none', background: 'none', textAlign: 'left' }}
                  >
                    {item.icon}
                    <span className="flex-1">{item.name}</span>
                    {expandedMenus[item.path] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {/* Submenu items */}
                  {expandedMenus[item.path] && (
                    <div className="ml-4">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`admin-nav-item ${isActive(subItem.path) ? 'active' : ''}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          style={{ fontSize: '0.875rem' }}
                        >
                          {subItem.icon}
                          <span>{subItem.name}</span>
                          {subItem.badge && (
                            <span className="admin-nav-badge">{subItem.badge}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular nav item without submenu
                <Link
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
              )}
            </div>
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
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Bar - Responsive */}
            <div className="hidden sm:flex items-center relative flex-1 max-w-md">
              <Search className="absolute left-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${currentPage === 'products' ? 'products...' : 
                             currentPage === 'categories' ? 'categories...' : 
                             currentPage === 'vendors' ? 'vendors...' :
                             currentPage === 'logistics' ? 'logistics partners...' :
                             currentPage === 'abandoned-carts' ? 'abandoned carts...' :
                             currentPage === 'orders' ? 'orders...' : 
                             currentPage === 'guest-visitors' ? 'guest visitors...' :
                             currentPage === 'users' ? 'users...' : 
                             'items...'}`}
                className="admin-search pl-10 w-full"
              />
            </div>
            
            {/* Mobile search button */}
            <button className="sm:hidden p-2 hover:bg-gray-100 rounded-md">
              <Search className="h-5 w-5" />
            </button>
          </div>

          <div className="admin-header-right">
            {/* Dynamic Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="admin-btn admin-btn-secondary admin-btn-sm"
                title="Refresh Data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline ml-1">Refresh</span>
              </button>
            </div>

            {/* Notifications */}
            <button className="p-2 relative hover:bg-gray-100 rounded-md">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="hidden md:flex items-center space-x-2 text-sm admin-text-secondary">
              <User className="h-4 w-4" />
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
