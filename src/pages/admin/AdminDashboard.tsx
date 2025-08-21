import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  ArrowUpRight,
  BarChart3,
  TrendingUp,
  Activity,
  Plus
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Products',
      value: '124',
      change: '+12%',
      changeType: 'increase',
      icon: <Package className="h-5 w-5" />,
      onClick: () => navigate('/admin/products'),
    },
    {
      title: 'Orders Today',
      value: '12',
      change: '+8%',
      changeType: 'increase',
      icon: <ShoppingCart className="h-5 w-5" />,
      onClick: () => navigate('/admin/orders'),
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+23%',
      changeType: 'increase',
      icon: <Users className="h-5 w-5" />,
      onClick: () => navigate('/admin/users'),
    },
    {
      title: 'Revenue',
      value: '₹1,24,500',
      change: '+15%',
      changeType: 'increase',
      icon: <DollarSign className="h-5 w-5" />,
      onClick: () => navigate('/admin/analytics'),
    }
  ];

  const recentOrders = [
    { 
      id: '#ORD-001', 
      customer: 'Priya Sharma', 
      status: 'Processing',
      amount: '₹2,450',
      time: '2 mins ago',
      avatar: 'PS'
    },
    { 
      id: '#ORD-002', 
      customer: 'Rahul Verma', 
      status: 'Shipped',
      amount: '₹3,200',
      time: '15 mins ago',
      avatar: 'RV'
    },
    { 
      id: '#ORD-003', 
      customer: 'Anita Singh', 
      status: 'Delivered',
      amount: '₹1,800',
      time: '1 hour ago',
      avatar: 'AS'
    },
    { 
      id: '#ORD-004', 
      customer: 'Vikram Gupta', 
      status: 'Processing',
      amount: '₹4,100',
      time: '2 hours ago',
      avatar: 'VG'
    }
  ];

  const topProducts = [
    { 
      name: 'Silk Saree - Royal Blue', 
      sales: 45, 
      revenue: '₹89,000', 
      trend: 'up' 
    },
    { 
      name: 'Embroidered Kurta Set', 
      sales: 38, 
      revenue: '₹76,000', 
      trend: 'up' 
    },
    { 
      name: 'Designer Lehenga', 
      sales: 22, 
      revenue: '₹1,10,000', 
      trend: 'down' 
    },
    { 
      name: 'Cotton Palazzo Set', 
      sales: 35, 
      revenue: '₹42,000', 
      trend: 'up' 
    }
  ];

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Add a new product to catalog',
      icon: <Plus className="h-5 w-5" />,
      onClick: () => navigate('/admin/products/create'),
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: <ShoppingCart className="h-5 w-5" />,
      onClick: () => navigate('/admin/orders'),
    },
    {
      title: 'Analytics',
      description: 'View sales analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      onClick: () => navigate('/admin/analytics'),
    },
    {
      title: 'Manage Users',
      description: 'View and manage users',
      icon: <Users className="h-5 w-5" />,
      onClick: () => navigate('/admin/users'),
    }
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'admin-badge admin-badge-warning';
      case 'shipped':
        return 'admin-badge admin-badge-neutral';
      case 'delivered':
        return 'admin-badge admin-badge-success';
      default:
        return 'admin-badge admin-badge-neutral';
    }
  };

  return (
    <div>
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="admin-card"
            style={{ cursor: 'pointer' }}
            onClick={stat.onClick}
          >
            <div className="admin-card-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p className="admin-text-secondary admin-text-sm" style={{ margin: '0 0 4px 0' }}>
                    {stat.title}
                  </p>
                  <p className="admin-font-mono" style={{ 
                    fontSize: '24px', 
                    fontWeight: '600', 
                    margin: '0 0 4px 0',
                    color: 'var(--admin-text-primary)'
                  }}>
                    {stat.value}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingUp className="h-4 w-4" style={{ color: 'var(--admin-success)' }} />
                    <span className="admin-text-xs" style={{ color: 'var(--admin-success)' }}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: 'var(--admin-bg)', 
                  borderRadius: '8px',
                  color: 'var(--admin-primary)'
                }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 400px', 
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity className="h-5 w-5" style={{ color: 'var(--admin-primary)' }} />
              <h2 className="admin-card-title">Recent Orders</h2>
            </div>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              View all
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          <div className="admin-card-content" style={{ padding: 0 }}>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={index}>
                      <td>
                        <span className="admin-font-mono admin-text-sm">{order.id}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--admin-primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {order.avatar}
                          </div>
                          <span>{order.customer}</span>
                        </div>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span className="admin-font-mono admin-text-sm">{order.amount}</span>
                      </td>
                      <td>
                        <span className="admin-text-muted admin-text-sm">{order.time}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Products Sidebar */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package className="h-5 w-5" style={{ color: 'var(--admin-success)' }} />
              <h2 className="admin-card-title">Top Products</h2>
            </div>
          </div>
          
          <div className="admin-card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topProducts.map((product, index) => (
                <div key={index} style={{ 
                  padding: '12px', 
                  border: '1px solid var(--admin-border)', 
                  borderRadius: '6px' 
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ 
                      fontWeight: '500', 
                      margin: '0 0 4px 0',
                      fontSize: '14px'
                    }}>
                      {product.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="admin-text-muted admin-text-sm">
                        {product.sales} sales
                      </span>
                      <span className="admin-font-mono admin-text-sm" style={{ fontWeight: '600' }}>
                        {product.revenue}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp 
                          className="h-4 w-4" 
                          style={{ 
                            color: product.trend === 'up' ? 'var(--admin-success)' : 'var(--admin-danger)',
                            transform: product.trend === 'down' ? 'rotate(180deg)' : 'none'
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Quick Actions</h2>
        </div>
        
        <div className="admin-card-content">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="admin-btn admin-btn-secondary"
                style={{ 
                  height: 'auto',
                  padding: '16px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: 'var(--admin-bg)', 
                  borderRadius: '6px',
                  marginBottom: '8px',
                  color: 'var(--admin-primary)'
                }}>
                  {action.icon}
                </div>
                <div>
                  <p style={{ 
                    fontWeight: '500', 
                    margin: '0 0 4px 0',
                    color: 'var(--admin-text-primary)'
                  }}>
                    {action.title}
                  </p>
                  <p className="admin-text-muted admin-text-sm" style={{ margin: 0 }}>
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
