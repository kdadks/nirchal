import { useState, useCallback } from 'react';

interface UsePasswordResetModalReturn {
  isModalOpen: boolean;
  modalMode: 'login' | 'register' | 'forgot' | 'reset-token';
  resetToken: string | null;
  openModal: (mode?: 'login' | 'register' | 'forgot' | 'reset-token', token?: string) => void;
  closeModal: () => void;
  setModalMode: (mode: 'login' | 'register' | 'forgot' | 'reset-token') => void;
}

export const usePasswordResetModal = (): UsePasswordResetModalReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register' | 'forgot' | 'reset-token'>('login');
  const [resetToken, setResetToken] = useState<string | null>(null);

  const openModal = useCallback((mode: 'login' | 'register' | 'forgot' | 'reset-token' = 'login', token?: string) => {
    setModalMode(mode);
    if (token) {
      setResetToken(token);
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setResetToken(null);
    // Don't reset mode immediately to allow for smooth transitions
    setTimeout(() => {
      setModalMode('login');
    }, 300);
  }, []);

  const setModalModeCallback = useCallback((mode: 'login' | 'register' | 'forgot' | 'reset-token') => {
    setModalMode(mode);
  }, []);

  return {
    isModalOpen,
    modalMode,
    resetToken,
    openModal,
    closeModal,
    setModalMode: setModalModeCallback,
  };
};