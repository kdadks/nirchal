import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProductsPage from '../pages/admin/ProductsPage';
import InventoryPage from '../pages/admin/InventoryPage';
import CategoriesPage from '../pages/admin/CategoriesPage';
import VendorsPage from '../pages/admin/VendorsPage';
import LogisticsPartnersPage from '../pages/admin/LogisticsPartnersPage';
import CreateProductPage from '../pages/admin/CreateProductPage';
import EditProductPage from '../pages/admin/EditProductPage';
import SettingsPage from '../pages/admin/SettingsPage';
import SecurityPage from '../pages/admin/SecurityPage';
import OrdersPage from '../pages/admin/OrdersPage';
import UsersPage from '../pages/admin/UsersPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import OptimizedAdminTest from '../components/admin/OptimizedAdminTest';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { AdminProvider } from '../contexts/AdminContext';
import { AdminSearchProvider } from '../contexts/AdminSearchContext';

const AdminRoutes: React.FC = () => {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminProvider>
        <AdminSearchProvider>
          <AdminLayout>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/logistics-partners" element={<LogisticsPartnersPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/create" element={<CreateProductPage />} />
              <Route path="/products/edit/:id" element={<EditProductPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/performance-test" element={<OptimizedAdminTest />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </AdminLayout>
        </AdminSearchProvider>
      </AdminProvider>
    </ProtectedRoute>
  );
};

export default AdminRoutes;