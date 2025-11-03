import React, { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CustomerAuthModal from '../components/auth/CustomerAuthModal';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get token directly from URL params without state
  const token = useMemo(() => searchParams.get('token'), [searchParams]);

  useEffect(() => {
    if (!token) {
      // No token provided, redirect to home
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  const handleCloseModal = () => {
    // Redirect to home after modal closes
    navigate('/', { replace: true });
  };

  // If no token, don't render modal (will redirect in useEffect)
  if (!token) {
    return null;
  }

  return (
    <CustomerAuthModal
      open={true}
      onClose={handleCloseModal}
      initialMode="reset-token"
      resetToken={token}
    />
  );
};

export default ResetPasswordPage;