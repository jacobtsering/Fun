import React from 'react';

interface TableProps {
  headers: string[];
  data: unknown /* TODO: Replace with proper type */[][];
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
}

export default function Table({ 
  headers, 
  data, 
  className = '', 
  loading = false,
  emptyMessage = &apos;No data available&apos;
}: TableProps) {
  return (
    <div className={`overflow-x-auto w-full ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`bg-white divide-y divide-gray-200 ${loading ? &apos;opacity-50&apos; : ''}`}>
          {loading ? (
            // Loading skeleton rows
            Array(3).fill(0).map((_, rowIndex) => (
              <tr key={`skeleton-${rowIndex}`}>
                {Array(headers.length).fill(0).map((_, cellIndex) => (
                  <td key={`skeleton-cell-${cellIndex}`} className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length > 0 ? (
            // Actual data rows
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? &apos;bg-white&apos; : 'bg-gray-50'}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            // Empty state
            <tr>
              <td colSpan={headers.length} className="px-2 sm:px-4 md:px-6 py-4 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
