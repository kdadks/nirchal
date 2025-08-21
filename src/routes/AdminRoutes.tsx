import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProductsPage from '../pages/admin/ProductsPage';
import CategoriesPage from '../pages/admin/CategoriesPage';
import CreateProductPage from '../pages/admin/CreateProductPage';
import EditProductPage from '../pages/admin/EditProductPage';
import SettingsPage from '../pages/admin/SettingsPage';
import OrdersPage from '../pages/admin/OrdersPage';
import UsersPage from '../pages/admin/UsersPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';

interface AdminRoutesProps {
  isAuthenticated: boolean;
}

const AdminRoutes: React.FC<AdminRoutesProps> = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/create" element={<CreateProductPage />} />
        <Route path="/products/edit/:id" element={<EditProductPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;