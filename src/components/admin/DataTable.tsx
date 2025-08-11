import React, { useState } from 'react';
import { MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';

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
}

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  actions,
  isLoading,
  onSort,
  rowKey = 'id'
}: DataTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

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
      <div className="border rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="bg-gray-100 h-12"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-t h-16 bg-white">
              <div className="grid grid-cols-4 gap-4 p-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
  <div className="border rounded-lg overflow-visible">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key as string}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.sortable ? (
                  <button
                    className="group inline-flex items-center space-x-1"
                    onClick={() => handleSort(column.key as keyof T)}
                  >
                    <span>{column.title}</span>
                    <span className="text-gray-400 group-hover:text-gray-500">
                      {sortConfig?.key === column.key ? (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )
                      ) : (
                        <ChevronDown size={16} className="opacity-0 group-hover:opacity-100" />
                      )}
                    </span>
                  </button>
                ) : (
                  column.title
                )}
              </th>
            ))}
            {actions && <th scope="col" className="relative px-6 py-3" />}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={row[rowKey]} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={column.key as string}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {renderCell(row, column)}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative">
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === rowIndex ? null : rowIndex)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {actionMenuOpen === rowIndex && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu">
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
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2
                                  ${action.color === 'danger' ? 'text-red-600' : 
                                    action.color === 'primary' ? 'text-primary-600' : 
                                    'text-gray-700'}`}
                                role="menuitem"
                              >
                                {action.icon && <span>{action.icon}</span>}
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
  );
};

export default DataTable;