import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/products', label: 'Products' },
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  return (
    <aside className="bg-white border-r border-gray-200 min-h-screen p-6 w-64">
      <h2 className="text-2xl font-bold mb-8">Admin Console</h2>
      <nav className="space-y-4">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`block px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${location.pathname.startsWith(link.to) ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-primary-50'}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
