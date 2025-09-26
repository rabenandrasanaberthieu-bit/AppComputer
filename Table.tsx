import React from 'react';

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  className?: string;
}

export function Table<T extends Record<string, any>>({ 
  data, 
  columns, 
  loading = false,
  className = '' 
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-700 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      <table className="w-full">
        <thead className="bg-gray-900 border-b border-gray-700">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                style={{ width: column.width }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-400"
              >
                Aucune donnée disponible
              </td>
            </tr>
          ) : (
            data.map((record, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-700">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-sm text-white">
                    {column.render
                      ? column.render(record[column.key as keyof T], record)
                      : String(record[column.key as keyof T] || '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}