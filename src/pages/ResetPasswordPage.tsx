import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CustomerAuthModal from '../components/auth/CustomerAuthModal';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (!urlToken) {
      // No token provided, redirect to home
      navigate('/', { replace: true });
    } else {
      setToken(urlToken);
      setIsModalOpen(true);
    }
  }, [searchParams, navigate]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Redirect to home after modal closes
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 300);
  };

  if (!token) {
    return null; // Will redirect to home
  }

  return (
    <CustomerAuthModal
      open={isModalOpen}
      onClose={handleCloseModal}
      initialMode="reset-token"
      resetToken={token}
    />
  );
};

export default ResetPasswordPage;