import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProductsPage from '../pages/admin/ProductsPage';
import CreateProductPage from '../pages/admin/CreateProductPage';
import EditProductPage from '../pages/admin/EditProductPage';
// import SettingsPage from '../pages/admin/SettingsPage';

interface AdminRoutesProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AdminRoutes: React.FC<AdminRoutesProps> = ({ isAuthenticated, isAdmin }) => {
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/create" element={<CreateProductPage />} />
        <Route path="/products/edit/:id" element={<EditProductPage />} />
        {/* <Route path="/settings" element={<SettingsPage />} /> */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;