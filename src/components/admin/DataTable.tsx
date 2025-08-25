import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  title: string | React.ReactNode;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface Action<T> {
  label: string | ((row: T) => string);
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  color?: 'default' | 'primary' | 'danger';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: Action<T>[];
  isLoading?: boolean;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  rowKey?: keyof T;
  title?: string;
  subtitle?: string;
  searchable?: boolean;
  filterable?: boolean;
  headerActions?: React.ReactNode;
  footerContent?: React.ReactNode;
}

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  actions,
  isLoading,
  onSort,
  rowKey = 'id',
  title,
  subtitle,
  searchable = false,
  filterable = false,
  headerActions,
  footerContent
}: DataTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const renderCell = (row: T, column: Column<T>) => {
    if (column.render) {
      return column.render(row);
    }

    const key = column.key as keyof T;
    return row[key];
  };

  const getActionIcon = (action: Action<T>) => {
    if (action.icon) return action.icon;
    
    const label = typeof action.label === 'string' ? action.label : action.label({} as T);
    
    switch (label.toLowerCase()) {
      case 'edit':
        return <Edit className="h-4 w-4" />;
      case 'delete':
      case 'remove':
        return <Trash2 className="h-4 w-4" />;
      case 'view':
        return <Eye className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActionButtonClass = (action: Action<T>) => {
    const baseClass = 'admin-action-btn';
    if (action.color === 'danger') {
      return `${baseClass} danger`;
    }
    return baseClass;
  };

  if (isLoading) {
    return (
      <div className="admin-card">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <span style={{ marginLeft: '8px' }}>Loading...</span>
        </div>
      </div>
    );
  }

  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    return columns.some(column => {
      const value = row[column.key as keyof T];
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  return (
    <div className="admin-card">
      {/* Header */}
      {(title || searchable || filterable || headerActions) && (
        <div className="admin-card-header">
          <div>
            {title && <h2 className="admin-card-title">{title}</h2>}
            {subtitle && <p className="admin-text-secondary admin-text-sm" style={{ margin: 0 }}>{subtitle}</p>}
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {searchable && (
              <div style={{ position: 'relative' }}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-table-search pl-10"
                />
              </div>
            )}
            
            {filterable && (
              <button className="admin-btn admin-btn-secondary admin-btn-sm">
                <Filter className="admin-btn-icon" />
                Filter
              </button>
            )}
            
            {headerActions && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="admin-card-content" style={{ padding: 0 }}>
        <div className="admin-table-wrapper">
          <table className="admin-table admin-products-table">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={String(column.key)} className={`admin-table-col-${index}`}>
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key as keyof T)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontFamily: 'Roboto Mono, monospace',
                          color: 'var(--admin-text-primary)'
                        }}
                      >
                        {column.title}
                        {sortConfig?.key === column.key && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      column.title
                    )}
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th style={{ width: '120px' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => {
                const key = row[rowKey] as string | number;
                return (
                  <tr key={key}>
                    {columns.map((column, index) => (
                      <td key={String(column.key)} className={`admin-table-col-${index}`}>
                        {renderCell(row, column)}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td>
                        <div className="admin-action-group">
                          {actions.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(row)}
                              className={getActionButtonClass(action)}
                              title={typeof action.label === 'string' ? action.label : action.label(row)}
                            >
                              {getActionIcon(action)}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="admin-loading" style={{ padding: '40px' }}>
              <span className="admin-text-muted">No data found</span>
            </div>
          )}
        </div>
        
        {/* Footer content (like pagination) */}
        {footerContent && (
          <div className="border-t border-gray-200">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
