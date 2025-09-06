import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminSearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  clearSearch: () => void;
}

const AdminSearchContext = createContext<AdminSearchContextType | undefined>(undefined);

export const useAdminSearch = () => {
  const context = useContext(AdminSearchContext);
  if (context === undefined) {
    throw new Error('useAdminSearch must be used within an AdminSearchProvider');
  }
  return context;
};

interface AdminSearchProviderProps {
  children: ReactNode;
}

export const AdminSearchProvider: React.FC<AdminSearchProviderProps> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');

  const clearSearch = () => {
    setSearchTerm('');
  };

  const value = {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    clearSearch,
  };

  return (
    <AdminSearchContext.Provider value={value}>
      {children}
    </AdminSearchContext.Provider>
  );
};
