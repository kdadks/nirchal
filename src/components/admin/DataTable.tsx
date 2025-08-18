import React, { useState } from 'react';
import { MoreVertical, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  title: string;
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
  filterable = false
}: DataTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

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

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-neutral-200/50 overflow-hidden">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="bg-gradient-to-r from-neutral-100 to-neutral-200 h-16 flex items-center px-6">
            <div className="h-6 bg-neutral-300 rounded-lg w-32"></div>
          </div>
          {/* Rows skeleton */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-t border-neutral-200/50 h-20 bg-white">
              <div className="grid grid-cols-4 gap-4 p-6">
                <div className="h-4 bg-neutral-200 rounded-lg"></div>
                <div className="h-4 bg-neutral-200 rounded-lg"></div>
                <div className="h-4 bg-neutral-200 rounded-lg"></div>
                <div className="h-4 bg-neutral-200 rounded-lg"></div>
              </div>
            </div>
          ))}
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
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-neutral-200/50 overflow-hidden">
      {/* Modern Header */}
      {(title || searchable || filterable) && (
        <div className="px-6 py-4 border-b border-neutral-200/50 bg-gradient-to-r from-neutral-50/50 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-xl font-display font-bold text-primary-800">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all duration-200 text-sm"
                  />
                </div>
              )}
              
              {filterable && (
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center space-x-2 px-3 py-2 border border-neutral-200 rounded-xl bg-neutral-50/50 hover:bg-white hover:border-primary-300 transition-all duration-200 text-sm"
                >
                  <Filter className="h-4 w-4 text-neutral-600" />
                  <span className="text-neutral-700">Filter</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modern Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-neutral-50/80 to-neutral-100/50">
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider"
                >
                  {column.sortable ? (
                    <button
                      className="group inline-flex items-center space-x-2 hover:text-primary-600 transition-colors"
                      onClick={() => handleSort(column.key as keyof T)}
                    >
                      <span>{column.title}</span>
                      <span className="text-neutral-400 group-hover:text-primary-500">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </span>
                    </button>
                  ) : (
                    column.title
                  )}
                </th>
              ))}
              {actions && <th scope="col" className="relative px-6 py-4 w-16" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredData.map((row, rowIndex) => (
              <tr 
                key={row[rowKey]} 
                className="hover:bg-gradient-to-r hover:from-primary-50/30 hover:to-accent-50/20 transition-all duration-200 group"
              >
                {columns.map((column) => (
                  <td
                    key={column.key as string}
                    className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800"
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === rowIndex ? null : rowIndex)}
                        className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {actionMenuOpen === rowIndex && (
                        <div className="absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl bg-white border border-neutral-200/50 z-50 overflow-hidden backdrop-blur-sm">
                          <div className="py-2" role="menu">
                            {actions.map((action, i) => {
                              const label = typeof action.label === 'function' 
                                ? action.label(row) 
                                : action.label;
                              
                              return (
                                <button
                                  key={i}
                                  onClick={() => {
                                    action.onClick(row);
                                    setActionMenuOpen(null);
                                  }}
                                  className={`w-full text-left px-4 py-3 text-sm hover:bg-neutral-50 flex items-center space-x-3 transition-colors ${
                                    action.color === 'danger' ? 'text-red-600 hover:bg-red-50' : 
                                    action.color === 'primary' ? 'text-primary-600 hover:bg-primary-50' : 
                                    'text-neutral-700'
                                  }`}
                                  role="menuitem"
                                >
                                  {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
                                  <span>{label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-neutral-400 mb-2">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-neutral-600 mb-1">No data found</h3>
          <p className="text-sm text-neutral-500">
            {searchTerm ? 'Try adjusting your search criteria' : 'No items to display'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DataTable;