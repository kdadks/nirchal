import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminRoutes from './AdminRoutes';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminWrapper: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <AdminRoutes isAuthenticated={!!user && isAdmin} />;
};

export default AdminWrapper;
